import { connectDB } from "@/lib/db";
import Client, { IClient } from "@/models/Client";


/**
 * Service for handling all Client-related database operations.
 * This layer is responsible for:
 * 1. Ensuring DB connection.
 * 2. Executing Mongoose queries.
 * 3. Handling DB-level errors.
 * 
 * It should NOT handle Auth or Revalidation (do that in Actions or Routes).
 */
export const ClientService = {
    /**
     * Finds a client by ID.
     */
    async findById(id: string, projection: any = {}): Promise<IClient | null> {
        await connectDB();
        return Client.findById(id).select(projection).lean();
    },

    /**
     * Finds one client matching a query.
     */
    async findOne(query: any, projection: any = {}): Promise<IClient | null> {
        await connectDB();
        return Client.findOne(query).select(projection).lean();
    },

    /**
     * Creates a new client.
     */
    async create(data: Partial<IClient>): Promise<IClient> {
        await connectDB();
        return Client.create(data);
    },

    /**
     * Creates multiple clients.
     */
    async insertMany(data: Partial<IClient>[]) {
        await connectDB();
        return Client.insertMany(data);
    },

    /**
     * Updates a client by ID.
     */
    async updateById(id: string, update: any, options: any = { new: true, runValidators: true }): Promise<IClient | null> {
        await connectDB();
        return Client.findByIdAndUpdate(id, update, options).lean();
    },

    /**
     * Updates multiple clients.
     */
    async updateMany(query: any, update: any) {
        await connectDB();
        return Client.updateMany(query, update);
    },

    /**
     * Deletes multiple clients.
     */
    async deleteMany(query: any) {
        await connectDB();
        return Client.deleteMany(query);
    },

    /**
     * Counts clients matching a query.
     */
    async count(query: any): Promise<number> {
        await connectDB();
        return Client.countDocuments(query);
    },

    /**
     * Lists clients with pagination and filtering.
     */
    async list(query: any = {}, sort: any = { createdAt: -1 }, limit = 20, skip = 0, projection: any = {}) {
        await connectDB();
        return Client.find(query)
            .select(projection)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean();
    },

    /**
     * Returns distinct values for a field.
     */
    async distinct(field: string, query: any = {}) {
        await connectDB();
        return Client.distinct(field, query);
    },

    /**
     * Runs an aggregation pipeline.
     */
    async aggregate(pipeline: any[]) {
        await connectDB();
        return Client.aggregate(pipeline);
    }
};
