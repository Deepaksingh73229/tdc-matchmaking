"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ClientTablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    startItem: number;
    endItem: number;
    visiblePages: number[];
    buildUrl: (overrides: Record<string, string | number>) => string;
    navigate: (overrides: Record<string, string | number>) => void;
}

export function ClientTablePagination({
    currentPage,
    totalPages,
    totalCount,
    startItem,
    endItem,
    visiblePages,
    buildUrl,
    navigate
}: ClientTablePaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-8 py-5 border-t border-stone-200/60 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.01]">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 hidden sm:block">
                {startItem}–{endItem} <span className="font-medium text-slate-300 mx-1">/</span> {totalCount}
            </p>

            <div className="flex items-center gap-1.5">
                <Link
                    href={buildUrl({ page: 1 })}
                    className={`p-2 rounded-xl text-slate-500 transition-colors ${
                        currentPage === 1
                            ? "opacity-30 pointer-events-none"
                            : "hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm"
                    }`}
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Link>
                <Link
                    href={buildUrl({ page: Math.max(1, currentPage - 1) })}
                    className={`p-2 rounded-xl text-slate-500 transition-colors ${
                        currentPage === 1
                            ? "opacity-30 pointer-events-none"
                            : "hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm"
                    }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-1 mx-2">
                    {visiblePages[0] > 1 && (
                        <span className="px-2 text-xs text-slate-400 font-bold">…</span>
                    )}
                    {visiblePages.map((p) => (
                        <Link
                            key={p}
                            href={buildUrl({ page: p })}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                p === currentPage
                                    ? "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
                            }`}
                        >
                            {p}
                        </Link>
                    ))}
                    {visiblePages[visiblePages.length - 1] < totalPages && (
                        <span className="px-2 text-xs text-slate-400 font-bold">…</span>
                    )}
                </div>

                <Link
                    href={buildUrl({ page: Math.min(totalPages, currentPage + 1) })}
                    className={`p-2 rounded-xl text-slate-500 transition-colors ${
                        currentPage === totalPages
                            ? "opacity-30 pointer-events-none"
                            : "hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm"
                    }`}
                >
                    <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                    href={buildUrl({ page: totalPages })}
                    className={`p-2 rounded-xl text-slate-500 transition-colors ${
                        currentPage === totalPages
                            ? "opacity-30 pointer-events-none"
                            : "hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm"
                    }`}
                >
                    <ChevronsRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="hidden sm:flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Jump To</span>
                <select
                    value={currentPage}
                    onChange={(e) => navigate({ page: Number(e.target.value) })}
                    className="bg-white/50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 shadow-sm cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>Page {p}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
