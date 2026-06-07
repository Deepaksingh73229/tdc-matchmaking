"use server";

import { ClientService } from "@/lib/services/client.service";
import { NotificationService } from "@/lib/services/notification.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { generateProfileEmbedding, buildProfileText } from "@/lib/services/embedding.service";

// ─── Required-field definition ────────────────────────────────────────────────
// Each entry is typed so `key` is always a real field name on the Client model.
const REQUIRED_FIELDS: Array<{ key: any; label: string }> = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "gender", label: "Gender" },
    { key: "dob", label: "Date of Birth" },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    { key: "height_cm", label: "Height" },
    { key: "religion", label: "Religion" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "college", label: "College" },
    { key: "degree", label: "Degree" },
    { key: "designation", label: "Job Designation" },
    { key: "income_lpa", label: "Annual Income" },
    { key: "profilePhoto", label: "Profile Photo" },
    { key: "aboutMe", label: "About Me" },
];

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Verifies a client's profile and immediately generates + stores their
 * embedding so they are discoverable in vector search right away.
 *
 * Only a logged-in Matchmaker can call this.
 */
export async function verifyClientProfile(clientId: string) {
    try {
        // ── Auth guard ──────────────────────────────────────────────────────────
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "Matchmaker") {
            return { success: false, error: "Unauthorized. Only Matchmakers can verify profiles." };
        }

        // ── Fetch client ────────────────────────────────────────────────────────
        const client = await ClientService.findById(clientId);
        if (!client) {
            return { success: false, error: "Client not found." };
        }

        // ── Idempotency guard ───────────────────────────────────────────────────
        if (client.statusTag === "Searching") {
            return { success: false, error: "This profile is already verified and active." };
        }

        // ── Completeness check ──────────────────────────────────────────────────
        const missingFields = REQUIRED_FIELDS.filter(({ key }) => {
            const val = client[key as keyof typeof client];
            if (val === null || val === undefined) return true;
            if (typeof val === "string" && val.trim() === "") return true;
            if (typeof val === "number" && val === 0) return true;
            return false;
        }).map(({ label }) => label);

        if (missingFields.length > 0) {
            return {
                success: false,
                error: `Profile is incomplete. Please fill out: ${missingFields.join(", ")}.`,
            };
        }

        // ── Generate embedding ──────────────────────────────────────────────────
        let embedding: number[];
        try {
            const profileText = buildProfileText({
                firstName: client.firstName,
                gender: client.gender,
                city: client.city,
                religion: client.religion,
                maritalStatus: client.maritalStatus,
                languages: client.languages,
                caste: client.caste,
                college: client.college,
                degree: client.degree,
                designation: client.designation,
                wantKids: client.wantKids,
                openToRelocate: client.openToRelocate,
                openToPets: client.openToPets,
                aboutMe: client.aboutMe,
                hobbies: client.hobbies,
                partnerExpectations: client.partnerExpectations,
            });
            embedding = await generateProfileEmbedding(profileText);
        } catch (embedErr) {
            console.error("[verifyClient] Embedding failed:", embedErr);
            return {
                success: false,
                error:
                    "Profile is complete but AI embedding failed. Please retry in a moment. " +
                    "The profile has NOT been marked as verified.",
            };
        }

        // ── Persist: status + embedding ──────────────────────
        await ClientService.updateById(clientId, {
            statusTag: "Searching",
            profileEmbedding: embedding,
            embeddedAt: new Date(),
        });

        // ── Notify client ───────────────────────────────────────────────────────
        await NotificationService.create({
            clientId,
            title: "Profile Verified! 🎉",
            message:
                "Your profile has been reviewed and approved by your Matchmaker. " +
                "You are now live and eligible for match suggestions.",
            type: "PROFILE_VERIFIED",
        });

        // ── Revalidate UI ───────────────────────────────────────────────────────
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/client/${clientId}`);

        return { success: true };
    } catch (error) {
        console.error("[verifyClient] Unexpected error:", error);
        return { success: false, error: "An unexpected error occurred during verification." };
    }
}