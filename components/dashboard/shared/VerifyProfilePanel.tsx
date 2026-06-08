"use client";

import { toast } from "sonner";
import { motion } from "motion/react";
import { useTransition } from "react";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

import { verifyClientProfile } from "@/lib/services/verifyClient.service";

export default function VerifyProfilePanel({ clientId, clientName }: { clientId: string, clientName: string }) {
    const [isPending, startTransition] = useTransition();

    const handleVerify = () => {
        startTransition(async () => {
            const promise = verifyClientProfile(clientId).then((res) => {
                if (!res.success) {
                    if (res.error?.includes("already")) {
                        return { duplicate: true, message: res.error };
                    }

                    throw new Error(res.error);
                }
                return res;
            });

            toast.promise(promise, {
                loading: `Verifying ${clientName}'s profile...`,
                success: (data: any) => data.duplicate
                    ? data.message
                    : `${clientName}'s profile is now verified and live for matching!`,
                error: (err) => err.message || "Failed to verify profile."
            });

            try {
                await promise;
            } catch (error) {
                console.error("Verification failed:", error);
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-linear-to-br from-amber-50/90 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-900/10 backdrop-blur-2xl rounded-[2.5rem] p-7 md:p-10 border border-amber-200/60 dark:border-amber-500/20 shadow-xl shadow-amber-500/5 dark:shadow-none relative overflow-hidden group"
        >
            {/* ─── Ambient Verification Geometry ─── */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2.5rem] z-0">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/10 blur-[60px] rounded-full transition-transform duration-1000 group-hover:scale-110"></div>

                {/* Security Shield Watermark */}
                <svg className="absolute -bottom-10 -right-10 w-48 h-48 text-amber-500/10 dark:text-amber-500/5 transform -rotate-12 transition-transform duration-700 group-hover:rotate-0" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 L90 25 L90 55 C90 75 50 95 50 95 C50 95 10 75 10 55 L10 25 Z" opacity="0.8" />
                    <path d="M50 15 L80 30 L80 55 C80 70 50 85 50 85 C50 85 20 70 20 55 L20 30 Z" opacity="0.2" fill="white" />
                </svg>
            </div>

            {/* ─── Header ─── */}
            <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="relative">
                    {/* Attention Pulse */}
                    <div className="absolute inset-0 rounded-xl bg-amber-100 dark:bg-amber-200 opacity-40 animate-ping"></div>

                    <div className="relative p-3 bg-amber-100/10 dark:bg-amber-500/10 rounded-xl border border-amber-300/50 dark:border-amber-500/20 shadow-sm text-amber-700 dark:text-amber-400">
                        <ShieldAlert className="w-6 h-6" strokeWidth={2} />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
                        Action Required
                    </h3>

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600/80 dark:text-amber-500/80 mt-1">
                        Profile Pending Review
                    </p>
                </div>
            </div>

            {/* ─── Instructional Prose ─── */}
            <div className="relative z-10 mb-8 bg-white/80 dark:bg-black/50 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-[inset_0_2px_10px_rgba(251,191,36,0.05)] dark:shadow-none">
                <p className="text-[14px] text-amber-900/80 dark:text-amber-200/70 leading-relaxed">
                    This profile is currently <strong className="font-semibold text-amber-900 dark:text-amber-100">On Hold</strong>. Please review the biodata on the left to ensure all details (including Photo, Education, and Profession) meet the platform's quality standards.
                </p>

                <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-900/50">
                    <p className="text-sm text-amber-800/80 dark:text-amber-100 font-medium">
                        Verification is irreversible. Once verified, {clientName} will instantly enter the active matching pool.
                    </p>
                </div>
            </div>

            {/* ─── Action Button ─── */}
            <div className="relative z-10">
                <motion.button
                    onClick={handleVerify}
                    disabled={isPending}
                    whileHover={{ scale: isPending ? 1 : 1.02 }}
                    whileTap={{ scale: isPending ? 1 : 0.98 }}
                    className="w-full py-4 bg-neutral-50 dark:bg-neutral-900 text-amber-800 dark:text-amber-100 rounded-xl text-[15px] font-black flex items-center justify-center gap-2.5 transition-all group/btn border border-amber-400/20 cursor-pointer"
                >
                    {
                        isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        )
                    }

                    {
                        isPending ? "Authenticating Profile..." : "Approve & Verify Profile"
                    }
                </motion.button>
            </div>
        </motion.div>
    );
}