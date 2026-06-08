"use client";

import { Search, Settings2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClientTableFiltersProps {
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
    searchInput: string;
    handleSearchChange: (value: string) => void;
    handleFilterChange: (key: string, value: string) => void;
    clearFilters: () => void;
    isFiltered: boolean;
}

export function ClientTableFilters({
    filters,
    filterOptions,
    searchInput,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    isFiltered
}: ClientTableFiltersProps) {
    return (
        <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-2xl p-4 md:p-5 rounded-[2rem] shadow-xl shadow-stone-200/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/60 dark:border-white/5 flex flex-wrap gap-4 items-center relative overflow-hidden">
            
            {/* Subtle SVG Background Pattern in Filter Bar */}
            <svg className="absolute right-0 top-0 w-64 h-full text-stone-100 dark:text-white/[0.02] pointer-events-none transform translate-x-1/4 -translate-y-1/4" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" opacity="0.5" />
                <circle cx="50" cy="50" r="30" opacity="0.8" />
            </svg>

            {/* Search */}
            <div className="relative flex-1 min-w-[280px] z-10 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors duration-300" />
                <input
                    type="text"
                    placeholder="Search profiles, emails, or cities..."
                    className="w-full pl-11 pr-4 py-3 bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3 items-center z-10">
                <div className="relative flex items-center justify-center p-2 rounded-xl bg-stone-100/50 dark:bg-white/5 text-slate-400 hidden sm:flex">
                    <Settings2 className="w-4 h-4" />
                </div>

                {[
                    { key: "gender", val: filters.gender, options: ["All Genders", "Male", "Female", "Other"] },
                    { key: "status", val: filters.statusTag, options: ["All Statuses", "Pending", "Searching", "On Hold", "Matched", "Proposed"] },
                    { key: "marital", val: filters.maritalStatus, options: ["All Marital", "Never Married", "Divorced", "Widowed", "Awaiting Divorce"] }
                ].map((filter) => (
                    <select
                        key={filter.key}
                        className="bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 appearance-none cursor-pointer transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white dark:hover:bg-white/5"
                        value={filter.val}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    >
                        {filter.options.map((opt) => (
                            <option key={opt} value={opt === filter.options[0] ? "All" : opt}>{opt}</option>
                        ))}
                    </select>
                ))}

                <select
                    className="bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 appearance-none cursor-pointer transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white dark:hover:bg-white/5 hidden lg:block"
                    value={filters.religion}
                    onChange={(e) => handleFilterChange("religion", e.target.value)}
                >
                    <option value="All">All Religions</option>
                    {filterOptions.religions.map((r) => (
                        <option key={`rel-${r}`} value={r}>{r}</option>
                    ))}
                </select>

                <select
                    className="bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 appearance-none cursor-pointer transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white dark:hover:bg-white/5 hidden xl:block"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                >
                    <option value="All">All Cities</option>
                    {filterOptions.cities.map((c) => (
                        <option key={`city-${c}`} value={c}>{c}</option>
                    ))}
                </select>

                <AnimatePresence>
                    {isFiltered && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
