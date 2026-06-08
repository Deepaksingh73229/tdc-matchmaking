import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import SuggestedMatches from "@/components/dashboard/matches/SuggestedMatches";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Matches | TDC Matchmaker",
    description: "View and manage your matches.",
};

export default async function ClientMatchesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Client") {
        redirect("/login");
    }

    const clientId = session.user.id;

    // Fetch all matches for this client
    const matches = await MatchService.listForClient(clientId);

    // Enrich matches with partner data and serialize for Client Components
    const enrichedMatches = await Promise.all(
        (matches as any).map(async (match: any) => {
            const isClientA = match.clientA.toString() === clientId;
            const partnerId = isClientA ? match.clientB : match.clientA;

            // Projection logic mirrored from API for consistency
            const PARTNER_SAFE = {
                passwordHash: 0,
                profileEmbedding: 0,
                phone: 0,
                email: 0,
            };

            const projection = match.overallStatus === "Connected"
                ? { passwordHash: 0, profileEmbedding: 0 }
                : PARTNER_SAFE;

            const partner = await ClientService.findById(partnerId.toString(), projection);
            
            // Map partner to profile for SuggestedMatches
            let age = "?";
            if (partner && partner.dob) {
                age = Math.abs(new Date(Date.now() - new Date(partner.dob).getTime()).getUTCFullYear() - 1970).toString();
            }

            // Robust serialization to plain objects (converting ObjectIds and Dates to strings)
            return {
                _id: match._id.toString(), // match id used for open portfolio link
                score: match.compatibilityScore,
                reasons: match.matchReasons || [],
                profile: partner ? {
                    ...partner,
                    _id: partner._id.toString(),
                    age,
                    gender: partner.gender || "N/A",
                    profession: partner.designation || partner.company || "",
                    city: partner.city || "",
                    dob: partner.dob ? new Date(partner.dob).toISOString() : null,
                    embeddedAt: partner.embeddedAt ? new Date(partner.embeddedAt).toISOString() : null,
                    createdAt: partner.createdAt ? new Date(partner.createdAt).toISOString() : null,
                    updatedAt: partner.updatedAt ? new Date(partner.updatedAt).toISOString() : null,
                } : null,
            };
        })
    );

    return (
        <div className="relative min-h-full w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] pb-16">
            
            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-stone-200/50 dark:bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 translate-y-1/3"></div>

            {/* ── Page Header ── */}
            <div className="mb-8 md:mb-10 relative z-10 px-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 rounded-full border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                        <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-wide">
                        Your Curated Matches
                    </h1>
                </div>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed pl-1">
                    Review hand-picked proposals from your matchmaker. Review their profiles, read the personal introductions, and decide if you'd like to connect.
                </p>
            </div>

            {/* ── Main Interactive Board ── */}
            <div className="relative z-20">
                <SuggestedMatches 
                    matches={enrichedMatches.filter((m: any) => m.profile)} 
                    currentClientId={clientId} 
                    isClientPortal={true} 
                />
            </div>
            
        </div>
    );
}