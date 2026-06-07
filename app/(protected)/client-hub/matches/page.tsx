import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import ClientMatchesUI from "@/components/dashboard/ClientMatchesUI";

export const dynamic = "force-dynamic";

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

            // Robust serialization to plain objects (converting ObjectIds and Dates to strings)
            return {
                ...match,
                _id: match._id.toString(),
                clientA: match.clientA.toString(),
                clientB: match.clientB.toString(),
                proposedBy: match.proposedBy.toString(),
                respondedAtA: match.respondedAtA ? new Date(match.respondedAtA).toISOString() : null,
                respondedAtB: match.respondedAtB ? new Date(match.respondedAtB).toISOString() : null,
                createdAt: match.createdAt ? new Date(match.createdAt).toISOString() : null,
                updatedAt: match.updatedAt ? new Date(match.updatedAt).toISOString() : null,
                partner: partner ? {
                    ...partner,
                    _id: partner._id.toString(),
                    dob: partner.dob ? new Date(partner.dob).toISOString() : null,
                    embeddedAt: partner.embeddedAt ? new Date(partner.embeddedAt).toISOString() : null,
                    createdAt: partner.createdAt ? new Date(partner.createdAt).toISOString() : null,
                    updatedAt: partner.updatedAt ? new Date(partner.updatedAt).toISOString() : null,
                } : null,
            };
        })
    );

    return <ClientMatchesUI initialMatches={enrichedMatches} />;
}
