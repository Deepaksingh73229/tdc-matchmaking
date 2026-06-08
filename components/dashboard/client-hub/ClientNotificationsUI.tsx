"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
    Bell, CheckCircle2, ArrowRight, Sparkles, HeartHandshake, ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function ClientNotificationsUI({ initialNotifications }: { initialNotifications: any[] }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAsRead = async (id: string) => {
        // Optimistic UI update
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));

        try {
            await fetch("/api/client/notifications/read", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            toast.success("Notification dismissed", { 
                position: "bottom-right",
                className: "text-[13px]" 
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
            toast.error("Failed to dismiss notification");
            // Revert on failure
            setNotifications(initialNotifications);
        }
    };

    // ─── Animation Variants ───
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            transition: { type: "spring", stiffness: 300, damping: 24 } 
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-8 max-w-[900px] mx-auto w-full"
        >
            <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-2xl rounded-[2.5rem] p-7 md:p-12 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/20 dark:shadow-none min-h-[500px] relative overflow-hidden group">
                
                {/* ── Premium Ambient Background ── */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-400/10 dark:bg-rose-500/10 blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                {/* Subtle SVG Geometry */}
                <svg className="absolute top-0 right-0 w-full h-full pointer-events-none text-stone-100 dark:text-white/[0.02] transform translate-x-1/3 -translate-y-1/4" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" opacity="0.3" />
                    <circle cx="50" cy="50" r="30" opacity="0.6" />
                </svg>

                {/* ── Feed Header ── */}
                <div className="flex items-center gap-3.5 mb-8 pb-5 border-b border-stone-200/60 dark:border-white/5 relative z-10">
                    <div className="p-2.5 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-white/10 dark:to-white/5 rounded-xl border border-stone-200/50 dark:border-white/10 shadow-sm">
                        <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Activity Feed</h2>
                </div>

                {notifications.length === 0 ? (
                    /* ── Empty State ── */
                    <div className="flex flex-col items-center justify-center py-20 md:py-28 text-center relative z-10">
                        {/* Empty State Radar */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-20">
                            <svg className="w-64 h-64 text-rose-300 dark:text-rose-500 animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" fill="none">
                                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
                                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/>
                            </svg>
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-20 h-20 bg-gradient-to-br from-stone-50 to-white dark:from-[#1A1B23] dark:to-[#111218] rounded-2xl flex items-center justify-center mb-6 shadow-md border border-stone-200/60 dark:border-white/10 rotate-3"
                        >
                            <Bell className="w-8 h-8 text-rose-400 dark:text-rose-500" strokeWidth={1.5} />
                        </motion.div>
                        <p className="text-slate-800 dark:text-slate-100 font-bold text-xl tracking-tight">All caught up.</p>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                            We will notify you here the moment your matchmaker takes action or a new proposal arrives.
                        </p>
                    </div>
                ) : (
                    /* ── Populated Feed ── */
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-5 relative z-10"
                    >
                        <AnimatePresence mode="popLayout">
                            {notifications.map((n) => (
                                <motion.div
                                    variants={itemVariants}
                                    layout
                                    key={n._id}
                                    className={`group p-6 md:p-8 rounded-[1.5rem] border transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] relative overflow-hidden ${
                                        n.isRead
                                            ? 'bg-stone-50/50 dark:bg-white/[0.02] border-stone-200/50 dark:border-white/5 shadow-none'
                                            : 'bg-white dark:bg-[#1A1B23] border-rose-200/60 dark:border-rose-900/30 shadow-xl shadow-rose-500/5 dark:shadow-none hover:-translate-y-0.5'
                                    }`}
                                >
                                    {/* Unread Accent Bar */}
                                    {!n.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-rose-600"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {!n.isRead && (
                                                <span className="flex h-2.5 w-2.5 relative shrink-0">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                                </span>
                                            )}
                                            <h4 className={`font-bold text-[16px] md:text-[18px] tracking-tight transition-colors duration-500 ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                {n.title}
                                            </h4>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors border border-transparent hover:border-stone-200 dark:hover:border-white/10"
                                                title="Dismiss Notification"
                                            >
                                                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                                            </button>
                                        )}
                                    </div>

                                    <p className={`text-[14px] leading-relaxed mb-6 transition-colors duration-500 ${n.isRead ? 'text-slate-500 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {n.message}
                                    </p>

                                    {/* ── Dynamic Action Buttons ── */}
                                    {n.type === 'MATCH_PROPOSAL' && n.relatedId && (
                                        <div className="mb-5">
                                            <button
                                                onClick={() => router.push(`/client-hub/match/${n.relatedId}`)}
                                                className={`px-6 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all duration-300 group/btn ${
                                                    n.isRead 
                                                    ? 'bg-stone-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400' 
                                                    : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 border border-rose-400/20'
                                                }`}
                                            >
                                                <HeartHandshake className="w-4 h-4" strokeWidth={2} />
                                                Review Proposal
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    {n.type === 'SYSTEM' && n.relatedId && n.title.includes("Mutual") && (
                                        <div className="mb-5">
                                            <button
                                                onClick={() => router.push(`/client-hub/match/${n.relatedId}`)}
                                                className={`px-6 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all duration-300 group/btn ${
                                                    n.isRead 
                                                    ? 'bg-stone-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-400' 
                                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 border border-emerald-400/20'
                                                }`}
                                            >
                                                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                                                View Connection Vault
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Footer Metadata */}
                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-stone-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-widest">
                                        <span>Concierge Update</span>
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