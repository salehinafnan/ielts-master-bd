# IELTS Master BD 🇧🇩

> **A high-fidelity Computer-Delivered IELTS (CD-IELTS) simulator and AI-powered preparation platform tailored for Bangladeshi candidates.**

---

## 🌟 Key Features

1. **Authentic Inspera / CD-IELTS Interface:**
   - 1:1 replica of the official British Council & IDP exam screen.
   - Split-screen Reading layout with responsive pane controls.
   - Native right-click text highlighting & sticky notes engine.
   - Question palette (1–40) with answered status and review flags.
   - Official 60-minute countdown timer with "Hide Screen" functionality.

2. **Offline & Load-Shedding Resilience:**
   - Active exam state automatically persists to `localStorage` via Zustand `persist`.
   - Immune to browser crashes, internet drops, and power cuts during 60-minute mock tests.

3. **Instant AI Band Evaluation (Google Gemini):**
   - Writing Task 1 & Task 2 band score evaluation based on official IELTS 9-band descriptors (TR, CC, LR, GRA).
   - Sentence-by-sentence error analysis, Band 8+ vocabulary upgrades, and full model band 8.5 essays.
   - Speaking examiner simulator with microphone speech recognition and pronunciation scoring.

4. **Cambridge IELTS Companion Grader:**
   - Rapid answer-key input for Cambridge IELTS Books 15–19.
   - Instant raw score to IELTS band conversion with question-type weakness analysis.

5. **Bangladeshi Localization & Payments:**
   - Native bKash and Nagad payment workflow with manual TrxID verification.
   - Admin moderation panel for activating student subscriptions.

6. **Target University Band Matcher:**
   - Compares the candidate's current predicted band against admission cutoffs for top universities across Canada, Australia, Germany, UK, and USA.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5 (Strict)
- **Styling:** Tailwind CSS + Shadcn UI + Lucide React
- **State Management:** Zustand 5 (`zustand/middleware` with `persist`)
- **Database & Auth:** Supabase PostgreSQL (`@supabase/ssr`)
- **AI Assessment:** Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 20+)
- Supabase project account
- Google Gemini API key

### 2. Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Database Setup
1. Execute [`schema.sql`](./schema.sql) in your Supabase SQL editor to create all required tables.
2. Seed initial tests and universities using [`scripts/seed-database.js`](./scripts/seed-database.js) or [`seed_mock_tests.sql`](./seed_mock_tests.sql).

### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📂 Project Structure

- `src/app/(exam-engine)/exam/[testId]/` — Dedicated test engines (Reading, Listening, Writing, Speaking, Results).
- `src/app/(dashboard)/` — Student dashboard, test catalogs, Cambridge grader, pricing, admin moderation.
- `src/components/exam/` — Inspera top header, bottom question palette, right-click highlighting system.
- `src/store/useExamStore.ts` — Persistent Zustand store managing test session states.
- `src/lib/ielts-scoring.ts` — Official IELTS band conversion algorithms.
- `PROJECT_HANDOVER.md` — Detailed technical specifications, test status, and refinement roadmap.

---

## 📄 License
Private & Proprietary. All rights reserved.
