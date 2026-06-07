/**
 * POST /api/auth/register
 *
 * Public endpoint — creates a new Client account with minimal details.
 * The client must then fill in their full profile before a Matchmaker
 * can verify them.
 *
 * Body:
 *   { firstName, lastName, email, password, phone, gender, dob, religion,
 *     country, city, height_cm, income_lpa }
 *
 * Returns: 201 + { message, clientId }
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ClientService } from "@/lib/services/client.service";
import {
    badRequest,
    conflict,
    created,
    serverError,
    isDuplicateKeyError,
    isValidEmail,
    isNonEmptyString,
} from "@/app/api/_lib/api-helpers";

// ─── Required fields for initial registration ─────────────────────────────────
const REQUIRED = [
    "firstName",
    "lastName",
    "email",
    "password",
    // "phone",
    // "gender",
    // "dob",
    // "religion",
    // "country",
    // "city",
    // "height_cm",
    // "income_lpa",
] as const;

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // ── Field presence check ─────────────────────────────────────────────────
        const missing = REQUIRED.filter(
            (f) => body[f] === undefined || body[f] === null || body[f] === ""
        );

        if (missing.length) {
            return badRequest(`Missing required fields: ${missing.join(", ")}.`);
        }

        // ── Format validation ────────────────────────────────────────────────────
        if (!isValidEmail(body.email)) {
            return badRequest("Please provide a valid email address.");
        }

        if (!isNonEmptyString(body.password) || body.password.length < 8) {
            return badRequest("Password must be at least 8 characters.");
        }

        // if (!["Male", "Female", "Other"].includes(body.gender)) {
        //     return badRequest("Gender must be 'Male', 'Female', or 'Other'.");
        // }

        // ── Hash password ────────────────────────────────────────────────────────
        const passwordHash = await bcrypt.hash(body.password, 12);

        // ── Create client ────────────────────────────────────────────────────────
        const client = await ClientService.create({
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            email: body.email.toLowerCase().trim(),
            passwordHash,
            statusTag: "On Hold", // Stays On Hold until Matchmaker verifies and embeds
        });

        return created({
            message: "Account created successfully. Please complete your profile.",
            clientId: client._id.toString(),
        });
    } 
    catch (err) {
        if (isDuplicateKeyError(err)) {
            return conflict("An account with this email already exists.");
        }

        console.error("[POST /api/auth/register]", err);
        return serverError();
    }
}