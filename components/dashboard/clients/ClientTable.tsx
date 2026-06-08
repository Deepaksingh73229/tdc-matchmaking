"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { ClientTableFilters } from "./client-table/ClientTableFilters";
import { ClientTablePagination } from "./client-table/ClientTablePagination";
import { ClientTableRow } from "./client-table/ClientTableRow";

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-6 max-w-[1400px] mx-auto relative"
        >
            {/* Background ambient glow for the table area */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-400/5 dark:bg-rose-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

            <ClientTableFilters
                filters={filters}
                filterOptions={filterOptions}
                searchInput={searchInput}
                handleSearchChange={handleSearchChange}
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                isFiltered={isFiltered}
            />

            {/* ── Results Info Bar ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400/80 dark:text-slate-500">
                    {totalCount === 0
                        ? "No connections found"
                        : `Viewing ${startItem}–${endItem} of ${totalCount} Profiles`}
                </p>
                {totalPages > 1 && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400/80 dark:text-slate-500">
                        Page {currentPage} / {totalPages}
                    </p>
                )}
            </div>

            {/* ── Data Table ────────────────────────────────────────────── */}
            <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2rem] shadow-xl shadow-stone-200/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/60 dark:border-white/5 overflow-hidden relative">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] font-semibold bg-stone-50/50 dark:bg-white/[0.02] border-b border-stone-200/60 dark:border-white/5">
                            <tr>
                                <th scope="col" className="px-8 py-5">Client Identity</th>
                                <th scope="col" className="px-6 py-5 hidden sm:table-cell">Age</th>
                                <th scope="col" className="px-6 py-5 hidden sm:table-cell">Location</th>
                                <th scope="col" className="px-6 py-5 hidden lg:table-cell">Profession</th>
                                <th scope="col" className="px-6 py-5 hidden md:table-cell">Life Stage</th>
                                <th scope="col" className="px-8 py-5 text-right">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                            {clients.length > 0 ? (
                                clients.map((client: any, i: number) => (
                                    <ClientTableRow key={client._id} client={client} index={i} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-20">
                                            <svg className="w-[400px] h-[400px] text-rose-300 dark:text-rose-500 animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
                                                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/>
                                                <circle cx="100" cy="20" r="4" fill="currentColor" />
                                                <circle cx="156" cy="156" r="3" fill="currentColor" />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col items-center gap-5 relative z-10">
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-24 h-24 bg-gradient-to-br from-white to-stone-50 dark:from-[#1A1B23] dark:to-[#111218] rounded-[2rem] flex items-center justify-center border border-stone-200/60 dark:border-white/10 shadow-xl shadow-rose-500/5 rotate-3"
                                            >
                                                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center -rotate-3">
                                                    <Search className="w-7 h-7 text-rose-500" />
                                                </div>
                                            </motion.div>
                                            
                                            <div className="space-y-1.5">
                                                <p className="text-slate-800 dark:text-slate-100 font-semibold text-xl tracking-tight">
                                                    No connections found
                                                </p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                                    The criteria you're searching for doesn't match anyone in the current roster. Try broadening your horizons.
                                                </p>
                                            </div>

                                            {isFiltered && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="px-6 py-2.5 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold rounded-xl transition-all mt-2 shadow-sm"
                                                >
                                                    Reset all criteria
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <ClientTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    startItem={startItem}
                    endItem={endItem}
                    visiblePages={visiblePages}
                    buildUrl={buildUrl}
                    navigate={navigate}
                />
            </div>
        </motion.div>
    );
}