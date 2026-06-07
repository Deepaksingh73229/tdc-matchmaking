/**
 * GET /api/client/matches           → list all matches for the logged-in client
 * GET /api/client/matches?id=<id>   → get a single match with partner's safe profile
 *
 * Auth: Client session required.
 *
 * Contact info (phone, email) is only included in the partner's profile when
 * overallStatus === "Connected" (mutual acceptance). The query projection
 * enforces this — never the frontend.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { MatchService } from "@/lib/services/match.service";
import { ClientService } from "@/lib/services/client.service";
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
import { respondToMatch } from "@/lib/services/respondToMatch.service";

// ─── Shared safe projection for the partner's profile ─────────────────────────
// Phone + email are added back conditionally after fetch if status is Connected.
const PARTNER_SAFE = {
    passwordHash: 0,
    profileEmbedding: 0,
    phone: 0,
    email: 0,
};

// ─── GET — list matches OR fetch single match ─────────────────────────────────

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const matchId = searchParams.get("id");

        const clientId = session.user.id;

        // ── Single match detail ──────────────────────────────────────────────────
        if (matchId) {
            if (!isValidObjectId(matchId)) return badRequest("Invalid match id.");

            const match = await MatchService.findOne({
                _id: matchId,
                $or: [{ clientA: clientId }, { clientB: clientId }],
            });

            if (!match) return notFound("Match not found.");

            const isClientA = match.clientA.toString() === clientId;
            const partnerId = isClientA ? match.clientB : match.clientA;
            const myMessage = isClientA ? match.messageA : match.messageB;
            const myStatus = isClientA ? match.statusA : match.statusB;
            const partnerStatus = isClientA ? match.statusB : match.statusA;

            // Fetch partner — reveal contact only on mutual acceptance
            const partnerProjection =
                match.overallStatus === "Connected"
                    ? { passwordHash: 0, profileEmbedding: 0 } // full profile — contact info visible
                    : PARTNER_SAFE;                              // safe public subset

            const partner = await ClientService.findById(partnerId.toString(), partnerProjection);

            return ok({
                match: {
                    _id: match._id,
                    overallStatus: match.overallStatus,
                    myStatus,
                    partnerStatus,
                    myMessage,
                    matchReasons: match.matchReasons,
                    compatibilityScore: match.compatibilityScore,
                    createdAt: match.createdAt,
                    partner,
                },
            });
        }

        // ── List all matches ─────────────────────────────────────────────────────
        const { searchParams: sp } = new URL(req.url);
        const status = sp.get("status"); // e.g. "Proposed" | "Connected" | "Rejected"
        const page = Math.max(1, Number(sp.get("page") ?? 1));
        const limit = Math.min(20, Math.max(1, Number(sp.get("limit") ?? 10)));

        const filter: any = {
            $or: [{ clientA: clientId }, { clientB: clientId }],
        };
        if (status) filter.overallStatus = status;

        const [matches, total] = await Promise.all([
            MatchService.list(filter, { createdAt: -1 }, limit, (page - 1) * limit, []),
            MatchService.count(filter),
        ]);

        // Attach partner's safe public profile to each match entry
        const enriched = await Promise.all(
            (matches as any).map(async (m: any) => {
                const isA = m.clientA.toString() === clientId;
                const partnerId = isA ? m.clientB : m.clientA;

                const projection =
                    m.overallStatus === "Connected"
                        ? { passwordHash: 0, profileEmbedding: 0 }
                        : PARTNER_SAFE;

                const partner = await ClientService.findById(partnerId.toString(), projection);

                return {
                    _id: m._id,
                    overallStatus: m.overallStatus,
                    myStatus: isA ? m.statusA : m.statusB,
                    compatibilityScore: m.compatibilityScore,
                    createdAt: m.createdAt,
                    partner,
                };
            })
        );

        return ok({
            matches: enriched,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("[GET /api/client/matches]", err);
        return serverError();
    }
}

// ─── PUT — respond to a match proposal (Accepted | Declined) ──────────────────

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const body = await req.json();
        const { matchId, response } = body;

        if (!isValidObjectId(matchId)) {
            return badRequest("A valid 'matchId' is required.");
        }
        if (!["Accepted", "Declined"].includes(response)) {
            return badRequest("'response' must be either 'Accepted' or 'Declined'.");
        }

        // Delegate to the server action which handles status transitions + notifications
        const result = await respondToMatch(matchId, response);

        if (!result.success) {
            return badRequest(result.error ?? "Could not process your response.");
        }

        return ok({
            message: `Match ${response.toLowerCase()} successfully.`,
            overallStatus: result.overallStatus,
        });
    } catch (err) {
        console.error("[PUT /api/client/matches]", err);
        return serverError();
    }
}