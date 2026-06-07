# Backend Services & API Architecture

The TDC platform strictly separates database execution logic from UI components. Instead of querying the database directly inside React components, the application utilizes **Service Layers** and **Next.js Server Actions / API Routes**.

This document outlines the core backend services and their responsibilities.

---

## 1. Authentication (`/api/auth/[...nextauth]/route.ts`)

Handles all security, session creation, and login validation.

- **Provider**: Credentials Provider.
- **Flow**: 
  1. Accepts `email` and `password`.
  2. Queries the `Matchmaker` database.
  3. Verifies the password using `bcrypt`.
  4. Returns a JWT containing the user's `id` and `role`.
- **Type Safety**: Custom NextAuth typing ensures that the `.id` property is natively accessible on the `session.user` object across the app without TypeScript throwing errors.

---

## 2. The Core Service Layer (`/lib/services/`)

To keep API routes and Server Components clean, all database interactions are encapsulated inside service objects. 

### A. `ClientService`
- `findById(id)`: Retrieves a specific client's full profile.
- `list(query, pagination)`: Fetches the dashboard grid data.
- `updateById(id, data)`: Handles updates (e.g., when a client's status changes to "Proposed").

### B. `MatchService`
- `create(data)`: Initiates a new match junction in the database.
- `listForClient(clientId)`: Fetches all active or past matches for a specific user.
- `exists(clientA, clientB)`: A crucial validation check to ensure a matchmaker doesn't accidentally propose the same pair twice.

### C. `ProposeMatchService`
The heaviest and most complex service in the application.
- **Responsibilities**: 
  1. Receives two Client IDs.
  2. Recalculates their final Compatibility Score using the Rule-Based Engine.
  3. Formats the `reasons` and `penalties` arrays.
  4. Triggers the Google Gemini AI API to generate the dual email introductions.
  5. Wraps the creation of the `Match` document and the status update of both clients into a single logical transaction.

---

## 3. Server Components (RSC) Data Fetching

In the Next.js App Router, much of the traditional "GET API" logic is bypassed in favor of direct Server Component fetching.

- **`/dashboard` Page**: 
  - Directly awaits `ClientService.list()`.
  - Directly awaits `MatchService.count()`.
  - Passes the highly serialized, plain JavaScript objects directly down to the Client Components (e.g., `ClientHubUI`) via props. This completely eliminates the need for `/api/clients` REST endpoints and reduces network waterfalls.

---

## 4. API Endpoints (Client-to-Server Mutations)

While data fetching is done via RSC, client-side interactions (like clicking "Propose Match" inside a modal) trigger secure backend endpoints.

### `POST /api/match/propose` (Conceptual)
- **Triggered by**: Matchmaker clicking "Confirm" in the Match Proposal UI.
- **Payload**: `{ targetClientId, matchCandidateId }`
- **Security Check**: Verifies the current session is a valid Matchmaker/Admin.
- **Action**: Awaits `ProposeMatchService.execute()`.
- **Response**: Returns the newly created `Match` object, prompting the frontend UI to display a success Toast notification and update its local state.
