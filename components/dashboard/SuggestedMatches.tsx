"use client";

import { useState } from "react";
import { User, Sparkles, MapPin, Briefcase, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { proposeMatch } from "@/lib/services/proposeMatch.service"; // The new server action

interface MatchProps {
    matches: any[];
    currentClientName: string;
    currentClientId: string;
}

export default function SuggestedMatches({ matches, currentClientName, currentClientId }: MatchProps) {
    // Track which specific match is currently being proposed to show a loading state
    const [proposingId, setProposingId] = useState<string | null>(null);

    // Empty state if no matches are found
    if (!matches || matches.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-stone-200 dark:border-slate-800 shadow-sm text-center">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Compatible Matches</h3>
                <p className="text-sm text-slate-500">The system needs more verified profiles to find highly compatible matches.</p>
            </div>
        );
    }

    const handlePropose = async (suggestedClientId: string, suggestedClientName: string) => {
        setProposingId(suggestedClientId);

        // Wrap the server action in a promise for the HeroUI Toast
        const promise = proposeMatch(currentClientId, suggestedClientId).then((res) => {
            if (!res.success) {
                // If it's a "duplicate action" case, don't treat it as a hard error
                if (res.error?.includes("already") || res.error?.includes("exists")) {
                    return { duplicate: true, message: res.error };
                }
                throw new Error(res.error);
            }
            return res;
        });

        toast.promise(promise, {
            loading: `Proposing match with ${suggestedClientName}...`,
            success: (data: any) => data.duplicate 
                ? data.message 
                : `Match proposed successfully! Both clients have been notified.`,
            error: (err) => err.message || "Failed to propose match."
        });

        // Reset loading state and catch only true errors
        promise
            .catch((err) => {
                console.error("Match proposal failed:", err.message);
            })
            .finally(() => setProposingId(null));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-stone-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Suggested for {currentClientName}</h2>
            </div>

            <div className="space-y-4">
                {matches.map((match) => (
                    <div key={match.profile._id} className="p-4 rounded-xl border border-stone-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-950/50 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors">

                        {/* ─── Header: Profile Info & Score ─── */}
                        <div className="flex justify-between items-start mb-3">
                            <Link href={`/dashboard/client/${match.profile._id}`} className="flex items-center gap-3 group">

                                {/* Dynamic Profile Photo */}
                                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 overflow-hidden shrink-0 border-2 border-transparent group-hover:border-rose-200 transition-all">
                                    {match.profile.profilePhoto ? (
                                        <img
                                            src={match.profile.profilePhoto}
                                            alt={match.profile.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                        {match.profile.firstName} {match.profile.lastName}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {match.profile.age} yrs • {match.profile.gender}
                                    </p>
                                </div>
                            </Link>

                            {/* Match Score Badge */}
                            <div className="flex flex-col items-end">
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    {match.score}% Match
                                </span>
                            </div>
                        </div>

                        {/* ─── Quick Details ─── */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {match.profile.city || "Location unknown"}
                            </span>
                            {match.profile.profession && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                    {match.profile.profession}
                                </span>
                            )}
                        </div>

                        {/* ─── AI Reasoning ─── */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-stone-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-4">
                            <span className="font-semibold text-slate-900 dark:text-slate-300 block mb-1">Why they match:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                                {match.reasons.map((reason: string, i: number) => (
                                    <li key={i} className="truncate">{reason}</li>
                                ))}
                            </ul>
                        </div>

                        {/* ─── Action Button ─── */}
                        <button
                            onClick={() => handlePropose(match.profile._id, match.profile.firstName)}
                            disabled={proposingId === match.profile._id}
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HeartHandshake className="w-4 h-4" />
                            {proposingId === match.profile._id ? "Proposing Match..." : "Propose Match"}
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}