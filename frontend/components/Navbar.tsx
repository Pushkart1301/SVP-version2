"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Bell, Moon, Sun, User, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/contexts/ThemeContext";
import EditProfileModal from "@/components/EditProfileModal";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [user, setUser] = useState<{ full_name: string; email: string; profile_image?: string; branch?: string; semester?: string } | null>(null);

    const fetchUser = async () => {
        try {
            // api lib handles token injection
            const { default: api } = await import("@/lib/api");
            const res = await api.get("/auth/me");
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user in navbar", error);
        }
    };

    React.useEffect(() => {
        if (!pathname.includes("/auth")) {
            fetchUser();
        }
    }, [pathname]);

    if (pathname.includes("/auth")) return null;

    // Fallback UI data
    const userName = user?.full_name || "Student User";
    const userEmail = user?.email || "student@example.com";

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

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
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
            <div className="px-4 h-16 flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
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

                {/* Notification and Profile Dropdown */}
                <div className="flex items-center gap-4 ml-auto relative">
                    {/* Notification Icon */}
                    <button
                        className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {/* Notification Badge */}
                        <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-white dark:ring-gray-900">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{getInitials(userName)}</span>
                                )}
                            </div>
                            {isProfileOpen ? <ChevronUp size={16} className="text-gray-500 mr-1" /> : <ChevronDown size={16} className="text-gray-500 mr-1" />}
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                {/* Invisible overlay to click outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>

                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden py-2" style={{
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                            {user?.profile_image ? (
                                                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{getInitials(userName)}</span>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

                                    <div className="px-2 py-1 space-y-1">
                                        {/* Edit Profile */}
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setIsEditingProfile(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <User size={18} className="text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium">Edit Profile</span>
                                        </button>

                                        {/* Dark Mode Toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTheme();
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {theme === 'dark' ? <Moon size={18} className="text-gray-500 dark:text-gray-400" /> : <Sun size={18} className="text-gray-500 dark:text-gray-400" />}
                                                <span className="font-medium">Dark Mode</span>
                                            </div>
                                            {/* Toggle switch visual */}
                                            <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

                                    <div className="px-2 py-1">
                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditingProfile && user && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditingProfile(false)}
                    onUpdate={fetchUser}
                />
            )}
        </nav>
    );
}
