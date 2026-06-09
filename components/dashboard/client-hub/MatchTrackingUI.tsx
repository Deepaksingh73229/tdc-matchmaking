"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Search, Clock, CheckCircle2, HeartHandshake, Heart, Sparkles, XCircle, PauseCircle, Filter, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface MatchTrackingUIProps {
    initialMatches: any[];
}

// Re-using the premium gradient status config
const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
        case "matched":
        case "accepted":
            return {
                icon: CheckCircle2,
                color: "text-emerald-700 dark:text-emerald-400",
                bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5",
                border: "border-emerald-200/60 dark:border-emerald-500/20"
            };
        case "proposed":
            return {
                icon: HeartHandshake,
                color: "text-indigo-700 dark:text-indigo-400",
                bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/10 dark:to-indigo-500/5",
                border: "border-indigo-200/60 dark:border-indigo-500/20"
            };
        case "searching":
            return {
                icon: Search,
                color: "text-blue-700 dark:text-blue-400",
                bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5",
                border: "border-blue-200/60 dark:border-blue-500/20"
            };
        case "on hold":
            return {
                icon: PauseCircle,
                color: "text-slate-600 dark:text-slate-400",
                bg: "bg-gradient-to-br from-stone-100 to-stone-50 dark:from-white/10 dark:to-white/5",
                border: "border-stone-200/60 dark:border-white/10"
            };
        case "declined":
            return {
                icon: XCircle,
                color: "text-rose-700 dark:text-rose-400",
                bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-500/5",
                border: "border-rose-200/60 dark:border-rose-500/20"
            };
        case "pending":
        default:
            return {
                icon: Clock,
                color: "text-amber-700 dark:text-amber-400",
                bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5",
                border: "border-amber-200/60 dark:border-amber-500/20"
            };
    }
};

export default function MatchTrackingUI({ initialMatches }: MatchTrackingUIProps) {
    const [activeTab, setActiveTab] = useState<"Proposed" | "Connected" | "Archived">("Proposed");

    const filteredMatches = initialMatches.filter(m => m.overallStatus === activeTab);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 mt-6">

            {/* Tabs / Segmented Control */}
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 bg-white/60 dark:bg-black/20 backdrop-blur-md p-1 sm:p-1.5 rounded-[1.25rem] border border-stone-200/60 dark:border-white/5 w-full sm:w-fit shadow-sm">
                {(["Proposed", "Connected", "Archived"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 sm:flex-none px-2 py-2.5 sm:px-6 rounded-xl text-[11px] sm:text-[14px] font-bold transition-all duration-300 relative ${activeTab === tab
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >
                        {
                            activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-neutral-700 dark:bg-neutral-800 rounded-xl shadow-md shadow-rose-500/10"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )
                        }

                        <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 w-full">
                            <div className="flex items-center gap-1.5">
                                {tab === "Proposed" && <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />}
                                {tab === "Connected" && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />}
                                {tab === "Archived" && <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />}
                                <span className="whitespace-nowrap hidden min-[360px]:block">{tab}</span>
                            </div>
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-black transition-colors duration-300 ${activeTab === tab
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                }`}>
                                {initialMatches.filter(m => m.overallStatus === tab).length}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                    {
                        filteredMatches.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="col-span-full py-20 text-center bg-white/40 dark:bg-[#111218]/40 backdrop-blur-xl rounded-[2.5rem] border border-stone-200/50 dark:border-white/5 relative overflow-hidden"
                            >
                                {/* Empty State Ambient Radar */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-20">
                                    <svg className="w-64 h-64 text-rose-300 dark:text-rose-500 animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" fill="none">
                                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
                                        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                                        <path d="M100 20 L100 180 M20 100 L180 100" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                                    </svg>
                                </div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-stone-100 dark:border-white/10 rotate-3">
                                        <Filter className="w-7 h-7 text-rose-400 dark:text-rose-500" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">No {activeTab} Matches</h3>

                                    <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                        There are currently no connection records residing in the {activeTab.toLowerCase()} status category.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            filteredMatches.map(match => (
                                <MatchCard key={match._id} match={match} />
                            ))
                        )
                    }
                </AnimatePresence>
            </div>

        </div>
    );
}

function MatchCard({ match }: { match: any }) {
    if (!match.clientA || !match.clientB) return null;

    const StatusIconA = getStatusConfig(match.statusA).icon;
    const StatusIconB = getStatusConfig(match.statusB).icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/90 dark:bg-[#1A1B23]/90 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/20 dark:shadow-none relative group overflow-hidden flex flex-col"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2rem] z-0">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-400/10 dark:bg-rose-500/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            {/* Meta Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border border-emerald-200/60 dark:border-emerald-500/20">
                        <Zap className="w-3 h-3 fill-emerald-500" />
                        {match.compatibilityScore}% Match
                    </span>

                    <span className="text-[11px] sm:text-[12px] font-medium text-slate-400 dark:text-slate-500">
                        • Initiated {formatDistanceToNow(new Date(match.createdAt))} ago
                    </span>
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-6">
                {/* Client A */}
                <div className="flex-1 flex flex-col items-center text-center group/client">
                    <Link
                        href={`/dashboard/client/${match.clientA._id}`}
                        className="relative block"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/20 overflow-hidden border-[3px] border-white dark:border-[#1A1B23] shadow-md mx-auto group-hover/client:border-rose-300 dark:group-hover/client:border-rose-900 transition-all duration-300 group-hover/client:scale-105">
                            {
                                match.clientA.profilePhoto ? (
                                    <Image 
                                        src={match.clientA.profilePhoto} 
                                        alt="A" 
                                        width={80} 
                                        height={80} 
                                        className="w-full h-full object-cover" 
                                        loading="lazy"
                                    />
                                ) : (
                                    <User className="w-8 h-8 m-auto text-rose-500 mt-4 md:mt-5" strokeWidth={1.5} />
                                )
                            }
                        </div>
                    </Link>

                    <Link
                        href={`/dashboard/client/${match.clientA._id}`}
                        className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                        <h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight tracking-tight truncate max-w-[120px]">
                            {match.clientA.firstName}
                        </h3>
                    </Link>

                    <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${getStatusConfig(match.statusA).bg} ${getStatusConfig(match.statusA).color} ${getStatusConfig(match.statusA).border} shadow-sm`}>
                        <StatusIconA className="w-3 h-3" strokeWidth={2.5} />
                        {match.statusA}
                    </div>
                </div>

                {/* Center Handshake */}
                <div className="px-2 flex flex-col items-center">
                    <HeartHandshake
                        className="w-12 h-12 sm:w-16 sm:h-16 opacity-10 text-rose-500"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Client B */}
                <div className="flex-1 flex flex-col items-center text-center group/client">
                    <Link
                        href={`/dashboard/client/${match.clientB._id}`}
                        className="relative block"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/20 overflow-hidden border-[3px] border-white dark:border-[#1A1B23] shadow-md mx-auto group-hover/client:border-rose-300 dark:group-hover/client:border-rose-900 transition-all duration-300 group-hover/client:scale-105">
                            {match.clientB.profilePhoto ? (
                                <Image 
                                    src={match.clientB.profilePhoto} 
                                    alt="B" 
                                    width={80} 
                                    height={80} 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                />
                            ) : (
                                <User className="w-8 h-8 m-auto text-rose-500 mt-4 md:mt-5" strokeWidth={1.5} />
                            )}
                        </div>
                    </Link>

                    <Link
                        href={`/dashboard/client/${match.clientB._id}`}
                        className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                        <h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight tracking-tight truncate max-w-[120px]">
                            {match.clientB.firstName}
                        </h3>
                    </Link>

                    <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${getStatusConfig(match.statusB).bg} ${getStatusConfig(match.statusB).color} ${getStatusConfig(match.statusB).border} shadow-sm`}>
                        <StatusIconB className="w-3 h-3" strokeWidth={2.5} />
                        {match.statusB}
                    </div>
                </div>
            </div>

            {/* Card Action Footer */}
            <div className="mt-auto pt-5 border-t border-stone-200/50 dark:border-white/5 relative z-10">
                <Link
                    href={`/dashboard/client/${match.clientA._id}`}
                    className="w-full flex items-center justify-center py-3 bg-stone-50/80 hover:bg-stone-100 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-stone-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300 text-[13px] font-bold rounded-xl transition-all duration-300"
                >
                    Manage Match & Details
                </Link>
            </div>

        </motion.div>
    );
}