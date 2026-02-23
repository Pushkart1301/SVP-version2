"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, BookOpen, MapPin, TrendingUp, Clock10Icon, ArrowRight } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
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

    // Chart specific states
    const [viewMode, setViewMode] = useState<'monthly' | 'overall'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [chartStats, setChartStats] = useState<AttendanceStats | null>(null);
    const [isChartLoading, setIsChartLoading] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('attendanceViewMode') as 'monthly' | 'overall';
        if (savedMode === 'overall' || savedMode === 'monthly') {
            setViewMode(savedMode);
        }
    }, []);

    const fetchChartData = async (mode: 'monthly' | 'overall', month: number, year: number) => {
        setIsChartLoading(true);
        try {
            const url = mode === 'monthly'
                ? `/attendance/stats/overall?mode=monthly&month=${month}&year=${year}`
                : `/attendance/stats/overall?mode=overall`;
            const res = await api.get(url);
            setChartStats(res.data);
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        } finally {
            setIsChartLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if not initializing auth
        if (!loading) {
            fetchChartData(viewMode, selectedMonth, selectedYear);
        }
    }, [viewMode, selectedMonth, selectedYear, loading]);

    const fetchData = async () => {
        try {
            const [userRes, statsRes, monthlyStatsRes] = await Promise.all([
                api.get("/auth/me"),
                api.get("/attendance/stats/overall"),
                api.get(`/attendance/stats/overall?mode=latest_month`)
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
            actionLabel: "Open Tracker",
            path: "/dashboard/calendar"
        },
        {
            icon: Clock10Icon,
            title: "Map Subjects to Schedule",
            description: "Map subjects to weekdays and build your personalized timetable.",
            actionLabel: "Get Started",
            path: "/dashboard/schedule"
        },
        {
            icon: BookOpen,
            title: "Select Subjects",
            description: "Configure subjects for accurate attendance tracking and analytics.",
            actionLabel: "Configure Now",
            path: "/dashboard/subjects"
        },
        {
            icon: MapPin,
            title: "Plan My Vacation",
            description: "Get AI-powered vacation recommendations based on your attendance patterns.",
            actionLabel: "Plan Vacation",
            path: "/dashboard/planner"
        }
    ];

    // Generate attendance graph data
    const generateAttendanceGraphData = (stats: AttendanceStats | null) => {
        if (!stats || stats.total_lectures === 0) {
            // Return sample/placeholder data
            return [
                { week: 'Week 1', percentage: 0, target: 75 },
                { week: 'Week 2', percentage: 0, target: 75 },
                { week: 'Week 3', percentage: 0, target: 75 },
                { week: 'Week 4', percentage: 0, target: 75 },
            ];
        }

        // Simulated weekly data (in production, this would come from backend)
        const currentPercentage = stats.overall_percentage;

        // Generate trend data showing progress towards current percentage
        return [
            { week: 'Week 1', percentage: Math.max(0, currentPercentage - 15), target: 75 },
            { week: 'Week 2', percentage: Math.max(0, currentPercentage - 10), target: 75 },
            { week: 'Week 3', percentage: Math.max(0, currentPercentage - 5), target: 75 },
            { week: 'Week 4', percentage: currentPercentage, target: 75 },
        ];
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="py-5">
                <div className="max-w-[1400px] mx-auto px-4 space-y-4">
                    {/* Welcome Section */}
                    <div className="animate-fade-in">
                        <div className="mb-5">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {user?.full_name || "Student"} 👋
                            </h1>
                            <p className="text-base text-gray-500 dark:text-gray-400 mt-1.5">
                                Track your attendance, stay on target, and plan vacations safely.
                            </p>
                        </div>
                        <WelcomeSection
                            user={user}
                            stats={stats}
                            monthlyStats={monthlyStats}
                            onEditProfile={() => setIsEditing(true)}
                        />
                    </div>

                    {/* Edit Modal */}
                    {isEditing && user && (
                        <EditProfileModal
                            user={user}
                            onClose={() => setIsEditing(false)}
                            onUpdate={fetchData}
                        />
                    )}

                    {/* Action Required / On Track Banner */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        {stats ? (
                            <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border ${stats.overall_percentage >= 75
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
                                : "bg-[#FFF8EB] dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                }`}>
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${stats.overall_percentage >= 75 ? "bg-green-100 dark:bg-green-800" : "bg-amber-100 dark:bg-amber-800"}`}>
                                        <span className="text-lg">{stats.overall_percentage >= 75 ? "🎉" : "⚠️"}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`font-bold flex items-center gap-2 ${stats.overall_percentage >= 75 ? "text-green-900 dark:text-green-100" : "text-gray-900 dark:text-gray-100"}`}>
                                            {stats.overall_percentage >= 75 ? "On Track!" : "Action Required"}
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">✦ AI</span>
                                        </h4>
                                        <p className={`text-sm mt-1 ${stats.overall_percentage >= 75 ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-300"}`}>
                                            {stats.overall_percentage >= 75
                                                ? "Great job! You're maintaining a healthy attendance record. You can safely plan a vacation!"
                                                : <>Your attendance is below the target. Attend the next <strong>{Math.ceil((75 - stats.overall_percentage) / 2)} lectures</strong> to safely plan a vacation without falling below minimum requirements.</>}
                                        </p>
                                        {stats.overall_percentage < 75 && (
                                            <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block w-2 h-2 rounded-sm bg-blue-500"></span>
                                                    Prediction: {Math.min(100, stats.overall_percentage + Math.ceil((75 - stats.overall_percentage) / 2) * 0.5).toFixed(1)}% after {Math.ceil((75 - stats.overall_percentage) / 2)} lectures
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block w-2 h-2 rounded-sm bg-green-500"></span>
                                                    Buffer: {Math.max(1, Math.ceil((75 - stats.overall_percentage) / 3))} lectures
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/planner')}
                                    className="shrink-0 self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    <span>✦</span> View AI Suggestions
                                </button>
                            </div>
                        ) : (
                            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                                <h4 className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100 mb-1">
                                    <span>🎯</span> Getting Started
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Start tracking your attendance by uploading your academic calendar and selecting your subjects.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Attendance Tracking Graph & Your Tools Side by Side */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Your Tools - Takes 1 column on large screens */}
                            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">⚡</span>
                                    Your Tools
                                </h3>
                                <div className="flex flex-col gap-2.5 flex-1">
                                    {featureCards.map((card) => (
                                        <div
                                            key={card.title}
                                            onClick={() => router.push(card.path)}
                                            className="group flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                        >
                                            {/* Icon */}
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors">
                                                <card.icon className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors mb-0.5">
                                                    {card.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-relaxed transition-colors">
                                                    {card.description}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Attendance Graph - Takes 2 columns on large screens */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors relative min-h-[380px]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 group relative">
                                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        {viewMode === 'monthly' ? 'Attendance Tracking (Monthly)' : 'Attendance Tracking (Overall)'}
                                        <div
                                            className="ml-1 cursor-help flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold leading-none"
                                            title={viewMode === 'monthly' ? "Shows attendance trend for the selected month" : "Shows cumulative attendance till date"}
                                        >
                                            i
                                        </div>
                                    </h4>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {viewMode === 'monthly' && (
                                            <div className="flex items-center gap-2 animate-fade-in pr-2 border-r border-gray-200 dark:border-gray-700">
                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                    className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 font-medium min-h-[36px]"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                        <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' })}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                    className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 font-medium min-h-[36px]"
                                                >
                                                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div
                                            role="group"
                                            aria-label="View Mode"
                                            className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                                        >
                                            <button
                                                onClick={() => {
                                                    setViewMode('monthly');
                                                    localStorage.setItem('attendanceViewMode', 'monthly');
                                                }}
                                                className={`px-4 py-1 text-sm font-medium rounded-lg transition-all min-h-[28px] ${viewMode === 'monthly' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setViewMode('overall');
                                                    localStorage.setItem('attendanceViewMode', 'overall');
                                                }}
                                                className={`px-4 py-1 text-sm font-medium rounded-lg transition-all min-h-[28px] ${viewMode === 'overall' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                            >
                                                Overall
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isChartLoading ? (
                                    <div className="w-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-xl min-h-[280px]">
                                        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading chart data...</span>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280} className="animate-fade-in">
                                        <LineChart data={generateAttendanceGraphData(chartStats)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                                            <XAxis
                                                dataKey="week"
                                                stroke="#94a3b8"
                                                style={{ fontSize: '12px' }}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                style={{ fontSize: '12px' }}
                                                domain={[0, 100]}
                                                label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="percentage"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', r: 5 }}
                                                activeDot={{ r: 7 }}
                                                name="Attendance %"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="target"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={false}
                                                name="Target (75%)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                    {viewMode === 'monthly' ? "Track your monthly attendance trends to stay on top of your goal" : "Your overall cumulative attendance over time"}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <StatsCards stats={stats} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
