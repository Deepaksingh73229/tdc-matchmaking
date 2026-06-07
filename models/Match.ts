import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    clientA: string | mongoose.Types.ObjectId;
    clientB: string | mongoose.Types.ObjectId;

    /** AI-generated personalised intro for clientA (about clientB) */
    messageA: string;
    /** AI-generated personalised intro for clientB (about clientA) */
    messageB: string;

    /** Individual response from each party */
    statusA: "Pending" | "Accepted" | "Declined";
    statusB: "Pending" | "Accepted" | "Declined";

    /**
     * Derived lifecycle state.
     *
     * Proposed  → both notified, awaiting responses
     * Connected → both accepted; contact info unlocked
     * Rejected  → at least one party declined
     * Archived  → manually archived by matchmaker
     */
    overallStatus: "Proposed" | "Connected" | "Rejected" | "Archived";

    /** Compatibility reasons stored at proposal time for audit/display */
    matchReasons: string[];

    /** Compatibility score (0–100) at the time of proposal */
    compatibilityScore: number;

    /** The Matchmaker who created this proposal */
    proposedBy: string | mongoose.Types.ObjectId;

    /** Timestamps for when each party responded */
    respondedAtA: Date | null;
    respondedAtB: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        clientA: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        clientB: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        messageA: { 
            type: String, 
            required: true 
        },

        messageB: { 
            type: String, 
            required: true 
        },

        statusA: {
            type: String,
            enum: ["Pending", "Accepted", "Declined"],
            default: "Pending",
        },

        statusB: {
            type: String,
            enum: ["Pending", "Accepted", "Declined"],
            default: "Pending",
        },

        overallStatus: {
            type: String,
            enum: ["Proposed", "Connected", "Rejected", "Archived"],
            default: "Proposed",
        },

        matchReasons: { 
            type: [String], 
            default: [] 
        },

        compatibilityScore: { 
            type: Number, 
            default: 0, 
            min: 0, 
            max: 100 
        },

        proposedBy: {
            type: Schema.Types.ObjectId,
            ref: "Matchmaker",
            required: true,
        },

        respondedAtA: { 
            type: Date, 
            default: null 
        },

        respondedAtB: { 
            type: Date, 
            default: null 
        },
    },
    { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

/**
 * Unique constraint on the sorted pair — prevents duplicate proposals.
 * NOTE: proposeMatch.ts always sorts IDs before writing so (A,B) and (B,A)
 * resolve to the same index key. Keep that sort logic in the action.
 */
MatchSchema.index({ clientA: 1, clientB: 1 }, { unique: true });

/** Fast lookups by overall lifecycle state (dashboard queries) */
MatchSchema.index({ overallStatus: 1, createdAt: -1 });

/** Quickly fetch all matches for a given client from either side */
MatchSchema.index({ clientA: 1, overallStatus: 1 });
MatchSchema.index({ clientB: 1, overallStatus: 1 });

// ─── Model registration (hot-reload safe) ────────────────────────────────────
if (mongoose.models.Match) {
    delete mongoose.models.Match;
}

export default mongoose.model<IMatch>("Match", MatchSchema);