/**
 * GET  /api/admin/profile   → get own Matchmaker profile
 * PUT  /api/admin/profile   → update own name or password
 *
 * Auth: Matchmaker session required.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";
import { MatchmakerService } from "@/lib/services/matchmaker.service";
import {
    ok,
    badRequest,
    unauthorized,
    serverError,
    requireRole,
    isNonEmptyString,
} from "@/app/api/_lib/api-helpers";

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const matchmaker = await MatchmakerService.findById(session.user.id, { passwordHash: 0 });

        if (!matchmaker) return unauthorized("Matchmaker record not found.");

        return ok({ matchmaker });
    } catch (err) {
        console.error("[GET /api/admin/profile]", err);
        return serverError();
    }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Matchmaker")) return unauthorized();

        const body = await req.json();
        const { name, currentPassword, newPassword } = body;

        const updateFields: Record<string, string> = {};

        // ── Name update ──────────────────────────────────────────────────────────
        if (name !== undefined) {
            if (!isNonEmptyString(name)) return badRequest("'name' cannot be empty.");
            updateFields.name = name.trim();
        }

        // ── Password change ──────────────────────────────────────────────────────
        if (newPassword !== undefined) {
            if (!isNonEmptyString(currentPassword)) {
                return badRequest("Provide 'currentPassword' to set a new password.");
            }
            if (!isNonEmptyString(newPassword) || newPassword.length < 8) {
                return badRequest("New password must be at least 8 characters.");
            }

            const matchmaker = await MatchmakerService.findById(session.user.id);
            if (!matchmaker) return unauthorized();

            const passwordValid = await bcrypt.compare(currentPassword, matchmaker.passwordHash);
            if (!passwordValid) return badRequest("Current password is incorrect.");

            updateFields.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        if (Object.keys(updateFields).length === 0) {
            return badRequest("No updatable fields provided (name, newPassword).");
        }

        await MatchmakerService.updateById(session.user.id, { $set: updateFields });

        return ok({ message: "Profile updated successfully." });
    } catch (err) {
        console.error("[PUT /api/admin/profile]", err);
        return serverError();
    }
}