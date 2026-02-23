"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Plus, Trash2, BookOpen } from "lucide-react";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSubject, setNewSubject] = useState({ name: "", code: "", target_attendance_percent: 75 });
    const [loading, setLoading] = useState(false);

    const fetchSubjects = async () => {
        try {
            const res = await api.get("/subjects");
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

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
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto px-4 py-5">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Subjects</h1>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Manage your enrolled courses and attendance goals</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* List */}
                <div className="md:col-span-2">
                    <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                        Your Subjects
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((sub, idx) => {
                            // Use index to cycle through visual types for demonstration
                            const types = [
                                { bg: "bg-blue-600/20", text: "text-blue-600 dark:text-blue-400" },
                                { bg: "bg-indigo-600/20", text: "text-indigo-600 dark:text-indigo-400" },
                                { bg: "bg-violet-600/20", text: "text-violet-600 dark:text-violet-400" }
                            ];
                            const typeStyle = types[idx % types.length];

                            return (
                                <Card
                                    key={sub._id}
                                    className="relative group hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(sub._id)} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div>
                                        <div className={`w-10 h-10 rounded-xl ${typeStyle.bg} ${typeStyle.text} flex items-center justify-center text-sm mb-4 font-bold shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
                                            {sub.code.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate pr-6">{sub.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">{sub.code}</p>
                                    </div>

                                    <div className="flex justify-start items-center pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                                            Target {sub.target_attendance_percent}%
                                        </span>
                                    </div>
                                </Card>
                            )
                        })}
                        {subjects.length === 0 && (
                            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400">No subjects added yet. Add one to get started!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Form */}
                <div>
                    <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                        Add or Configure
                    </h3>
                    <Card className="sticky top-24 border-slate-200 dark:border-slate-700/50 shadow-sm bg-slate-50/50 dark:bg-white/5 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Add New Subject</h3>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Subject Name</label>
                                <Input value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required placeholder="e.g. Data Structures" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Subject Code</label>
                                <Input value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} required placeholder="e.g. CS101" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Target Attendance (%)</label>
                                <Input type="number" value={newSubject.target_attendance_percent} onChange={e => setNewSubject({ ...newSubject, target_attendance_percent: Number(e.target.value) })} required min="1" max="100" />
                            </div>
                            <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" disabled={loading}>
                                {loading ? "Adding..." : "Add Subject"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = '/dashboard/schedule'}
                                className="w-full mt-2 gap-2 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Map with Timetable
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
