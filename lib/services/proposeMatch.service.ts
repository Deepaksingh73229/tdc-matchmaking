"use server";

import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import { NotificationService } from "@/lib/services/notification.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { calculateWeightedScore } from "@/lib/services/scoring.service";
import { generateMatchEmail } from "./generateMatchEmail.service";

/**
 * Proposes a match between two clients.
 *
 * Flow:
 *  1. Auth — only Matchmakers may propose.
 *  2. Sort IDs so the unique index (clientA, clientB) is always in
 *     canonical order regardless of which order the admin selects them.
 *  3. Idempotency — reject if a match already exists for this pair.
 *  4. Fetch both clients and run the scoring engine to get reasons.
 *  5. Generate personalised AI intro messages for each party (with fallback).
 *  6. Persist the Match document with score + reasons for audit history.
 *  7. Send MATCH_PROPOSAL notifications to both clients.
 *  8. Revalidate relevant Next.js cache paths.
 */
export async function proposeMatch(clientA_Id: string, clientB_Id: string, customMessageA?: string, customMessageB?: string) {
    try {
        // ── Auth ────────────────────────────────────────────────────────────────
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "Matchmaker") {
            return {
                success: false,
                error: "Unauthorized. Only Matchmakers can propose matches.",
            };
        }

        // ── Canonical ID ordering (preserves unique index) ──────────────────────
        const [id1, id2] = [clientA_Id, clientB_Id].sort();

        // ── Idempotency check ───────────────────────────────────────────────────
        const existingMatch = await MatchService.findOne({ clientA: id1, clientB: id2 });
        if (existingMatch) {
            return {
                success: false,
                error: `A match proposal already exists between these two clients (status: ${existingMatch.overallStatus}).`,
            };
        }

        // ── Fetch clients ───────────────────────────────────────────────────────
        const [client1, client2] = await Promise.all([
            ClientService.findById(id1),
            ClientService.findById(id2),
        ]);

        if (!client1 || !client2) {
            return { 
                success: false, 
                error: "One or both clients could not be found." 
            };
        }

        // Both must be active in the matching pool
        if (client1.statusTag !== "Searching" || client2.statusTag !== "Searching") {
            return {
                success: false,
                error:
                    "Both clients must have a 'Searching' status to be proposed a match. " +
                    `Client 1: ${client1.statusTag}, Client 2: ${client2.statusTag}.`,
            };
        }

        // ── Scoring ─────────────────────────────────────────────────────────────
        // Run in both directions so each party's perspective is captured
        const score1 = calculateWeightedScore(client1 as any, client2 as any); // for client1 about client2
        const score2 = calculateWeightedScore(client2 as any, client1 as any); // for client2 about client1

        // Include semantic bonus from embeddings (same formula as matching.service.ts)
        // so the proposal score matches what was shown in the suggestion panel.
        let semanticBonus = 0;
        if (
            client1.profileEmbedding?.length &&
            client2.profileEmbedding?.length &&
            client1.profileEmbedding.length === client2.profileEmbedding.length
        ) {
            let dot = 0, magA = 0, magB = 0;
            for (let i = 0; i < client1.profileEmbedding.length; i++) {
                dot  += client1.profileEmbedding[i] * client2.profileEmbedding[i];
                magA += client1.profileEmbedding[i] ** 2;
                magB += client2.profileEmbedding[i] ** 2;
            }
            const cosineSim = (magA && magB) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
            // Atlas Vector Search normalises cosine as (1 + cos) / 2 to map [-1,1] → [0,1].
            // Apply the same normalisation so the bonus matches the suggestion panel.
            const normalised = (1 + cosineSim) / 2;
            semanticBonus = Math.round(normalised * 20);
        }

        const avgRuleScore = Math.round((score1.score + score2.score) / 2);
        const avgScore = Math.min(100, avgRuleScore + semanticBonus);

        // Deduplicated shared reasons stored on the Match for admin audit
        const allReasons = Array.from(new Set([...score1.reasons, ...score2.reasons]));

        // ── Generate AI intro messages ──────────────────────────────────────────
        const [aiMsg1, aiMsg2] = await Promise.all([
            customMessageA ? Promise.resolve({ text: customMessageA }) : generateMatchEmail(
                client1.firstName,
                client2.firstName,
                score1.reasons,
                score1.penalties
            ),

            customMessageB ? Promise.resolve({ text: customMessageB }) : generateMatchEmail(
                client2.firstName,
                client1.firstName,
                score2.reasons,
                score2.penalties
            ),
        ]);

        // ── Create Match document ───────────────────────────────────────────────
        const match = await MatchService.create({
            clientA: id1,
            clientB: id2,
            messageA: aiMsg1.text, // shown to client1 (about client2)
            messageB: aiMsg2.text, // shown to client2 (about client1)
            proposedBy: session.user.id,
            overallStatus: "Proposed",
            compatibilityScore: avgScore,
            matchReasons: allReasons,
        });

        // ── Update clients to "Proposed" status ────────────────────────────────
        await ClientService.updateMany(
            { _id: { $in: [id1, id2] } },
            { $set: { statusTag: "Proposed" } }
        );

        // ── Notify both clients ─────────────────────────────────────────────────
        await NotificationService.insertMany([
            {
                clientId: id1,
                title: "New Match Proposed! 💌",
                message:
                    "Your Matchmaker has hand-picked a profile for you. " +
                    "Log in to review their details and share your thoughts.",
                type: "MATCH_PROPOSAL",
                relatedId: match._id.toString(),
            },
            {
                clientId: id2,
                title: "New Match Proposed! 💌",
                message:
                    "Your Matchmaker has hand-picked a profile for you. " +
                    "Log in to review their details and share your thoughts.",
                type: "MATCH_PROPOSAL",
                relatedId: match._id.toString(),
            },
        ]);

        // ── Revalidate relevant cache paths ─────────────────────────────────────
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/client/${clientA_Id}`);
        revalidatePath(`/dashboard/client/${clientB_Id}`);

        return { 
            success: true, 
            matchId: match._id.toString() 
        };
    } 
    catch (error: any) {
        console.error("[proposeMatch] Error:", error);

        // MongoDB duplicate-key error (race condition — two admins click at once)
        if (error.code === 11000) {
            return {
                success: false,
                error: "A match between these clients was just created by another session.",
            };
        }

        return { 
            success: false, 
            error: "Failed to propose match. Please try again." 
        };
    }
}

export async function draftMatchProposal(clientA_Id: string, clientB_Id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Matchmaker") {
            return { success: false, error: "Unauthorized." };
        }

        const [id1, id2] = [clientA_Id, clientB_Id].sort();
        const existingMatch = await MatchService.findOne({ clientA: id1, clientB: id2 });
        if (existingMatch) {
            return { success: false, error: `A match proposal already exists (status: ${existingMatch.overallStatus}).` };
        }

        const [client1, client2] = await Promise.all([
            ClientService.findById(id1),
            ClientService.findById(id2),
        ]);

        if (!client1 || !client2) return { success: false, error: "One or both clients not found." };
        if (client1.statusTag !== "Searching" || client2.statusTag !== "Searching") {
            return { success: false, error: "Both clients must be 'Searching'." };
        }

        const score1 = calculateWeightedScore(client1 as any, client2 as any);
        const score2 = calculateWeightedScore(client2 as any, client1 as any);

        let semanticBonus = 0;
        if (
            client1.profileEmbedding?.length &&
            client2.profileEmbedding?.length &&
            client1.profileEmbedding.length === client2.profileEmbedding.length
        ) {
            let dot = 0, magA = 0, magB = 0;
            for (let i = 0; i < client1.profileEmbedding.length; i++) {
                dot  += client1.profileEmbedding[i] * client2.profileEmbedding[i];
                magA += client1.profileEmbedding[i] ** 2;
                magB += client2.profileEmbedding[i] ** 2;
            }
            const cosineSim = (magA && magB) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
            const normalised = (1 + cosineSim) / 2;
            semanticBonus = Math.round(normalised * 20);
        }

        const avgRuleScore = Math.round((score1.score + score2.score) / 2);
        const avgScore = Math.min(100, avgRuleScore + semanticBonus);
        let aiReason = "";
        if (semanticBonus >= 15) {
            aiReason = "Strong personality and lifestyle alignment detected by AI analysis.";
        } else if (semanticBonus >= 8) {
            aiReason = "Good personality compatibility based on AI analysis.";
        }
        
        const allReasons = Array.from(new Set([
            ...score1.reasons, 
            ...score2.reasons,
            ...(aiReason ? [aiReason] : [])
        ]));

        return {
            success: true,
            score: avgScore,
            reasons: allReasons,
            penalties1: score1.penalties,
            penalties2: score2.penalties,
            clientA: { _id: client1._id.toString(), firstName: client1.firstName },
            clientB: { _id: client2._id.toString(), firstName: client2.firstName }
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function generateSingleAIMessage(targetClientName: string, aboutClientName: string, reasons: string[], penalties: string[]) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Matchmaker") return { success: false, error: "Unauthorized" };

        const msg = await generateMatchEmail(targetClientName, aboutClientName, reasons, penalties);
        return { success: true, message: msg.text };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function revokeMatchProposal(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Matchmaker") return { success: false, error: "Unauthorized" };

        const match = await MatchService.findById(matchId);
        if (!match || match.overallStatus !== "Proposed") {
            return { success: false, error: "Match not found or is no longer in Proposed status." };
        }

        await MatchService.updateById(matchId, { $set: { overallStatus: "Archived" } });

        const clients = [match.clientA.toString(), match.clientB.toString()];
        await ClientService.updateMany(
            { _id: { $in: clients }, statusTag: "Proposed" },
            { $set: { statusTag: "Searching" } }
        );

        await NotificationService.insertMany([
            {
                clientId: match.clientA.toString(),
                title: "Match Proposal Withdrawn",
                message: "A recent match proposal has been recalled by your Matchmaker. Your profile is now active in the matching pool again.",
                type: "MATCH_DECLINED",
                relatedId: matchId,
            },
            {
                clientId: match.clientB.toString(),
                title: "Match Proposal Withdrawn",
                message: "A recent match proposal has been recalled by your Matchmaker. Your profile is now active in the matching pool again.",
                type: "MATCH_DECLINED",
                relatedId: matchId,
            }
        ]);

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/client/${match.clientA.toString()}`);
        revalidatePath(`/dashboard/client/${match.clientB.toString()}`);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}