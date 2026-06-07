# System Flow

This document outlines the step-by-step operational flow of the TDC platform, from the perspective of the Admin (Matchmaker) utilizing the dashboard to facilitate connections.

---

## 1. Authentication & Authorization

1. **Login Request**: The user navigates to `/login` and submits credentials.
2. **NextAuth Verification**: The system intercepts the request via `NextAuth` Credentials Provider.
3. **Role Check**: The system queries the database to verify if the user is a `Matchmaker` (Admin) or a `Client`. 
4. **Session Creation**: Upon successful password verification (using bcrypt), a JWT session is created, injecting the user's `id` and `role` into the session token.
5. **Redirection**: The user is securely redirected to the `/dashboard` (protected route).

---

## 2. The Matchmaker Dashboard

Once authenticated, the Matchmaker lands on the main dashboard.

1. **Data Fetching**: The Next.js Server Component queries the MongoDB database for:
   - Total Client Count.
   - Count of matches in "Proposed" state.
   - Count of matches in "Connected" state.
   - A paginated list of clients.
2. **UI Rendering**: The dashboard displays key metrics and a searchable data grid of clients.
3. **Filtering**: The matchmaker can filter the client roster by specific criteria (e.g., City, Religion, Gender, Marital Status) to find a specific client to work on.

---

## 3. The Match Discovery Process

When the Matchmaker selects a client and clicks **"Find Matches"**, the core workflow begins.

1. **Initiation**: The system opens the Suggestion Engine interface for the selected `Target Client`.
2. **Algorithm Execution**: 
   - A request is sent to the backend to find potential matches.
   - The **Hybrid Matchmaking Engine** runs (see [ALGORITHM.md](./ALGORITHM.md) for deep details).
   - It performs an Atlas Vector Search followed by Rule-Based Scoring.
3. **Surfacing Results**: The UI populates a list of top candidates, sorted descending by their `Compatibility Score` (0-100).
4. **Contextual Analysis**: Alongside the score, the system displays human-readable "Reasons" and "Penalties" (e.g., *"Perfect location match"*, or *"Income disparity detected"*), allowing the Matchmaker to understand *why* the algorithm suggested them.

---

## 4. Match Proposal & AI Integration

If the Matchmaker approves of a suggested candidate, they proceed to **Propose** the match.

1. **Action Trigger**: The Matchmaker clicks "Propose Match".
2. **Score Recalculation**: The backend formally recalculates and locks in the final Compatibility Score and deduplicates the compatibility reasons from both clients' perspectives.
3. **Parallel AI Generation**: 
   - The system invokes the **Google Gemini AI API** concurrently for both clients.
   - It feeds the LLM the names, compatibility reasons, and soft penalties.
   - The AI generates two personalized, warm introduction emails (one tailored for Client A introducing Client B, and vice versa).
4. **Database Transaction**:
   - A new `Match` document is created in MongoDB containing the IDs of both clients, the AI-generated messages, the compatibility score, and the Matchmaker's ID.
   - The status of both clients is updated to `Proposed`.
5. **UI Update**: The Matchmaker is shown a success modal, and the dashboard metrics (e.g., Proposed Count) instantly reflect the new data.

---

## 5. Client Lifecycle (Post-Proposal)

*While the assignment focuses primarily on the Matchmaker dashboard, the system is designed to support the following downstream flow:*

1. **Notification**: Clients receive the AI-generated proposal via email/notifications.
2. **Client Decision**: Clients log into their portal and accept or decline the match.
3. **Mutual Acceptance**: If both parties accept (`statusA === "Accepted"` and `statusB === "Accepted"`), the `overallStatus` changes to `Connected`, unlocking contact information.
4. **Rejection**: If either declines, the status changes to `Rejected`, and the clients are placed back into the available matching pool.
