"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Edit3, Calendar, TrendingUp } from "lucide-react";

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
    month_label?: string;
}

interface WelcomeSectionProps {
    user: UserProfile | null;
    stats: AttendanceStats | null;
    monthlyStats?: AttendanceStats | null;
    onEditProfile: () => void;
}

export function WelcomeSection({ user, stats, monthlyStats, onEditProfile }: WelcomeSectionProps) {
    const userName = user?.full_name || "Student";
    const overallAttendance = stats?.overall_percentage || 0;
    const monthlyAttendance = monthlyStats?.overall_percentage || 0;
    const targetAttendance = 75;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors mb-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                {/* Profile Section */}
                <div className="flex items-center gap-4 lg:w-1/3">
                    <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                        <AvatarImage src={user?.profile_image} alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
                            {getInitials(userName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">{userName}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {user?.semester && user?.branch
                                ? `Semester ${user.semester} • ${user.branch}`
                                : "Set your Semester & Branch"}
                        </p>
                        {user?.branch && (
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 inline-flex px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30">
                                AIML Specialization
                            </p>
                        )}
                    </div>
                </div>

                {/* Attendance Progress Bars */}
                <div className="flex-1 flex flex-col justify-center gap-4 lg:w-2/3">
                    {/* Monthly Progress Tracking */}
                    <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Progress Tracking</h4>
                                    <span className="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {monthlyStats?.month_label ? `Progress for ${monthlyStats.month_label}` : "Shows month-by-month performance"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Progress
                                value={monthlyAttendance}
                                className="h-1.5 flex-1"
                                indicatorClassName={monthlyAttendance >= targetAttendance ? "bg-green-500" : "bg-amber-500"}
                            />
                            <span className={`text-sm font-bold shrink-0 ${monthlyAttendance >= targetAttendance ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-500"}`}>
                                {monthlyAttendance}% <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">/ 100%</span>
                            </span>
                        </div>
                    </div>

                    {/* Overall Attendance */}
                    <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Overall Attendance</h4>
                                    <span className="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">Shows cumulative performance</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Progress
                                value={overallAttendance}
                                className="h-1.5 flex-1"
                                indicatorClassName={overallAttendance >= targetAttendance ? "bg-green-500 dark:bg-green-400" : "bg-amber-500 dark:bg-amber-500"}
                            />
                            <span className={`text-sm font-bold shrink-0 ${overallAttendance >= targetAttendance ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-500"}`}>
                                {overallAttendance}% <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">/ 100%</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
