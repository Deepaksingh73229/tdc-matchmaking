"use client";

import { MapPin, CalendarHeart, CircleDashed, CheckCircle2, PauseCircle, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(dob: string | null) {
    if (!dob) return "?";
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

export function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "Searching":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/10 shadow-sm shadow-emerald-500/5">
                    <CircleDashed className="w-3.5 h-3.5 animate-[spin_4s_linear_infinite]" strokeWidth={2.5} />
                    Searching
                </span>
            );
        case "Matched":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-500/5 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Matched
                </span>
            );
        case "Pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/10 shadow-sm shadow-amber-500/5">
                    <PauseCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Pending
                </span>
            );
        case "Proposed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/10 shadow-sm shadow-purple-500/5">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Proposed
                </span>
            );
        default: // "On Hold"
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-stone-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-stone-200/60 dark:border-white/5 shadow-sm">
                    <PauseCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    On Hold
                </span>
            );
    }
}

interface ClientTableRowProps {
    client: any;
    index: number;
}

export function ClientTableRow({ client, index }: ClientTableRowProps) {
    const router = useRouter();

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            className="group hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-transparent dark:hover:from-rose-500/5 dark:hover:to-transparent transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/dashboard/client/${client._id}`)}
        >
            <td className="px-8 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    {/* Profile photo or initial */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 overflow-hidden border border-rose-200/50 dark:border-rose-500/10 shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:shadow-rose-500/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        {client.profilePhoto ? (
                            <img
                                src={client.profilePhoto}
                                alt={client.firstName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <span className="text-sm font-bold tracking-widest pl-1">
                                {client.firstName?.[0]}
                                {client.lastName?.[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight">
                            {client.firstName} {client.lastName}
                        </div>
                        <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {client.gender} <span className="opacity-40 mx-1.5">•</span> {client.religion}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden sm:table-cell">
                <div className="flex items-baseline gap-1">
                    <span className="text-[15px] font-semibold">{calculateAge(client.dob)}</span>
                    <span className="text-[11px] text-slate-400 font-normal">yrs</span>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden sm:table-cell">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-rose-500 transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                    </div>
                    {client.city || "—"}
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden lg:table-cell">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-rose-500 transition-colors">
                        <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate max-w-[160px]">
                        {client.designation || "—"}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden md:table-cell">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-rose-500 transition-colors">
                        <CalendarHeart className="w-3.5 h-3.5" />
                    </div>
                    {client.maritalStatus}
                </div>
            </td>

            <td className="px-8 py-4 whitespace-nowrap text-right">
                <StatusBadge status={client.statusTag} />
            </td>
        </motion.tr>
    );
}
