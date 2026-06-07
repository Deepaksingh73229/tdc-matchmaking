"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Search, Clock, CheckCircle2, HeartHandshake, FileText, Heart, Sparkles, XCircle, PauseCircle, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface MatchTrackingUIProps {
    initialMatches: any[];
}

// Re-using the same status config from ProposedMatchPanel for consistency
const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
        case "matched":
        case "accepted":
            return { icon: Heart, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" };
        case "proposed":
            return { icon: HeartHandshake, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20" };
        case "searching":
            return { icon: Search, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" };
        case "on hold":
            return { icon: PauseCircle, color: "text-slate-600 dark:text-slate-400", bg: "bg-stone-100 dark:bg-slate-800/50", border: "border-stone-200 dark:border-slate-700" };
        case "declined":
            return { icon: XCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20" };
        case "pending":
        default:
            return { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" };
    }
};

export default function MatchTrackingUI({ initialMatches }: MatchTrackingUIProps) {
    const [activeTab, setActiveTab] = useState<"Proposed" | "Connected" | "Archived">("Proposed");
    
    const filteredMatches = initialMatches.filter(m => m.overallStatus === activeTab);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 mt-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <HeartHandshake className="w-8 h-8 text-rose-500" /> Match Control Center
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">Track, manage, and monitor all active proposals and connections across your roster.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-stone-200/60 dark:border-slate-800 w-fit shadow-sm">
                {(["Proposed", "Connected", "Archived"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-rose-600 rounded-xl"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab === "Proposed" && <Clock className="w-4 h-4" />}
                            {tab === "Connected" && <CheckCircle2 className="w-4 h-4" />}
                            {tab === "Archived" && <XCircle className="w-4 h-4" />}
                            {tab}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-slate-800 text-slate-500'}`}>
                                {initialMatches.filter(m => m.overallStatus === tab).length}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredMatches.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="col-span-full py-16 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-stone-200/60 dark:border-slate-800/50 border-dashed"
                        >
                            <Filter className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No {activeTab} matches</h3>
                            <p className="text-slate-500 mt-2">There are currently no matches in this status category.</p>
                        </motion.div>
                    ) : (
                        filteredMatches.map(match => (
                            <MatchCard key={match._id} match={match} />
                        ))
                    )}
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
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/30 dark:shadow-none relative group overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-400/5 dark:bg-rose-900/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {match.compatibilityScore}% Match
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {formatDistanceToNow(new Date(match.createdAt))} ago
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
                {/* Client A */}
                <div className="flex-1 flex flex-col items-center text-center group/client">
                    <Link href={`/dashboard/client/${match.clientA._id}`} className="relative block">
                        <div className="w-16 h-16 mb-3 rounded-full bg-rose-100 dark:bg-rose-900/30 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm mx-auto group-hover/client:border-rose-400 transition-colors">
                            {match.clientA.profilePhoto ? (
                                <img src={match.clientA.profilePhoto} alt="A" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-3 text-rose-500" />
                            )}
                        </div>
                    </Link>
                    <Link href={`/dashboard/client/${match.clientA._id}`} className="hover:text-rose-600 transition-colors">
                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">{match.clientA.firstName}</h3>
                    </Link>
                    
                    <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusConfig(match.statusA).bg} ${getStatusConfig(match.statusA).color} ${getStatusConfig(match.statusA).border}`}>
                        <StatusIconA className="w-3 h-3" />
                        {match.statusA}
                    </div>
                </div>

                {/* Center Connector */}
                <div className="px-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 flex items-center justify-center text-rose-500">
                        <HeartHandshake className="w-4 h-4" />
                    </div>
                </div>

                {/* Client B */}
                <div className="flex-1 flex flex-col items-center text-center group/client">
                    <Link href={`/dashboard/client/${match.clientB._id}`} className="relative block">
                        <div className="w-16 h-16 mb-3 rounded-full bg-rose-100 dark:bg-rose-900/30 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm mx-auto group-hover/client:border-rose-400 transition-colors">
                            {match.clientB.profilePhoto ? (
                                <img src={match.clientB.profilePhoto} alt="B" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-3 text-rose-500" />
                            )}
                        </div>
                    </Link>
                    <Link href={`/dashboard/client/${match.clientB._id}`} className="hover:text-rose-600 transition-colors">
                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">{match.clientB.firstName}</h3>
                    </Link>
                    
                    <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusConfig(match.statusB).bg} ${getStatusConfig(match.statusB).color} ${getStatusConfig(match.statusB).border}`}>
                        <StatusIconB className="w-3 h-3" />
                        {match.statusB}
                    </div>
                </div>
            </div>

            {/* Admin Quick Action (Always view client page to revoke so we don't duplicate complex logic here, but we can link to it quickly) */}
            <div className="mt-8 pt-4 border-t border-stone-100 dark:border-slate-800/60 relative z-10 flex gap-2">
                <Link href={`/dashboard/client/${match.clientA._id}`} className="flex-1 text-center py-2.5 bg-stone-50 hover:bg-stone-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors">
                    Manage from {match.clientA.firstName}'s Profile
                </Link>
            </div>

        </motion.div>
    );
}
