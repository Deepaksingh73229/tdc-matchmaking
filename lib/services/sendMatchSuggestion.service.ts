"use server";

import { NotificationService } from "@/lib/services/notification.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

/**
 * Sends an informal match suggestion (teaser) to a client.
 *
 * This is lighter-weight than proposeMatch — no Match document is created.
 * Use it when the matchmaker wants to gauge interest before committing to
 * a formal proposal.
 *
 * @param clientId  - The client receiving the suggestion
 * @param matchName - First name of the suggested match (shown in notification)
 * @param message   - Short personalised note from the matchmaker
 */
export async function sendMatchSuggestion(
    clientId: string,
    matchName: string,
    message: string
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Matchmaker") {
            return {
                success: false,
                error: "Unauthorized. Only Matchmakers can send match suggestions.",
            };
        }

        if (!clientId || !matchName.trim() || !message.trim()) {
            return { success: false, error: "clientId, matchName, and message are all required." };
        }

        await NotificationService.create({
            clientId,
            title: `A new profile has caught our eye for you 👀`,
            message: message.trim(),
            type: "MATCH_SUGGESTED",
            // No relatedId — there is no Match document yet for a suggestion
        });

        revalidatePath("/client-hub/notifications");

        return { success: true };
    } catch (error) {
        console.error("[sendMatchSuggestion] Error:", error);
        return { success: false, error: "Failed to send match suggestion. Please try again." };
    }
}