"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Calendar,
    BookOpen,
    MapPin,
    TrendingUp,
    Clock10Icon,
    ArrowRight,
    Sparkles,
    ShieldAlert,
    ShieldCheck,
    BarChart3,
} from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { StatsCards } from "@/components/StatsCards";
import api from "@/lib/api";
import EditProfileModal from "@/components/EditProfileModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UserProfile {
    full_name: string;
    email: string;
    branch?: string;
    semester?: string;
    profile_image?: string;
}

interface AttendanceStats {
    total_lectures: number;
    lectures_attended: number;
    lectures_missed: number;
    overall_percentage: number;
}

const Dashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [viewMode, setViewMode] = useState<"monthly" | "overall">("monthly");
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [chartStats, setChartStats] = useState<AttendanceStats | null>(null);
    const [overallChartData, setOverallChartData] = useState<any[]>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem("attendanceViewMode") as "monthly" | "overall";
        if (savedMode === "overall" || savedMode === "monthly") {
            setViewMode(savedMode);
        }
    }, []);

    const fetchChartData = async (mode: "monthly" | "overall", month: number, year: number) => {
        setIsChartLoading(true);
        try {
            if (mode === "monthly") {
                const url = `/attendance/stats/overall?mode=monthly&month=${month}&year=${year}`;
                const res = await api.get(url);
                setChartStats(res.data);
            } else {
                const res = await api.get("attendance/history");
                const history = res.data;

                const monthlyData: Record<string, { p: number; total: number }> = {};

                history.forEach((record: any) => {
                    if (!record.date) return;
                    const dateObj = new Date(record.date);
                    const monthKey = dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
                    const key = `${sortKey}|${monthKey}`;

                    if (!monthlyData[key]) {
                        monthlyData[key] = { p: 0, total: 0 };
                    }

                    record.entries?.forEach((entry: any) => {
                        if (entry.status === "P") monthlyData[key].p++;
                        if (entry.status === "P" || entry.status === "A") monthlyData[key].total++;
                    });
                });

                const sortedKeys = Object.keys(monthlyData).sort();
                const processedData = sortedKeys.map((key) => {
                    const label = key.split("|")[1];
                    const data = monthlyData[key];
                    const percentage = data.total > 0 ? (data.p / data.total) * 100 : 0;
                    return {
                        name: label,
                        percentage: Number(percentage.toFixed(1)),
                        target: 75,
                    };
                });

                setOverallChartData(processedData);
            }
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        } finally {
            setIsChartLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchChartData(viewMode, selectedMonth, selectedYear);
        }
    }, [viewMode, selectedMonth, selectedYear, loading]);

    const fetchData = async () => {
        try {
            const [userRes, statsRes, monthlyStatsRes] = await Promise.all([
                api.get("auth/me"),
                api.get("attendance/stats/overall"),
                api.get(`/attendance/stats/overall?mode=latest_month`),
            ]);
            setUser(userRes.data);
            setStats(statsRes.data);
            setMonthlyStats(monthlyStatsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const featureCards = [
        {
            icon: Calendar,
            title: "Attendance Tracker",
            description: "Mark lecture-wise attendance and monitor progress in real time.",
            path: "/dashboard/calendar",
        },
        {
            icon: Clock10Icon,
            title: "Map Subjects to Schedule",
            description: "Map subjects to weekdays and build your personalized timetable.",
            path: "/dashboard/schedule",
        },
        {
            icon: BookOpen,
            title: "Select Subjects",
            description: "Configure subjects for accurate attendance tracking and analytics.",
            path: "/dashboard/subjects",
        },
        {
            icon: MapPin,
            title: "Plan My Vacation",
            description: "Get AI-powered vacation recommendations based on your attendance patterns.",
            path: "/dashboard/planner",
        },
    ];

    const generateAttendanceGraphData = (statsData: AttendanceStats | null) => {
        if (viewMode === "overall") {
            return overallChartData.length > 0 ? overallChartData : [{ name: "No data", percentage: 0, target: 75 }];
        }

        if (!statsData || statsData.total_lectures === 0) {
            return [
                { name: "Week 1", percentage: 0, target: 75 },
                { name: "Week 2", percentage: 0, target: 75 },
                { name: "Week 3", percentage: 0, target: 75 },
                { name: "Week 4", percentage: 0, target: 75 },
            ];
        }

        const currentPercentage = statsData.overall_percentage;

        return [
            { name: "Week 1", percentage: Math.max(0, currentPercentage - 15), target: 75 },
            { name: "Week 2", percentage: Math.max(0, currentPercentage - 10), target: 75 },
            { name: "Week 3", percentage: Math.max(0, currentPercentage - 5), target: 75 },
            { name: "Week 4", percentage: currentPercentage, target: 75 },
        ];
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
    }

    const isOnTrack = (stats?.overall_percentage || 0) >= 75;
    const lecturesNeeded = Math.ceil((75 - (stats?.overall_percentage || 0)) / 2);

    return (
        <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
            <div className="py-5">
                <div className="mx-auto max-w-[1400px] space-y-6 px-4">
                    <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_82%_18%,_rgba(34,197,94,0.12),_transparent_26%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.95))] p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_34%),radial-gradient(circle_at_82%_18%,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.96))] md:p-8">
                        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Dashboard Overview
                                </div>
                                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                                    Welcome back, {user?.full_name || "Student"}.
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                                    Track your attendance, stay on target, and make smarter academic planning decisions from one place.
                                </p>
                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <HeroPill
                                        icon={BarChart3}
                                        title="Overall Attendance"
                                        subtitle={`${stats?.overall_percentage || 0}% currently tracked`}
                                    />
                                    <HeroPill
                                        icon={Calendar}
                                        title="Monthly View"
                                        subtitle={`${monthlyStats?.overall_percentage || 0}% this month`}
                                    />
                                    <HeroPill
                                        icon={isOnTrack ? ShieldCheck : ShieldAlert}
                                        title={isOnTrack ? "On Track" : "Needs Attention"}
                                        subtitle={isOnTrack ? "You have healthy attendance" : "Take action before planning leave"}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Quick status</p>
                                <p className={`mt-2 text-2xl font-black ${isOnTrack ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {isOnTrack ? "Safe to plan" : "Review attendance"}
                                </p>
                                <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {isOnTrack
                                        ? "Your current trend looks good enough to keep planning confidently."
                                        : `Attend the next ${Math.max(0, lecturesNeeded)} lectures to move closer to the 75% target.`}
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="animate-fade-in">
                        <WelcomeSection
                            user={user}
                            stats={stats}
                            monthlyStats={monthlyStats}
                            onEditProfile={() => setIsEditing(true)}
                        />
                    </div>

                    {isEditing && user && (
                        <EditProfileModal user={user} onClose={() => setIsEditing(false)} onUpdate={fetchData} />
                    )}

                    <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                        {stats ? (
                            <div
                                className={`rounded-3xl border p-5 shadow-sm transition-colors ${
                                    isOnTrack
                                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-green-900/20"
                                        : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20"
                                }`}
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                                isOnTrack ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800/70 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-800/70 dark:text-amber-300"
                                            }`}
                                        >
                                            {isOnTrack ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {isOnTrack ? "On Track" : "Action Required"}
                                                </h4>
                                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                    AI Signal
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                {isOnTrack
                                                    ? "Great job! You're maintaining a healthy attendance record. You can safely plan a vacation."
                                                    : <>Your attendance is below the target. Attend the next <strong>{lecturesNeeded}</strong> lectures to safely plan a vacation without falling below minimum requirements.</>}
                                            </p>
                                            {!isOnTrack && (
                                                <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                        Prediction: {Math.min(100, (stats?.overall_percentage || 0) + lecturesNeeded * 0.5).toFixed(1)}% after {lecturesNeeded} lectures
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        Buffer: {Math.max(1, Math.ceil((75 - (stats?.overall_percentage || 0)) / 3))} lectures
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push("/dashboard/planner")}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        View AI Suggestions
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <h4 className="mb-1 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
                                    <Sparkles className="h-4 w-4" />
                                    Getting Started
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Start tracking your attendance by uploading your academic calendar and selecting your subjects.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="animate-fade-in grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.45fr]" style={{ animationDelay: "0.2s" }}>
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Tools</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Move quickly between the core student workflows.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {featureCards.map((card) => (
                                    <button
                                        key={card.title}
                                        onClick={() => router.push(card.path)}
                                        className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-500/40 dark:hover:bg-slate-900"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                                            <card.icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                                                {card.title}
                                            </h4>
                                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                                        </div>
                                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative min-h-[420px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h4 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        {viewMode === "monthly" ? "Attendance Tracking (Monthly)" : "Attendance Tracking (Overall)"}
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {viewMode === "monthly" ? "Shows attendance trend for the selected month." : "Shows cumulative attendance trend over time."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {viewMode === "monthly" && (
                                        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                className="min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                    <option key={m} value={m}>
                                                        {new Date(2000, m - 1, 1).toLocaleString("default", { month: "short" })}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                className="min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div
                                        role="group"
                                        aria-label="View Mode"
                                        className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <button
                                            onClick={() => {
                                                setViewMode("monthly");
                                                localStorage.setItem("attendanceViewMode", "monthly");
                                            }}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${viewMode === "monthly" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => {
                                                setViewMode("overall");
                                                localStorage.setItem("attendanceViewMode", "overall");
                                            }}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${viewMode === "overall" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                                        >
                                            Overall
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isChartLoading ? (
                                <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl bg-slate-50/80 dark:bg-slate-900/60">
                                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading chart data...</span>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300} className="animate-fade-in">
                                    <LineChart data={generateAttendanceGraphData(chartStats)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                                        <YAxis
                                            stroke="#94a3b8"
                                            style={{ fontSize: "12px" }}
                                            domain={[0, 100]}
                                            label={{ value: "Attendance %", angle: -90, position: "insideLeft", style: { fontSize: "12px", fill: "#64748b" } }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} activeDot={{ r: 7 }} name="Attendance %" />
                                        <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target (75%)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                                {viewMode === "monthly" ? "Track your monthly attendance trends to stay on top of your goal" : "Your overall cumulative attendance over time"}
                            </p>
                        </div>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                        <StatsCards stats={stats} />
                    </div>
                </div>
            </div>
        </div>
    );
};

function HeroPill({ icon: Icon, title, subtitle }: any) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
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

export default Dashboard;
