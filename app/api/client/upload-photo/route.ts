/**
 * POST /api/client/upload-photo
 *
 * Auth: Client session required.
 *
 * Body: multipart/form-data with a single "file" field (JPEG / PNG / WEBP).
 *
 * Flow:
 *  1. Validate file type and size (max 5 MB).
 *  2. Upload to Cloudinary under folder "tdc_profiles/" with a deterministic
 *     public_id so re-uploads replace the previous photo automatically.
 *  3. Save the secure_url to the Client document.
 *
 * Returns: 200 + { message, url }
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";
import { ClientService } from "@/lib/services/client.service";
import {
    ok,
    badRequest,
    unauthorized,
    serverError,
    requireRole,
} from "@/app/api/_lib/api-helpers";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function uploadToCloudinary(
    buffer: Buffer,
    publicId: string
): Promise<{ secure_url: string }> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "tdc_profiles",
                public_id: publicId,
                overwrite: true,
                // Auto-generate a WebP derivative for faster delivery
                eager: [{ format: "webp", quality: "auto" }],
            },
            (error, result) => {
                if (error || !result) reject(error ?? new Error("Cloudinary returned no result."));
                else resolve(result as { secure_url: string });
            }
        );
        stream.end(buffer);
    });
}


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!requireRole(session, "Client")) return unauthorized();

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return badRequest("No file provided. Include a 'file' field in the form data.");
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return badRequest("Only JPEG, PNG, and WEBP images are accepted.");
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return badRequest("File exceeds the 5 MB size limit.");
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Deterministic public_id means re-uploads replace the old image in-place
        const publicId = `profile_${session.user.id}`;
        const uploadResult = await uploadToCloudinary(buffer, publicId);
        const photoUrl = uploadResult.secure_url;

        await ClientService.updateById(session.user.id, {
            $set: { profilePhoto: photoUrl },
        });

        return ok({ message: "Profile photo uploaded successfully.", url: photoUrl });
    } catch (err) {
        console.error("[POST /api/client/upload-photo]", err);
        return serverError("Failed to upload photo. Please try again.");
    }
}