"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Bell, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    if (pathname.includes("/auth")) return null;

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/calendar", label: "Attendance" },
        { href: "/dashboard/subjects", label: "Subjects" },
        { href: "/dashboard/schedule", label: "Timetable" },
        { href: "/dashboard/planner", label: "Plan Vacation" },
        { href: "/dashboard/contact", label: "Contact Us" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 overflow-x-auto transition-colors">
            <div className="px-4 h-16 flex items-center gap-4 min-w-max">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-blue-500 dark:bg-blue-600 rounded-lg p-1.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">VP</span>
                </Link>

                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "text-sm font-medium transition-colors relative py-5 px-2",
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                        >
                            {link.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400 rounded-t-full" />
                            )}
                        </Link>
                    )
                })}

                {/* Notification, Dark Mode Toggle, and Logout Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Notification Icon */}
                    <button
                        className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {/* Notification Badge */}
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
