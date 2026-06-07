import { notFound } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import { findHybridMatches } from "@/lib/services/matching.service";
import ClientProfile from "@/components/dashboard/ClientProfile";
import SuggestedMatches from "@/components/dashboard/SuggestedMatches";
import ConnectedMatchPanel from "@/components/dashboard/ConnectedMatchPanel";
import ProposedMatchPanel from "@/components/dashboard/ProposedMatchPanel";
import VerifyProfilePanel from "@/components/dashboard/VerifyProfilePanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <div className="animate-fade-in">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Roster
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Full Biodata */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <ClientProfile client={serializedClient} />
                </div>

                {/* Right Column: Actions & Suggestions */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    {/* Verification Panel (only for unverified clients) */}
                    {client.statusTag === "On Hold" && (
                        <VerifyProfilePanel
                            clientId={serializedClient._id}
                            clientName={serializedClient.firstName}
                        />
                    )}

                    {/* Conditional Rendering: Connected Match OR Proposed Match OR Suggestions */}
                    {activeMatch?.overallStatus === "Connected" ? (
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
                    ) : null}
                </div>

            </div>
        </div>
    );
}