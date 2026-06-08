# System Behavior & Architecture

*Part of the [TDC Matchmaking Platform](../README.md) | 🚀 **Live Demo:** [tdc-matchmaking.vercel.app](https://tdc-matchmaking.vercel.app/)*

This document details the architectural decisions, state management, security protocols, and data modeling behaviors of the TDC Matchmaking platform.

---

## 1. Architectural Pattern

The application utilizes the **Next.js App Router** architecture, strictly adhering to modern React paradigms:
- **Server Components (RSC)**: Heavy data-fetching (like the main dashboard grids) is performed entirely on the server. This reduces JavaScript bundle size sent to the client, hides database query logic, and ensures high performance.
- **Client Components**: Interactive elements (like the Match Suggestion UI, Modals, and Filtering dropdowns) are marked with `"use client"` and handle React state (`useState`, `useEffect`).
- **API Route Handlers**: RESTful endpoints (`/api/...`) act as the secure bridge for client-side interactions to trigger backend services (e.g., generating AI emails or proposing matches).

---

## 2. Database Behavior & Data Integrity

The system relies on **MongoDB** paired with **Mongoose v9** for strict schema enforcement.

### Data Models
1. **Client Model**: Stores demographic data, lifestyle preferences, and `profileEmbedding` (a numerical array representing the semantic meaning of their profile used for Vector Search).
2. **Match Model**: Acts as a junction table tracking the relationship between `clientA` and `clientB`. It is strictly typed to hold `mongoose.Types.ObjectId` to maintain relational integrity, alongside the AI-generated messages and the current state (`Proposed`, `Connected`, `Rejected`).
3. **Matchmaker Model**: Represents the internal admin staff with elevated privileges.
4. **Notification Model**: Used to push real-time alerts to clients regarding their profile status and new match proposals.

### Type Safety & Consistency
To bridge the gap between Next.js (which passes route parameters and session data as strings) and MongoDB (which expects ObjectIds), the system leverages widened TypeScript types (e.g., `string | mongoose.Types.ObjectId`). This ensures Mongoose can auto-cast valid strings internally without causing TypeScript compilation errors during build time.

---

## 3. Security & Authentication

- **NextAuth Integration**: Authentication is managed completely server-side via NextAuth.
- **JWT Strategy**: Sessions are stateless and stored via JWT tokens. The custom `next-auth.d.ts` module extension ensures that `user.id` and `user.role` are deeply integrated into the session object across the entire application.
- **Route Protection**: Next.js Middleware intercepts incoming requests. Any attempt to access `/dashboard` or protected API routes without a valid Matchmaker session token results in an automatic redirect to `/login` or a `401 Unauthorized` response.

---

## 4. Error Handling & Resilience

- **Fail-safes in AI Generation**: The LLM API calls are wrapped in `try/catch` blocks. If the external Gemini API times out or fails, the system degrades gracefully by returning a generic, pre-written polite introduction template rather than crashing the matching process.
- **Toast Notifications**: Client-side errors (like attempting to upload an oversized profile photo) are immediately caught and displayed using the `sonner` toast notification library, preventing unnecessary backend load.

---

## 5. Performance Optimization

- **Database Indexes**: To speed up queries on large datasets, compound indexes are utilized. 
- **Atlas Vector Search**: Instead of loading all clients into memory to calculate compatibility, the system leverages MongoDB Atlas's native Vector Search (`$vectorSearch`), allowing the database engine to perform lightning-fast nearest-neighbor calculations on thousands of embeddings simultaneously before returning the top candidates to the Node.js server.
