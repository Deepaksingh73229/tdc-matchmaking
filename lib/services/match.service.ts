import { connectDB } from "@/lib/db";
import Match, { IMatch } from "@/models/Match";

/**
 * Service for handling all Match-related database operations.
 */
export const MatchService = {
    /**
     * Finds a match by ID.
     */
    async findById(id: string): Promise<IMatch | null> {
        await connectDB();
        return Match.findById(id).lean();
    },

    /**
     * Finds one match matching a query.
     */
    async findOne(query: any, projection: any = {}, populate: any = []): Promise<IMatch | null> {
        await connectDB();
        let q = Match.findOne(query).select(projection);
        if (populate && populate.length > 0) {
            populate.forEach((p: any) => {
                q = q.populate(p);
            });
        }
        return q.lean();
    },

    /**
     * Creates a new match.
     */
    async create(data: Partial<IMatch>): Promise<IMatch> {
        await connectDB();
        return Match.create(data);
    },

    /**
     * Updates a match by ID.
     */
    async updateById(id: string, update: any): Promise<IMatch | null> {
        await connectDB();
        return Match.findByIdAndUpdate(id, update, { new: true }).lean();
    },

    /**
     * Lists matches for a specific client.
     */
    async listForClient(clientId: string) {
        await connectDB();
        return Match.find({
            $or: [{ clientA: clientId }, { clientB: clientId }]
        })
            .sort({ createdAt: -1 })
            .lean();
    },

    /**
     * Checks if a match exists between two clients.
     */
    async exists(clientA: string, clientB: string): Promise<boolean> {
        await connectDB();
        const [id1, id2] = [clientA, clientB].sort();
        const count = await Match.countDocuments({ clientA: id1, clientB: id2 });
        return count > 0;
    },

    /**
     * Counts matches matching a query.
     */
    async count(query: any): Promise<number> {
        await connectDB();
        return Match.countDocuments(query);
    },

    /**
     * Lists matches with pagination and filtering.
     */
    async list(query: any = {}, sort: any = { createdAt: -1 }, limit = 20, skip = 0, populate: any = []) {
        await connectDB();
        let q = Match.find(query).sort(sort).limit(limit).skip(skip);
        if (populate && populate.length > 0) {
            populate.forEach((p: any) => {
                q = q.populate(p);
            });
        }
        return q.lean();
    },

    /**
     * Deletes a match by ID.
     */
    async deleteById(id: string) {
        await connectDB();
        return Match.findByIdAndDelete(id).lean();
    }
};
