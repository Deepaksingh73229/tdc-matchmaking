export interface MatchResult {
    matchId: string;
    score: number;
    reasons: string[];
}

export function calculateMatchScore(clientA: any, clientB: any): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Hard Filter: Gender (Assuming heterosexual matching for MVP simplicity)
    if (clientA.gender === clientB.gender) {
        return { matchId: clientB._id, score: 0, reasons: ["Same gender (Filtered)"] };
    }

    // 2. Religion & Caste (Highly weighted in Indian context)
    if (clientA.religion === clientB.religion) {
        score += 35;
        reasons.push("Religions match perfectly");

        // Bonus for caste match if religion matches
        if (clientA.caste && clientB.caste && clientA.caste === clientB.caste) {
            score += 15;
            reasons.push("Same community/caste");
        }
    } else {
        reasons.push("Different religious backgrounds");
    }

    // 3. Age Logic
    const ageA = new Date().getFullYear() - new Date(clientA.dob).getFullYear();
    const ageB = new Date().getFullYear() - new Date(clientB.dob).getFullYear();

    // Traditional Indian context: Groom is usually same age or slightly older
    const ageDiff = clientA.gender === 'Female' ? ageB - ageA : ageA - ageB;

    if (ageDiff >= 0 && ageDiff <= 5) {
        score += 20;
        reasons.push("Ideal age gap (0-5 years)");
    } else if (ageDiff > 5 && ageDiff <= 8) {
        score += 10;
        reasons.push("Acceptable age gap");
    } else if (ageDiff < 0 && ageDiff >= -2) {
        score += 5;
        reasons.push("Slight reverse age gap");
    }

    // 4. Location/Relocation
    if (clientA.city === clientB.city) {
        score += 15;
        reasons.push(`Both based in ${clientA.city}`);
    } else if (clientA.openToRelocate === 'Yes' || clientB.openToRelocate === 'Yes') {
        score += 10;
        reasons.push("Open to relocation");
    }

    // 5. Lifestyle & Preferences (Kids)
    if (clientA.wantKids === clientB.wantKids) {
        score += 15;
        reasons.push(`Aligned on having children (${clientA.wantKids})`);
    }

    // Cap score at 99% for realism
    const finalScore = Math.min(Math.round(score), 99);

    return {
        matchId: clientB._id,
        score: finalScore,
        reasons: reasons.slice(0, 3), // Only keep the top 3 reasons for the UI
    };
}