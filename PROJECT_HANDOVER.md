# IELTS MASTER BD - COMPLETE ARCHITECTURE & HANDOVER CONTEXT

> **Project Name:** IELTS Master BD  
> **Repository Path:** `c:\Users\saleh\Desktop\IELTS Practicing Website`  
> **Target Audience:** Bangladeshi IELTS Candidates (Academic & General Training)  
> **Tech Stack:** Next.js 16.4.3 (Turbopack, App Router), React 19, TypeScript (Strict), Tailwind CSS, Shadcn UI, Zustand 5 (`persist` via `localStorage`), Supabase (`@supabase/ssr`), Google Gemini AI (`@google/genai`).

---

## 1. Ultimate Goal & Project Vision

### 1.1 The Core Problem
1. **Unfamiliarity with CD-IELTS UI:** Over 75% of Bangladeshi candidates taking Computer-Delivered IELTS (British Council / IDP) score lower than expected due to unfamiliarity with the exact CD-IELTS screen mechanics (split-screen reading, right-click highlighting/notes, 1-40 question palette, strict countdown timers).
2. **Expensive Preparation:** International platforms (IELTSReady, Cambridge One) charge in USD with international credit cards that most Bangladeshi students do not possess.
3. **Local Infrastructure Challenges:** Frequent load-shedding (power cuts) and unstable broadband connections cause students to lose active 60-minute test progress on traditional web platforms.
4. **Lack of Instant, High-Quality Feedback:** Writing and Speaking evaluations from human tutors in Dhaka/Chittagong take days and cost thousands of BDT per essay/mock.

### 1.2 The Solution: IELTS Master BD
A locally tailored, highly resilient, full-stack CD-IELTS simulation and AI diagnostic engine providing:
1. **1:1 Inspera/Official CD-IELTS Interface Replication:** Pixel-perfect clone of the real British Council & IDP exam screen, split-screen reading, right-click highlight & note taker, bottom navigation palette with review flag, and authentic typography.
2. **Zero Progress Loss (Load-Shedding Resilience):** Active exam sessions statefully persist to `localStorage` via Zustand `persist`. If the browser crashes, power cuts, or internet drops, reopening the exam immediately restores all 40 answers, remaining seconds, highlights, and notes.
3. **Instant AI Band Evaluation (IELTS 9-Band Descriptors):** Powered by Google Gemini with strict IELTS rubrics for Writing (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) and Speaking (Fluency, Lexical, Grammar, Pronunciation), generating sentence-by-sentence rewrites, vocabulary upgrades, and model Band 8.5 essays.
4. **Legal Cambridge Companion Grader:** Fast-entry answer key grader for Cambridge IELTS Books 15–19, enabling students with physical books to grade answers deterministically and get weakness diagnostics.
5. **Bangladeshi Localization & Payments:** Native bKash and Nagad payment gateway (manual TrxID verification and admin approval dashboard), priced in BDT.
6. **Study Abroad Band Gap Matcher:** Direct integration comparing the student's current predicted band against admission cutoffs for top universities popular among Bangladeshi students (Canada, Australia, Germany, UK, USA).

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Matrix
| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.4.3 (Turbopack) | App Router, Server Actions, Dynamic API Routes |
| **Language** | TypeScript 5 (Strict) | All models strictly typed in `src/lib/types.ts` |
| **Styling** | Tailwind CSS + Lucide React | Official CD-IELTS palette (`#f4f4f4`, `#0f172a`, `#2563eb`) |
| **State Management** | Zustand 5 (`zustand/middleware`) | `persist` middleware storing active test session in `localStorage` |
| **Database & Auth** | Supabase (`@supabase/ssr`) | PostgreSQL, Cookie-based SSR auth, row policies |
| **AI Assessment** | Google Gemini API (`@google/genai`) | Model cascade: `gemini-3.5-flash` → `gemini-3.8-flash` → `gemini-flash-latest` |
| **Speech Recognition** | Web Speech API | `webkitSpeechRecognition` with microphone input stream |

### 2.2 Directory Structure
```text
c:\Users\saleh\Desktop\IELTS Practicing Website\
├── package.json
├── tsconfig.json
├── schema.sql                      # Complete Supabase PostgreSQL schema
├── seed_mock_tests.sql             # SQL seed data for tests & universities
├── scripts/
│   └── seed-database.js            # Node script for direct REST seeding
├── src/
│   ├── middleware.ts               # Supabase session refresher
│   ├── lib/
│   │   ├── types.ts                # Master TypeScript contracts (Questions, AI schemas, Tests)
│   │   ├── ielts-scoring.ts        # Raw (0-40) to Band (1.0-9.0) standard converter
│   │   └── supabase/
│   │       ├── client.ts           # Browser Supabase client (createBrowserClient)
│   │       └── server.ts           # SSR Supabase client (createServerClient + cookies)
│   ├── store/
│   │   └── useExamStore.ts         # Persistent Zustand store (answers, timer, highlights, flags)
│   ├── components/
│   │   ├── exam/
│   │   │   ├── InsperaHeader.tsx   # CD-IELTS timer, Hide button, test title
│   │   │   ├── InsperaFooter.tsx   # 1-40 Question palette, review flag, section jump
│   │   │   ├── HighlightableText.tsx # Right-click highlight & note engine
│   │   │   └── QuestionRenderer.tsx  # Dynamic TFNG, YNNG, MCQ, Fill-blanks renderer
│   │   └── dashboard/
│   │       ├── UniversityMatcher.tsx # University requirement gap tracker
│   │       └── WeaknessAnalytics.tsx # Question-type accuracy visualizer
│   └── app/
│       ├── (auth)/
│       │   ├── login/page.tsx      # Email/Password + Google OAuth login
│       │   └── register/page.tsx   # Student account registration
│       ├── (dashboard)/
│       │   ├── layout.tsx          # App shell navigation & profile badge
│       │   ├── dashboard/page.tsx  # Analytics, predicted band, test history
│       │   ├── tests/page.tsx      # Full Mock Test library catalog
│       │   ├── cambridge-grader/page.tsx # Cambridge 15-19 Answer Grader
│       │   ├── pricing/page.tsx    # bKash / Nagad checkout & pricing plans
│       │   └── admin/page.tsx      # Admin TrxID approval & manual activation
│       ├── (exam-engine)/
│       │   └── exam/[testId]/
│       │       ├── reading/page.tsx        # Split-screen Reading test engine
│       │       ├── listening/page.tsx      # CD-IELTS Listening test engine + audio player
│       │       ├── writing/page.tsx        # Task 1 & Task 2 Writing + charts + AI evaluator
│       │       ├── speaking/page.tsx       # AI Speaking Examiner + speech recognition
│       │       └── results/[attemptId]/page.tsx # Band breakdown, weakness & AI feedback
│       └── api/
│           ├── grade-objective/route.ts    # Deterministic scoring for Reading & Listening
│           ├── grade-writing/route.ts      # Gemini AI Writing assessor
│           ├── grade-speaking/route.ts     # Gemini AI Speaking assessor
│           └── payments/submit/route.ts    # bKash/Nagad TrxID submission handler
```

---

## 3. Database Schema & Current State

### 3.1 Tables Overview
1. **`profiles`**:
   - `id`: UUID (references `auth.users.id` ON DELETE CASCADE)
   - `full_name`, `email`, `role` (`student` | `admin`)
   - `subscription_tier` (`free`, `crash_7d`, `pro_1m`, `pro_3m`, `pro_1y`)
   - `subscription_expires_at`: TIMESTAMPTZ
   - `target_university_id`: UUID
   - `target_overall_band`: NUMERIC(2,1) (default: 7.0)
   - `free_ai_credits_used`: INT (default: 0)
2. **`universities`**:
   - `id`, `name`, `country`
   - `min_overall_band`, `min_listening`, `min_reading`, `min_writing`, `min_speaking`
   - Initial Seeded: University of Toronto, Monash University, TU Munich, University of Manchester, Arizona State University.
3. **`tests`**:
   - `id`: UUID
   - `title`: TEXT
   - `test_category`: `full_mock` | `cambridge_companion`
   - `module_type`: `listening` | `reading` | `writing` | `speaking`
   - `is_premium`: BOOLEAN
   - `audio_url`: TEXT (listening track URL)
   - `content_json`: JSONB (passages, tasks, prompts, questions)
   - `answer_key_json`: JSONB (correct answers, question categories, explanations)
4. **`test_attempts`**:
   - `id`, `user_id`, `test_id`, `module_type`
   - `user_answers_json`: JSONB
   - `raw_score`: INT (0-40)
   - `band_score`: NUMERIC(2,1) (0.0 to 9.0)
   - `weakness_breakdown_json`: JSONB (`{"TFNG": {"correct": 3, "total": 5}}`)
   - `ai_feedback_json`: JSONB (Gemini AI assessment payload)
5. **`ai_usage_logs`**:
   - `user_id`, `used_date`, `usage_count` (Daily quota enforcement)
6. **`payment_requests`**:
   - `user_id`, `plan_requested`, `amount_bdt`, `payment_method` (`bkash` | `nagad`), `sender_phone`, `trx_id`, `status` (`pending` | `approved` | `rejected`)

### 3.2 Live Database Seeding Status
- **Supabase Project:** Connected and verified live.
- **Seeded Records:**
  1. `Academic Reading Mock Test 1` (`id: a1111111-1111-1111-1111-111111111111`) - 40 questions across Section 1 (True/False/Not Given, Blanks), Section 2 (Matching Headings, MCQ), Section 3 (Yes/No/Not Given, Summary Completion).
  2. `Academic Writing Mock Test 1` (`id: b2222222-2222-2222-2222-222222222222`) - Task 1 (Bar Chart: Percentage of Internet Access across 5 countries) & Task 2 (Discussion/Opinion Essay on Remote Working).
  3. `Cambridge 18 - Test 1 Reading` (`id: c3333333-3333-3333-3333-333333333333`) - Complete 40-question companion answer key.
  4. 5 Foreign Universities populated with minimum band cutoffs.

---

## 4. What Has Been Built & Completed

### 4.1 Exam Engine Modules
1. **Reading Simulator (`/exam/[testId]/reading`):**
   - Split-screen layout: Passage on left column, interactive question list on right column.
   - Text selection contextual menu: Right-click on any passage text opens options to Highlight (yellow) or Add Sticky Note.
   - Dynamic Question Types Supported:
     - `TFNG` (True / False / Not Given) & `YNNG` (Yes / No / Not Given) radio buttons.
     - `MCQ_SINGLE` single-choice radio options.
     - `MATCHING_HEADINGS` dropdown selectors for Roman numerals (i, ii, iii...).
     - `FILL_BLANKS` & `SUMMARY_COMPLETION` inline inputs.
   - Top Bar: Countdown timer (60:00), Hide screen toggle, test title.
   - Bottom Palette: Questions 1 to 40 with status indicators (Attempted / Unanswered) and "Review" checkbox.
2. **Writing Simulator (`/exam/[testId]/writing`):**
   - Task 1 & Task 2 tabbed navigation.
   - Real-time word counter with color indicators (Task 1: <150 words warning, Task 2: <250 words warning).
   - Dynamic Chart Visualization: Built-in `InternetAccessBarChart` SVG component rendering comparative 2005 vs 2015 data across 5 countries.
   - Submission & AI Grading Modal: Submits essay to Gemini API, streams evaluation into an interactive report card.
3. **Speaking Simulator (`/exam/[testId]/speaking`):**
   - 6-Stage structured interview (Introduction, Part 1 General Questions, Part 2 Cue Card preparation 1 min, Part 2 Speaking 2 min, Part 3 Follow-up, Part 3 Abstract Discussion).
   - Browser audio recording via `MediaRecorder` + real-time speech transcription via `webkitSpeechRecognition`.
   - Audio examiner prompt speech via `speechSynthesis`.
   - Transcripts packaged and graded against official IELTS Speaking descriptors.
4. **Listening Simulator (`/exam/[testId]/listening`):**
   - Synchronized audio playback with CD-IELTS single-play restriction.
   - Sectional question switching (Sections 1-4).
5. **Results & Analytics (`/exam/[testId]/results/[attemptId]`):**
   - Detailed band scorecard with Raw Score (0-40) and IELTS Band (0-9.0).
   - Question-by-question review with user answer vs correct answer and rationale.
   - Weakness radar: Percentage accuracy per question category (`TFNG`, `MCQ`, `FILL_BLANKS`, etc.).

### 4.2 AI Assessment Engine (Google Gemini)
- Implemented in `src/app/api/grade-writing/route.ts` and `src/app/api/grade-speaking/route.ts`.
- **Band Criteria Graded:**
  - Writing: Task Response / Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
  - Speaking: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation.
- **Specific Output Schema:**
  - Band scores for each criterion + overall band.
  - Sentence-level corrections (`original`, `corrected`, `reason`).
  - Vocabulary upgrades (`basicWord` → `band8Alternative` with context example).
  - High-scoring Model Essay / Response (Band 8.5+).
  - Actionable next steps.
- **Model Cascade & Reliability:**
  - Primary: `gemini-3.5-flash`
  - Fallback 1: `gemini-3.8-flash`
  - Fallback 2: `gemini-flash-latest`

### 4.3 Bangladesh Payment & Monetization Flow
- Pricing plans:
  - 7-Day Crash Course: ৳499
  - 1-Month Pro: ৳999
  - 3-Month Pro: ৳2,299
  - 1-Year Master: ৳4,999
- Manual bKash / Nagad payment workflow:
  - Copy merchant number button.
  - Form submitting Sender Phone Number + Transaction ID (TrxID).
  - Recorded in `public.payment_requests`.
  - Admin panel (`/admin`) to approve/reject TrxIDs and automatically update `profiles.subscription_tier`.

---

## 5. What Has Been Tested & Verified Locally

| Test Case | Status | Verified Outcome |
|---|---|---|
| **TypeScript Compilation** | Passed | `npx tsc --noEmit` exits with code 0. Zero typing defects. |
| **Next.js 16 Turbopack Prerender** | Passed | Fixed `useParams()` bail-out errors by wrapping all 5 dynamic exam pages in `<React.Suspense>`. |
| **Zustand Snapshot Stability** | Passed | Fixed React 19 `useSyncExternalStore` infinite loop warning in `HighlightableText.tsx` and `QuestionRenderer.tsx` using cached `EMPTY_HIGHLIGHTS` constant. |
| **Supabase REST Database Connection** | Passed | Live connection established with `blfncpsaiwxfmsfqgvwo.supabase.co`; tables seeded and verified. |
| **Tests Catalog Navigation** | Passed | `/tests` lists active seeded tests (`Academic Reading Mock Test 1`, `Academic Writing Mock Test 1`). |
| **Cambridge Grader Catalog** | Passed | `/cambridge-grader` lists `Cambridge 18 - Test 1 Reading`. |
| **Task 1 Bar Chart Rendering** | Passed | SVG chart renders 2005 vs 2015 Internet Access percentages with axes, bars, values, and legend. |
| **AI Writing Grading API** | Passed | Tested live with Gemini API; returns parsed JSON evaluation with 4 criterion bands, sentence corrections, and model essay. |

---

## 6. What Needs to Be Done Next (Roadmap for Refinement)

### 6.1 Critical Infrastructure & Security
1. **Supabase Row Level Security (RLS) Policies:**
   - Currently, during local development, tables are tested without strict RLS. Production policies need to be finalized:
     - `profiles`: Users can select/update only their own row (`auth.uid() = id`), admins can read/update all.
     - `test_attempts`: Users can only access their own attempts.
     - `payment_requests`: Users can insert and read their own requests; admins can update `status`.
2. **Auth Webhook / Supabase Trigger:**
   - Add a PostgreSQL trigger on `auth.users` (`AFTER INSERT`) to automatically insert a corresponding record into `public.profiles` for Google OAuth and email signups.

### 6.2 Media & Audio Storage
1. **Supabase Storage Bucket for Listening Audio:**
   - Create a public Supabase Storage bucket (`audio-files`) or Cloudflare R2 bucket.
   - Upload full-length Listening MP3 tracks (Sections 1-4) and link them to `tests.audio_url`.
2. **Seed Full Mock Listening Test:**
   - Add a full 40-question Listening mock test into `tests` with audio timestamps (`audioTimestampStart`) for Sections 1–4.

### 6.3 AI & Speech Enhancements
1. **Cross-Browser Speech-to-Text Fallback:**
   - `webkitSpeechRecognition` is native in Chrome/Edge, but unsupported in Safari iOS and Firefox.
   - Implement audio recording upload to Gemini 3.5 Flash / Whisper API for non-webkit browsers so iOS/Safari users can also complete Speaking tests.
2. **AI Daily Rate Limiter Production Lock:**
   - Verify server-side incrementing of `ai_usage_logs` on each call to `/api/grade-writing` and `/api/grade-speaking` to prevent API budget exhaustion on free tier accounts.

### 6.4 Feature Extensions & Polish
1. **PDF Diagnostic Report Download:**
   - Implement PDF generation (e.g. `@react-pdf/renderer` or `jspdf`) on `/exam/[testId]/results/[attemptId]` allowing students to download a branded IELTS Master BD score report to share with agents/parents.
2. **Additional Cambridge Answer Keys:**
   - Seed answer keys for Cambridge IELTS Books 15, 16, 17, and 19 for Reading and Listening.
3. **Automated bKash Merchant API (Optional):**
   - Upgrade from manual TrxID submission to direct bKash Checkout URL (Tokenized API) if the client obtains a registered merchant account.

---

## 7. Key Files Quick Reference
- Types & Interfaces: [`src/lib/types.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/lib/types.ts)
- Scoring Formula: [`src/lib/ielts-scoring.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/lib/ielts-scoring.ts)
- Active Test State: [`src/store/useExamStore.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/store/useExamStore.ts)
- Reading Simulator: [`src/app/(exam-engine)/exam/[testId]/reading/page.tsx`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/(exam-engine)/exam/[testId]/reading/page.tsx)
- Writing Simulator: [`src/app/(exam-engine)/exam/[testId]/writing/page.tsx`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/(exam-engine)/exam/[testId]/writing/page.tsx)
- Speaking Simulator: [`src/app/(exam-engine)/exam/[testId]/speaking/page.tsx`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/(exam-engine)/exam/[testId]/speaking/page.tsx)
- Writing Grader API: [`src/app/api/grade-writing/route.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/api/grade-writing/route.ts)
- Speaking Grader API: [`src/app/api/grade-speaking/route.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/api/grade-speaking/route.ts)
- Payment Gateway API: [`src/app/api/payments/submit/route.ts`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/src/app/api/payments/submit/route.ts)
- Supabase SQL Schema: [`schema.sql`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/schema.sql)
- Seed Data SQL: [`seed_mock_tests.sql`](file:///c:/Users/saleh/Desktop/IELTS%20Practicing%20Website/seed_mock_tests.sql)
