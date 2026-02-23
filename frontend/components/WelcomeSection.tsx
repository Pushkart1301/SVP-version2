"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Edit3 } from "lucide-react";

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

interface WelcomeSectionProps {
    user: UserProfile | null;
    stats: AttendanceStats | null;
    onEditProfile: () => void;
}

export function WelcomeSection({ user, stats, onEditProfile }: WelcomeSectionProps) {
    const userName = user?.full_name || "Student";
    const currentAttendance = stats?.overall_percentage || 0;
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Profile Section */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={user?.profile_image} alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg">
                            {getInitials(userName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.semester && user?.branch
                                ? `Semester ${user.semester} • ${user.branch}`
                                : "Set your Semester & Branch"}
                        </p>
                        {user?.branch && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                AIML Specialization
                            </p>
                        )}
                    </div>
                </div>

                {/* Attendance Progress */}
                <div className="flex-1 max-w-md space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Attendance Goal Progress
                        </span>
                        <span className={`text-sm font-semibold ${currentAttendance >= targetAttendance ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {currentAttendance}% / 100%
                        </span>
                    </div>
                    <Progress
                        value={currentAttendance}
                        className="h-2.5"
                        indicatorClassName={currentAttendance >= targetAttendance ? "bg-green-500" : "bg-red-500"}
                    />
                    <p className={`text-xs ${currentAttendance >= targetAttendance ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {currentAttendance < targetAttendance
                            ? `⚠ ${(targetAttendance - currentAttendance).toFixed(1)}% below target (${targetAttendance}%)`
                            : `✓ ${(currentAttendance - targetAttendance).toFixed(1)}% above target (${targetAttendance}%)`}
                    </p>
                </div>
            </div>
        </div>
    );
}
