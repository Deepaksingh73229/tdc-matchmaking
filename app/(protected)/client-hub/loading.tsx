import { Skeleton } from "@/components/ui/skeleton";

export default function ClientHubLoading() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-48 mb-2 rounded-lg" />
                    <Skeleton className="h-5 w-80 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-32 rounded-xl" />
            </div>

            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl shrink-0" />
                    <div className="flex-1 text-center md:text-left w-full space-y-4">
                        <Skeleton className="h-9 w-64 mx-auto md:mx-0 rounded-lg" />
                        <Skeleton className="h-5 w-48 mx-auto md:mx-0 rounded-lg" />
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 pt-2">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8 bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-slate-800/60">
                        <Skeleton className="w-9 h-9 rounded-xl" />
                        <Skeleton className="h-7 w-48 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        {Array.from({ length: i === 1 ? 2 : 4 }).map((_, j) => (
                            <div key={j} className={i === 1 ? "col-span-1 md:col-span-2" : ""}>
                                <Skeleton className="h-3 w-24 mb-2 rounded-md" />
                                {i === 1 ? (
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                ) : (
                                    <Skeleton className="h-5 w-full max-w-[200px] rounded-md" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
