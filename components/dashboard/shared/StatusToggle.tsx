"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
    Pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    Searching: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    "On Hold": "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    Matched:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    Proposed:  "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
};

interface StatusToggleProps {
    clientId: string;
    currentStatus: string;
    disabled?: boolean;
}

export default function StatusToggle({ clientId, currentStatus, disabled = false }: StatusToggleProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const statuses = ["Pending", "Searching", "On Hold", "Matched", "Proposed"];

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);
        const promise = fetch(`/api/admin/clients/${clientId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusTag: newStatus }),
        }).then(async (res) => {
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update status");
            }
            return res.json();
        });

        toast.promise(promise, {
            loading: "Updating status...",
            success: () => {
                router.refresh();
                setIsUpdating(false);
                return `Status updated to ${newStatus}`;
            },
            error: (err) => {
                setIsUpdating(false);
                return err.message;
            },
        });
    };

    const cls = STATUS_COLORS[currentStatus] ?? STATUS_COLORS["On Hold"];

    return (
        <div className="relative">
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating || disabled}
                className={`appearance-none outline-none cursor-pointer pr-8 pl-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border ${cls} ${isUpdating ? "opacity-50" : "hover:brightness-95 dark:hover:brightness-110"}`}
            >
                {statuses.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s}
                    </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
    );
}
