"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import {
    Upload,
    Plane,
    BookOpen,
    Loader2,
    Sparkles,
    CalendarDays,
    ShieldCheck,
    ArrowRight,
    BrainCircuit,
} from "lucide-react";

export default function PlannerPage() {
    const [activeTab, setActiveTab] = useState<"vacation" | "study" | "upload">("upload");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [query, setQuery] = useState("");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        try {
            const res = await api.post("/planner/academic-calendar/upload", formData);
            setResult(res.data);
        } catch (err) {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const generateVacation = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await api.post("/planner/vacation/generate", {
                min_attendance: 75,
                query,
            });

            setResult(res.data);
        } catch (err) {
            alert("Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    const generateStudy = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post("/planner/study-plan/generate", {
                focus: "weak_areas",
                daily_hours: 4,
            });
            setResult(res.data);
        } catch (err) {
            alert("Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-5">
            <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),radial-gradient(circle_at_85%_20%,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.94))] p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_35%),radial-gradient(circle_at_85%_20%,_rgba(34,197,94,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.96))] md:p-8">
                <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-slate-900/60 dark:text-blue-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            Planner Studio
                        </div>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                            Turn your timetable into smarter breaks and sharper study plans.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                            Upload your academic calendar, ask for safe leave windows, and get study suggestions from one focused command center.
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <InsightPill icon={CalendarDays} title="Calendar Aware" subtitle="Reads uploaded academic events" />
                            <InsightPill icon={ShieldCheck} title="Attendance Safe" subtitle="Built around your attendance buffer" />
                            <InsightPill icon={BrainCircuit} title="AI Assisted" subtitle="Vacation and study guidance" />
                        </div>
                    </div>

                    <div className="flex gap-2 self-start rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-lg backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
                        <TabButton active={activeTab === "upload"} onClick={() => { setActiveTab("upload"); setResult(null); }} icon={Upload}>Upload Calendar</TabButton>
                        <TabButton active={activeTab === "vacation"} onClick={() => { setActiveTab("vacation"); setResult(null); }} icon={Plane}>Vacation</TabButton>
                        <TabButton active={activeTab === "study"} onClick={() => { setActiveTab("study"); setResult(null); }} icon={BookOpen}>Study Plan</TabButton>
                    </div>
                </div>
            </section>

            <Card className="min-h-[520px] overflow-hidden border-slate-200/70 bg-white/90 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.6)] dark:border-slate-700/70 dark:bg-slate-900/85">
                {loading && (
                    <div className="flex min-h-[520px] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_40%)] px-6 py-20 text-center">
                        <div className="rounded-3xl border border-blue-200/70 bg-white/80 p-5 shadow-xl dark:border-blue-500/20 dark:bg-slate-900/80">
                            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">Thinking through your plan</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Crunching attendance, calendar context, and AI suggestions...
                            </p>
                        </div>
                    </div>
                )}

                {!loading && activeTab === "upload" && (
                    <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
                        <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.85))] p-8 text-center shadow-sm transition-colors hover:border-blue-400 dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(17,24,39,0.7))] dark:hover:border-blue-500">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <Upload className="h-7 w-7" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Upload Academic Calendar</h3>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Drop in a PDF or image and let the planner extract holidays and exams so later vacation suggestions have better context.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">PDF</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Images</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">OCR + AI</span>
                            </div>
                            <label className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700">
                                <Upload className="h-4 w-4" />
                                Select File
                                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,image/*" />
                            </label>
                        </div>

                        <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-6 dark:border-slate-700 dark:bg-slate-950/40">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">What happens after upload?</h4>
                            <div className="mt-5 space-y-4">
                                <ProcessStep number="01" title="Text extraction" description="The planner reads your calendar from PDF or image input." />
                                <ProcessStep number="02" title="Event detection" description="AI identifies holidays and exam entries from the extracted text." />
                                <ProcessStep number="03" title="Planning context" description="Those events can then guide safer vacation suggestions." />
                            </div>
                        </div>

                        {result && (
                            <div className="grid w-full gap-6 text-left md:col-span-2 md:grid-cols-2">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                                    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                                        <Plane className="h-4 w-4" />
                                        Holidays ({result.data?.holidays?.length || 0})
                                    </div>
                                    <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-700">
                                        {result.data?.holidays?.map((h: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{h.name}</span>
                                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">{h.start_date}</span>
                                            </div>
                                        ))}
                                        {(!result.data?.holidays || result.data.holidays.length === 0) && (
                                            <p className="p-4 text-center text-sm text-slate-400">No holidays found.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                                    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                                        <BookOpen className="h-4 w-4" />
                                        Exams ({result.data?.exams?.length || 0})
                                    </div>
                                    <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-700">
                                        {result.data?.exams?.map((e: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{e.subject}</span>
                                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">{e.date}</span>
                                            </div>
                                        ))}
                                        {(!result.data?.exams || result.data.exams.length === 0) && (
                                            <p className="p-4 text-center text-sm text-slate-400">No exams found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === "vacation" && (
                    <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
                        <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.82))] p-7 shadow-sm dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(17,24,39,0.72))]">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.25em]">Vacation Query</span>
                            </div>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Plan your next break with confidence.</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Ask for a month, duration, or a specific break idea and the planner will search for a safer attendance window.
                            </p>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-inner dark:border-slate-700 dark:bg-slate-900/80">
                                <Input
                                    placeholder="Ask AI: e.g. 'Can I take 4 days off in April?'"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="h-14 border-0 bg-transparent px-2 text-base shadow-none focus:ring-0"
                                />
                                <Button onClick={generateVacation} size="lg" className="mt-3 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700">
                                    Ask AI
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <MiniStat title="Best for" value="Long weekends" />
                                <MiniStat title="Checks" value="Attendance + holidays" />
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-950/40">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Recommended windows</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your best leave options appear here after each query.</p>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                    Planner output
                                </span>
                            </div>

                            {result ? (
                                <div className="mt-6 space-y-4">
                                    {result.windows?.length ? (
                                        result.windows.map((win: any, i: number) => (
                                            <div key={i} className="rounded-3xl border border-emerald-200/80 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-emerald-500/20 dark:bg-slate-900/80">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                            Safe Window
                                                        </div>
                                                        <h4 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                                            {win.start_date} - {win.end_date}
                                                        </h4>
                                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{win.reason}</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                        Approved
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyResult
                                            icon={Plane}
                                            title="No safe windows found yet"
                                            description="Try a different month or ask for a shorter leave request."
                                        />
                                    )}

                                    {result.ai_advice && (
                                        <div className="rounded-3xl border border-blue-200/80 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(34,197,94,0.06))] p-5 dark:border-blue-500/20">
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                <Sparkles className="h-4 w-4" />
                                                <span className="text-sm font-semibold">AI advice</span>
                                            </div>
                                            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{result.ai_advice}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-6">
                                    <EmptyResult
                                        icon={CalendarDays}
                                        title="Ask for a leave window"
                                        description="Examples: 'Can I take 4 days off in April?' or 'Suggest a safe break next month.'"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!loading && activeTab === "study" && (
                    <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-10">
                        <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.85))] p-7 shadow-sm dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(17,24,39,0.72))]">
                            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                                <BrainCircuit className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.25em]">Study Mode</span>
                            </div>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Generate a focused weekly study rhythm.</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Let the planner create a 7-day routine centered around your subjects and priorities.
                            </p>
                            <Button onClick={generateStudy} size="lg" className="mt-6 w-full rounded-xl bg-violet-600 text-base font-semibold hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500">
                                Generate Plan
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-950/40">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Your study plan</h3>
                            {result ? (
                                <div className="mt-5">
                                    <div className="rounded-3xl border border-violet-200/80 bg-white p-5 shadow-sm dark:border-violet-500/20 dark:bg-slate-900/80">
                                        <p className="text-sm italic leading-6 text-slate-600 dark:text-slate-300">"{result.summary}"</p>
                                    </div>
                                    <div className="mt-5 space-y-4">
                                        {result.daily_tasks?.map((day: any, i: number) => (
                                            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                                                <h4 className="mb-4 text-lg font-bold text-violet-600 dark:text-violet-400">{day.date}</h4>
                                                <div className="space-y-3">
                                                    {day.tasks.map((t: any, j: number) => (
                                                        <div key={j} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/70">
                                                            <span className="font-semibold text-slate-900 dark:text-white">{t.subject}</span>
                                                            <span className="text-slate-500 dark:text-slate-400">{t.topic} ({t.duration_mins}m)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6">
                                    <EmptyResult
                                        icon={BookOpen}
                                        title="Generate your study week"
                                        description="The planner will create a simple 7-day breakdown once you trigger the study plan flow."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

function InsightPill({ icon: Icon, title, subtitle }: any) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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

function ProcessStep({ number, title, description }: any) {
    return (
        <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                {number}
            </div>
            <div>
                <h5 className="font-semibold text-slate-900 dark:text-white">{title}</h5>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
    );
}

function MiniStat({ title, value }: any) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{title}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function EmptyResult({ icon: Icon, title, description }: any) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Icon className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function TabButton({ active, onClick, children, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
        >
            <Icon className="h-4 w-4" />
            {children}
        </button>
    );
}
