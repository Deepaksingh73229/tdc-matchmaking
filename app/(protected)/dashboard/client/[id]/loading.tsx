import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ClientDetailLoading() {
    return (
        <div className="animate-pulse">
            <div className="mb-6 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1 text-slate-300 dark:text-slate-600" />
                <Skeleton className="h-4 w-24" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Full Biodata Skeleton */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                        <Skeleton className="w-32 h-32 rounded-full border-[4px] border-white dark:border-slate-800 shadow-xl shrink-0" />
                        <div className="flex-1 text-center md:text-left w-full flex flex-col justify-center pt-2">
                            <Skeleton className="h-9 w-64 mx-auto md:mx-0 mb-4 rounded-lg" />
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Skeleton className="h-8 w-24 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end justify-center">
                            <Skeleton className="h-3 w-24 mb-2 rounded-md" />
                            <Skeleton className="h-10 w-32 rounded-full" />
                        </div>
                    </div>

                    {/* About & Personality */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-slate-800/60">
                            <Skeleton className="w-9 h-9 rounded-xl" />
                            <Skeleton className="h-6 w-48 rounded-md" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div className="col-span-1 md:col-span-2">
                                <Skeleton className="h-3 w-20 mb-2 rounded-md" />
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <Skeleton className="h-3 w-32 mb-2 rounded-md" />
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <Skeleton className="h-3 w-40 mb-2 rounded-md" />
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Other Grid Sections */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-slate-800/60">
                                <Skeleton className="w-9 h-9 rounded-xl" />
                                <Skeleton className="h-6 w-48 rounded-md" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div key={j} className="flex flex-col justify-center min-h-[50px]">
                                        <Skeleton className="h-2.5 w-20 mb-2 rounded-md" />
                                        <Skeleton className="h-4 w-32 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Suggested Matches Skeleton */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-stone-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-rose-500/50" />
                            <Skeleton className="h-6 w-48 rounded-md" />
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-xl border border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                            <div>
                                                <Skeleton className="h-4 w-32 mb-2 rounded-md" />
                                                <Skeleton className="h-3 w-24 rounded-md" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                                    </div>
                                    <div className="flex gap-3 mb-4">
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                        <Skeleton className="h-4 w-28 rounded-md" />
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-stone-100 dark:border-slate-800 mb-4">
                                        <Skeleton className="h-3 w-24 mb-2 rounded-md" />
                                        <div className="space-y-2 mt-2">
                                            <Skeleton className="h-2.5 w-full rounded-md" />
                                            <Skeleton className="h-2.5 w-5/6 rounded-md" />
                                            <Skeleton className="h-2.5 w-4/5 rounded-md" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-[44px] w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
