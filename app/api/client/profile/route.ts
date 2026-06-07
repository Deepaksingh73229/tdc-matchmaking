/**
 * GET /api/client/profile
 *
 * Returns the logged-in client's own profile with safe field projection
 * (no embedding vector, no password hash). Intended for the "My Profile"
 * page in the client hub so the client can review exactly what their
 * Matchmaker and (post-connection) match partner will see.
 *
 * Auth: Client session required.
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
} from "@/app/api/_lib/api-helpers";

export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const client = await ClientService.findById(session.user.id, { passwordHash: 0, profileEmbedding: 0 });

        if (!client) return unauthorized("Client record not found.");

        return ok({ client });
    } catch (err) {
        console.error("[GET /api/client/profile]", err);
        return serverError();
    }
}