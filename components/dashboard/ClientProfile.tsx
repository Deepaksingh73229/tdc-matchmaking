"use client";

import {
    User,
    Heart,
    Briefcase,
    MapPin,
    BookOpen,
    Target,
    Info,
    Calendar,
    Languages,
} from "lucide-react";
import StatusToggle from "./StatusToggle";
import { motion } from "motion/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAge(dob: string | undefined): number | null {
    if (!dob) return null;
    return Math.abs(
        new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970
    );
}

function fmtDate(iso: string | undefined | null): string {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const STATUS_COLORS: Record<string, string> = {
    Pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    Searching: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    "On Hold": "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    Matched:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-slate-800/60 relative z-10">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                    <Icon className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h3>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

function DataPoint({
    label,
    value,
}: {
    label: string;
    value: string | number | undefined | null;
}) {
    const display =
        value !== undefined && value !== null && value !== "" ? value : "N/A";
    return (
        <div className="flex flex-col justify-center min-h-[50px]">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                {label}
            </span>
            <span className="block font-medium text-slate-900 dark:text-slate-100">
                {display}
            </span>
        </div>
    );
}

function Prose({ label, value }: { label: string; value: string | undefined | null }) {
    return (
        <div className="col-span-1 md:col-span-2">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {label}
            </span>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-stone-50/50 dark:bg-slate-950 p-4 rounded-xl border border-stone-100 dark:border-slate-800/60">
                {value || "N/A"}
            </p>
        </div>
    );
}

function TagPills({ items }: { items: string[] | undefined | null }) {
    if (!items || items.length === 0)
        return (
            <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                Any
            </span>
        );
    return (
        <div className="flex flex-wrap gap-2 mt-1">
            {items.map((t) => (
                <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20 shadow-sm"
                >
                    {t}
                </span>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientProfile({ client }: { client: any }) {
    const age = computeAge(client.dob);
    const prefs = client.preferences ?? {};

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* ── Header Card ────────────────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group"
            >
                {/* Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

                <div className="relative w-32 h-32 shrink-0 z-10">
                    {client.profilePhoto ? (
                        <img
                            src={client.profilePhoto}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="w-full h-full rounded-full object-cover border-[4px] border-white dark:border-slate-800 shadow-xl transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 border-[4px] border-white dark:border-slate-800 shadow-xl transition-transform duration-500 group-hover:scale-105">
                            <User className="w-12 h-12" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-center pt-2">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        {client.firstName} {client.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className="px-3 py-1 bg-stone-50 dark:bg-slate-800 rounded-lg border border-stone-100 dark:border-slate-700">{age ?? "?"} years</span>
                        <span className="px-3 py-1 bg-stone-50 dark:bg-slate-800 rounded-lg border border-stone-100 dark:border-slate-700">{client.height_cm ?? "?"} cm</span>
                        <span className="px-3 py-1 bg-stone-50 dark:bg-slate-800 rounded-lg border border-stone-100 dark:border-slate-700">{client.gender ?? "N/A"}</span>
                    </div>
                </div>

                <div className="z-10 mt-4 md:mt-0 flex flex-col items-center md:items-end justify-center">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Client Status</span>
                    <StatusToggle clientId={client._id} currentStatus={client.statusTag} />
                </div>
            </motion.div>

            {/* ── About & Personality ────────────────────────────────── */}
            <Section title="About & Personality" icon={BookOpen}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                    <Prose label="About Me" value={client.aboutMe} />
                    <Prose label="Hobbies & Interests" value={client.hobbies} />
                    <Prose
                        label="Partner Expectations"
                        value={client.partnerExpectations}
                    />
                </div>
            </Section>

            {/* ── Background & Lifestyle ─────────────────────────────── */}
            <Section title="Background & Lifestyle" icon={Heart}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <DataPoint label="Religion" value={client.religion} />
                    <DataPoint label="Caste" value={client.caste} />
                    <DataPoint
                        label="Marital Status"
                        value={client.maritalStatus}
                    />
                    <DataPoint
                        label="Languages"
                        value={client.languages?.join(", ")}
                    />
                    <DataPoint label="Siblings" value={client.siblings} />
                    <DataPoint label="Want Kids?" value={client.wantKids} />
                    <DataPoint label="Open to Pets?" value={client.openToPets} />
                    <DataPoint
                        label="Open to Relocate?"
                        value={client.openToRelocate}
                    />
                </div>
            </Section>

            {/* ── Career & Education ─────────────────────────────────── */}
            <Section title="Career & Education" icon={Briefcase}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <DataPoint
                        label="Income"
                        value={
                            client.income_lpa != null
                                ? `₹${client.income_lpa} LPA`
                                : undefined
                        }
                    />
                    <DataPoint label="Company" value={client.company} />
                    <DataPoint label="Designation" value={client.designation} />
                    <DataPoint label="Degree" value={client.degree} />
                    <DataPoint label="College" value={client.college} />
                </div>
            </Section>

            {/* ── Location & Contact ─────────────────────────────────── */}
            <Section title="Location & Contact" icon={MapPin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                    <DataPoint label="City" value={client.city} />
                    <DataPoint label="Country" value={client.country} />
                    <DataPoint label="Email" value={client.email} />
                    <DataPoint label="Phone" value={client.phone} />
                </div>
            </Section>

            {/* ── Partner Preferences ────────────────────────────────── */}
            <Section title="Partner Preferences" icon={Target}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                    <DataPoint
                        label="Preferred Gender"
                        value={prefs.preferredGender}
                    />
                    <DataPoint
                        label="Age Range"
                        value={
                            prefs.minAge != null && prefs.maxAge != null
                                ? `${prefs.minAge} – ${prefs.maxAge}`
                                : undefined
                        }
                    />
                    <DataPoint
                        label="Height Range"
                        value={
                            prefs.minHeight_cm != null &&
                            prefs.maxHeight_cm != null
                                ? `${prefs.minHeight_cm} – ${prefs.maxHeight_cm} cm`
                                : undefined
                        }
                    />
                    <DataPoint
                        label="Min Income"
                        value={
                            prefs.minIncome_lpa != null
                                ? `₹${prefs.minIncome_lpa} LPA`
                                : undefined
                        }
                    />
                    <DataPoint label="Want Kids?" value={prefs.wantKids} />
                    <DataPoint
                        label="Open to Relocate?"
                        value={prefs.openToRelocate}
                    />

                    {/* Array preferences — full width with tag pills */}
                    <div className="col-span-1 sm:col-span-2 space-y-5 pt-4 mt-2 border-t border-stone-100 dark:border-slate-800/60">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                Preferred Religions
                            </span>
                            <TagPills items={prefs.preferredReligions} />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                Preferred Castes
                            </span>
                            <TagPills items={prefs.preferredCastes} />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                Preferred Cities
                            </span>
                            <TagPills items={prefs.preferredCities} />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                Preferred Marital Statuses
                            </span>
                            <TagPills
                                items={prefs.preferredMaritalStatuses}
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── System Info ────────────────────────────────────────── */}
            <Section title="System Info" icon={Info}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <DataPoint
                        label="Embedded At"
                        value={fmtDate(client.embeddedAt)}
                    />
                    <DataPoint
                        label="Created At"
                        value={fmtDate(client.createdAt)}
                    />
                    <DataPoint
                        label="Updated At"
                        value={fmtDate(client.updatedAt)}
                    />
                </div>
            </Section>
        </div>
    );
}