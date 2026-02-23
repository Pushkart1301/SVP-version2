"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, X, Clock, CheckSquare, Check, Minus, Edit2 } from "lucide-react";

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
                const subRes = await api.get("/subjects");
                setSubjects(subRes.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }

            // Fetch Schedule
            try {
                const schedRes = await api.get("/attendance/schedule");
                setSchedule(schedRes.data);
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            }

            // Fetch Attendance History
            try {
                const attRes = await api.get("/attendance/history");
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
            await api.post("/attendance", {
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
            await api.delete("/attendance/clear");
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

    return (
        <div className="space-y-4 max-w-[1400px] mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Attendance Calendar</h1>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                        onClick={handleClearAttendance}
                        disabled={loading}
                        variant="danger"
                        className="w-full sm:w-auto gap-2 text-sm"
                    >
                        <X size={16} />
                        {loading ? "Clearing..." : "Clear All"}
                    </Button>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-700">
                        <Button
                            onClick={() => changeMonth(-1)}
                            variant="ghost"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300"
                        >
                            <ChevronLeft />
                        </Button>
                        <span className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white min-w-[150px] sm:min-w-[180px] text-center">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button
                            onClick={() => changeMonth(1)}
                            variant="ghost"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300"
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
                    {DAYS.map(d => (
                        <div
                            key={d}
                            className="text-center font-bold text-slate-600 dark:text-slate-400 py-2 text-xs sm:text-sm uppercase tracking-wide"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {renderDays()}
                </div>
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
                        className="w-full max-w-[400px] bg-[#111317] border-0 rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'modalSlideIn 0.3s ease-out'
                        }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10"></div> {/* Spacer for centering the icon */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-[#1A1D24] rounded-xl flex items-center justify-center mb-4">
                                    <CheckSquare size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Review Attendance</h3>
                                <div className="flex items-center gap-2 text-[#8F93A3] text-sm font-medium">
                                    <Clock size={14} />
                                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                            <button onClick={() => {
                                setSelectedDate(null);
                                setIsEditMode(false);
                            }} className="text-[#8F93A3] hover:text-white w-10 flex justify-end">
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
                                        <div key={`${sub._id}-${sub.slotIndex}`} className="flex items-center justify-between p-4 bg-[#1A1D24] rounded-xl border border-white/5">
                                            <div className="flex-1">
                                                <div className="font-semibold tracking-wide text-white mb-1">{sub.name}</div>
                                                <div className="text-xs text-[#8F93A3] flex items-center gap-1 font-medium">
                                                    <Clock size={12} />
                                                    {sub.timeSlot}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0 ml-4">
                                                {attendanceMap[dateKey] && !isEditMode ? (
                                                    <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${status === 'P' ? 'bg-[#2BE67D] text-[#111317]' : status === 'A' ? 'bg-[#1A1D24] border border-[#2B2F36] text-white' : 'bg-white/10 text-[#8F93A3]'}`}>
                                                        {status === 'P' && <Check size={16} />}
                                                        {status === 'A' && <Minus size={16} className="text-[#8F93A3]" />}
                                                        {status === 'P' ? 'Present' : status === 'A' ? 'Absent' : '-'}
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#111317] rounded-full p-1 border border-white/5 flex">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMark(sub._id, "P")}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${status === 'P' ? 'bg-[#2BE67D] text-[#111317]' : 'text-[#8F93A3] hover:text-white'}`}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMark(sub._id, "A")}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${status === 'A' ? 'bg-[#FF4646] text-white' : 'text-[#8F93A3] hover:text-white'}`}
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
                                        className="w-full mt-6 bg-[#2BE67D] hover:bg-[#25C86C] text-[#111317] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                        Modify Attendance
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
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
