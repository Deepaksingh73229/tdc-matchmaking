import { Skeleton } from "@/components/ui/skeleton";
import { HeartHandshake } from "lucide-react";

export default function RegisterLoading() {
    return (
        <div className="min-h-[85vh] pt-14 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-[-10%] w-96 h-96 bg-rose-200/50 dark:bg-rose-900/10 rounded-full blur-3xl opacity-70"></div>

            <div className="relative w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-rose-100/50 dark:bg-rose-900/20 rounded-2xl mb-4">
                        <HeartHandshake className="w-8 h-8 text-rose-600/50 dark:text-rose-500/50" />
                    </div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-[42px] w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-[42px] w-full rounded-xl" />
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-[42px] w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-[42px] w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-[48px] w-full rounded-xl mt-4" />
                </div>

                <div className="mt-6 flex justify-center">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        </div>
    );
}
