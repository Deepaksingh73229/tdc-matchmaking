"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function ClientNotificationsUI({ initialNotifications }: { initialNotifications: any[] }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAsRead = async (id: string) => {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));

        try {
            await fetch("/api/client/notifications/read", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            toast.info("Notification dismissed");
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Notifications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Stay updated with your matchmaking progress and admin messages.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none min-h-[400px] relative overflow-hidden">
                {/* Premium Ambient Background */}
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-stone-100 dark:border-slate-800 relative z-10">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                        <Bell className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Activity Feed</h2>
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="w-24 h-24 bg-stone-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100 dark:border-slate-700"
                        >
                            <Bell className="w-10 h-10 text-stone-300 dark:text-slate-600" />
                        </motion.div>
                        <p className="text-slate-900 dark:text-white font-bold text-xl">No new updates yet.</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
                            We will notify you here as soon as your matchmaker takes action on your profile.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-4 relative z-10"
                    >
                        <AnimatePresence>
                            {notifications.map((n) => (
                                <motion.div
                                    variants={itemVariants}
                                    layout
                                    key={n._id}
                                    className={`group p-6 rounded-2xl border transition-all duration-300 ${n.isRead
                                            ? 'bg-stone-50/50 dark:bg-slate-950/50 border-stone-100 dark:border-slate-800/50 opacity-80 hover:opacity-100'
                                            : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-lg shadow-rose-100/50 dark:shadow-none hover:-translate-y-0.5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            {!n.isRead && (
                                                <span className="flex h-2.5 w-2.5 relative mt-1">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                                </span>
                                            )}
                                            <h4 className={`font-bold text-lg ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                {n.title}
                                            </h4>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <p className={`leading-relaxed mb-5 ${n.isRead ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {n.message}
                                    </p>

                                    {n.type === 'MATCH_PROPOSAL' && n.relatedId && (
                                        <div className="mb-4">
                                            <button
                                                onClick={() => router.push(`/client-hub/match/${n.relatedId}`)}
                                                className="px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-rose-600 dark:hover:bg-rose-500 text-white dark:text-slate-900 hover:text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 group/btn"
                                            >
                                                Review Proposal
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    {n.type === 'SYSTEM' && n.relatedId && n.title.includes("Mutual") && (
                                        <div className="mb-4">
                                            <button
                                                onClick={() => router.push(`/client-hub/match/${n.relatedId}`)}
                                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 group/btn"
                                            >
                                                View Connection
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-stone-100 dark:border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Matchmaker Update</span>
                                        <span>{n.displayDate ?? new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}