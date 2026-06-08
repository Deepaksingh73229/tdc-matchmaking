import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { MatchService } from "@/lib/services/match.service";
import MatchTrackingUI from "@/components/dashboard/client-hub/MatchTrackingUI";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Matches | TDC Matchmaker",
    description: "Track and monitor all client matches across the network.",
};

export default async function MatchesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Matchmaker") {
        redirect("/login");
    }

    // Fetch all matches with client data populated
    const matches = await MatchService.list(
        {},
        { createdAt: -1 },
        200, // Limit 200 matches for the dashboard
        0,
        ["clientA", "clientB"]
    );

    return (
        <div className="relative min-h-full w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] pb-16">

            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-stone-200/50 dark:bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 translate-y-1/3"></div>

            {/* ── Page Header ── */}
            <div className="mb-8 md:mb-10 relative z-10 px-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-3">
                    Connection Tracking
                </h1>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Monitor active proposals, manage pending responses, and celebrate successful connections across your entire roster.
                </p>
            </div>

            {/* ── Main Interactive Board ── */}
            <div className="relative z-20">
                <MatchTrackingUI initialMatches={JSON.parse(JSON.stringify(matches))} />
            </div>

        </div>
    );
}