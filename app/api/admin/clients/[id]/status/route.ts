import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
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

        const client = await ClientService.updateById(id, { $set: { statusTag } });
        if (!client) return notFound("Client not found.");

        return ok({ message: "Client status updated successfully.", statusTag });
    } catch (err) {
        console.error("[PUT /api/admin/clients/[id]/status]", err);
        return serverError();
    }
}
