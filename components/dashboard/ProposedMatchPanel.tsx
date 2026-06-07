"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { User, Clock, CheckCircle2, HeartHandshake, FileText, Heart, Sparkles, XCircle, PauseCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { revokeMatchProposal } from "@/lib/services/proposeMatch.service";

interface ProposedMatchPanelProps {
    match: any;
    currentClientId: string;
    currentClientName: string;
}

export default function ProposedMatchPanel({ match, currentClientId, currentClientName }: ProposedMatchPanelProps) {
    const [isRevoking, setIsRevoking] = useState(false);

    if (!match) return null;

    const isClientA = match.clientA._id.toString() === currentClientId;
    const otherClient = isClientA ? match.clientB : match.clientA;
    
    const myStatus = isClientA ? match.statusA : match.statusB;
    const theirStatus = isClientA ? match.statusB : match.statusA;

    const handleRevoke = async () => {
        setIsRevoking(true);
        const promise = revokeMatchProposal(match._id).then((res) => {
            if (!res.success) throw new Error(res.error);
            return res;
        });

        toast.promise(promise, {
            loading: "Revoking match proposal...",
            success: "Proposal revoked successfully. Both clients are now Searching.",
            error: (err) => err.message || "Failed to revoke proposal."
        });

        promise.catch(() => setIsRevoking(false));
    };

    // Comprehensive Status Styling Helper
    const getStatusConfig = (status: string) => {
        // Normalizing the string to handle varying cases safely
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

    const MyStatusIcon = getStatusConfig(myStatus).icon;
    const TheirStatusIcon = getStatusConfig(theirStatus).icon;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none relative overflow-hidden group"
        >
            {/* ─── Premium Ambient Background ─── */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2rem]">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                <motion.div 
                    animate={{ rotate: [12, 15, 12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-8 -right-8 text-rose-50 dark:text-rose-950/30 w-48 h-48"
                >
                    <HeartHandshake className="w-full h-full fill-current" />
                </motion.div>
            </div>

            {/* ─── Header ─── */}
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                    <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Proposal</h2>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 relative z-10 leading-relaxed max-w-[90%]">
                A matchmaker has paired <span className="font-semibold text-slate-700 dark:text-slate-300">{currentClientName}</span> and <span className="font-semibold text-slate-700 dark:text-slate-300">{otherClient.firstName}</span>. Awaiting mutual consent to securely unlock contact details.
            </p>

            {/* ─── Inner Glass Card ─── */}
            <div className="p-6 rounded-3xl border border-white/40 dark:border-slate-800/60 bg-stone-50/80 dark:bg-slate-950/80 backdrop-blur-md relative z-10 shadow-inner">
                
                {/* Profile Target Info */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/client/${otherClient._id}`} className="relative block group/avatar">
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 overflow-hidden border-[3px] border-white dark:border-slate-800 shadow-md group-hover/avatar:border-rose-200 dark:group-hover/avatar:border-rose-700 transition-all">
                                {otherClient.profilePhoto ? (
                                    <img
                                        src={otherClient.profilePhoto}
                                        alt={otherClient.firstName}
                                        className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <User className="w-7 h-7" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center gap-1">
                                <Heart className="w-2.5 h-2.5 fill-current text-rose-500" />
                                {match.compatibilityScore || 0}%
                            </div>
                        </Link>

                        <div>
                            <p className="text-xs font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">Match Candidate</p>
                            <Link href={`/dashboard/client/${otherClient._id}`}>
                                <h4 className="font-bold text-xl text-slate-900 dark:text-white hover:text-rose-600 transition-colors">
                                    {otherClient.firstName} {otherClient.lastName}
                                </h4>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Current Client Status */}
                    <div className="flex-1 flex flex-col gap-1.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-800 shadow-sm">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{currentClientName}'s Response</span>
                        <div className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusConfig(myStatus).bg} ${getStatusConfig(myStatus).color} ${getStatusConfig(myStatus).border}`}>
                            <MyStatusIcon className="w-3.5 h-3.5" />
                            {myStatus}
                        </div>
                    </div>

                    {/* Other Client Status */}
                    <div className="flex-1 flex flex-col gap-1.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-800 shadow-sm">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{otherClient.firstName}'s Response</span>
                        <div className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusConfig(theirStatus).bg} ${getStatusConfig(theirStatus).color} ${getStatusConfig(theirStatus).border}`}>
                            <TheirStatusIcon className="w-3.5 h-3.5" />
                            {theirStatus}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <motion.button 
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {isRevoking ? "Revoking Proposal..." : "Revoke Proposal"}
                </motion.button>

            </div>
        </motion.div>
    );
}