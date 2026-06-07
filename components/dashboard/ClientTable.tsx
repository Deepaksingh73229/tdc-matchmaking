"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
    User,
    MapPin,
    CalendarHeart,
    CircleDashed,
    CheckCircle2,
    PauseCircle,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Briefcase,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(dob: string | null) {
    if (!dob) return "?";
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "Searching":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm">
                    <CircleDashed className="w-3.5 h-3.5 animate-[spin_3s_linear_infinite]" />
                    Searching
                </span>
            );
        case "Matched":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matched
                </span>
            );
        case "Pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 shadow-sm">
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pending
                </span>
            );
        default: // "On Hold"
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-stone-200 dark:border-slate-700 shadow-sm">
                    <PauseCircle className="w-3.5 h-3.5" />
                    On Hold
                </span>
            );
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientTableProps {
    clients: any[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    filters: {
        query: string;
        gender: string;
        statusTag: string;
        maritalStatus: string;
        religion: string;
        city: string;
    };
    filterOptions: {
        religions: string[];
        cities: string[];
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientTable({
    clients,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,
    filterOptions,
}: ClientTableProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Local state for the search input (debounced)
    const [searchInput, setSearchInput] = useState(filters.query);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync search input if the URL changes externally
    useEffect(() => {
        setSearchInput(filters.query);
    }, [filters.query]);

    // ─── Build URL with updated params ────────────────────────────────────────

    const buildUrl = useCallback(
        (overrides: Record<string, string | number>) => {
            const p = new URLSearchParams();

            const merged = {
                q: filters.query,
                gender: filters.gender,
                status: filters.statusTag,
                marital: filters.maritalStatus,
                religion: filters.religion,
                city: filters.city,
                page: currentPage,
                ...overrides,
            };

            // Only add non-default params to keep URLs clean
            if (merged.q) p.set("q", String(merged.q));
            if (merged.gender !== "All") p.set("gender", String(merged.gender));
            if (merged.status !== "All") p.set("status", String(merged.status));
            if (merged.marital !== "All") p.set("marital", String(merged.marital));
            if (merged.religion !== "All") p.set("religion", String(merged.religion));
            if (merged.city !== "All") p.set("city", String(merged.city));
            if (Number(merged.page) > 1) p.set("page", String(merged.page));

            const qs = p.toString();
            return `${pathname}${qs ? `?${qs}` : ""}`;
        },
        [filters, currentPage, pathname]
    );

    // ─── Navigate helper ──────────────────────────────────────────────────────

    const navigate = useCallback(
        (overrides: Record<string, string | number>) => {
            router.push(buildUrl(overrides));
        },
        [router, buildUrl]
    );

    // ─── Debounced search ─────────────────────────────────────────────────────

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            navigate({ q: value, page: 1 });
        }, 350);
    };

    // ─── Filter change — always reset to page 1 ──────────────────────────────

    const handleFilterChange = (key: string, value: string) => {
        navigate({ [key]: value, page: 1 });
    };

    const clearFilters = () => {
        setSearchInput("");
        router.push(pathname);
    };

    const isFiltered =
        filters.query !== "" ||
        filters.gender !== "All" ||
        filters.statusTag !== "All" ||
        filters.maritalStatus !== "All" ||
        filters.religion !== "All" ||
        filters.city !== "All";

    // ─── Pagination helpers ───────────────────────────────────────────────────

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    // Visible page numbers (max 5 centered around current)
    const visiblePages: number[] = [];
    const spread = 2;
    let start = Math.max(1, currentPage - spread);
    let end = Math.min(totalPages, currentPage + spread);
    if (currentPage - spread < 1) end = Math.min(totalPages, end + (spread - currentPage + 1));
    if (currentPage + spread > totalPages) start = Math.max(1, start - (currentPage + spread - totalPages));
    for (let i = start; i <= end; i++) visiblePages.push(i);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* ── Search & Filters Bar ──────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-xl shadow-stone-200/30 dark:shadow-none border border-stone-200/60 dark:border-slate-800 flex flex-wrap gap-4 items-center relative overflow-hidden">
                {/* Search */}
                <div className="relative flex-1 min-w-[260px] z-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or city..."
                        className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-medium shadow-inner"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap gap-2.5 items-center z-10">
                    <select
                        className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 appearance-none cursor-pointer transition-all shadow-inner"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange("gender", e.target.value)}
                    >
                        <option value="All">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 appearance-none cursor-pointer transition-all shadow-inner"
                        value={filters.statusTag}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Searching">Searching</option>
                        <option value="Matched">Matched</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <select
                        className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 appearance-none cursor-pointer transition-all shadow-inner"
                        value={filters.maritalStatus}
                        onChange={(e) => handleFilterChange("marital", e.target.value)}
                    >
                        <option value="All">All Marital Status</option>
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>

                    <select
                        className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 appearance-none cursor-pointer transition-all shadow-inner hidden lg:block"
                        value={filters.religion}
                        onChange={(e) => handleFilterChange("religion", e.target.value)}
                    >
                        <option value="All">All Religions</option>
                        {filterOptions.religions.map((r) => (
                            <option key={`rel-${r}`} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <select
                        className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 appearance-none cursor-pointer transition-all shadow-inner hidden xl:block"
                        value={filters.city}
                        onChange={(e) => handleFilterChange("city", e.target.value)}
                    >
                        <option value="All">All Cities</option>
                        {filterOptions.cities.map((c) => (
                            <option key={`city-${c}`} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    {isFiltered && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Results Info Bar ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {totalCount === 0
                        ? "No clients match your filters"
                        : `Showing ${startItem}–${endItem} of ${totalCount} profiles`}
                </p>
                {totalPages > 1 && (
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Page {currentPage} of {totalPages}
                    </p>
                )}
            </div>

            {/* ── Data Table ────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-stone-200/40 dark:shadow-none border border-stone-200/60 dark:border-slate-800 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-stone-50/80 dark:bg-slate-950 border-b border-stone-100 dark:border-slate-800">
                            <tr>
                                <th scope="col" className="px-8 py-5 font-bold">
                                    Client Profile
                                </th>
                                <th scope="col" className="px-6 py-5 font-bold">
                                    Age
                                </th>
                                <th scope="col" className="px-6 py-5 font-bold">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-5 font-bold hidden lg:table-cell">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-5 font-bold hidden md:table-cell">
                                    Marital Status
                                </th>
                                <th scope="col" className="px-8 py-5 font-bold text-right">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                            {clients.length > 0 ? (
                                clients.map((client: any) => (
                                    <tr
                                        key={client._id}
                                        className="group hover:bg-stone-50/50 dark:hover:bg-slate-800/40 transition-colors duration-200 cursor-pointer"
                                        onClick={() => router.push(`/dashboard/client/${client._id}`)}
                                    >
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                {/* Profile photo or initial */}
                                                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 overflow-hidden border-[2px] border-white dark:border-slate-800 shadow-sm group-hover:border-rose-100 dark:group-hover:border-rose-900/50 transition-colors">
                                                    {client.profilePhoto ? (
                                                        <img
                                                            src={client.profilePhoto}
                                                            alt={client.firstName}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-black tracking-widest pl-1">
                                                            {client.firstName?.[0]}
                                                            {client.lastName?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                        {client.firstName} {client.lastName}
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {client.gender} <span className="opacity-50 mx-1">•</span> {client.religion}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                                            {calculateAge(client.dob)} <span className="text-xs text-slate-400 font-normal">yrs</span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                                {client.city || "—"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden lg:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="truncate max-w-[160px]">
                                                    {client.designation || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <CalendarHeart className="w-4 h-4 text-slate-400 shrink-0" />
                                                {client.maritalStatus}
                                            </div>
                                        </td>

                                        <td className="px-8 py-4 whitespace-nowrap text-right">
                                            <StatusBadge status={client.statusTag} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center relative overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-400/5 dark:bg-rose-900/10 blur-[60px] rounded-full pointer-events-none"></div>
                                        <div className="flex flex-col items-center gap-4 relative z-10">
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-20 h-20 bg-stone-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-stone-100 dark:border-slate-700 shadow-sm"
                                            >
                                                <Search className="w-8 h-8 text-rose-300 dark:text-rose-600" />
                                            </motion.div>
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-bold text-lg">
                                                    No profiles found
                                                </p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                                    Try adjusting your search query or removing some filters.
                                                </p>
                                            </div>
                                            {isFiltered && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-sm text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors mt-2"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination Bar ────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-5 border-t border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/30">
                        {/* Left: info text */}
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
                            {startItem}–{endItem} of {totalCount}
                        </p>

                        {/* Center: page buttons */}
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={buildUrl({ page: 1 })}
                                className={`p-2 rounded-xl text-slate-500 transition-colors ${
                                    currentPage === 1
                                        ? "opacity-30 pointer-events-none"
                                        : "hover:bg-stone-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                                aria-label="First page"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Link>

                            <Link
                                href={buildUrl({ page: Math.max(1, currentPage - 1) })}
                                className={`p-2 rounded-xl text-slate-500 transition-colors ${
                                    currentPage === 1
                                        ? "opacity-30 pointer-events-none"
                                        : "hover:bg-stone-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>

                            {visiblePages[0] > 1 && (
                                <span className="px-2 text-xs text-slate-400 font-bold">…</span>
                            )}
                            {visiblePages.map((p) => (
                                <Link
                                    key={p}
                                    href={buildUrl({ page: p })}
                                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                        p === currentPage
                                            ? "bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                            {visiblePages[visiblePages.length - 1] < totalPages && (
                                <span className="px-2 text-xs text-slate-400 font-bold">…</span>
                            )}

                            <Link
                                href={buildUrl({ page: Math.min(totalPages, currentPage + 1) })}
                                className={`p-2 rounded-xl text-slate-500 transition-colors ${
                                    currentPage === totalPages
                                        ? "opacity-30 pointer-events-none"
                                        : "hover:bg-stone-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href={buildUrl({ page: totalPages })}
                                className={`p-2 rounded-xl text-slate-500 transition-colors ${
                                    currentPage === totalPages
                                        ? "opacity-30 pointer-events-none"
                                        : "hover:bg-stone-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                                aria-label="Last page"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Right: page selector */}
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Go to</span>
                            <select
                                value={currentPage}
                                onChange={(e) => navigate({ page: Number(e.target.value) })}
                                className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 shadow-inner cursor-pointer"
                            >
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}