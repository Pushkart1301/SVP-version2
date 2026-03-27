"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Plus, Trash2, BookOpen, Sparkles, Target, ArrowRight, Layers3 } from "lucide-react";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSubject, setNewSubject] = useState({ name: "", code: "", target_attendance_percent: 75 });
    const [loading, setLoading] = useState(false);

    const fetchSubjects = async () => {
        try {
            const res = await api.get("subjects/");
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/subjects", newSubject);
            setNewSubject({ name: "", code: "", target_attendance_percent: 75 });
            fetchSubjects();
        } catch (err) {
            alert("Failed to add subject. Code might be duplicate.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all attendance records for this subject.")) return;
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
    };

    return (
        <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            Subject Manager
                        </div>

                        <div className="mt-4 flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                                    Subjects
                                </h1>
                                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                    Manage your enrolled courses, keep attendance targets clear, and prepare the rest of the dashboard for accurate tracking.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <HeroPill icon={Layers3} title="Course Setup" subtitle="Keep your subject list tidy" />
                            <HeroPill icon={Target} title="Attendance Goals" subtitle="Set target percentages clearly" />
                            <HeroPill icon={BookOpen} title="Planner Ready" subtitle="Feeds the timetable and attendance flow" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current overview</p>
                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{subjects.length}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Subjects configured</p>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
                <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                Your Subjects
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Add, review, and remove subjects without touching the underlying logic.
                            </p>
                        </div>
                    </div>

                    {subjects.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {subjects.map((sub, idx) => {
                                const types = [
                                    { tone: "from-blue-500/15 to-cyan-500/10", badge: "bg-blue-600/15 text-blue-700 dark:text-blue-300", border: "border-blue-200/60 dark:border-blue-500/20" },
                                    { tone: "from-indigo-500/15 to-violet-500/10", badge: "bg-indigo-600/15 text-indigo-700 dark:text-indigo-300", border: "border-indigo-200/60 dark:border-indigo-500/20" },
                                    { tone: "from-violet-500/15 to-fuchsia-500/10", badge: "bg-violet-600/15 text-violet-700 dark:text-violet-300", border: "border-violet-200/60 dark:border-violet-500/20" },
                                ];
                                const style = types[idx % types.length];

                                return (
                                    <Card
                                        key={sub._id}
                                        className={`group relative overflow-hidden border ${style.border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800`}
                                    >
                                        <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${style.tone}`} />

                                        <div className="relative">
                                            <div className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleDelete(sub._id)}
                                                    className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${style.badge}`}>
                                                {sub.code.substring(0, 2).toUpperCase()}
                                            </div>

                                            <h3 className="pr-10 text-xl font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                                {sub.code}
                                            </p>

                                            <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <Target className="h-4 w-4" />
                                                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Attendance Goal</span>
                                                </div>
                                                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                                                    {sub.target_attendance_percent}%
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <BookOpen className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">No subjects added yet</h3>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Add your first subject from the panel on the right to start building the rest of the academic workflow.
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Add Or Configure
                        </h2>
                    </div>

                    <Card className="sticky top-24 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Subject</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">This keeps the existing form logic unchanged.</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject Name</label>
                                <Input
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    required
                                    placeholder="e.g. Data Structures"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject Code</label>
                                <Input
                                    value={newSubject.code}
                                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                    required
                                    placeholder="e.g. CS101"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Attendance (%)</label>
                                <Input
                                    type="number"
                                    value={newSubject.target_attendance_percent}
                                    onChange={(e) => setNewSubject({ ...newSubject, target_attendance_percent: Number(e.target.value) })}
                                    required
                                    min="1"
                                    max="100"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? "Adding..." : "Add Subject"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = "/dashboard/schedule"}
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Map with Timetable
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HeroPill({ icon: Icon, title, subtitle }: any) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}
