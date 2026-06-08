import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function LoginLoading() {
    return (
        <div className="min-h-[85vh] pt-14 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200/50 dark:bg-rose-900/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-200/50 dark:bg-pink-900/10 rounded-full blur-3xl opacity-70"></div>

            <div className="relative w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-rose-100/50 dark:bg-rose-900/20 rounded-2xl mb-4">
                        <Image src="/logo100.png" alt="TDC Logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
                    </div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-[48px] w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-[48px] w-full rounded-xl" />
                        </div>
                    </div>

                    <Skeleton className="h-[48px] w-full rounded-xl" />
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <Skeleton className="h-4 w-48 mb-4" />
                    <Skeleton className="h-3 w-56" />
                </div>
            </div>
        </div>
    );
}
