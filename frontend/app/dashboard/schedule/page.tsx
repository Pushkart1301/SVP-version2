"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Calendar as CalendarIcon, Clock, Trash2, PlusCircle, Save, Sparkles, CheckCircle2 } from "lucide-react";
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
                api.get("/attendance/schedule"),
            ]);

            setSubjects(subRes.data);

            const schedules: WeekdaySchedule[] = schedRes.data;
            const uniqueSlots = new Map<string, { start: string; end: string }>();

            schedules.forEach((daySched) => {
                daySched.slots.forEach((slot) => {
                    const key = `${slot.start_time}-${slot.end_time}`;
                    if (!uniqueSlots.has(key)) {
                        uniqueSlots.set(key, { start: slot.start_time, end: slot.end_time });
                    }
                });
            });

            const slots = Array.from(uniqueSlots.values()).sort((a, b) => a.start.localeCompare(b.start));
            setTimeSlots(slots);

            const initialMatrix = slots.map(() => Array(DAYS.length).fill("no_lecture"));

            schedules.forEach((daySched) => {
                daySched.slots.forEach((slot) => {
                    const timeIndex = slots.findIndex((ts) => ts.start === slot.start_time && ts.end === slot.end_time);
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
        const exists = timeSlots.some((ts) => ts.start === slot.start && ts.end === slot.end);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlots = [...timeSlots, slot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        const insertIndex = newSlots.findIndex((ts) => ts.start === slot.start && ts.end === slot.end);
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

        const exists = timeSlots.some((ts) => ts.start === customStart && ts.end === customEnd);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlot = { start: customStart, end: customEnd };
        const newSlots = [...timeSlots, newSlot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        const insertIndex = newSlots.findIndex((ts) => ts.start === customStart && ts.end === customEnd);
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
                            subject_id: subjectId,
                        });
                    }
                });

                return api.post("/attendance/schedule", {
                    weekday: dayIndex,
                    slots,
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
        <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            Weekly Timetable
                        </div>
                        <div className="mt-4 flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <CalendarIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                                    Lecture Timetable
                                </h1>
                                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                    Build your weekly schedule for accurate attendance tracking, cleaner subject mapping, and better planner recommendations.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <InfoPill title="Fast Setup" text="Use quick time-slot chips" />
                            <InfoPill title="Clean Mapping" text="Assign subjects by weekday" />
                            <InfoPill title="Safe Save" text="Current save logic unchanged" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={clearAllSlots}
                            className="rounded-xl border-transparent bg-red-600 px-5 py-3 text-white shadow-md hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Save Schedule"}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <Card className="border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Time Slots</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Pick a common time or create a custom slot for your weekly grid.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TIME_SLOTS.map((slot, i) => (
                                <button
                                    key={i}
                                    onClick={() => quickAddTimeSlot(slot)}
                                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                >
                                    {slot.start} - {slot.end}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                    Start time
                                </label>
                                <Input
                                    type="time"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                    End time
                                </label>
                                <Input
                                    type="time"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>
                            <Button onClick={addCustomTimeSlot} className="h-12 rounded-xl px-6">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Slot
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="border-amber-200 bg-amber-50/60 p-6 dark:border-amber-800 dark:bg-amber-900/10">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em]">How To Use</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Create your schedule step by step</h3>
                    <div className="mt-5 space-y-4">
                        <StepRow step="01" text="Add the time ranges you actually use during the week." />
                        <StepRow step="02" text="Choose the matching subject for each weekday column." />
                        <StepRow step="03" text="Leave empty periods as No Lecture and save once." />
                    </div>
                </Card>
            </div>

            {timeSlots.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-900/50">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Matrix</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Edit the timetable directly. Each row is a slot and each column is a weekday.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {timeSlots.length} active slots
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/40">
                                    <th className="sticky left-0 z-10 w-48 border-r border-slate-200 bg-slate-50/95 p-4 text-left text-sm font-bold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400">
                                        Time
                                    </th>
                                    {DAYS.map((day) => (
                                        <th key={day} className="min-w-[170px] p-4 text-left text-base font-bold text-slate-700 dark:text-slate-200">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {timeSlots.map((slot, tIndex) => (
                                    <tr key={tIndex} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/20">
                                        <td className="sticky left-0 z-10 whitespace-nowrap border-r border-slate-200 bg-white/95 p-4 font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-200">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{slot.start} - {slot.end}</div>
                                                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Time slot</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteTimeSlot(tIndex)}
                                                    className="rounded-lg p-2 text-red-500 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-950/30"
                                                    title="Delete this time slot"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        {DAYS.map((_, dIndex) => (
                                            <td key={dIndex} className="p-3">
                                                <select
                                                    value={scheduleMatrix[tIndex]?.[dIndex] || "no_lecture"}
                                                    onChange={(e) => handleCellChange(tIndex, dIndex, e.target.value)}
                                                    className={clsx(
                                                        "w-full rounded-xl border px-3 py-3 text-sm outline-none transition-all focus:ring-2",
                                                        scheduleMatrix[tIndex]?.[dIndex] !== "no_lecture"
                                                            ? "border-indigo-200 bg-indigo-50 font-medium text-indigo-700 focus:ring-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                                            : "border-slate-200 bg-white text-slate-500 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                                    )}
                                                >
                                                    <option value="no_lecture">-- No Lecture --</option>
                                                    {subjects.map((sub) => (
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
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <CalendarIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">No time slots added yet</h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Start with the quick-add buttons above, then fill the grid to turn this into your working lecture timetable.
                    </p>
                </div>
            )}
        </div>
    );
}

function InfoPill({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
        </div>
    );
}

function StepRow({ step, text }: { step: string; text: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                {step}
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
        </div>
    );
}
