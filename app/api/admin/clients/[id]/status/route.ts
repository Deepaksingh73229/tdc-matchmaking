import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import { NotificationService } from "@/lib/services/notification.service";
import {
    ok,
    badRequest,
    unauthorized,
    notFound,
    serverError,
    requireRole,
    isValidObjectId,
} from "@/app/api/_lib/api-helpers";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { id } = await params;
        if (!isValidObjectId(id)) {
            return badRequest("A valid client 'id' is required.");
        }

        const body = await req.json();
        const { statusTag } = body;

        const validStatuses = ["Pending", "Searching", "On Hold", "Matched", "Proposed"];
        if (!validStatuses.includes(statusTag)) {
            return badRequest("Invalid status tag.");
        }

        // 1. Update the target client
        const client = await ClientService.updateById(id, { $set: { statusTag } });
        if (!client) return notFound("Client not found.");

        // 2. Sync logic: if status is changed to a "free" state, cancel active matches
        if (["Searching", "Pending", "On Hold"].includes(statusTag)) {
            const activeMatches = await MatchService.list({
                $or: [{ clientA: id }, { clientB: id }],
                overallStatus: { $in: ["Proposed", "Connected"] }
            });

            for (const match of activeMatches) {
                // Archive the match
                await MatchService.updateById(match._id.toString(), { $set: { overallStatus: "Archived" } });

                // Find the partner
                const partnerId = match.clientA.toString() === id ? match.clientB.toString() : match.clientA.toString();
                
                // Fetch partner to check their status
                const partner = await ClientService.findById(partnerId);
                
                // If partner is stuck in a matched/proposed state, revert them to searching
                if (partner && ["Proposed", "Matched"].includes(partner.statusTag)) {
                    await ClientService.updateById(partnerId, { $set: { statusTag: "Searching" } });
                    
                    // Notify partner
                    await NotificationService.create({
                        clientId: partnerId,
                        title: "Match Update",
                        message: "A recent match or proposal has been recalled by your Matchmaker. Your profile is now active in the matching pool again.",
                        type: "MATCH_DECLINED",
                        relatedId: match._id.toString()
                    });
                }
            }
        }

        return ok({ message: "Client status updated successfully.", statusTag });
    } catch (err) {
        console.error("[PUT /api/admin/clients/[id]/status]", err);
        return serverError();
    }
}
