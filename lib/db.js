import mongoose from "mongoose";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3_000;

/**
 * Mongoose connection options following production best practices.
 * - bufferCommands: false  → fail fast; don't silently queue ops before connect
 * - maxPoolSize            → max simultaneous sockets per host (default 5 is low)
 * - serverSelectionTimeoutMS → how long the driver waits to find a usable server
 * - socketTimeoutMS        → close idle sockets after N ms
 * - family: 4             → force IPv4 (avoids slow DNS fallback on some hosts)
 */
const MONGOOSE_OPTS = {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    heartbeatFrequencyMS: 10_000,
    family: 4,
};

// ─── Connection states ────────────────────────────────────────────────────────

const ConnectionState = Object.freeze({
    DISCONNECTED: 0,
    CONNECTED: 1,
    CONNECTING: 2,
    DISCONNECTING: 3,
});

// ─── Module-level cache ───────────────────────────────────────────────────────
//
// In Next.js / serverless environments the module is re-evaluated on every cold
// start, but `global` persists across hot-reloads in development. We attach the
// cache to `global` so we don't exhaust the connection pool during HMR.

/** @type {{ conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }} */
const cache =
    global.__mongoose_cache ??
    (global.__mongoose_cache = { conn: null, promise: null });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUri() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error(
            "[DB] MONGODB_URI is not defined. " +
            "Add it to your .env.local (local) or environment variables (production)."
        );
    }
    return uri;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function attachEventListeners() {
    const { connection } = mongoose;

    connection.on("connected", () =>
        log("info", "MongoDB connected")
    );
    connection.on("disconnected", () =>
        log("warn", "MongoDB disconnected — will retry on next request")
    );
    connection.on("reconnected", () =>
        log("info", "MongoDB reconnected")
    );
    connection.on("error", (err) =>
        log("error", `MongoDB connection error: ${err.message}`)
    );

    // Graceful shutdown — close pool when the Node process exits
    process.once("SIGINT", gracefulShutdown("SIGINT"));
    process.once("SIGTERM", gracefulShutdown("SIGTERM"));
}

function gracefulShutdown(signal) {
    return async () => {
        try {
            await mongoose.connection.close();
            log("info", `MongoDB connection closed (${signal})`);
        } catch (err) {
            log("error", `Error closing MongoDB connection: ${err.message}`);
        } finally {
            process.exit(0);
        }
    };
}

function log(level, message) {
    const prefix = "[DB]";
    const ts = new Date().toISOString();
    if (level === "error") {
        console.error(`${ts} ${prefix} ❌ ${message}`);
    } else if (level === "warn") {
        console.warn(`${ts} ${prefix} ⚠️  ${message}`);
    } else {
        console.log(`${ts} ${prefix} ✅ ${message}`);
    }
}

// ─── Core connect logic (with retry) ─────────────────────────────────────────

async function createConnection(attempt = 1) {
    const uri = getUri();
    try {
        const instance = await mongoose.connect(uri, MONGOOSE_OPTS);
        attachEventListeners();
        return instance;
    } catch (err) {
        if (attempt < MAX_RETRIES) {
            log(
                "warn",
                `Connection attempt ${attempt}/${MAX_RETRIES} failed — retrying in ${RETRY_DELAY_MS / 1000}s. ` +
                `(${err.message})`
            );
            await sleep(RETRY_DELAY_MS);
            return createConnection(attempt + 1);
        }
        // Exhausted retries — bubble the error up
        throw new Error(
            `[DB] Could not connect to MongoDB after ${MAX_RETRIES} attempts. ` +
            `Last error: ${err.message}`
        );
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a connected Mongoose instance.
 *
 * Safe to call concurrently — only one connection attempt is made at a time.
 * Subsequent calls while a connection is in progress await the same promise.
 *
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB() {
    // 1. Already connected — return immediately
    if (
        cache.conn &&
        mongoose.connection.readyState === ConnectionState.CONNECTED
    ) {
        return cache.conn;
    }

    // 2. Connection in progress — wait for the existing promise
    if (cache.promise) {
        cache.conn = await cache.promise;
        return cache.conn;
    }

    // 3. No connection yet — initiate one
    cache.promise = createConnection();

    try {
        cache.conn = await cache.promise;
    } catch (err) {
        // Clear the promise so the next caller can retry fresh
        cache.promise = null;
        cache.conn = null;
        throw err;
    }

    return cache.conn;
}

/**
 * Explicitly closes the MongoDB connection.
 * Useful in test teardown or CLI scripts.
 */
export async function disconnectDB() {
    if (mongoose.connection.readyState === ConnectionState.DISCONNECTED) {
        return;
    }
    try {
        await mongoose.connection.close();
        cache.conn = null;
        cache.promise = null;
        log("info", "MongoDB disconnected (manual)");
    } catch (err) {
        log("error", `Failed to disconnect: ${err.message}`);
        throw err;
    }
}

/**
 * Returns the current connection health.
 * @returns {{ status: string; readyState: number; host: string | null }}
 */
export function getConnectionStatus() {
    const { readyState, host } = mongoose.connection;
    const labels = {
        [ConnectionState.DISCONNECTED]: "disconnected",
        [ConnectionState.CONNECTED]: "connected",
        [ConnectionState.CONNECTING]: "connecting",
        [ConnectionState.DISCONNECTING]: "disconnecting",
    };
    return {
        status: labels[readyState] ?? "unknown",
        readyState,
        host: host ?? null,
    };
}