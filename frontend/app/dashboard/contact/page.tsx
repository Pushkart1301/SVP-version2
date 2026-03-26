"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Sparkles, Clock3, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqezbvve";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:py-12">
            <div className="mx-auto max-w-6xl space-y-8">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Contact Hub
                            </div>
                            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                                Get in touch with the SVP team.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                                Have a question, spotted an issue, or want to share feedback? Send us a message and we’ll get back to you as soon as possible.
                            </p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <HeroPill icon={Mail} title="Direct Email" subtitle="Reach us anytime" />
                                <HeroPill icon={Clock3} title="Quick Replies" subtitle="Usually within 24-48h" />
                                <HeroPill icon={ShieldCheck} title="Support Ready" subtitle="Helpful for account issues" />
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(99,102,241,0.08))] p-6 dark:border-slate-700 dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.14),rgba(99,102,241,0.10))]">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
                                <Mail className="h-10 w-10" />
                            </div>
                            <h2 className="mt-5 text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                We’d love to hear from you
                            </h2>
                            <p className="mt-3 text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Include clear details so we can help faster, especially for timetable, attendance, or account-related issues.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-4">
                        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email</h3>
                                    <p className="mt-2 break-all text-sm leading-6 text-slate-600 dark:text-slate-400">
                                        toshniwal.pushkarx@gmail.com
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Response Time</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                        Within 24-48 hours for most messages.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-3xl border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-800/40 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick tip</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                Include your student ID or registered email for faster help with account-related queries.
                            </p>
                        </Card>
                    </div>

                    <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Send us a message</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Your existing submission flow stays exactly the same. Only the UI has been refreshed.
                            </p>
                        </div>

                        {status === "success" && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 animate-fade-in dark:border-green-800/50 dark:bg-green-900/20">
                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    Message sent successfully! We'll get back to you soon.
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 animate-fade-in dark:border-red-800/50 dark:bg-red-900/20">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
                                <p className="break-words text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Field label="Your Name *" icon={<User className="h-5 w-5" />}>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </Field>

                                <Field label="Email Address *" icon={<Mail className="h-5 w-5" />}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                </Field>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="What is this regarding?"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    placeholder="Tell us more about your query..."
                                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                            >
                                {status === "loading" ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HeroPill({ icon: Icon, title, subtitle }: any) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
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

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    {icon}
                </div>
                {children}
            </div>
        </div>
    );
}
