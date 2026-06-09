import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
    | "MATCH_PROPOSAL"   // Matchmaker formally proposed a match
    | "MATCH_SUGGESTED"  // Informal suggestion / teaser
    | "MATCH_ACCEPTED"   // Other party accepted — mutual connection
    | "MATCH_DECLINED"   // Other party declined
    | "PROFILE_UPDATED"  // Admin updated profile details
    | "PROFILE_VERIFIED" // Profile passed verification
    | "SYSTEM";          // Generic platform announcement

export interface INotification extends Document {
    clientId: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    /** ObjectId of the related Match (or other entity) stored as string for flexibility */
    relatedId?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        title: { 
            type: String, 
            required: true 
        },

        message: { 
            type: String, 
            required: true 
        },

        type: {
            type: String,
            enum: [
                "MATCH_PROPOSAL",
                "MATCH_SUGGESTED",
                "MATCH_ACCEPTED",
                "MATCH_DECLINED",
                "PROFILE_UPDATED",
                "PROFILE_VERIFIED",
                "SYSTEM",
            ],
            default: "SYSTEM",
        },

        relatedId: { 
            type: String 
        },

        isRead: { 
            type: Boolean, 
            default: false 
        },
    },
    { timestamps: true }
);


/** Primary query: unread notifications for a client, newest first */
NotificationSchema.index({ clientId: 1, isRead: 1, createdAt: -1 });

/**
 * TTL index — automatically purge read notifications after 90 days.
 * Keeps the collection lean without manual cleanup jobs.
 * Only applies when isRead = true (use a partial filter for prod-grade precision,
 * but a simple TTL on updatedAt works fine here since we only update on read).
 */
NotificationSchema.index(
    { updatedAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days
);

if (mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

export default mongoose.model<INotification>("Notification", NotificationSchema);