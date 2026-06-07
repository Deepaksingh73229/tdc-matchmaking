import mongoose, { Schema, Document } from "mongoose";

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/**
 * Structured partner preferences for rule-based pre-filtering.
 * Stored as a nested object on the Client document so a single
 * aggregation stage can apply hard-constraint filters before the
 * vector search, without a secondary lookup.
 */
const PreferencesSchema = new Schema(
    {
        preferredGender: {
            type: String,
            enum: ["Male", "Female", "Other", "Any"],
            default: "Any",
        },

        minAge: { 
            type: Number, 
            default: 18 
        },

        maxAge: { 
            type: Number, 
            default: 60 
        },

        minHeight_cm: { 
            type: Number, 
            default: 140 
        },

        maxHeight_cm: { 
            type: Number, 
            default: 220 
        },

        minIncome_lpa: { 
            type: Number, 
            default: 0 
        },

        preferredReligions: { 
            type: [String], 
            default: [] 
        }, // empty = any

        preferredCastes: { 
            type: [String], 
            default: [] 
        },    // empty = any

        preferredCities: { 
            type: [String], 
            default: [] 
        },    // empty = any

        preferredMaritalStatuses: {
            type: [String],
            enum: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
            default: [],
        },

        wantKids: {
            type: String,
            enum: ["Yes", "No", "Maybe", "Any"],
            default: "Any",
        },
        
        openToRelocate: {
            type: String,
            enum: ["Yes", "No", "Maybe", "Any"],
            default: "Any",
        },
    },
    { _id: false } // embedded sub-doc — no separate _id needed
);

// ─── Main Client interface ────────────────────────────────────────────────────

export interface IClient extends Document {
    // ── Identity
    firstName: string;
    lastName: string;
    gender: "Male" | "Female" | "Other";
    dob: Date;
    profilePhoto: string;

    // ── Contact (confidential — never leaked before mutual acceptance)
    email: string;
    phone: string;
    passwordHash: string;

    // ── Location
    country: string;
    city: string;

    // ── Physical
    height_cm: number;

    // ── Education & Career
    college: string;
    degree: string;
    company: string;
    designation: string;
    income_lpa: number;

    // ── Background
    maritalStatus: "Never Married" | "Divorced" | "Widowed" | "Awaiting Divorce";
    languages: string[];
    siblings: number;
    caste: string;
    religion: string;

    // ── Lifestyle
    wantKids: "Yes" | "No" | "Maybe";
    openToRelocate: "Yes" | "No" | "Maybe";
    openToPets: "Yes" | "No" | "Maybe";

    // ── Narrative fields (fed into the embedding model)
    aboutMe: string;
    hobbies: string;
    partnerExpectations: string;

    // ── Partner preferences (used for pre-filter query)
    preferences: {
        preferredGender: string;
        minAge: number;
        maxAge: number;
        minHeight_cm: number;
        maxHeight_cm: number;
        minIncome_lpa: number;
        preferredReligions: string[];
        preferredCastes: string[];
        preferredCities: string[];
        preferredMaritalStatuses: string[];
        wantKids: string;
        openToRelocate: string;
    };

    // ── AI / Search
    profileEmbedding: number[];   // dense vector from Gemini gemini-embedding-2 (768 dims)
    embeddedAt: Date | null;      // timestamp of last embedding — used to detect stale vectors

    // ── Workflow
    statusTag: "Pending" | "Searching" | "On Hold" | "Matched" | "Proposed";

    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema definition ────────────────────────────────────────────────────────

const ClientSchema = new Schema<IClient>(
    {
        // ── Identity
        firstName: { 
            type: String, 
            required: true, 
            trim: true 
        },

        lastName: { 
            type: String, 
            required: true, 
            trim: true 
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            // required: true,
        },

        dob: { 
            type: Date, 
            // required: true 
        },

        profilePhoto: { 
            type: String, 
            default: "" 
        },

        // ── Contact
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: { 
            type: String, 
            // required: true 
        },

        passwordHash: { 
            type: String, 
            required: true 
        },

        // ── Location
        country: { 
            type: String, 
            // required: true 
        },

        city: { 
            type: String, 
            // required: true 
        },

        // ── Physical
        height_cm: { 
            type: Number, 
            // required: true 
        },

        // ── Education & Career
        college: { 
            type: String, 
            default: "" 
        },

        degree: { 
            type: String, 
            default: "" 
        },

        company: { 
            type: String, 
            default: "" 
        },

        designation: { 
            type: String, 
            default: "" 
        },

        income_lpa: { 
            type: Number, 
            // required: true, 
            default: 0 
        },

        // ── Background
        maritalStatus: {
            type: String,
            enum: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
            default: "Never Married",
        },

        languages: { 
            type: [String], 
            default: ["Hindi", "English"] 
        },

        siblings: { 
            type: Number, 
            default: 0 
        },

        caste: { 
            type: String, 
            default: "" 
        },

        religion: { 
            type: String, 
            // required: true 
        },

        // ── Lifestyle
        wantKids: { 
            type: String, 
            enum: ["Yes", "No", "Maybe"], 
            default: "Maybe" 
        },

        openToRelocate: { 
            type: String, 
            enum: ["Yes", "No", "Maybe"], 
            default: "Maybe" 
        },

        openToPets: { 
            type: String, 
            enum: ["Yes", "No", "Maybe"], 
            default: "Maybe" 
        },

        // ── Narrative (embedding source)
        aboutMe: { 
            type: String, 
            default: "" 
        },

        hobbies: { 
            type: String, 
            default: "" 
        },

        partnerExpectations: { 
            type: String, 
            default: "" 
        },

        // ── Partner preferences
        preferences: { 
            type: PreferencesSchema, 
            default: () => ({}) 
        },

        // ── AI / Search
        profileEmbedding: {
            type: [Number],
            default: [],
            // Do NOT index here — Atlas Vector Search index is defined separately
            // in the Atlas UI / IaC, not via Mongoose.
        },

        embeddedAt: { 
            type: Date, 
            default: null 
        },

        // ── Workflow
        statusTag: {
            type: String,
            enum: ["Pending", "Searching", "On Hold", "Matched", "Proposed"],
            default: "On Hold",
        },
    },
    { timestamps: true }
);

// ─── Secondary indexes (non-vector) ──────────────────────────────────────────
// Used by the pre-filter aggregation stage to narrow candidates fast.
ClientSchema.index({ statusTag: 1, gender: 1, religion: 1, city: 1 });

// ─── Model registration (hot-reload safe) ────────────────────────────────────
if (mongoose.models.Client) {
    delete mongoose.models.Client;
}

export default mongoose.model<IClient>("Client", ClientSchema);