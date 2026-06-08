# The Date Crew (TDC) - Matchmaking Platform

🚀 **Live Demo:** [https://tdc-matchmaking.vercel.app/](https://tdc-matchmaking.vercel.app/)

### 🔑 Demo Credentials (For Evaluation)
To easily explore the system without registering, you can use the following test accounts:
- **Universal Password:** `password123` (Applies to all admin and client accounts)
- **Demo Client Account:** `kavya.singh100@yahoo.com`

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Welcome to the repository for **The Date Crew (TDC)**, a comprehensive matchmaking platform and administrative dashboard built as an assignment. The core objective of this project is to provide a sophisticated, AI-enhanced matchmaking system tailored specifically for Indian matrimonial preferences, alongside a powerful dashboard for matchmakers to manage clients and propose matches.

---

## 🎯 Project Overview

In traditional Indian matchmaking, compatibility extends far beyond basic hobbies. It involves nuanced cultural, financial, and lifestyle alignments (such as Religion, Caste, Income Parity, Location, and Family Planning). 

This project solves the complex problem of surfacing high-quality matches from a large pool of candidates by blending **Deterministic Rule-Based Scoring** with **Semantic AI Vector Search**, offering the matchmaker a highly curated list of candidates complete with auto-generated explanations of *why* they match.

### Key Features
- **Admin Matchmaker Dashboard**: A centralized hub to view the client roster, track client lifecycles (Proposed, Connected), and initiate the matching process.
- **Hybrid Matchmaking Engine**: A dual-layered algorithm combining MongoDB Atlas Vector Search (for personality/narrative alignment) and a weighted Rule-Based Scoring system (for cultural/lifestyle hard constraints).
- **AI-Powered Proposals**: Automated, highly personalized email introductions generated via LLMs based on the specific compatibility factors of the matched pair.
- **Client Lifecycle Management**: End-to-end tracking of client statuses from initial onboarding to "Proposed" and finally "Connected".

---

## 📚 Documentation

To provide a clear and thorough explanation of the system architecture, business logic, and algorithmic decisions, the documentation has been split into three detailed guides:

1. **[System Flow (FLOW.md)](./docs/FLOW.md)**  
   *A step-by-step walkthrough of the user journey, from matchmaker login to proposing a match and generating AI introductions.*
   
2. **[System Behavior (SYSTEM_BEHAVIOR.md)](./docs/SYSTEM_BEHAVIOR.md)**  
   *Details on how the application handles data, manages state, authenticates users, and integrates with the database (MongoDB).*

3. **[Matching Algorithm (ALGORITHM.md)](./docs/ALGORITHM.md)**  
   *An in-depth mathematical and logical breakdown of the Hybrid Matchmaking Algorithm, detailing exact point distributions, semantic bonus calculations, and penalty rules.*

4. **[Database Schema (DATABASE_SCHEMA.md)](./docs/DATABASE_SCHEMA.md)**  
   *A breakdown of the Mongoose models, data relationships, and strict TypeScript interfaces enforcing data integrity.*

5. **[Backend & APIs (API_ROUTES.md)](./docs/API_ROUTES.md)**  
   *An overview of the Next.js Server Actions, REST API routes, and the encapsulated Service Layer architecture.*

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, Framer Motion (for fluid animations), Lucide React (icons).
- **Backend**: Next.js Route Handlers (API), NextAuth (Authentication).
- **Database**: MongoDB & Mongoose v9.
- **AI/Search**: MongoDB Atlas Vector Search (Cosine Similarity), Google Gemini AI (`@google/genai`) for generating tailored email introductions.
- **Styling/UI**: Shadcn/Radix UI primitives for accessible components.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster (with Vector Search enabled)
- Google Gemini API Key

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

*This project was developed as a hiring assignment to demonstrate full-stack proficiency, algorithmic design, and AI integration.*
