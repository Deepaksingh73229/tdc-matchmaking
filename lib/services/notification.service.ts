import { connectDB } from "@/lib/db";
import Notification, { INotification } from "@/models/Notification";

/**
 * Service for handling all Notification-related database operations.
 */
export const NotificationService = {
    /**
     * Finds a notification by ID.
     */
    async findById(id: string): Promise<INotification | null> {
        await connectDB();
        return Notification.findById(id).lean();
    },

    /**
     * Finds one notification matching a query.
     */
    async findOne(query: any): Promise<INotification | null> {
        await connectDB();
        return Notification.findOne(query).lean();
    },

    /**
     * Finds multiple notifications matching a query.
     */
    async findMany(query: any, sort: any = { createdAt: -1 }): Promise<INotification[]> {
        await connectDB();
        return Notification.find(query)
            .sort(sort)
            .lean();
    },

    /**
     * Creates a single notification.
     */
    async create(data: Partial<INotification>): Promise<INotification> {
        await connectDB();
        return Notification.create(data);
    },

    /**
     * Creates multiple notifications.
     */
    async insertMany(data: Partial<INotification>[]) {
        await connectDB();
        return Notification.insertMany(data);
    },

    /**
     * Finds notifications for a client.
     */
    async findByClient(clientId: string, limit = 50) {
        await connectDB();
        return Notification.find({ clientId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    },

    /**
     * Marks a notification as read.
     */
    async markAsRead(id: string): Promise<INotification | null> {
        await connectDB();
        return Notification.findByIdAndUpdate(
            id,
            { $set: { isRead: true } },
            { returnDocument: "after" }
        ).lean();
    },

    /**
     * Marks all notifications for a client as read.
     */
    async markAllAsRead(clientId: string) {
        await connectDB();
        return Notification.updateMany(
            { clientId, isRead: false },
            { $set: { isRead: true } }
        );
    },

    /**
     * Counts unread notifications for a client.
     */
    async countUnread(clientId: string): Promise<number> {
        await connectDB();
        return Notification.countDocuments({ clientId, isRead: false });
    },

    /**
     * Counts notifications matching a query.
     */
    async count(query: any): Promise<number> {
        await connectDB();
        return Notification.countDocuments(query);
    },

    /**
     * Finds and updates a single notification.
     */
    async findOneAndUpdate(query: any, update: any, options: any = { returnDocument: "after" }) {
        await connectDB();
        return Notification.findOneAndUpdate(query, update, options).lean();
    },

    /**
     * Lists notifications with pagination and filtering.
     */
    async list(query: any = {}, sort: any = { createdAt: -1 }, limit = 20, skip = 0) {
        await connectDB();
        return Notification.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean();
    }
};
