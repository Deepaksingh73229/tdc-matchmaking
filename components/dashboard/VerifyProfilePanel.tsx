"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
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
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400">Action Required</h3>
            </div>

            <p className="text-sm text-amber-800 dark:text-amber-500/80 mb-6 leading-relaxed">
                This profile is currently <strong>On Hold</strong>. Please review the biodata on the left to ensure all details (including Photo, Education, and Profession) are complete. <br /><br />
                Verification is only possible once the profile is fully populated. Once verified, this client will enter the matching pool.
            </p>

            <button
                onClick={handleVerify}
                disabled={isPending}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <CheckCircle2 className="w-5 h-5" />
                )}
                {isPending ? "Approving..." : "Approve & Verify Profile"}
            </button>
        </div>
    );
}