"use client";

import Link from "next/link";
import { GraduationCap, Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 transition-colors">
            <div className="max-w-[1400px] mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-500 dark:bg-blue-600 rounded-lg p-1.5">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">Student Vacation Planner</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Plan your attendance smartly, track your progress, and take vacations without worrying about falling behind.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            {[
                                { label: "Dashboard", href: "/dashboard" },
                                { label: "Attendance", href: "/dashboard/calendar" },
                                { label: "Subjects", href: "/dashboard/subjects" },
                                { label: "Plan Vacation", href: "/dashboard/planner" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-black dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resources</h4>
                        <ul className="space-y-2">
                            {[
                                { label: "Timetable", href: "/dashboard/schedule" },
                                { label: "Contact Us", href: "/dashboard/contact" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-black dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Connect</h4>
                        <div className="flex items-center gap-3">
                            <a
                                href="mailto:support@svp.com"
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                            Built with ❤️ for students
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        © {currentYear} Student Vacation Planner 2.0. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-black dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full inline-block">Privacy Policy</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-black dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full inline-block">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
