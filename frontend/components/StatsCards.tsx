import { CheckCircle2, XCircle, Calendar, TrendingUp } from "lucide-react";
import React from "react";

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    iconColor: string;
}

function StatCard({ icon, value, label, iconColor }: StatCardProps) {
    return (
        <div className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex flex-col gap-3">
                <div className={`transition-transform group-hover:scale-110`}>
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{label}</div>
                </div>
            </div>
        </div>
    );
}

interface AttendanceStats {
    total_lectures: number;
    lectures_attended: number;
    lectures_missed: number;
    overall_percentage: number;
}

interface StatsCardsProps {
    stats: AttendanceStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const statItems = [
        {
            icon: <CheckCircle2 className="h-5 w-5" />,
            value: stats?.lectures_attended || 0,
            label: "Lectures Attended",
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            icon: <XCircle className="h-5 w-5" />,
            value: stats?.lectures_missed || 0,
            label: "Lectures Missed",
            bgColor: "bg-red-50",
            iconColor: "text-red-600",
        },
        {
            icon: <Calendar className="h-5 w-5" />,
            value: stats ? stats.lectures_attended + stats.lectures_missed : 0,
            label: "Total Lectures Marked",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            icon: <TrendingUp className="h-5 w-5" />,
            value: `${stats?.overall_percentage || 0}%`,
            label: "Overall Attendance",
            bgColor: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}
