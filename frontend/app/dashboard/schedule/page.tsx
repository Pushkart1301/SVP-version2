"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Calendar as CalendarIcon, Clock, Trash2, Plus, Save } from "lucide-react";
import clsx from "clsx";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Common time slots that can be quick-added
const COMMON_TIME_SLOTS = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "12:00", end: "13:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
];

export default function SchedulePage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
    const [scheduleMatrix, setScheduleMatrix] = useState<string[][]>([]);
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, schedRes] = await Promise.all([
                api.get("/subjects"),
                api.get("/attendance/schedule")
            ]);

            setSubjects(subRes.data);

            // Extract unique time slots from existing schedules
            const schedules: WeekdaySchedule[] = schedRes.data;
            const uniqueSlots = new Map<string, { start: string; end: string }>();

            schedules.forEach(daySched => {
                daySched.slots.forEach(slot => {
                    const key = `${slot.start_time}-${slot.end_time}`;
                    if (!uniqueSlots.has(key)) {
                        uniqueSlots.set(key, { start: slot.start_time, end: slot.end_time });
                    }
                });
            });

            const slots = Array.from(uniqueSlots.values()).sort((a, b) => a.start.localeCompare(b.start));
            setTimeSlots(slots);

            // Build matrix
            const initialMatrix = slots.map(() => Array(DAYS.length).fill("no_lecture"));

            schedules.forEach(daySched => {
                daySched.slots.forEach(slot => {
                    const timeIndex = slots.findIndex(ts => ts.start === slot.start_time && ts.end === slot.end_time);
                    if (timeIndex !== -1) {
                        initialMatrix[timeIndex][daySched.weekday] = slot.subject_id;
                    }
                });
            });

            setScheduleMatrix(initialMatrix);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCellChange = (timeIndex: number, dayIndex: number, subjectId: string) => {
        const newMatrix = [...scheduleMatrix];
        newMatrix[timeIndex] = [...newMatrix[timeIndex]];
        newMatrix[timeIndex][dayIndex] = subjectId;
        setScheduleMatrix(newMatrix);
    };

    const quickAddTimeSlot = (slot: { start: string; end: string }) => {
        // Check if already exists
        const exists = timeSlots.some(ts => ts.start === slot.start && ts.end === slot.end);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlots = [...timeSlots, slot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        // Insert new row in matrix at correct position
        const insertIndex = newSlots.findIndex(ts => ts.start === slot.start && ts.end === slot.end);
        const newMatrix = [...scheduleMatrix];
        newMatrix.splice(insertIndex, 0, Array(DAYS.length).fill("no_lecture"));
        setScheduleMatrix(newMatrix);
    };

    const addCustomTimeSlot = () => {
        if (!customStart || !customEnd) {
            alert("Please enter both start and end times.");
            return;
        }

        if (customStart >= customEnd) {
            alert("End time must be after start time.");
            return;
        }

        const exists = timeSlots.some(ts => ts.start === customStart && ts.end === customEnd);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlot = { start: customStart, end: customEnd };
        const newSlots = [...timeSlots, newSlot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        const insertIndex = newSlots.findIndex(ts => ts.start === customStart && ts.end === customEnd);
        const newMatrix = [...scheduleMatrix];
        newMatrix.splice(insertIndex, 0, Array(DAYS.length).fill("no_lecture"));
        setScheduleMatrix(newMatrix);

        setCustomStart("");
        setCustomEnd("");
    };

    const deleteTimeSlot = (index: number) => {
        if (!confirm("Delete this time slot? All subject mappings for this time will be removed.")) return;

        const newSlots = timeSlots.filter((_, i) => i !== index);
        const newMatrix = scheduleMatrix.filter((_, i) => i !== index);

        setTimeSlots(newSlots);
        setScheduleMatrix(newMatrix);
    };

    const clearAllSlots = () => {
        if (!confirm("Clear all time slots and start fresh?")) return;
        setTimeSlots([]);
        setScheduleMatrix([]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = DAYS.map(async (_, dayIndex) => {
                const slots: ScheduleSlot[] = [];
                timeSlots.forEach((time, timeIndex) => {
                    const subjectId = scheduleMatrix[timeIndex][dayIndex];
                    if (subjectId && subjectId !== "no_lecture") {
                        slots.push({
                            start_time: time.start,
                            end_time: time.end,
                            subject_id: subjectId
                        });
                    }
                });

                return api.post("/attendance/schedule", {
                    weekday: dayIndex,
                    slots: slots
                });
            });

            await Promise.all(promises);
            alert("Schedule saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Lecture Timetable</h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                            Build your weekly schedule for accurate attendance tracking
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={clearAllSlots}
                        className="bg-red-600 text-white border-transparent hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-md hover:shadow-lg transition-all dark:bg-red-600 dark:hover:bg-red-700 dark:text-white dark:border-transparent"
                    >
                        Clear All
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        {saving ? "Saving..." : "Save Schedule"}
                    </Button>
                </div>
            </div>

            {/* Add Time Slots - Unified Section */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Time Slots</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Choose a common slot or create your own
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Quick Add Slots */}
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TIME_SLOTS.map((slot, i) => (
                            <button
                                key={i}
                                onClick={() => quickAddTimeSlot(slot)}
                                className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium border-none"
                            >
                                {slot.start} - {slot.end}
                            </button>
                        ))}
                    </div>

                    {/* Custom Time Slot */}
                    <div className="flex items-end gap-3 max-w-xl">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Start time</label>
                            <Input
                                type="time"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">End time</label>
                            <Input
                                type="time"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white"
                            />
                        </div>
                        <Button
                            onClick={addCustomTimeSlot}
                            className="h-10 px-6 shrink-0"
                        >
                            Add Slot
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Collapsible Instructions */}
            <details className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 group">
                <summary className="cursor-pointer text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2 select-none">
                    <span className="text-base">💡</span>
                    <span>How to create your schedule</span>
                    <svg
                        className="w-4 h-4 ml-auto transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>

                <ol className="mt-3 space-y-1.5 text-sm text-amber-700 dark:text-amber-400 list-decimal list-inside pl-1">
                    <li>Add or select time slots from the options above</li>
                    <li>Select subjects for each weekday in the table below</li>
                    <li>Choose "No Lecture" where there's no class</li>
                    <li>Click "Save Schedule" to apply your changes</li>
                </ol>
            </details>

            {/* Schedule Table */}
            {timeSlots.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300 w-44 sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-10 border-r dark:border-slate-700">
                                        Time
                                    </th>
                                    {DAYS.map((day) => (
                                        <th key={day} className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300 min-w-[160px]">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-700">
                                {timeSlots.map((slot, tIndex) => (
                                    <tr key={tIndex} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 group transition-colors">
                                        <td className="p-4 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 border-r dark:border-slate-700 z-10 transition-colors">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span>{slot.start} - {slot.end}</span>
                                                </div>
                                                <button
                                                    onClick={() => deleteTimeSlot(tIndex)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all"
                                                    title="Delete this time slot"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        {DAYS.map((_, dIndex) => (
                                            <td key={dIndex} className="p-2">
                                                <select
                                                    value={scheduleMatrix[tIndex]?.[dIndex] || "no_lecture"}
                                                    onChange={(e) => handleCellChange(tIndex, dIndex, e.target.value)}
                                                    className={clsx(
                                                        "w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none focus:ring-2",
                                                        scheduleMatrix[tIndex]?.[dIndex] !== "no_lecture"
                                                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-200 font-medium"
                                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 focus:ring-slate-200"
                                                    )}
                                                >
                                                    <option value="no_lecture">-- No Lecture --</option>
                                                    {subjects.map(sub => (
                                                        <option key={sub._id} value={sub._id}>
                                                            {sub.name} ({sub.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center p-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <CalendarIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No time slots added yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Click on the quick-add buttons above to get started!</p>
                </div>
            )}
        </div>
    );
}
