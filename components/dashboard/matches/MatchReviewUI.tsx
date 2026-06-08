"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    User, Heart, Briefcase, MapPin, Check, X,
    ShieldCheck, ShieldAlert, Phone, Mail,
    MessageCircle, ArrowLeft, Loader2, Sparkles, Lock, Unlock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { respondToMatch } from "@/lib/services/respondToMatch.service";
import { motion, AnimatePresence } from "motion/react";

interface MatchReviewProps {
    match: any;
    profile: any;
    myStatus: "Pending" | "Accepted" | "Declined";
    isConnected: boolean;
    message?: string;
}

export default function MatchReviewUI({ match, profile, myStatus, isConnected, message }: MatchReviewProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState<"Accepted" | "Declined" | null>(null);

    const dobDate = profile?.dob ? new Date(profile.dob) : null;
    const age = dobDate && !isNaN(dobDate.getTime())
        ? Math.abs(new Date(Date.now() - dobDate.getTime()).getUTCFullYear() - 1970)
        : "N/A";

    const handleResponse = async (response: "Accepted" | "Declined") => {
        setSubmitting(response);

        const promise = respondToMatch(match._id, response).then((res) => {
            if (!res.success) throw new Error(res.error);
            return res;
        });

        toast.promise(promise, {
            loading: `${response === "Accepted" ? "Accepting" : "Declining"} this match...`,
            success: `You have ${response.toLowerCase()} this match.`,
            error: (err) => err.message || "Failed to update match status."
        });

        promise
            .then(() => {
                router.refresh();
            })
            .catch((err) => {
                console.error("Match response error:", err.message);
            })
            .finally(() => {
                setSubmitting(null);
            });
    };

    const DataPoint = ({ label, value }: { label: string, value: any }) => (
        <div className="flex flex-col justify-center group/dp">
            <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 transition-colors group-hover/dp:text-rose-500/70 dark:group-hover/dp:text-rose-400/70">{label}</span>
            <span className="block text-[15px] font-medium text-slate-800 dark:text-slate-100">{value || "—"}</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-6 md:space-y-8 max-w-[900px] mx-auto w-full pb-24 relative"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2.5 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-stone-200/80 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm w-fit"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2} />
                    Back to Hub
                </button>

                {isConnected && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-2 shadow-sm"
                    >
                        <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Mutual Connection Established</span>
                    </motion.div>
                )}
            </div>

            {/* AI Matchmaker Note (The Curator's Letter) */}
            {message && (
                <div className="bg-gradient-to-br from-white/90 to-stone-50/80 dark:from-[#1A1B23]/90 dark:to-[#111218]/90 backdrop-blur-2xl border border-rose-100 dark:border-rose-900/30 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group shadow-xl shadow-rose-500/5 dark:shadow-none">
                    {/* Decorative Watermark */}
                    <svg className="absolute -top-10 -right-10 w-48 h-48 text-rose-50 dark:text-rose-900/30 transform rotate-12 transition-transform duration-1000 group-hover:rotate-0 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 10 C 20 10, 10 40, 50 90 C 90 40, 80 10, 50 10 Z" opacity="0.6" />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 rounded-lg shadow-inner">
                                <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            </div>

                            <span className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-wide">
                                A Note from Your Matchmaker
                            </span>
                        </div>

                        <div className="relative">
                            <MessageCircle
                                strokeWidth={3}
                                className="absolute -top-10 right-80 w-30 h-30 text-rose-200 dark:text-rose-900/40 -rotate-12 opacity-40"
                            />

                            <p className="text-[18px] md:text-[22px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic relative z-10 px-4 md:px-8">
                                "{message}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Overview Card */}
            <div className="bg-white/90 dark:bg-[#1A1B23]/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/20 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-stone-50 dark:from-white/[0.02] to-transparent pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="relative w-36 h-36 md:w-40 md:h-40 shrink-0">
                        <div className="relative w-full h-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/10 rounded-full flex items-center justify-center text-rose-600 border-[4px] border-white dark:border-neutral-800 shadow-lg overflow-hidden">
                            {profile.profilePhoto ? (
                                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-rose-400" strokeWidth={1.5} />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left flex flex-col justify-center pt-2 md:pt-4">
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
                            {profile.firstName} <span className="font-light">{profile.lastName}</span>
                        </h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-50 dark:bg-white/5 rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm">
                                <Heart className="w-3.5 h-3.5 text-rose-500" /> {age} yrs
                            </span>
                            <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-50 dark:bg-white/5 rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {profile.city}, {profile.country}
                            </span>
                            <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-50 dark:bg-white/5 rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm">
                                <Briefcase className="w-3.5 h-3.5 text-rose-500" /> {profile.designation || "Professional"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Background Details */}
                <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-xl rounded-[2rem] p-7 md:p-8 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/10 dark:shadow-none">
                    <h3 className="text-[16px] font-bold mb-6 flex items-center gap-2.5 text-slate-800 dark:text-slate-100 tracking-tight border-b border-stone-100 dark:border-white/5 pb-4">
                        <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg"><Heart className="w-4 h-4 text-rose-500" /></div>
                        Roots & Lifestyle
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DataPoint label="Religion" value={profile.religion} />
                        <DataPoint label="Caste" value={profile.caste} />
                        <DataPoint label="Marital Status" value={profile.maritalStatus} />
                        <DataPoint label="Languages" value={profile.languages?.join(", ")} />
                        <DataPoint label="Want Kids?" value={profile.wantKids} />
                        <DataPoint label="Siblings" value={profile.siblings} />
                    </div>
                </div>

                {/* Career Details */}
                <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-xl rounded-[2rem] p-7 md:p-8 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/10 dark:shadow-none">
                    <h3 className="text-[16px] font-bold mb-6 flex items-center gap-2.5 text-slate-800 dark:text-slate-100 tracking-tight border-b border-stone-100 dark:border-white/5 pb-4">
                        <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg"><Briefcase className="w-4 h-4 text-rose-500" /></div>
                        Career & Education
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DataPoint label="Designation" value={profile.designation} />
                        <DataPoint label="Company" value={profile.company} />
                        <DataPoint label="Education" value={profile.degree ? `${profile.degree} from ${profile.college}` : null} />
                        <DataPoint label="Income Bracket" value={profile.income_lpa ? `₹${profile.income_lpa} LPA` : null} />
                    </div>
                </div>
            </div>

            {/* ── The Privacy Vault (Contact Details) ── */}
            <div className={`relative overflow-hidden rounded-[2rem] p-8 border transition-all duration-700 ${isConnected
                ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-[#111218] border-emerald-200/60 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/10'
                : 'bg-stone-50 dark:bg-[#0A0B0E]/50 border-stone-200 dark:border-white/10 shadow-inner'
                }`}>

                {/* Background Pattern */}
                <svg className={`absolute right-0 bottom-0 w-48 h-48 pointer-events-none transform translate-x-1/4 translate-y-1/4 ${isConnected ? 'text-emerald-500/10' : 'text-slate-300 dark:text-white/5'}`} viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" opacity="0.5" />
                    <circle cx="50" cy="50" r="20" opacity="0.8" />
                </svg>

                <h3 className="text-lg font-bold mb-6 flex items-center gap-3 relative z-10 text-slate-800 dark:text-slate-100 tracking-tight">
                    <div className={`p-2 rounded-xl ${isConnected ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-white dark:bg-white/10 text-slate-400 border border-stone-200 dark:border-white/10'}`}>
                        {isConnected ? <Unlock className="w-5 h-5" strokeWidth={2} /> : <Lock className="w-5 h-5" strokeWidth={2} />}
                    </div>
                    Contact Information
                </h3>

                {isConnected ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="flex items-center gap-4 p-5 bg-white/80 dark:bg-[#1A1B23]/80 backdrop-blur-md rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm hover:border-emerald-300 transition-colors">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-emerald-700/60 dark:text-emerald-500/80 uppercase tracking-widest mb-1">Phone Number</span>
                                <a href={`tel:${profile.phone}`} className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors truncate block">
                                    {profile.phone}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-white/80 dark:bg-[#1A1B23]/80 backdrop-blur-md rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm hover:border-emerald-300 transition-colors">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-emerald-700/60 dark:text-emerald-500/80 uppercase tracking-widest mb-1">Email Address</span>
                                <a href={`mailto:${profile.email}`} className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors truncate block">
                                    {profile.email}
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 relative z-10">
                        <div className="w-16 h-16 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Privacy Protected</h4>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Contact information is securely vaulted. It will automatically unlock once both you and the candidate accept this proposal.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Floating Action Bar (Decision Matrix) ── */}
            {!isConnected && myStatus === "Pending" && (
                <div className="fixed sm:sticky bottom-4 sm:bottom-8 left-0 right-0 sm:left-auto sm:right-auto z-50 px-4 sm:px-0">
                    <div className="bg-white/90 dark:bg-[#1A1B23]/90 backdrop-blur-2xl p-5 md:p-6 rounded-[2rem] border border-rose-200/60 dark:border-rose-900/30 shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col md:flex-row items-center justify-between gap-6 max-w-[900px] mx-auto">
                        <div className="text-center md:text-left hidden sm:block">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Your Decision</h4>
                            <p className="text-[12px] font-medium text-slate-500 mt-1">Your choice remains private until a mutual connection is formed.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleResponse("Declined")}
                                disabled={!!submitting}
                                className="flex-1 md:flex-none px-6 md:px-8 py-3.5 rounded-xl border-2 border-stone-200 dark:border-white/10 font-bold text-[14px] text-slate-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting === "Declined" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Pass
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleResponse("Accepted")}
                                disabled={!!submitting}
                                className="flex-[2] md:flex-none px-8 md:px-12 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-[15px] shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-rose-400/20"
                            >
                                {submitting === "Accepted" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={2.5} />}
                                I'm Interested
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolved State Message */}
            {myStatus !== "Pending" && !isConnected && (
                <div className={`p-6 rounded-2xl border text-center transition-all ${myStatus === "Accepted"
                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 shadow-sm'
                    : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/5 text-slate-500'
                    }`}>
                    <p className="font-semibold text-[15px] flex items-center justify-center gap-2">
                        {myStatus === "Accepted" ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Awaiting response from {profile.firstName}...</>
                        ) : (
                            <><X className="w-4 h-4" /> You have passed on this match proposal.</>
                        )}
                    </p>
                </div>
            )}
        </motion.div>
    );
}