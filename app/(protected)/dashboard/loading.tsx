import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-pulse">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-72 mb-2 rounded-lg" />
                    <Skeleton className="h-5 w-80 rounded-lg" />
                </div>

                {/* KPI Stats */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center w-24">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center w-24">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center w-24 border-b-2 border-b-emerald-500/20">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                </div>
            </div>

            {/* Search & Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-xl shadow-stone-200/30 dark:shadow-none border border-stone-200/60 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                <Skeleton className="h-[42px] flex-1 min-w-[260px] rounded-xl" />
                <div className="flex flex-wrap gap-2.5 items-center">
                    <Skeleton className="h-[42px] w-[130px] rounded-xl" />
                    <Skeleton className="h-[42px] w-[130px] rounded-xl" />
                    <Skeleton className="h-[42px] w-[160px] rounded-xl" />
                    <Skeleton className="h-[42px] w-[130px] rounded-xl hidden lg:block" />
                    <Skeleton className="h-[42px] w-[120px] rounded-xl hidden xl:block" />
                </div>
            </div>

            {/* Results Info Bar */}
            <div className="flex items-center justify-between px-4">
                <Skeleton className="h-3 w-48 rounded-md" />
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-stone-200/40 dark:shadow-none border border-stone-200/60 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50/80 dark:bg-slate-950 border-b border-stone-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-5"><Skeleton className="h-3 w-20" /></th>
                                <th className="px-6 py-5"><Skeleton className="h-3 w-8" /></th>
                                <th className="px-6 py-5"><Skeleton className="h-3 w-16" /></th>
                                <th className="px-6 py-5 hidden lg:table-cell"><Skeleton className="h-3 w-12" /></th>
                                <th className="px-6 py-5 hidden md:table-cell"><Skeleton className="h-3 w-24" /></th>
                                <th className="px-8 py-5 text-right flex justify-end"><Skeleton className="h-3 w-12" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-8" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap text-right flex justify-end">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
