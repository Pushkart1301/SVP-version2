"use client";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
                <Navbar />
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
            </div>
        </AuthGuard>
    );
}
