"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
    Heart,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    Sparkles,
    HeartHandshake
} from "lucide-react";
import Link from "next/link";

interface ClientMatchesUIProps {
    initialMatches: any[];
}

export default function ClientMatchesUI({ initialMatches }: ClientMatchesUIProps) {
    const [matches, setMatches] = useState(initialMatches);

    // Animation variants for the staggered grid
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    if (!matches || matches.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50 dark:bg-slate-900 rounded-[2rem] p-12 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none text-center max-w-2xl mx-auto mt-12 relative overflow-hidden"
            >
                {/* Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-sm border border-rose-100 dark:border-slate-700"
                    >
                        <HeartHandshake className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No Matches Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto">
                        Our matchmakers are carefully reviewing profiles to find the perfect connection for you.
                        You will be notified the moment a hand-picked match is proposed!
                    </p>
                    <Link
                        href="/client-hub"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/25"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </motion.div>
        );
    }

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "Connected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mutual Match
                    </span>
                );
            case "Proposed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> New Proposal
                    </span>
                );
            case "Rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <XCircle className="w-3.5 h-3.5" /> Closed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    My Matches
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Review and manage your curated match proposals.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {matches.map((match) => (
                    <motion.div
                        variants={itemVariants}
                        key={match._id}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-7 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none hover:border-rose-300 dark:hover:border-rose-800 transition-colors group relative overflow-hidden"
                    >
                        {/* Subtle Card Hover Glow */}
                        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-rose-400/5 dark:bg-rose-900/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <StatusBadge status={match.overallStatus} />
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-stone-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-stone-100 dark:border-slate-800">
                                <Calendar className="w-3 h-3" />
                                {new Date(match.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex items-center gap-5 mb-6 relative z-10">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 border-[3px] border-white dark:border-slate-800 shadow-md shrink-0 overflow-hidden group-hover:border-rose-100 dark:group-hover:border-rose-900 transition-colors">
                                {match.partner.profilePhoto ? (
                                    <img
                                        src={match.partner.profilePhoto}
                                        alt={match.partner.firstName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <Heart className="w-8 h-8" />
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    {match.partner.firstName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
                                    {match.partner.city}, {match.partner.country || "India"}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-md border border-rose-200/60 dark:border-rose-500/20">
                                    <Heart className="w-3 h-3 fill-current text-rose-500" />
                                    {match.compatibilityScore}% Match
                                </div>
                            </div>
                        </div>

                        <div className="bg-stone-50/80 dark:bg-slate-950/50 rounded-2xl p-4 mb-6 border border-white dark:border-slate-800/50 shadow-inner relative z-10">
                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                Why this match?
                            </h4>
                            <ul className="space-y-2">
                                {match.matchReasons?.slice(0, 2).map((reason: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 font-medium leading-relaxed">
                                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0 shadow-sm" />
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href={`/client-hub/match/${match._id}`}
                            className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all shadow-md hover:shadow-rose-500/25 relative z-10"
                        >
                            Review Proposal
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}