import { ClientService } from "@/lib/services/client.service";
import { calculateWeightedScore } from "./scoring.service";

export interface MatchSuggestion {
    profile: Record<string, any>; // safe public subset of IClient
    score: number;
    reasons: string[];
    penalties: string[];
    vectorSimilarity: number;     // raw 0–1 value from Atlas
}

/**
 * Executes a two-stage hybrid search to find compatible profiles:
 *
 * Stage 1 — MongoDB Atlas Vector Search with a pre-filter
 *   The pre-filter applies the client's hard preferences (gender, age,
 *   religion, etc.) *inside the HNSW graph traversal*, so only matching
 *   nodes are ever scored — no wasted computation.
 *
 * Stage 2 — Rule-based weighted scorer
 *   Adds interpretable compatibility points on top of the semantic
 *   score and filters out weak results.
 *
 * @param clientId - The client we are finding matches FOR
 * @param limit    - Number of results to return (default 5)
 */
export async function findHybridMatches(
    clientId: string,
    limit = 5
): Promise<MatchSuggestion[]> {
    // ── 1. Fetch target client ────────────────────────────────────────────────
    const targetClient = await ClientService.findById(clientId);

    if (!targetClient) {
        throw new Error(`Client ${clientId} not found.`);
    }

    if (!targetClient.profileEmbedding || targetClient.profileEmbedding.length === 0) {
        console.warn(`[matching_service] Client ${clientId} has no embedding. Returning empty matches.`);
        return [];
    }

    const prefs = targetClient.preferences ?? {};

    // ── 2. Build the Atlas pre-filter from client preferences ─────────────────
    // Keeping this dynamic means adding a new preference field only
    // requires updating the Preferences sub-schema, not this function.
    const preFilter: Record<string, any> = {
        _id: { $ne: targetClient._id },   // never self-match
        statusTag: "Searching",                  // only verified, active profiles
    };

    // Gender
    if (prefs.preferredGender && prefs.preferredGender !== "Any") {
        preFilter.gender = prefs.preferredGender;
    }

    // Age range — computed as a DOB range
    const now = new Date();
    if (prefs.minAge || prefs.maxAge) {
        // DOB range: people born between (now - maxAge) and (now - minAge).
        // Example: minAge=23, maxAge=38 -> DOB between (now-38) and (now-23).
        const dobFilter: Record<string, Date> = {};
        if (prefs.maxAge) {
            // age <= maxAge  -> DOB >= (now - maxAge)
            dobFilter.$gte = new Date(
                now.getFullYear() - prefs.maxAge,
                now.getMonth(),
                now.getDate()
            );
        }

        if (prefs.minAge) {
            // age >= minAge -> DOB <= (now - minAge)
            dobFilter.$lte = new Date(
                now.getFullYear() - prefs.minAge,
                now.getMonth(),
                now.getDate()
            );
        }

        preFilter.dob = dobFilter;
    }

    // Religion (array means "any of these")
    if (prefs.preferredReligions?.length) {
        preFilter.religion = { $in: prefs.preferredReligions };
    }

    // Income floor
    if (prefs.minIncome_lpa) {
        preFilter.income_lpa = { $gte: prefs.minIncome_lpa };
    }

    // Height range
    if (prefs.minHeight_cm || prefs.maxHeight_cm) {
        const heightFilter: Record<string, number> = {};
        if (prefs.minHeight_cm) heightFilter.$gte = prefs.minHeight_cm;
        if (prefs.maxHeight_cm) heightFilter.$lte = prefs.maxHeight_cm;
        preFilter.height_cm = heightFilter;
    }

    // Marital statuses
    if (prefs.preferredMaritalStatuses?.length) {
        preFilter.maritalStatus = { $in: prefs.preferredMaritalStatuses };
    }

    // Debug: emit preFilter for troubleshooting in server logs
    // console.debug(`[matching_service] preFilter for ${clientId}:`, JSON.stringify(preFilter));

    // ── 3. Atlas Vector Search aggregation ───────────────────────────────────
    const CANDIDATES_MULTIPLIER = 4; // fetch more then rank-cut
    const vectorCandidates = await ClientService.aggregate([
        {
            $vectorSearch: {
                index: "profile_vector_index", // Atlas Vector Search index name
                path: "profileEmbedding",
                queryVector: targetClient.profileEmbedding,
                numCandidates: Math.max(100, limit * CANDIDATES_MULTIPLIER * 2),
                limit: limit * CANDIDATES_MULTIPLIER,
                filter: preFilter,
            },
        },
        {
            $project: {
                // Never expose credentials or the embedding vector to caller code
                passwordHash: 0,
                profileEmbedding: 0,
                phone: 0,
                email: 0,
                // Attach the vector similarity score for blending
                vectorSimilarity: { $meta: "vectorSearchScore" },
            },
        },
    ]);

    if (vectorCandidates.length === 0) {
        return [];
    }

    // ── 4. Rule-based scoring pass ────────────────────────────────────────────
    const scored: MatchSuggestion[] = vectorCandidates.map((candidate) => {
        const { score, reasons, penalties } = calculateWeightedScore(
            targetClient as any,
            candidate as any
        );

        // Blend: rule-based score (0–100) + semantic bonus (up to +20)
        // Vector similarity ∈ [0, 1] → map to [0, 20] bonus points
        const semanticBonus = Math.round((candidate.vectorSimilarity ?? 0) * 20);
        const blendedScore = Math.min(100, score + semanticBonus);

        if (semanticBonus >= 15) {
            reasons.push("Strong personality and lifestyle alignment detected by AI analysis.");
        } 
        else if (semanticBonus >= 8) {
            reasons.push("Good personality compatibility based on AI analysis.");
        }

        return {
            profile: candidate,
            score: blendedScore,
            reasons,
            penalties,
            vectorSimilarity: candidate.vectorSimilarity ?? 0,
        };
    });

    // ── 5. Filter weak matches, sort descending, return top N ────────────────
    return scored
        .filter((m) => m.score >= 30) // only surface reasonably compatible matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}