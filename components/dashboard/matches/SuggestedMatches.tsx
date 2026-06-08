"use client";

import { User, Sparkles, MapPin, Briefcase, HeartHandshake, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

interface MatchProps {
    matches: any[];
    currentClientName?: string;
    currentClientId?: string;
    isClientPortal?: boolean;
}

// ─── Animation Variants ───
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export default function SuggestedMatches({ matches, currentClientName, currentClientId, isClientPortal = false }: MatchProps) {
    // ─── Empty State ───
    if (!matches || matches.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-xl rounded-[2rem] p-10 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/20 dark:shadow-none text-center relative overflow-hidden group w-full"
            >
                {/* Searching Radar SVG Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 dark:opacity-20">
                    <svg className="w-64 h-64 text-rose-300 dark:text-rose-500 animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
                        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                        <path d="M100 20 L100 180 M20 100 L180 100" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-5 rotate-3 shadow-sm border border-rose-100 dark:border-rose-500/20">
                        <Sparkles className="w-7 h-7 text-rose-400 dark:text-rose-500 animate-pulse" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">No Compatible Matches</h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] leading-relaxed">
                        The AI engine needs a broader pool of verified profiles to construct highly compatible connections.
                    </p>
                </div>
            </motion.div>
        );
    }

    // ─── Populated State ───
    return (
        <div className={`bg-white/80 dark:bg-[#111218]/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/20 dark:shadow-none relative overflow-hidden ${isClientPortal ? "w-full" : ""}`}>

            {/* Soft AI Glow Top Right */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-400/10 dark:bg-rose-500/10 blur-[60px] rounded-full pointer-events-none"></div>

            {!isClientPortal && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200/60 dark:border-white/5 relative z-10">
                    <Sparkles className="w-8 h-8 text-rose-600 dark:text-rose-500" strokeWidth={1.5} />

                    <div>
                        <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                            AI Suggested
                        </h2>

                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400/80 dark:text-slate-500">
                            For {currentClientName}
                        </p>
                    </div>
                </div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={`relative z-10 ${isClientPortal ? "grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8" : "space-y-4"}`}
            >
                {
                    matches.map((match) => {
                        const href = isClientPortal 
                            ? `/client-hub/match/${match._id}` 
                            : `/dashboard/compare/${currentClientId}/${match.profile._id}`;
                        
                        return (
                            <motion.div
                                key={match.profile._id}
                                variants={itemVariants}
                                className="group flex flex-col relative p-5 rounded-[1.5rem] border border-stone-200/60 dark:border-white/5 bg-stone-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/5 hover:border-rose-100 dark:hover:border-rose-200/30 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 overflow-hidden"
                            >
                                {/* ─── Header: Profile Info & Score ─── */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <Link
                                        href={isClientPortal ? '#' : `/dashboard/client/${match.profile._id}`}
                                        className="flex items-center gap-4 flex-1 min-w-0"
                                    >
                                        {/* Dynamic Profile Photo with Halo */}
                                        <div className="relative w-14 h-14 shrink-0">
                                            <div className="relative w-full h-full rounded-full flex items-center justify-center text-rose-500 overflow-hidden border-[3px] border-white dark:border-neutral-800 shadow-md z-10 transition-transform duration-300 group-hover:scale-[1.05]">
                                                {
                                                    match.profile.profilePhoto ? (
                                                        <img
                                                            src={match.profile.profilePhoto}
                                                            alt={match.profile.firstName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-6 h-6" strokeWidth={1.5} />
                                                    )
                                                }
                                            </div>
                                        </div>

                                        <div className="truncate pr-2">
                                            <h4 className="font-semibold text-[16px] text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-wide truncate">
                                                {match.profile.firstName} {match.profile.lastName}
                                            </h4>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                                                {match.profile.age} yrs <span className="opacity-40 mx-1">•</span> {match.profile.gender}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Match Score Badge */}
                                    <div className="shrink-0 pl-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-linear-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-500/10 dark:to-teal-500/5 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                            <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                            {match.score}%
                                        </span>
                                    </div>
                                </div>

                                {/* ─── Quick Details ─── */}
                                <div className="flex flex-wrap gap-2.5 mb-5 relative z-10">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-black/20 text-[12px] font-medium text-slate-600 dark:text-slate-400 border border-stone-100 dark:border-white/5">
                                        <MapPin className="w-3.5 h-3.5 text-rose-400 dark:text-rose-500/70" />
                                        {match.profile.city || "Location unknown"}
                                    </span>

                                    {match.profile.profession && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-black/20 text-[12px] font-medium text-slate-600 dark:text-slate-400 border border-stone-100 dark:border-white/5">
                                            <Briefcase className="w-3.5 h-3.5 text-rose-400 dark:text-rose-500/70" />
                                            {match.profile.profession}
                                        </span>
                                    )}
                                </div>

                                {/* ─── AI Reasoning Engine Output ─── */}
                                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 mb-5 relative z-10 flex-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                                    <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">
                                        AI Synergy Engine
                                    </span>

                                    <ul className="space-y-2">
                                        {
                                            match.reasons.map((reason: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
                                                    <span>{reason}</span>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                {/* ─── Action Button ─── */}
                                <div className="relative z-10 mt-auto pt-2">
                                    <Link href={href} className="block">
                                        {isClientPortal ? (
                                            <button
                                                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-rose-500/25 hover:-translate-y-0.5 group/btn border border-transparent hover:border-rose-400/20"
                                            >
                                                Open Portfolio
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full py-3.5 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 group/btn border border-rose-400/20"
                                            >
                                                <HeartHandshake className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                Review & Propose Match
                                            </button>
                                        )}
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })
                }
            </motion.div>
        </div>
    );
}