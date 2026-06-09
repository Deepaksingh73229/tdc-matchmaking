import mongoose, { Schema, Document } from "mongoose";

export interface IMatchmaker extends Document {
    name: string;
    username: string;
    profilePhoto?: string;
    passwordHash: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MatchmakerSchema = new Schema<IMatchmaker>(
    {
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        profilePhoto: {
            type: String,
            trim: true,
            default: ""
        },

        passwordHash: { 
            type: String, 
            required: true 
        },

        isActive: { 
            type: Boolean, 
            default: true 
        },
    },
    { timestamps: true }
);

if (mongoose.models.Matchmaker) {
    delete mongoose.models.Matchmaker;
}

export default mongoose.model<IMatchmaker>("Matchmaker", MatchmakerSchema);