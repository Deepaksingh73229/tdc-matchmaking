# Database Schema & Models

*Part of the [TDC Matchmaking Platform](../README.md) | 🚀 **Live Demo:** [tdc-matchmaking.vercel.app](https://tdc-matchmaking.vercel.app/)*

The TDC platform uses **MongoDB** as its primary database, interfaced via **Mongoose v9**. 

This document outlines the core collections, their relationships, and the strict TypeScript interfaces that enforce data integrity across the application.

---

## 1. Client Model (`/models/Client.ts`)

The `Client` collection holds all demographic, lifestyle, and matchmaking data for end-users. 

### Key Fields:
- **Identity:** `firstName`, `lastName`, `email`, `gender`, `profilePhoto`
- **Demographics:** `age`, `height_cm`, `religion`, `caste`, `motherTongue`
- **Location:** `city`, `country`, `openToRelocate` (Boolean)
- **Professional:** `education`, `occupation`, `income_lpa` (Number)
- **Lifestyle:** `diet`, `drinking`, `smoking`, `pets`
- **Matching Preferences:** 
  - `maritalStatus` (Never Married, Divorced, Widowed)
  - `familyPlanning` (Wants kids, Doesn't want kids, Open/Maybe)
- **System State:**
  - `statusTag`: Tracks pipeline stage (`New`, `Active`, `Proposed`, `Connected`).
  - `profileEmbedding`: `[Number]` - A dense vector array generated from the client's narrative, used by Atlas Vector Search for semantic matching.

---

## 2. Match Model (`/models/Match.ts`)

The `Match` collection acts as a relational junction between two clients. It records the historical state of a proposal and stores the AI-generated context.

### Key Fields:
- **Relationships:**
  - `clientA`: ObjectId (Reference to Client)
  - `clientB`: ObjectId (Reference to Client)
  - `proposedBy`: ObjectId (Reference to Matchmaker who initiated the proposal)
- **Match Data:**
  - `compatibilityScore`: Number (0-100) calculated at the time of proposal.
  - `matchReasons`: Array of strings (The deterministic logic triggers, e.g., "Same Religion").
- **AI Integration:**
  - `messageA`: String (The Gemini LLM-generated introductory email shown to Client A about Client B).
  - `messageB`: String (The Gemini LLM-generated introductory email shown to Client B about Client A).
- **Status Lifecycle:**
  - `statusA` & `statusB`: Enums (`Pending`, `Accepted`, `Declined`)
  - `overallStatus`: Enum (`Proposed`, `Connected`, `Rejected`) - Automatically transitions to `Connected` only when both parties accept.

---

## 3. Matchmaker Model (`/models/Matchmaker.ts`)

The administrative users of the platform who access the `/dashboard`.

### Key Fields:
- **Identity:** `name`, `email`
- **Security:** `passwordHash` (Bcrypt hashed)
- **Authorization:** `role` (Strictly defaults to `admin` or `matchmaker`).
- **Activity:** `isActive` (Boolean flag for revoking access).

---

## 4. Notification Model (`/models/Notification.ts`)

A lightweight collection used to push asynchronous updates to clients (e.g., when a new match is proposed).

### Key Fields:
- **Target:** `clientId` (Reference to Client)
- **Content:** 
  - `title`: String
  - `message`: String
  - `type`: Enum (`Match_Proposed`, `System_Alert`, etc.)
- **State:** `isRead` (Boolean)

---

## 💡 Architectural Notes on Schemas

- **Timestamps:** All models have `timestamps: true` enabled at the Mongoose schema level, automatically managing `createdAt` and `updatedAt`.
- **ObjectId Casting:** To ensure smooth Next.js App Router compilation, relational fields in our TypeScript interfaces (like `clientA`) are typed as `string | mongoose.Types.ObjectId`. This allows the frontend to pass string IDs safely, while Mongoose handles the underlying BSON ObjectId casting during query execution.
- **Indexes:** Compound indexes are heavily utilized (e.g., `{ clientA: 1, clientB: 1 }` on the Match model) to ensure $lookup and relational queries remain performant at scale.
