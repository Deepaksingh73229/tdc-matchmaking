import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

/**
 * Builds a single enriched text blob from a client's narrative fields.
 * Keeping this logic here (rather than in the caller) means every
 * embedder produces the same shape of text and the vector space stays
 * consistent when you re-embed after profile updates.
 */
export function buildProfileText(profile: {
    firstName?: string;
    gender?: string;
    city?: string;
    religion?: string;
    maritalStatus?: string;
    languages?: string[];
    caste?: string;
    college?: string;
    degree?: string;
    designation?: string;
    wantKids?: string;
    openToRelocate?: string;
    openToPets?: string;
    aboutMe?: string;
    hobbies?: string;
    partnerExpectations?: string;
}): string {
    const parts: string[] = [];

    if (profile.aboutMe) parts.push(`About me: ${profile.aboutMe}`);
    if (profile.hobbies) parts.push(`Hobbies and interests: ${profile.hobbies}`);
    if (profile.partnerExpectations) parts.push(`What I look for in a partner: ${profile.partnerExpectations}`);

    // Structured attributes — give the model anchoring signal
    const structured: string[] = [];
    if (profile.religion) structured.push(`religion: ${profile.religion}`);
    if (profile.caste) structured.push(`community: ${profile.caste}`);
    if (profile.city) structured.push(`lives in ${profile.city}`);
    if (profile.maritalStatus) structured.push(`marital status: ${profile.maritalStatus}`);
    if (profile.degree) structured.push(`education: ${profile.degree}`);
    if (profile.designation) structured.push(`works as ${profile.designation}`);
    if (profile.wantKids) structured.push(`wants kids: ${profile.wantKids}`);
    if (profile.openToRelocate) structured.push(`open to relocate: ${profile.openToRelocate}`);
    if (profile.openToPets) structured.push(`open to pets: ${profile.openToPets}`);
    if (profile.languages?.length) structured.push(`speaks ${profile.languages.join(", ")}`);

    if (structured.length) {
        parts.push(`Profile details — ${structured.join("; ")}.`);
    }

    const text = parts.join("\n\n");
    if (!text.trim()) {
        throw new Error("Cannot generate embedding: profile has no narrative content.");
    }
    return text;
}

/**
 * Generates a 768-dimension dense vector for the given text using
 * Google's gemini-embedding-2 model.
 *
 * This model uses asymmetric retrieval prefixes. For matrimonial matching
 * (profile-to-profile), we use the 'document' prefix ('title: none | text: ')
 * for both sides to ensure symmetric semantic alignment.
 */
export async function generateProfileEmbedding(
    text: string,
    { maxRetries = 3 }: { maxRetries?: number } = {}
): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error("Text cannot be empty for embedding generation.");
    }

    // gemini-embedding-2 accepts large contexts; we cap at 8 000 chars (~2 000 tokens)
    const MAX_CHARS = 8_000;
    const contentText = trimmed.length > MAX_CHARS ? trimmed.slice(0, MAX_CHARS) : trimmed;
    
    // Prefix required for gemini-embedding-2 asymmetric retrieval
    const input = `title: none | text: ${contentText}`;

    let lastError: unknown;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await ai.models.embedContent({
                model: "gemini-embedding-2",
                contents: input,
                config: {
                    outputDimensionality: 768,
                }
            });

            const values = result.embeddings?.[0]?.values;
            if (!values || values.length === 0) {
                throw new Error("Gemini returned an empty embedding vector.");
            }
            return values;
        } catch (err: any) {
            lastError = err;

            const isRetryable =
                err?.status === 429 ||          // rate limited
                (err?.status >= 500 && err?.status < 600); // server error

            if (!isRetryable || attempt === maxRetries - 1) break;

            // Exponential back-off: 1s, 2s, 4s …
            await new Promise((res) => setTimeout(res, 1_000 * 2 ** attempt));
        }
    }

    console.error("[embedding_service] Failed after", maxRetries, "attempts:", lastError);
    throw new Error(
        "Embedding generation failed after retries. Check API quota or network connectivity."
    );
}