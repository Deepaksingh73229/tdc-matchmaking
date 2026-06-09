/**
 * Rule-based weighted compatibility scorer.
 *
 * This runs AFTER the MongoDB pre-filter (hard constraints) and the
 * vector search (semantic similarity). It adds interpretable,
 * human-readable reasoning on top of the raw vector score.
 *
 * Score starts at 0 and accumulates points for compatible signals,
 * with penalties for soft mismatches.
 * Final value is clamped to [0, 100].
 */


export interface ScoringProfile {
    city: string;
    religion: string;
    caste?: string;
    wantKids: string;
    openToRelocate?: string;
    openToPets?: string;
    income_lpa?: number;
    maritalStatus?: string;
    languages?: string[];
}

export interface ScoreResult {
    score: number;
    reasons: string[];
    penalties: string[];
}


function incomeCompatible(a?: number, b?: number): boolean {
    if (!a || !b) return true; // unknown → no penalty
    // Compatible if within one income bracket (roughly 2× difference)
    return Math.max(a, b) / Math.min(a, b) <= 2.5;
}

function sharedLanguages(a?: string[], b?: string[]): string[] {
    if (!a?.length || !b?.length) return [];
    const setB = new Set(b.map((l) => l.toLowerCase()));
    
    return a.filter((l) => setB.has(l.toLowerCase()));
}


/**
 * @param target  - The client we are finding matches FOR
 * @param candidate - A candidate surfaced by the vector search
 */
export function calculateWeightedScore(
    target: ScoringProfile,
    candidate: ScoringProfile
): ScoreResult {
    let score = 0;
    const reasons: string[] = [];
    const penalties: string[] = [];

    if (target.city === candidate.city) {
        score += 20;
        reasons.push(`Both live in ${target.city}.`);
    } else if (
        target.openToRelocate === "Yes" ||
        candidate.openToRelocate === "Yes"
    ) {
        score += 10;
        reasons.push("Different cities, but at least one is open to relocating.");
    } else if (
        target.openToRelocate === "No" &&
        candidate.openToRelocate === "No"
    ) {
        score -= 10;
        penalties.push("Both are in different cities and neither is open to relocation.");
    }

    const kidsA = target.wantKids;
    const kidsB = candidate.wantKids;

    if (kidsA === kidsB && kidsA !== "Maybe") {
        score += 20;
        reasons.push(`Aligned on having children (both: ${kidsA}).`);
    } else if (
        kidsA !== kidsB &&
        kidsA !== "Maybe" &&
        kidsB !== "Maybe"
    ) {
        // Hard conflict: one wants, one does not
        score -= 30;
        penalties.push("Conflicting views on having children — this is a significant dealbreaker.");
    } else if (kidsA === "Maybe" || kidsB === "Maybe") {
        // One is flexible — neutral, no bonus or penalty
        reasons.push("Family planning is open for discussion.");
    }

    if (target.religion && target.religion === candidate.religion) {
        score += 10;
        reasons.push(`Shared religious background (${target.religion}).`);

        // Same caste bonus (only meaningful if same religion)
        if (target.caste && target.caste === candidate.caste) {
            score += 5;
            reasons.push(`Same community/caste (${target.caste}).`);
        }
    }

    if (target.income_lpa && candidate.income_lpa) {
        if (incomeCompatible(target.income_lpa, candidate.income_lpa)) {
            score += 10;
            reasons.push("Income levels are broadly compatible.");
        } else {
            score -= 10;
            penalties.push("Significant income disparity may affect lifestyle compatibility.");
        }
    }

    const shared = sharedLanguages(target.languages, candidate.languages);
    if (shared.length >= 2) {
        score += 5;
        reasons.push(`Speak ${shared.length} common languages (${shared.slice(0, 3).join(", ")}).`);
    } else if (shared.length === 1) {
        score += 2;
        reasons.push(`Share a common language (${shared[0]}).`);
    }

    if (
        target.openToPets !== undefined &&
        candidate.openToPets !== undefined &&
        target.openToPets === candidate.openToPets
    ) {
        score += 5;
        if (target.openToPets === "Yes") {
            reasons.push("Both are pet-friendly.");
        } else if (target.openToPets === "No") {
            reasons.push("Neither is looking for a pet household.");
        }
    }

    if (target.maritalStatus && candidate.maritalStatus) {
        if (target.maritalStatus === candidate.maritalStatus) {
            score += 5;
            if (target.maritalStatus !== "Never Married") {
                reasons.push(
                    `Both have a similar background in marital history (${target.maritalStatus}).`
                );
            }
        }
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return { score: finalScore, reasons, penalties };
}