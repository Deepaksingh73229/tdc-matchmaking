/**
 * GET  /api/client/notifications          → paginated notification list
 * PUT  /api/client/notifications/read     → mark one notification as read
 * POST /api/client/notifications/read     → mark ALL unread notifications as read (bulk)
 *
 * Auth: Client session required for all methods.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NotificationService } from "@/lib/services/notification.service";
import {
    ok,
    badRequest,
    unauthorized,
    serverError,
    requireRole,
    isValidObjectId,
} from "@/app/api/_lib/api-helpers";

// Returns paginated notifications for the logged-in client.
// Query params: ?page=1&limit=20&unreadOnly=true

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const query: any = { clientId: session.user.id };
        if (unreadOnly) query.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            NotificationService.list(query, { createdAt: -1 }, limit, (page - 1) * limit),
            NotificationService.count(query),
            // Always include the total unread badge count regardless of filter
            NotificationService.countUnread(session.user.id),
        ]);

        return ok({
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            unreadCount,
        });
    } catch (err) {
        console.error("[GET /api/client/notifications]", err);
        return serverError();
    }
}