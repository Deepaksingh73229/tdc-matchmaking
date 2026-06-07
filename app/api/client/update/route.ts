/**
 * GET  /api/client/update   → fetch own profile (safe fields only)
 * PUT  /api/client/update   → update own profile fields
 *
 * Auth: Client session required.
 *
 * PUT body: any subset of editable Client fields.
 *   Immutable fields (passwordHash, email, statusTag, profileEmbedding, etc.)
 *   are stripped server-side before the update is applied — the client cannot
 *   escalate privileges by sending them.
 *
 * Note: When narrative fields (aboutMe, hobbies, partnerExpectations) are
 *   updated, the profile embedding becomes stale. The client is notified via
 *   the `embeddingStale` flag in the response. Re-embedding is triggered only
 *   by the Matchmaker's verify action (or a dedicated re-embed route).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
import {
    ok,
    unauthorized,
    serverError,
    requireRole,
    sanitiseClientUpdate,
    CLIENT_ADMIN_PROJECTION,
} from "@/app/api/_lib/api-helpers";

// ─── Fields whose update stales the embedding ─────────────────────────────────
const EMBEDDING_SOURCE_FIELDS = new Set([
    "firstName",
    "lastName",
    "gender",
    "dob",
    "country",
    "city",
    "height_cm",
    "religion",
    "caste",
    "maritalStatus",
    "college",
    "degree",
    "company",
    "designation",
    "income_lpa",
    "wantKids",
    "openToRelocate",
    "openToPets",
    "aboutMe",
    "hobbies",
    "partnerExpectations",
    "preferences",
]);

// ─── GET — fetch own profile ──────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const client = await ClientService.findById(session.user.id, { ...CLIENT_ADMIN_PROJECTION });

        if (!client) return unauthorized("Client record not found.");

        return ok({ client });
    } catch (err) {
        console.error("[GET /api/client/update]", err);
        return serverError();
    }
}

// ─── PUT — update own profile ─────────────────────────────────────────────────

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const raw = await req.json();

        // Strip anything the client must not self-assign
        const safeUpdates = sanitiseClientUpdate(raw);

        if (Object.keys(safeUpdates).length === 0) {
            return ok({ message: "No updatable fields provided." });
        }

        // Detect whether the update touches embedding-source fields
        const touchesEmbedding = Object.keys(safeUpdates).some((k) =>
            EMBEDDING_SOURCE_FIELDS.has(k)
        );

        // If the client changes an important field, place them "On Hold"
        if (touchesEmbedding) {
            safeUpdates.statusTag = "On Hold";
        }

        const updatedClient = await ClientService.updateById(
            session.user.id,
            { $set: safeUpdates },
            { new: true, runValidators: true, select: { ...CLIENT_ADMIN_PROJECTION } }
        );

        if (!updatedClient) return unauthorized("Client record not found.");

        // Sync: if client went On Hold, abort any active matches
        if (touchesEmbedding) {
            const { MatchService } = await import("@/lib/services/match.service");
            const { NotificationService } = await import("@/lib/services/notification.service");

            const activeMatches = await MatchService.list({
                $or: [{ clientA: session.user.id }, { clientB: session.user.id }],
                overallStatus: { $in: ["Proposed", "Connected"] }
            });

            for (const match of activeMatches) {
                // Archive match
                await MatchService.updateById(match._id.toString(), { $set: { overallStatus: "Archived" } });

                const partnerId = match.clientA.toString() === session.user.id ? match.clientB.toString() : match.clientA.toString();
                const partner = await ClientService.findById(partnerId);

                // Reset partner to searching
                if (partner && ["Proposed", "Matched"].includes(partner.statusTag)) {
                    await ClientService.updateById(partnerId, { $set: { statusTag: "Searching" } });
                    
                    await NotificationService.create({
                        clientId: partnerId,
                        title: "Match Update",
                        message: "Your recent match has updated their profile and is undergoing verification. Your profile has been placed back in the active matching pool.",
                        type: "MATCH_DECLINED",
                        relatedId: match._id.toString()
                    });
                }
            }
        }

        return ok({
            message: "Profile updated successfully.",
            client: updatedClient,
            embeddingStale: touchesEmbedding,
        });
    } catch (err) {
        console.error("[PUT /api/client/update]", err);
        return serverError();
    }
}