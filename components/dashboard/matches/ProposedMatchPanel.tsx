"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { User, Clock, CheckCircle2, HeartHandshake, Heart, Sparkles, XCircle, PauseCircle, Search, Loader2 } from "lucide-react";
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

    // Comprehensive Status Styling Helper - Upgraded for premium gradients
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

    const MyStatusIcon = getStatusConfig(myStatus).icon;
    const TheirStatusIcon = getStatusConfig(theirStatus).icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] p-7 md:p-10 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/20 dark:shadow-none relative overflow-hidden group"
        >
            {/* ─── Premium Ambient Background ─── */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2.5rem] z-0">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-400/10 dark:bg-rose-500/10 blur-[80px] rounded-full transition-transform duration-1000 group-hover:scale-110"></div>
                {/* Slow rotating dashed rings symbolizing "Pending/Waiting" */}
                <svg className="absolute -top-12 -right-12 w-64 h-64 text-rose-200 dark:text-rose-900/50 animate-[spin_40s_linear_infinite]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.6" />
                    <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                </svg>
            </div>

            {/* ─── Header ─── */}
            <div className="flex items-center gap-3.5 mb-4 relative z-10">
                <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 rounded-xl border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                    <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Active Proposal
                </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 relative z-10 leading-relaxed pr-4">
                A matchmaker has paired <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentClientName}</strong> and <strong className="font-semibold text-slate-800 dark:text-slate-200">{otherClient.firstName}</strong>. Awaiting mutual consent to securely unlock contact details.
            </p>

            {/* ─── Inner Glass Card (Holding Area) ─── */}
            <div className="p-6 md:p-8 rounded-[1.5rem] border border-stone-200/50 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.02] relative z-10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none">

                {/* Profile Target Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-5">
                        <Link href={`/dashboard/client/${otherClient._id}`} className="relative block group/avatar shrink-0">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/10 flex items-center justify-center text-rose-500 overflow-hidden border-[3px] border-white dark:border-neutral-800 shadow-md z-10 transition-transform duration-500 group-hover/avatar:scale-[1.05]">
                                {
                                    otherClient.profilePhoto ? (
                                        <img
                                            src={otherClient.profilePhoto}
                                            alt={otherClient.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8" strokeWidth={1.5} />
                                    )
                                }
                            </div>

                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1A1B23] text-slate-800 dark:text-slate-100 text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-stone-100 dark:border-white/10 shadow-sm flex items-center gap-1 z-20">
                                <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                                {match.compatibilityScore || 0}%
                            </div>
                        </Link>

                        <div className="">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">Match Candidate</p>
                            <Link href={`/dashboard/client/${otherClient._id}`}>
                                <h4 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide truncate">
                                    {otherClient.firstName} {otherClient.lastName}
                                </h4>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {/* Current Client Status */}
                    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-black/20 border border-stone-100 dark:border-white/5 shadow-sm">
                        <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">{currentClientName}'s Response</span>

                        <div className={`inline-flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border ${getStatusConfig(myStatus).bg} ${getStatusConfig(myStatus).color} ${getStatusConfig(myStatus).border} shadow-sm`}>
                            <MyStatusIcon className="w-4 h-4" strokeWidth={2} />
                            {myStatus}
                        </div>
                    </div>

                    {/* Other Client Status */}
                    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-black/20 border border-stone-100 dark:border-white/5 shadow-sm">
                        <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">{otherClient.firstName}'s Response</span>

                        <div className={`inline-flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border ${getStatusConfig(theirStatus).bg} ${getStatusConfig(theirStatus).color} ${getStatusConfig(theirStatus).border} shadow-sm`}>
                            <TheirStatusIcon className="w-4 h-4" strokeWidth={2} />
                            {theirStatus}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="w-full py-3.5 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-500/30 hover:border-rose-300 dark:hover:border-rose-500/50 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
                >
                    {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {isRevoking ? "Revoking Proposal..." : "Revoke Proposal"}
                </button>

            </div>
        </motion.div>
    );
}