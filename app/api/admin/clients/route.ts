/**
 * GET  /api/admin/clients           → paginated client list with filters
 * GET  /api/admin/clients?id=<id>   → single client detail + top match suggestions
 * PUT  /api/admin/clients?id=<id>   → update any client field (admin override)
 *
 * Auth: Matchmaker session required for all methods.
 *
 * Projections:
 *  - List view:   no embedding vector, no passwordHash
 *  - Detail view: no embedding vector, no passwordHash;
 *                 phone + email ARE included (admin needs them)
 *  - Match suggestions: no phone/email/embedding on candidate profiles
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
import { findHybridMatches } from "@/lib/services/matching.service";
import { verifyClientProfile } from "@/lib/services/verifyClient.service";
import {
    ok,
    badRequest,
    unauthorized,
    notFound,
    serverError,
    requireRole,
    isValidObjectId,
    CLIENT_ADMIN_PROJECTION,
} from "@/app/api/_lib/api-helpers";

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("id");
        const withMatches = searchParams.get("withMatches") === "true";
        const matchLimit = Math.min(10, Math.max(1, Number(searchParams.get("matchLimit") ?? 5)));

        // ── Single client detail ─────────────────────────────────────────────────
        if (clientId) {
            if (!isValidObjectId(clientId)) return badRequest("Invalid client id.");

            const client = await ClientService.findById(clientId, CLIENT_ADMIN_PROJECTION);

            if (!client) return notFound("Client not found.");

            // Optionally run the hybrid match engine for the "suggest matches" UI
            let suggestions = null;
            if (withMatches) {
                try {
                    suggestions = await findHybridMatches(clientId, matchLimit);
                } catch (matchErr: any) {
                    // Non-fatal: return the client without suggestions and surface the reason
                    suggestions = { error: matchErr.message };
                }
            }

            return ok({ client, suggestions });
        }

        // ── Paginated list ───────────────────────────────────────────────────────
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const status = searchParams.get("status");  // Pending | Searching | On Hold | Matched
        const gender = searchParams.get("gender");
        const search = searchParams.get("search");  // free-text name/email search

        const filter: any = {};
        if (status) filter.statusTag = status;
        if (gender) filter.gender = gender;
        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { city: regex },
            ];
        }

        const [clients, total] = await Promise.all([
            ClientService.list(filter, { createdAt: -1 }, limit, (page - 1) * limit, {
                ...CLIENT_ADMIN_PROJECTION,
                // Additional trimming for list view (not needed until detail)
                aboutMe: 0,
                hobbies: 0,
                partnerExpectations: 0,
                preferences: 0,
            }),
            ClientService.count(filter),
        ]);

        // Quick status breakdown for dashboard KPI cards
        const [pending, searching, onHold, matched, proposed] = await Promise.all([
            ClientService.count({ statusTag: "Pending" }),
            ClientService.count({ statusTag: "Searching" }),
            ClientService.count({ statusTag: "On Hold" }),
            ClientService.count({ statusTag: "Matched" }),
            ClientService.count({ statusTag: "Proposed" }),
        ]);

        return ok({
            clients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: { pending, searching, onHold, matched, proposed },
        });
    } catch (err) {
        console.error("[GET /api/admin/clients]", err);
        return serverError();
    }
}

// ─── PUT — admin updates a client field (e.g. statusTag override) ─────────────

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("id");

        if (!clientId || !isValidObjectId(clientId)) {
            return badRequest("A valid client 'id' query param is required.");
        }

        const body = await req.json();
        const { action, ...fields } = body;

        // ── Special action: verify ────────────────────────────────────────────────
        if (action === "verify") {
            const result = await verifyClientProfile(clientId);
            if (!result.success) return badRequest(result.error ?? "Verification failed.");
            return ok({ message: "Client profile verified and embedding generated." });
        }

        // ── Special action: statusTag override ───────────────────────────────────
        const ALLOWED_ADMIN_FIELDS = new Set([
            "statusTag",
            "firstName",
            "lastName",
            "city",
            "country",
            "phone",
        ]);

        const safeFields = Object.fromEntries(
            Object.entries(fields).filter(([k]) => ALLOWED_ADMIN_FIELDS.has(k))
        );

        if (Object.keys(safeFields).length === 0) {
            return badRequest("No permitted fields to update. Use 'action: verify' to verify a client.");
        }

        const updated = await ClientService.updateById(
            clientId,
            { $set: safeFields },
            { new: true, runValidators: true, select: CLIENT_ADMIN_PROJECTION }
        );

        if (!updated) return notFound("Client not found.");

        return ok({ message: "Client updated.", client: updated });
    } catch (err) {
        console.error("[PUT /api/admin/clients]", err);
        return serverError();
    }
}