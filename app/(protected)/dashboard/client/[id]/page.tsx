import { notFound } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import { findHybridMatches } from "@/lib/services/matching.service";
import ClientProfile from "@/components/dashboard/clients/ClientProfile";
import SuggestedMatches from "@/components/dashboard/matches/SuggestedMatches";
import ConnectedMatchPanel from "@/components/dashboard/matches/ConnectedMatchPanel";
import ProposedMatchPanel from "@/components/dashboard/matches/ProposedMatchPanel";
import VerifyProfilePanel from "@/components/dashboard/shared/VerifyProfilePanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const client = await ClientService.findById(id);
    return {
        title: client ? `${client.firstName} ${client.lastName} | TDC Matchmaker` : "Client Profile | TDC Matchmaker",
        description: "Review and manage this client's profile and matches.",
    };
}

export default async function ClientDetailedView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Fetch current client
    const client = await ClientService.findById(id);
    if (!client) {
        notFound();
    }

    // Serialize current client for Client Components
    const serializedClient = JSON.parse(JSON.stringify(client));

    // 2. Check if the client already has a "Connected" or "Proposed" match
    const activeMatch = await MatchService.findOne(
        {
            $or: [{ clientA: id }, { clientB: id }],
            overallStatus: { $in: ["Connected", "Proposed"] },
        },
        {},
        ["clientA", "clientB"]
    );

    let matchedClientProfile = null;
    let scoredMatches: any[] = [];

    if (activeMatch) {
        // Find the OTHER client in the match
        const isClientA = (activeMatch.clientA as any)._id.toString() === id;
        const otherClient = isClientA ? activeMatch.clientB : activeMatch.clientA;
        matchedClientProfile = JSON.parse(JSON.stringify(otherClient));
    } else {
        // 3. Fetch AI suggestions ONLY if the client is not already connected AND is "Searching" (Verified)
        if (client.statusTag === "Searching") {
            try {
                const rawMatches = await findHybridMatches(id, 5);
                scoredMatches = JSON.parse(JSON.stringify(rawMatches));
            } catch (error) {
                console.error("Failed to fetch hybrid matches:", error);
            }
        }
    }

    return (
        <div className="relative min-h-full w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">

            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-rose-400/10 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-stone-200/50 dark:bg-white/[0.02] blur-[100px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

            {/* ── Top Navigation ── */}
            <div className="mb-6 md:mb-8 relative z-20">
                <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-[#111218]/70 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-white/5 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-300 shadow-sm shadow-stone-200/20 dark:shadow-none w-fit"
                >
                    <div className="p-1 rounded-lg bg-stone-100 dark:bg-white/5 group-hover:bg-rose-50 dark:group-hover:bg-rose-500/20 transition-colors">
                        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2} />
                    </div>
                    Back to Roster
                </Link>
            </div>

            {/* ── Main Layout Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">

                {/* Left Column: Full Biodata */}
                <div className="col-span-7">
                    {/* The ClientProfile component should naturally inherit the width and flow here */}
                    <ClientProfile client={serializedClient} />
                </div>

                {/* Right Column: Actions & Suggestions */}
                {/* Made sticky so matchmakers can review matches while reading a long biodata */}
                <div className="col-span-5 space-y-6 lg:sticky lg:top-24 self-start pb-5">

                    {/* Verification Panel (only for unverified clients) */}
                    {
                        ["On Hold", "Pending"].includes(client.statusTag) && (
                            <VerifyProfilePanel
                                clientId={serializedClient._id}
                                clientName={serializedClient.firstName}
                            />
                        )
                    }

                    {/* Conditional Rendering: Connected Match OR Proposed Match OR Suggestions */}
                    {
                        activeMatch?.overallStatus === "Connected" ? (
                            <ConnectedMatchPanel
                                matchedClient={matchedClientProfile}
                                currentClientName={client.firstName}
                            />
                        ) : activeMatch?.overallStatus === "Proposed" ? (
                            <ProposedMatchPanel
                                match={JSON.parse(JSON.stringify(activeMatch))}
                                currentClientId={id}
                                currentClientName={client.firstName}
                            />
                        ) : client.statusTag === "Searching" ? (
                            <SuggestedMatches
                                matches={scoredMatches}
                                currentClientName={client.firstName}
                                currentClientId={serializedClient._id}
                            />
                        ) : null
                    }
                </div>

            </div>
        </div>
    );
}