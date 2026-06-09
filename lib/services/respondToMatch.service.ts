"use server";

import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import { NotificationService } from "@/lib/services/notification.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

/**
 * Records a client's response to a match proposal.
 *
 * Rules:
 * - Only the two clients in the match may respond.
 * - A client cannot change their response once submitted (Pending → terminal).
 * - If either declines  → overallStatus = "Rejected".
 * - If both accept      → overallStatus = "Connected"; notify both parties.
 * - If only one accepts → overallStatus stays "Proposed" until the other responds.
 */
export async function respondToMatch(
    matchId: string,
    response: "Accepted" | "Declined"
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Client") {
            return { 
                success: false, 
                error: "Unauthorized." 
            };
        }

        const match = await MatchService.findById(matchId);
        if (!match) {
            return { 
                success: false, 
                error: "Match not found." 
            };
        }

        if (match.overallStatus !== "Proposed") {
            return {
                success: false,
                error: `This match is already ${match.overallStatus} and cannot accept further responses.`,
            };
        }

        const clientId = session.user.id;
        const isClientA = match.clientA.toString() === clientId;
        const isClientB = match.clientB.toString() === clientId;

        if (!isClientA && !isClientB) {
            return {
                success: false,
                error: "You are not a participant in this match.",
            };
        }

        const currentStatus = isClientA ? match.statusA : match.statusB;
        if (currentStatus !== "Pending") {
            return {
                success: false,
                error: `You have already responded to this match (${currentStatus}).`,
            };
        }

        const respondedAt = new Date();
        const matchUpdate: any = {};

        if (isClientA) {
            matchUpdate.statusA = response;
            matchUpdate.respondedAtA = respondedAt;
        } 
        else {
            matchUpdate.statusB = response;
            matchUpdate.respondedAtB = respondedAt;
        }

        let finalOverallStatus = "Proposed";

        if (response === "Declined") {
            // Immediate rejection — no need to wait for the other party
            finalOverallStatus = "Rejected";
            matchUpdate.overallStatus = finalOverallStatus;

            const otherClientId = isClientA
                ? match.clientB.toString()
                : match.clientA.toString();

            // Notify the other party that the proposal didn't progress
            await NotificationService.create({
                clientId: otherClientId,
                title: "Match Update",
                message:
                    "Unfortunately, the match proposal you received was not taken forward. " +
                    "Your Matchmaker will continue to look for great profiles for you.",
                type: "MATCH_DECLINED",
                relatedId: matchId,
            });

            // Revert both clients back to the "Searching" pool
            await ClientService.updateMany(
                { _id: { $in: [match.clientA, match.clientB] } },
                { $set: { statusTag: "Searching" } }
            );
        } 
        else {
            // Check if both have now accepted
            const otherStatus = isClientA ? match.statusB : match.statusA;
            if (otherStatus === "Accepted") {
                finalOverallStatus = "Connected";
                matchUpdate.overallStatus = finalOverallStatus;

                // Update both clients to "Matched" status
                await ClientService.updateMany(
                    { _id: { $in: [match.clientA, match.clientB] } },
                    { $set: { statusTag: "Matched" } }
                );

                await NotificationService.insertMany([
                    {
                        clientId: match.clientA.toString(),
                        title: "It's a Match! 🎉",
                        message:
                            "Great news — both you and your match have accepted the proposal. " +
                            "You can now view their full profile and contact details. Congratulations!",
                        type: "MATCH_ACCEPTED",
                        relatedId: matchId,
                    },
                    {
                        clientId: match.clientB.toString(),
                        title: "It's a Match! 🎉",
                        message:
                            "Great news — both you and your match have accepted the proposal. " +
                            "You can now view their full profile and contact details. Congratulations!",
                        type: "MATCH_ACCEPTED",
                        relatedId: matchId,
                    },
                ]);
            }
        }

        // Persist match update
        await MatchService.updateById(matchId, matchUpdate);

        revalidatePath(`/client-hub/match/${matchId}`);
        revalidatePath("/client-hub/notifications");

        return { success: true, overallStatus: finalOverallStatus };
    } 
    catch (error) {
        console.error("[respondToMatch] Error:", error);
        return { success: false, error: "Failed to record your response. Please try again." };
    }
}
