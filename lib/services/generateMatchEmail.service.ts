"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

/**
 * Generates a warm, personalised introduction paragraph for a matchmaking
 * proposal email. Uses Gemini 2.5 Flash for speed and cost efficiency.
 *
 * @param recipientName  - First name of the client receiving the email
 * @param matchName      - First name of the proposed match
 * @param matchReasons   - Array of compatibility reasons from the scoring engine
 * @param matchPenalties - Soft mismatches the matchmaker should be aware of
 *                         (not included in the email but used for tone calibration)
 */
export async function generateMatchEmail(
    recipientName: string,
    matchName: string,
    matchReasons: string[],
    matchPenalties: string[] = []
): Promise<{ success: boolean; text: string }> {
    if (!matchReasons.length) {
        // Graceful fallback — don't call the API with an empty reasons list
        return {
            success: false,
            text: generateFallbackEmail(recipientName, matchName, matchReasons),
        };
    }

    const reasonsBullets = matchReasons.map((r) => `• ${r}`).join("\n");

    // Include penalty awareness so the AI doesn't over-promise
    const cautionNote =
        matchPenalties.length
            ? `\n\nBe honest but tactful. Avoid over-promising on these points:\n${matchPenalties
                .map((p) => `• ${p}`)
                .join("\n")}`
            : "";

    const prompt = `You are a premium matchmaker at 'The Date Crew' (TDC). You are writing to your client, ${recipientName}, to propose a match with ${matchName}.

Reasons for this match:
${reasonsBullets}${cautionNote}

Write a persuasive 3-sentence paragraph explaining exactly why you have selected ${matchName} for them based on the reasons above. 

Rules:
- Address the client by name at the beginning (e.g. "${recipientName}, I have a wonderful match...").
- Weave the reasons into the text seamlessly.
- Keep the tone warm, elegant, and professional.
- Output ONLY the paragraph text. No subject line, no sign-off, no isolated salutation.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                candidateCount: 1,
            },
        });

        const text = response.text?.trim();
        if (!text) throw new Error("Gemini returned an empty response.");

        return { success: true, text };
    } catch (error) {
        console.error("[generateMatchEmail] Gemini API error:", error);
        return {
            success: false,
            text: generateFallbackEmail(recipientName, matchName, matchReasons),
        };
    }
}

/**
 * Hard-coded fallback used when the AI call fails or reasons are empty.
 * Keeps the proposal workflow from blocking on AI availability.
 */
function generateFallbackEmail(recipientName: string, matchName: string, reasons: string[] = []): string {
    const reasonsText = reasons.length > 0 
        ? ` Specifically, we noticed strong alignment in these areas: ${reasons.map(r => r.toLowerCase()).join(', ')}.` 
        : ` We believe you share meaningful values and life goals.`;

    return (
        `${recipientName}, we are excited to introduce you to ${matchName}, ` +
        `a thoughtfully curated match selected by your Matchmaker at The Date Crew.${reasonsText} ` +
        `Please take a moment to review their profile and let us know your thoughts.`
    );
}