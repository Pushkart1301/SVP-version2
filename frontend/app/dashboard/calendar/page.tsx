"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, X, Clock, CheckSquare, Check, Minus, Edit2, Sparkles, CalendarDays, ShieldCheck, AlertTriangle } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Subject {
    _id: string;
    name: string;
    code: string;
}

interface ScheduleSlot {
    start_time: string;
    end_time: string;
    subject_id: string;
}

interface WeekdaySchedule {
    weekday: number;
    slots: ScheduleSlot[];
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [schedule, setSchedule] = useState<WeekdaySchedule[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Helper to format date key locally (YYYY-MM-DD)
    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get weekday index (0=Mon, 6=Sun) from Date
    const getWeekdayIndex = (date: Date) => {
        const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        return day === 0 ? 6 : day - 1; // Convert to 0=Mon, 6=Sun
    };

    useEffect(() => {
        const fetchRefData = async () => {
            // Fetch Subjects
            try {
                const subRes = await api.get("subjects");
                setSubjects(subRes.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }

            // Fetch Schedule
            try {
                const schedRes = await api.get("attendance/schedule");
                setSchedule(schedRes.data);
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            }

            // Fetch Attendance History
            try {
                const attRes = await api.get("attendance/history");
                console.log("Fetched Attendance:", attRes.data);

                const map: Record<string, any> = {};
                attRes.data.forEach((record: any) => {
                    let dKey = record.date;
                    if (typeof dKey === 'string' && dKey.includes('T')) {
                        dKey = dKey.split('T')[0];
                    }
                    map[dKey] = record;
                });
                setAttendanceMap(map);
            } catch (error) {
                console.error("Failed to fetch attendance history", error);
            }
        };
        fetchRefData();
    }, []);

    // Get scheduled subjects for a specific date
    const getScheduledSubjects = (date: Date) => {
        const weekdayIndex = getWeekdayIndex(date);
        const daySchedule = schedule.find(s => s.weekday === weekdayIndex);

        if (!daySchedule || daySchedule.slots.length === 0) {
            return [];
        }

        // Map subject IDs to full subject info and merge duplicate subjects
        const uniqueSubjects = new Map();

        daySchedule.slots.forEach((slot, index) => {
            const subject = subjects.find(s => s._id === slot.subject_id);
            if (subject) {
                if (uniqueSubjects.has(subject._id)) {
                    const existing = uniqueSubjects.get(subject._id);
                    existing.timeSlot += `, ${slot.start_time} - ${slot.end_time}`;
                } else {
                    uniqueSubjects.set(subject._id, {
                        ...subject,
                        timeSlot: `${slot.start_time} - ${slot.end_time}`,
                        slotIndex: index
                    });
                }
            }
        });

        return Array.from(uniqueSubjects.values());
    };

    const handleMark = async (subjectId: string, status: "P" | "A") => {
        if (!selectedDate) return;

        const dateKey = getDateKey(selectedDate);
        const currentEntries = attendanceMap[dateKey]?.entries || [];

        // Remove existing entry for this subject and add new one
        const newEntries = [
            ...currentEntries.filter((e: any) => e.subject_id !== subjectId),
            {
                subject_id: subjectId,
                status
            }
        ];

        // Optimistically update UI
        const updatedMap = {
            ...attendanceMap,
            [dateKey]: {
                date: dateKey,
                entries: newEntries
            }
        };
        setAttendanceMap(updatedMap);

        // If we just created the first entry for this date, force Edit Mode 
        // to stay open so the user can easily mark the rest of the subjects.
        setIsEditMode(true);

        // Save to backend
        try {
            await api.post("attendance", {
                date: dateKey,
                entries: newEntries
            });
            console.log("Attendance saved successfully");
        } catch (err) {
            console.error("Failed to save attendance", err);
            // Revert state on error
            setAttendanceMap(attendanceMap);
            alert("Failed to save attendance. Please try again.");
        }
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Empty cells for first week
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div
                    key={`empty-${i}`}
                    className="h-20 sm:h-24 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/30"
                />
            );
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateKey = getDateKey(date);
            const hasData = attendanceMap[dateKey];

            const isToday = getDateKey(new Date()) === dateKey;
            const isSelected = selectedDate && getDateKey(selectedDate) === dateKey;

            days.push(
                <div
                    key={dateKey}
                    onClick={() => {
                        setSelectedDate(date);
                        setIsEditMode(false);
                    }}
                    className={`
                        h-20 sm:h-24 border-2 rounded-lg p-2 sm:p-3 cursor-pointer 
                        transition-all duration-200 relative
                        ${isSelected
                            ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-lg transform scale-105'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                        }
                        ${isToday
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-400'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`
                            text-sm sm:text-base font-bold
                            ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}
                            ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}
                        `}>
                            {d}
                        </span>
                        {hasData && (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-green-600 font-medium hidden sm:inline">
                                    {hasData.entries?.filter((e: any) => e.status === 'P').length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status indicators */}
                    <div className="mt-2 flex flex-wrap gap-1">
                        {hasData?.entries?.map((e: any, i: number) => (
                            <div
                                key={i}
                                className={`
                                    w-2 h-2 rounded-full transition-transform hover:scale-150
                                    ${e.status === 'P' ? 'bg-green-500' : 'bg-red-500'}
                                `}
                                title={`${e.status === 'P' ? 'Present' : 'Absent'}`}
                            />
                        ))}
                    </div>

                    {/* Today indicator */}
                    {isToday && (
                        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                                Today
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const handleClearAttendance = async () => {
        if (!confirm("Are you sure you want to clear ALL attendance records? This action cannot be undone!")) {
            return;
        }

        setLoading(true);
        try {
            await api.delete("attendance/clear");
            setAttendanceMap({});
            alert("All attendance records cleared successfully!");
        } catch (error) {
            console.error("Failed to clear attendance", error);
            alert("Failed to clear attendance records. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Get scheduled subjects when a date is selected
    const scheduledSubjects = selectedDate ? getScheduledSubjects(selectedDate) : [];
    const weekdayName = selectedDate ? WEEKDAY_NAMES[getWeekdayIndex(selectedDate)] : '';
    const todayKey = getDateKey(new Date());
    const recordedDays = Object.keys(attendanceMap).length;
    const attendanceEntries = Object.values(attendanceMap).reduce((count: number, record: any) => count + (record?.entries?.length || 0), 0);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto px-4 py-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            Attendance Control
                        </div>
                        <div className="mt-4 flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <CalendarDays className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">Attendance Calendar</h1>
                                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                    Review each lecture day, mark subject-wise attendance, and keep the rest of the dashboard aligned with accurate daily records.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <TopStat icon={CheckSquare} title="Recorded Days" value={String(recordedDays)} tone="blue" />
                            <TopStat icon={ShieldCheck} title="Marked Entries" value={String(attendanceEntries)} tone="emerald" />
                            <TopStat icon={todayKey in attendanceMap ? ShieldCheck : AlertTriangle} title="Today" value={todayKey in attendanceMap ? "Logged" : "Pending"} tone={todayKey in attendanceMap ? "emerald" : "amber"} />
                        </div>
                    </div>

                    <Card className="rounded-3xl border-slate-200 bg-slate-50/80 p-5 shadow-none dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em]">How It Works</span>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Safe attendance workflow</h3>
                        <div className="mt-4 space-y-3">
                            <HelpRow step="01" text="Pick a date from the calendar grid." />
                            <HelpRow step="02" text="Review all scheduled subjects for that weekday." />
                            <HelpRow step="03" text="Mark Present or Absent and let the page save it immediately." />
                        </div>
                    </Card>
                </div>
            </section>

            <div className="grid gap-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Button
                        onClick={handleClearAttendance}
                        disabled={loading}
                        variant="danger"
                        className="w-full sm:w-auto gap-2 rounded-xl text-sm"
                    >
                        <X size={16} />
                        {loading ? "Clearing..." : "Clear All"}
                    </Button>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                        <Button
                            onClick={() => changeMonth(-1)}
                            variant="ghost"
                            className="text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                            <ChevronLeft />
                        </Button>
                        <span className="min-w-[150px] text-center text-lg font-semibold text-slate-900 dark:text-white sm:min-w-[180px] sm:text-xl">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button
                            onClick={() => changeMonth(1)}
                            variant="ghost"
                            className="text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-7">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Month View</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Click any day to review or edit attendance for the scheduled lectures.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Interactive calendar
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3 sm:gap-4 mb-4">
                        {DAYS.map(d => (
                            <div
                                key={d}
                                className="py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:text-sm"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3 sm:gap-4">
                        {renderDays()}
                    </div>
                </Card>

            </div>

            {selectedDate && (
                <div
                    className="fixed top-[10px] inset-x-0 bottom-0 bg-black/60 flex items-center justify-center z-40 p-4 transition-all duration-200"
                    onClick={() => {
                        setSelectedDate(null);
                        setIsEditMode(false);
                    }}
                    style={{
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <Card
                        className="w-full max-w-[560px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'modalSlideIn 0.3s ease-out'
                        }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10"></div> {/* Spacer for centering the icon */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-[#1A1D24] rounded-xl flex items-center justify-center mb-4">
                                    <CheckSquare size={24} className="text-slate-800 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Review Attendance</h3>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#8F93A3]">
                                    <Clock size={14} />
                                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                            <button onClick={() => {
                                setSelectedDate(null);
                                setIsEditMode(false);
                            }} className="text-slate-400 hover:text-slate-900 dark:text-[#8F93A3] dark:hover:text-white w-10 flex justify-end">
                                <X size={20} />
                            </button>
                        </div>

                        {scheduledSubjects.length > 0 ? (
                            <div className="space-y-3">
                                {scheduledSubjects.map((sub: any) => {
                                    const dateKey = getDateKey(selectedDate);
                                    const entry = attendanceMap[dateKey]?.entries?.find((e: any) => e.subject_id === sub._id);
                                    const status = entry?.status;

                                    return (
                                        <div key={`${sub._id}-${sub.slotIndex}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#1A1D24]">
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold tracking-wide text-slate-800 dark:text-white">{sub.name}</div>
                                                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-[#8F93A3]">
                                                    <Clock size={12} />
                                                    {sub.timeSlot}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0 ml-4">
                                                {attendanceMap[dateKey] && !isEditMode ? (
                                                    <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${status === 'P' ? 'bg-[#2BE67D] text-[#111317]' : status === 'A' ? 'bg-slate-200 dark:bg-[#1A1D24] border border-slate-300 dark:border-[#2B2F36] text-slate-700 dark:text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-[#8F93A3]'}`}>
                                                        {status === 'P' && <Check size={16} />}
                                                        {status === 'A' && <Minus size={16} className="text-slate-400 dark:text-[#8F93A3]" />}
                                                        {status === 'P' ? 'Present' : status === 'A' ? 'Absent' : '-'}
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-200 dark:bg-[#111317] rounded-full p-1 border border-slate-300 dark:border-white/5 flex">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMark(sub._id, "P")}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${status === 'P' ? 'bg-[#2BE67D] text-[#111317] shadow-sm' : 'text-slate-500 dark:text-[#8F93A3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/5'}`}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMark(sub._id, "A")}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${status === 'A' ? 'bg-[#FF4646] text-white shadow-sm' : 'text-slate-500 dark:text-[#8F93A3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/5'}`}
                                                        >
                                                            A
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {attendanceMap[getDateKey(selectedDate)] && !isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2BE67D] py-3.5 font-bold text-[#111317] transition-colors hover:bg-[#25C86C]"
                                    >
                                        <Edit2 size={18} />
                                        Modify Attendance
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700/50">
                                    <Clock size={32} className="text-gray-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Lectures Scheduled</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    You don't have any lectures scheduled for {weekdayName}.<br />
                                    Set up your timetable to track attendance automatically.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}

function TopStat({ icon: Icon, title, value, tone }: { icon: any; title: string; value: string; tone: "blue" | "emerald" | "amber" }) {
    const tones = {
        blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

function HelpRow({ step, text }: { step: string; text: string }) {
    return (
        <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                {step}
            </div>
            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">{text}</p>
        </div>
    );
}
