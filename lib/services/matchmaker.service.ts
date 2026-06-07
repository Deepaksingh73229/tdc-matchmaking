import { connectDB } from "@/lib/db";
import Matchmaker, { IMatchmaker } from "@/models/Matchmaker";

/**
 * Service for handling all Matchmaker (Admin) related database operations.
 */
export const MatchmakerService = {
    /**
     * Finds a matchmaker by ID.
     */
    async findById(id: string, projection: any = {}): Promise<IMatchmaker | null> {
        await connectDB();
        return Matchmaker.findById(id).select(projection).lean();
    },

    /**
     * Finds one matchmaker matching a query.
     */
    async findOne(query: any): Promise<IMatchmaker | null> {
        await connectDB();
        return Matchmaker.findOne(query).lean();
    },

    /**
     * Finds multiple matchmakers matching a query.
     */
    async findMany(query: any): Promise<IMatchmaker[]> {
        await connectDB();
        return Matchmaker.find(query).lean();
    },

    /**
     * Updates a matchmaker by ID.
     */
    async updateById(id: string, update: any) {
        await connectDB();
        return Matchmaker.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    },

    /**
     * Creates a new matchmaker.
     */
    async create(data: Partial<IMatchmaker>): Promise<IMatchmaker> {
        await connectDB();
        return Matchmaker.create(data);
    },

    /**
     * Deletes multiple matchmakers.
     */
    async deleteMany(query: any) {
        await connectDB();
        return Matchmaker.deleteMany(query);
    }
};
