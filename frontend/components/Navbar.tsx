"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Bell, Moon, Sun, User, ChevronDown, ChevronUp, Check, CheckCircle2, AlertCircle } from "lucide-react";
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

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

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

    const fetchNotifications = async () => {
        try {
            const { default: api } = await import("@/lib/api");
            const res = await api.get("/notifications");
            if (res.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const { default: api } = await import("@/lib/api");
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { default: api } = await import("@/lib/api");
            await api.put("/notifications/read-all");
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    React.useEffect(() => {
        if (!pathname.includes("/auth")) {
            fetchUser();
            fetchNotifications();
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
                    {/* Notification Dropdown Container */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen);
                                setIsProfileOpen(false); // Close profile if open
                            }}
                            className={clsx(
                                "relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors",
                                isNotificationsOpen && "bg-gray-100 dark:bg-gray-800"
                            )}
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {/* Notification Badge */}
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <>
                                {/* Invisible overlay to click outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsNotificationsOpen(false)}
                                ></div>

                                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Check className="w-3 h-3" />
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => {
                                                            if (!notification.is_read) markAsRead(notification._id);
                                                        }}
                                                        className={clsx(
                                                            "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex gap-3",
                                                            !notification.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                                        )}
                                                    >
                                                        <div className="shrink-0 mt-0.5">
                                                            {notification.type === "success" ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <p className={clsx(
                                                                    "text-sm font-medium text-gray-900 dark:text-white pr-2",
                                                                    !notification.is_read && "font-semibold"
                                                                )}>
                                                                    {notification.title}
                                                                </p>
                                                                {!notification.is_read && (
                                                                    <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500 mt-1.5"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                                                                {notification.message}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                                                                {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center px-4">
                                                <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-center">
                                        <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors py-1 w-full rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                                            View old notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown Container */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsProfileOpen(!isProfileOpen);
                                setIsNotificationsOpen(false); // Close notifications if open
                            }}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 group"
                            aria-label="User menu"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-gray-200 dark:border-gray-700 shrink-0">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{getInitials(userName)}</span>
                                )}
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                {/* Invisible overlay to click outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>

                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    {/* User Info Header */}
                                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 border-2 border-gray-200 dark:border-gray-700">
                                            {user?.profile_image ? (
                                                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{getInitials(userName)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        {/* Edit Profile */}
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setIsEditingProfile(true);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-900 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <User size={20} className="shrink-0" />
                                            <span className="font-medium">Edit Profile</span>
                                        </button>

                                        {/* Dark Mode Toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTheme();
                                            }}
                                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-gray-900 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                {theme === 'dark' ? <Moon size={20} className="shrink-0" /> : <Sun size={20} className="shrink-0" />}
                                                <span className="font-medium">Dark Mode</span>
                                            </div>
                                            {/* Toggle switch visual */}
                                            <div
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </div>
                                        </button>

                                        {/* Divider */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                                        >
                                            <LogOut size={20} className="shrink-0" />
                                            <span className="font-medium">Logout</span>
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
