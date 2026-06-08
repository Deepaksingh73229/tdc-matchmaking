"use client";

import Link from "next/link";
import { User, Heart, MapPin, Briefcase, Phone, Mail, Unlock, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ConnectedMatchPanelProps {
    matchedClient: any;
    currentClientName: string;
}

export default function ConnectedMatchPanel({ matchedClient, currentClientName }: ConnectedMatchPanelProps) {
    if (!matchedClient) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] p-7 md:p-10 border border-emerald-200/60 dark:border-emerald-900/30 shadow-2xl shadow-emerald-500/10 dark:shadow-none relative overflow-hidden group"
        >
            {/* ─── Premium Ambient Background ─── */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2.5rem] z-0">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-500/10 blur-[80px] rounded-full transition-transform duration-1000 group-hover:scale-110"></div>
                {/* Interlocking Rings SVG (Symbolizing Union/Connection) */}
                <svg className="absolute -top-10 -right-10 w-64 h-64 text-emerald-50 dark:text-emerald-900/10 transform rotate-12 transition-transform duration-700 group-hover:rotate-45" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="80" cy="100" r="50" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                    <circle cx="120" cy="100" r="50" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                </svg>
            </div>

            {/* ─── Header ─── */}
            <div className="flex items-center gap-3.5 mb-4 relative z-10">
                <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 rounded-xl border border-emerald-200/50 dark:border-emerald-500/10 shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Connection Established
                </h2>
            </div>

            <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 mb-8 relative z-10">
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">{currentClientName}</strong> and <strong className="text-slate-800 dark:text-slate-200 font-semibold">{matchedClient.firstName}</strong> have mutually agreed to connect. Private contact details are now unlocked and available.
            </p>

            {/* ─── The Matched Profile Card ─── */}
            <div className="p-5 md:p-6 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/20 bg-gradient-to-br from-emerald-50/50 to-white dark:from-white/[0.02] dark:to-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all duration-300 relative z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none">

                {/* Profile Info Row */}
                <div className="flex justify-between items-start mb-6">
                    <Link href={`/dashboard/client/${matchedClient._id}`} className="flex items-center gap-4 group/link flex-1 min-w-0">
                        {/* Dynamic Avatar with Success Halo */}
                        <div className="relative w-16 h-16 shrink-0">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-200 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 blur-sm opacity-40 group-hover/link:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative w-full h-full rounded-full bg-white dark:bg-[#1A1B23] flex items-center justify-center text-emerald-600 dark:text-emerald-400 overflow-hidden border-[3px] border-white dark:border-[#1A1B23] shadow-sm z-10 transition-transform duration-300 group-hover/link:scale-[1.05]">
                                {matchedClient.profilePhoto ? (
                                    <img
                                        src={matchedClient.profilePhoto}
                                        alt={matchedClient.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-7 h-7" strokeWidth={1.5} />
                                )}
                            </div>
                        </div>

                        <div className="truncate pr-4">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors tracking-tight truncate">
                                {matchedClient.firstName} {matchedClient.lastName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {matchedClient.gender}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Details Row */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/20 text-[13px] font-medium text-slate-600 dark:text-slate-400 border border-stone-100 dark:border-white/5 shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate max-w-[150px]">{matchedClient.city || "Location unknown"}</span>
                    </span>
                    {matchedClient.designation && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/20 text-[13px] font-medium text-slate-600 dark:text-slate-400 border border-stone-100 dark:border-white/5 shadow-sm">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="truncate max-w-[200px]">{matchedClient.designation} {matchedClient.company ? `at ${matchedClient.company}` : ""}</span>
                        </span>
                    )}
                </div>

                {/* ─── Unlocked Contact Vault ─── */}
                <div className="relative overflow-hidden bg-white dark:bg-[#0A0B0E]/50 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-[inset_0_2px_8px_rgba(16,185,129,0.05)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
                    {/* Vault Background Pattern */}
                    <svg className="absolute right-0 bottom-0 w-32 h-32 text-emerald-50 dark:text-emerald-900/10 pointer-events-none transform translate-x-1/4 translate-y-1/4" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 100 L100 0 L100 100 Z" opacity="0.5" />
                    </svg>

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <Unlock className="w-4 h-4 text-emerald-500" />
                        <h5 className="font-bold text-[11px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                            Private Details Unlocked
                        </h5>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3 text-[14px] text-slate-700 dark:text-slate-300 bg-stone-50/50 dark:bg-white/5 p-2.5 rounded-xl border border-stone-100 dark:border-white/5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800/50">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <a href={`tel:${matchedClient.phone}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
                                {matchedClient.phone || "Not provided"}
                            </a>
                        </div>

                        <div className="flex items-center gap-3 text-[14px] text-slate-700 dark:text-slate-300 bg-stone-50/50 dark:bg-white/5 p-2.5 rounded-xl border border-stone-100 dark:border-white/5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800/50">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <a href={`mailto:${matchedClient.email}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors truncate">
                                {matchedClient.email || "Not provided"}
                            </a>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/dashboard/client/${matchedClient._id}`}
                    className="mt-5 w-full py-3 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl text-[14px] font-bold flex items-center justify-center transition-all duration-300 shadow-sm"
                >
                    View Full Profile
                </Link>
            </div>
        </motion.div>
    );
}