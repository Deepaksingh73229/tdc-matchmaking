/**
 * PUT  /api/client/notifications/read   → mark a SINGLE notification as read
 * POST /api/client/notifications/read   → mark ALL unread notifications as read
 *
 * Auth: Client session required.
 *
 * PUT body:  { id: string }   — the notification ObjectId
 * POST body: (empty)          — marks every unread notification for this client
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


export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const body = await req.json();
        const { id } = body;

        if (!isValidObjectId(id)) {
            return badRequest("A valid notification 'id' is required.");
        }

        // Scoping by clientId ensures a client can only mark their own notifications
        const updated = await NotificationService.findOneAndUpdate(
            { _id: id, clientId: session.user.id },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!updated) {
            return badRequest("Notification not found or does not belong to you.");
        }

        return ok({ message: "Notification marked as read.", notification: updated });
    } catch (err) {
        console.error("[PUT /api/client/notifications/read]", err);
        return serverError();
    }
}


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const result = await NotificationService.markAllAsRead(session.user.id);

        return ok({
            message: `${result.modifiedCount} notification(s) marked as read.`,
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error("[POST /api/client/notifications/read]", err);
        return serverError();
    }
}