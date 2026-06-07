/**
 * GET    /api/admin/matches            → paginated list of all match proposals
 * GET    /api/admin/matches?id=<id>    → single match detail
 * POST   /api/admin/matches            → propose a new match between two clients
 * PUT    /api/admin/matches?id=<id>    → archive a match
 * DELETE /api/admin/matches?id=<id>   → hard-delete (superadmin only, use sparingly)
 *
 * Auth: Matchmaker session required.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { MatchService } from "@/lib/services/match.service";
import { ClientService } from "@/lib/services/client.service";
import { proposeMatch } from "@/lib/services/proposeMatch.service";
import { sendMatchSuggestion } from "@/lib/services/sendMatchSuggestion.service";
import {
    ok,
    badRequest,
    unauthorized,
    notFound,
    serverError,
    requireRole,
    isValidObjectId,
    CLIENT_PRIVATE_PROJECTION,
} from "@/app/api/_lib/api-helpers";

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const matchId = searchParams.get("id");

        // ── Single match detail ──────────────────────────────────────────────────
        if (matchId) {
            if (!isValidObjectId(matchId)) return badRequest("Invalid match id.");

            const match = await MatchService.findById(matchId);
            if (!match) return notFound("Match not found.");

            // Admins always see both profiles in full (minus embedding / passwordHash)
            const [clientA, clientB] = await Promise.all([
                ClientService.findById(match.clientA.toString(), { passwordHash: 0, profileEmbedding: 0 }),
                ClientService.findById(match.clientB.toString(), { passwordHash: 0, profileEmbedding: 0 }),
            ]);

            return ok({
                match: {
                    ...match,
                    clientA: clientA,
                    clientB: clientB,
                },
            });
        }

        // ── Paginated list ───────────────────────────────────────────────────────
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const status = searchParams.get("status"); // Proposed | Connected | Rejected | Archived

        const filter: any = {};
        if (status) filter.overallStatus = status;

        const [matches, total] = await Promise.all([
            MatchService.list(filter, { createdAt: -1 }, limit, (page - 1) * limit, [
                { path: "clientA", select: "firstName lastName city gender profilePhoto statusTag" },
                { path: "clientB", select: "firstName lastName city gender profilePhoto statusTag" },
                { path: "proposedBy", select: "name username" },
            ]),
            MatchService.count(filter),
        ]);

        // KPI stats
        const [proposed, connected, rejected, archived] = await Promise.all([
            MatchService.count({ overallStatus: "Proposed" }),
            MatchService.count({ overallStatus: "Connected" }),
            MatchService.count({ overallStatus: "Rejected" }),
            MatchService.count({ overallStatus: "Archived" }),
        ]);

        return ok({
            matches,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            stats: { proposed, connected, rejected, archived },
        });
    } catch (err) {
        console.error("[GET /api/admin/matches]", err);
        return serverError();
    }
}

// ─── POST — propose a match ───────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const body = await req.json();
        const { clientA_Id, clientB_Id, type = "proposal" } = body;

        // ── Validate IDs ─────────────────────────────────────────────────────────
        if (!isValidObjectId(clientA_Id) || !isValidObjectId(clientB_Id)) {
            return badRequest("Both 'clientA_Id' and 'clientB_Id' must be valid ObjectIds.");
        }
        if (clientA_Id === clientB_Id) {
            return badRequest("Cannot propose a match between a client and themselves.");
        }

        // ── Route to the correct server action ───────────────────────────────────
        if (type === "suggestion") {
            // Informal teaser — no Match document created
            const { message, matchName } = body;
            if (!matchName || !message) {
                return badRequest("'matchName' and 'message' are required for a suggestion.");
            }
            const result = await sendMatchSuggestion(clientA_Id, matchName, message);
            if (!result.success) return badRequest(result.error ?? "Failed to send suggestion.");
            return ok({ message: "Match suggestion sent." });
        }

        // Default: formal match proposal
        const result = await proposeMatch(clientA_Id, clientB_Id);
        if (!result.success) {
            return badRequest(result.error ?? "Failed to propose match.");
        }

        return ok({
            message: "Match proposed successfully.",
            matchId: (result as any).matchId,
        });
    } catch (err) {
        console.error("[POST /api/admin/matches]", err);
        return serverError();
    }
}

// ─── PUT — archive a match ────────────────────────────────────────────────────

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const matchId = searchParams.get("id");

        if (!matchId || !isValidObjectId(matchId)) {
            return badRequest("A valid match 'id' query param is required.");
        }

        const match = await MatchService.findById(matchId);
        if (!match) return notFound("Match not found.");

        if (match.overallStatus === "Archived") {
            return badRequest("This match is already archived.");
        }

        await MatchService.updateById(matchId, { $set: { overallStatus: "Archived" } });

        return ok({ message: "Match archived successfully." });
    } catch (err) {
        console.error("[PUT /api/admin/matches]", err);
        return serverError();
    }
}

// ─── DELETE — hard delete (use with extreme caution) ─────────────────────────

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const matchId = searchParams.get("id");

        if (!matchId || !isValidObjectId(matchId)) {
            return badRequest("A valid match 'id' query param is required.");
        }

        const deleted = await MatchService.deleteById(matchId);
        if (!deleted) return notFound("Match not found.");

        return ok({ message: "Match permanently deleted." });
    } catch (err) {
        console.error("[DELETE /api/admin/matches]", err);
        return serverError();
    }
}