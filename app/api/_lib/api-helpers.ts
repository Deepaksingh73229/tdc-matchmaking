/**
 * api/_lib/api-helpers.ts
 *
 * Shared utilities used across every route handler:
 *  - Typed JSON response helpers (no magic status numbers scattered in handlers)
 *  - Input sanitisation (strips fields clients must not self-assign)
 *  - Minimal Zod-free validators for common shapes
 */

import { NextResponse } from "next/server";
import type { Session } from "next-auth";


export function ok<T extends object>(data: T, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function created<T extends object>(data: T) {
    return NextResponse.json({ success: true, ...data }, { status: 201 });
}

export function badRequest(message: string) {
    return NextResponse.json({ success: false, message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized.") {
    return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = "Forbidden.") {
    return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = "Resource not found.") {
    return NextResponse.json({ success: false, message }, { status: 404 });
}

export function conflict(message: string) {
    return NextResponse.json({ success: false, message }, { status: 409 });
}

export function serverError(message = "An unexpected error occurred.") {
    return NextResponse.json({ success: false, message }, { status: 500 });
}


export function requireRole(
    session: Session | null,
    role: "Client" | "Matchmaker"
): session is Session {
    return !!(session && session.user && (session.user as any).role === role);
}


/**
 * Fields that must NEVER be updated via the client self-update route.
 * Prevents privilege escalation and data integrity issues.
 */
const CLIENT_IMMUTABLE_FIELDS = new Set([
    "passwordHash",
    "email",
    "profileEmbedding",
    "embeddedAt",
    "statusTag",
    "profilePhoto", // updated only via the dedicated upload route
    "_id",
    "__v",
    "createdAt",
    "updatedAt",
]);

/**
 * Strips immutable / server-managed fields from a client-supplied update payload.
 * Returns the sanitised object (never mutates the input).
 */
export function sanitiseClientUpdate(raw: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(raw).filter(([key]) => !CLIENT_IMMUTABLE_FIELDS.has(key))
    );
}


export function isNonEmptyString(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}

export function isValidObjectId(v: unknown): v is string {
    return typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
}

export function isValidEmail(v: unknown): v is string {
    return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}


export function isDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as any).code === 11000
    );
}


/**
 * Fields NEVER sent to the client (or matchmaker) in any list/search response.
 * Phone + email are revealed only after mutual acceptance.
 */
export const CLIENT_PRIVATE_PROJECTION = {
    passwordHash: 0,
    profileEmbedding: 0,
    phone: 0,
    email: 0,
} as const;

/**
 * Same as above but also hides the embedding — used when full profile IS shown
 * (e.g. admin detail view) but the vector array is never needed by the UI.
 */
export const CLIENT_ADMIN_PROJECTION = {
    passwordHash: 0,
    profileEmbedding: 0,
} as const;