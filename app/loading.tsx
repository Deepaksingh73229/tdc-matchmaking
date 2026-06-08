import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center">
            {/* ─── Decorative Background Elements ─── */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200/50 dark:bg-rose-900/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-200/50 dark:bg-pink-900/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-amber-100/50 dark:bg-amber-900/5 rounded-full blur-3xl opacity-60"></div>

            {/* ─── Top Navigation ─── */}
            <header className="absolute top-0 w-full px-6 py-6 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2">
                    <Image src="/logo100.png" alt="TDC Logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-7 w-12" />
                </div>
                <div className="flex items-center gap-5">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </header>

            {/* ─── Hero Section ─── */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
                <div className="max-w-3xl flex flex-col items-center w-full">
                    <Skeleton className="h-9 w-64 rounded-full mb-8" />
                    <Skeleton className="h-[60px] md:h-[84px] w-[80%] rounded-2xl mb-6" />
                    <Skeleton className="h-7 w-full max-w-2xl mb-2" />
                    <Skeleton className="h-7 w-2/3 max-w-xl mb-10" />
                    <Skeleton className="h-[56px] w-[240px] rounded-2xl" />
                </div>

                {/* ─── Feature Highlights ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-stone-200/50 dark:border-slate-800/50 text-left">
                            <Skeleton className="w-12 h-12 rounded-2xl mb-6" />
                            <Skeleton className="h-7 w-3/4 rounded-md mb-3" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
