# IELTS Master BD — Full Codebase Audit & Improvement Scope Plan

**Repository:** `salehinafnan/ielts-master-bd`  
**Stack Audited:** Next.js 16.4.3 (App Router, Turbopack), React 19.3, TypeScript 5, Tailwind CSS 4, Zustand 5, Supabase (`@supabase/ssr`), Google Gemini (`@google/genai`)  
**Audit Coverage:** 100% of source files, API routes, SQL schemas, seed scripts, state stores, and documentation (`ARCHITECTURE.md`, `PROJECT_HANDOVER.md`, `README.md`)

## 1. Executive Summary & Audit Verdict

**IELTS Master BD** has a strong product foundation and clear market fit for Bangladeshi IELTS candidates: a clean Inspera-style exam interface, local `localStorage` persistence for load-shedding resilience, a Cambridge Companion answer-key grader, manual bKash/Nagad checkout with Telegram alerts, and AI Writing/Speaking evaluation.

However, a line-by-line audit of the codebase revealed **critical functional bugs, security vulnerabilities, and architectural gaps** that will break core user flows or expose the platform to abuse in production. Most notably:
1. **17 of the 40 questions in the seeded Reading Mock Test (`MATCHING_HEADINGS` and `MCQ_SINGLE`) are impossible to score correctly** due to a mismatch between option values rendered in `QuestionRenderer.tsx` and answer keys stored in `seed_mock_tests.sql`.
2. **Row Level Security (RLS) is completely absent**, and sensitive admin operations (approving payments, upgrading user tiers, uploading tests) execute directly from the browser using the public Supabase anon key.
3. **Google OAuth login is broken** because the PKCE `/auth/callback` route handler and the PostgreSQL `auth.users` → `public.profiles` trigger are missing.
4. **Paid subscriptions never expire** because `subscription_expires_at` is written on approval but never checked anywhere in the app or API routes.
5. **AI Writing grading evaluates essays blind** (without passing the Task 1/Task 2 prompt or chart data to Gemini) and attempts two non-existent model IDs (`gemini-3.5-flash`, `gemini-3.8-flash`) before falling back to `gemini-flash-latest`.

| Audit Dimension | Current Maturity | Critical Issues Found | Priority Level |
| :--- | :--- | :--- | :--- |
| **Security, Auth & Database (RLS)** | Prototype / Unsafe | 6 critical vulnerabilities | **P0 — Immediate Blocker** |
| **Core Exam Engine & Scoring Accuracy** | Partially Broken | 5 high-severity logic bugs | **P0 — Immediate Blocker** |
| **Subscription, Billing & Rate Limiting** | Incomplete | 5 revenue & quota leaks | **P1 — Pre-Launch** |
| **AI Grading & Speech Engine** | Uncalibrated | 4 accuracy & latency flaws | **P1 — Pre-Launch** |
| **Content, UX & Engineering Quality** | MVP | 6 data & maintainability gaps | **P2 — Post-Launch Polish** |

## 2. P0: Critical Bugs & Security Blockers (Fix Immediately)

### 2.1 Broken Scoring for `MCQ_SINGLE` and `MATCHING_HEADINGS` (17/40 Questions Always Marked Wrong)
* **Files Affected:** `src/components/exam/QuestionRenderer.tsx` (lines 72–118), `src/lib/ielts-scoring.ts` (lines 38–51), `seed_mock_tests.sql` (lines 89–238, 297–345)
* **Root Cause:** In `seed_mock_tests.sql`, `MCQ_SINGLE` options are stored as full strings like `"C. Nearly seventy percent"` while `correctAnswers` is `["C"]`. Similarly, `MATCHING_HEADINGS` options are `"v. The ecological toll of traditional farming"` while `correctAnswers` is `["v"]`. In `QuestionRenderer.tsx`, selecting an option calls `setAnswer(questionNumber, opt)` with the **entire option string**, and `checkObjectiveAnswer()` in `ielts-scoring.ts` performs a strict equality check (`cleanAnswer(acceptable) === cleanedUser`).
* **Impact:** Candidates taking `Academic Reading Mock Test 1` receive **0 points** on Questions 14–26 and 33–36 even when selecting every single right answer, capping their maximum possible score at 23/40 (Band 6.0).
* **Fix Scope:**
  * Extract the option prefix code (e.g., `"A"`, `"B"`, `"i"`, `"v"`) when storing or comparing answers for `MCQ_SINGLE` and `MATCHING_HEADINGS`, or normalize `QuestionItem.options` into `{ value: string; label: string }` objects.
  * Update `checkObjectiveAnswer()` to support matching either the prefix token (`"C"`, `"v"`) or the full option text.

### 2.2 Missing Row Level Security (RLS) & Client-Side Admin Privilege Escalation
* **Files Affected:** `schema.sql`, `src/app/(dashboard)/admin/page.tsx` (lines 193–264, 305–366)
* **Root Cause:** `schema.sql` defines 6 tables in `public` without enabling RLS or defining policies. Furthermore, `admin/page.tsx` performs payment approvals (`payment_requests.update`, `profiles.update`) and test uploads (`tests.insert`) directly from the browser using the public anon key.
* **Impact:** Any authenticated student can open browser DevTools and execute `supabase.from('profiles').update({ role: 'admin', subscription_tier: 'pro_1y' }).eq('id', user.id)` to grant themselves admin rights or free Pro subscriptions, or read other users' payment requests and test attempts.
* **Fix Scope:**
  * Enable RLS on all 6 tables in `schema.sql` (`ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`).
  * Restrict `profiles` updates so users can only update non-sensitive columns (`full_name`, `target_university_id`, `target_overall_band`) via a column-restricted policy or RPC, while `role`, `subscription_tier`, `subscription_expires_at`, and `free_ai_credits_used` can only be mutated by `service_role` server routes.
  * Move admin actions (`handleApprove`, `handleReject`, `handleUploadTest`) out of `admin/page.tsx` into dedicated server API routes (`/api/admin/payments/approve`, `/api/admin/tests/create`) that verify `profile.role === 'admin'` server-side and use `SUPABASE_SERVICE_ROLE_KEY`.

### 2.3 Client-Side Answer Key Leakage During Active Exams
* **Files Affected:** `src/app/(exam-engine)/exam/[testId]/reading/page.tsx` (lines 38–42), `src/app/(exam-engine)/exam/[testId]/listening/page.tsx` (lines 48–52), `seed_mock_tests.sql`
* **Root Cause:** Both Reading and Listening exam pages fetch `content_json` directly from `public.tests` on the client. Because `content_json` embeds `correctAnswers` and `explanation` inside every question object, all 40 answers are sent to the browser before the test starts.
* **Impact:** Any student can inspect the Network response in DevTools to see all correct answers and explanations during an active mock test.
* **Fix Scope:**
  * Create a server endpoint or Server Component data loader (`/api/tests/[testId]/start`) that strips `correctAnswers` and `explanation` from `content_json` before sending the test payload to the client, and enforces premium subscription checks server-side.

### 2.4 Broken Google OAuth & Missing `auth.users` Profile Trigger
* **Files Affected:** `src/app/(auth)/login/page.tsx` (lines 38–55), `src/app/(auth)/register/page.tsx` (lines 35–44), `src/middleware.ts`, `schema.sql`
* **Root Cause:**
  1. `login/page.tsx` initiates OAuth with `redirectTo: `${window.location.origin}/dashboard``, but there is no `/auth/callback/route.ts` to call `supabase.auth.exchangeCodeForSession(code)`. When Google redirects back, `middleware.ts` sees no session cookie and bounces the user back to `/login`.
  2. `register/page.tsx` inserts into `public.profiles` from the client after `supabase.auth.signUp()`. This never runs for Google OAuth sign-ins and fails when email confirmation is enabled.
* **Fix Scope:**
  * Add `src/app/(auth)/auth/callback/route.ts` to exchange the OAuth PKCE code and redirect to `next` / `/dashboard`.
  * Add a PostgreSQL function and trigger `on_auth_user_created` (`AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`) in `schema.sql` to automatically create the `public.profiles` row for both email and Google OAuth users.
  * Fix the corrupted UTF-8 password placeholder (`placeholder="•••••••"`) in `login/page.tsx` (line 115) and honor the `?redirectTo=` query parameter set by `middleware.ts`.

### 2.5 Cambridge Companion Grader Pollutes `public.tests` with Empty Answer Keys
* **Files Affected:** `src/app/(dashboard)/cambridge-grader/page.tsx` (lines 47–86)
* **Root Cause:** When a user selects any book/test/module combination not yet in the database (19 out of the 20 selectable Reading/Listening combinations in Books 15–19), `cambridge-grader/page.tsx` automatically inserts a new row into `public.tests` with `correctAnswers: []` for all 40 questions and grades the submission against those empty arrays.
* **Impact:** Students receive a false **0/40 (Band 0.0)** score, their weakness analytics are corrupted with 0% accuracy across 40 `FILL_BLANKS` questions, and `public.tests` is polluted with broken placeholder rows.
* **Fix Scope:**
  * Remove the client-side `supabase.from('tests').insert(...)` fallback from `cambridge-grader/page.tsx`.
  * Query available Cambridge tests from the database on mount, disable or badge unseeded Book/Test combinations as "Coming Soon", and seed all official Cambridge 15–19 Reading & Listening answer keys via `seed_mock_tests.sql`.

## 3. P1: Subscription, Billing & Exam Integrity Gaps

### 3.1 Subscription Expiration (`subscription_expires_at`) Is Never Enforced
* **Files Affected:** `src/app/(dashboard)/tests/page.tsx` (line 138), `src/app/api/grade-writing/route.ts` (line 45), `src/app/api/grade-speaking/route.ts` (line 69), `src/app/(dashboard)/layout.tsx`
* **Root Cause:** Every check for Pro status only tests `subscription_tier !== 'free'` without checking whether `subscription_expires_at` is in the future (`new Date(profile.subscription_expires_at) > new Date()`).
* **Impact:** A user purchasing the 7-Day Crash Pass (`crash_7d` for ৳199) retains Pro access forever. Additionally, approving a renewal payment in `admin/page.tsx` overwrites `subscription_expires_at` from `Date.now()` instead of extending an existing active expiry date.
* **Fix Scope:**
  * Create a shared helper `isSubscriptionActive(profile)` in `src/lib/utils.ts` that checks `profile.subscription_tier !== 'free' && profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()`.
  * Use this helper across all API routes, server checks, `/tests`, and `/dashboard` layout, and display remaining subscription days in the sidebar badge.

### 3.2 Payment Amount Tampering & Pricing Mismatch
* **Files Affected:** `src/app/api/payments/submit/route.ts` (lines 22–67), `src/app/(dashboard)/pricing/page.tsx` (lines 32–93), `PROJECT_HANDOVER.md`
* **Root Cause:** `/api/payments/submit/route.ts` trusts `amountBdt` from the client request payload instead of looking up the server-side price for `planRequested`. Also, `pricing/page.tsx` lists prices as ৳199 / ৳499 / ৳999 / ৳1,999, whereas `PROJECT_HANDOVER.md` lists ৳499 / ৳999 / ৳2,299 / ৳4,999, and `pricing/page.tsx` advertises "Unlimited AI Examiner grading" on Pro plans while the backend enforces a hard cap of 3/day.
* **Fix Scope:**
  * Define a single canonical `PLAN_CATALOG` constant in `src/lib/types.ts` (with price, duration days, and daily AI quota per tier) shared between `pricing/page.tsx`, `admin/page.tsx`, and `/api/payments/submit/route.ts`.
  * Derive `amount_bdt` strictly on the server from `planRequested`.
  * Differentiate AI daily quotas by tier (e.g., `crash_7d`: 3/day, `pro_1m`: 5/day, `pro_3m`: 10/day, `pro_1y`: 15/day) and align copy on `pricing/page.tsx`.

### 3.3 Exam Timer Expiry, Clock Drift, and State Collisions
* **Files Affected:** `src/components/exam/InsperaHeader.tsx` (lines 28–33), `src/store/useExamStore.ts`, `src/app/(exam-engine)/exam/[testId]/writing/page.tsx`
* **Root Cause:**
  1. **No Auto-Submit on Time Up:** When `remainingSeconds` reaches `0`, `InsperaHeader.tsx` stops at `00:00` but never invokes `onSubmit()`.
  2. **Tab Throttling Drift:** Decrementing `remainingSeconds` via `setInterval(..., 1000)` drifts whenever the user switches tabs or the browser throttles background timers.
  3. **Cross-Test & Cross-User Store Collisions:** `useExamStore` stores a single global `answers: Record<number, string>` keyed only by `activeTestId`. Writing Task 1 & Task 2 overwrite keys `1` and `2`, `resetExam()` is never called after Writing/Speaking submission, and signing out in `layout.tsx` does not clear `localStorage` (`ielts-active-exam`).
* **Fix Scope:**
  * Store `examEndsAt: number | null` (Unix timestamp in ms) alongside `pausedRemainingSeconds` in `useExamStore` so remaining time is computed accurately against `Date.now()`.
  * Trigger automatic test submission in `InsperaHeader.tsx` when `remainingSeconds === 0`.
  * Scope `useExamStore` state by `${userId}:${testId}:${moduleType}` and clear the persisted store upon sign-out.

## 4. P1: AI Assessment & Speech Engine Upgrades

### 4.1 Invalid Gemini Model Names Causing Failed Roundtrips & High Latency
* **Files Affected:** `src/app/api/grade-writing/route.ts` (line 80), `src/app/api/grade-speaking/route.ts` (line 119)
* **Root Cause:** Both endpoints iterate over `['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest']`. Because `gemini-3.5-flash` and `gemini-3.8-flash` do not exist in the Google Gemini API, every grading request suffers two failed API calls before hitting `gemini-flash-latest`.
* **Fix Scope:**
  * Replace the model list with valid production Gemini models (`['gemini-2.5-flash', 'gemini-2.0-flash']`) and enforce `responseSchema` via `@google/genai` `Type` declarations so JSON parsing never fails with `502 Bad Gateway`.

### 4.2 Writing Grader Evaluates Essays Without the Question Prompt or Chart Context
* **Files Affected:** `src/app/api/grade-writing/route.ts` (lines 70–106), `src/app/(exam-engine)/exam/[testId]/writing/page.tsx`
* **Root Cause:** `grade-writing/route.ts` sends only ``Grade this IELTS Writing Task ${cleanTaskNumber} essay:\n\n${essay}`` to Gemini without fetching `tests.content_json` to include the Task 1/Task 2 prompt text or `imageDescription`.
* **Impact:** Gemini cannot accurately assess **Task Achievement (Task 1)** or **Task Response (Task 2)**—such as checking whether a student fabricated numbers unrelated to the chart or wrote an off-topic memorized essay. Additionally, Task 1 and Task 2 are graded in isolation rather than calculating the official weighted Writing band (`(Task1 + Task2 * 2) / 3`).
* **Fix Scope:**
  * Fetch `content_json` for `testId` inside `grade-writing/route.ts` and inject the exact task prompt, `imageDescription`, minimum word count, and actual word count (applying official under-length penalties when `<150` or `<250` words) into the system prompt.
  * Support combined Task 1 + Task 2 full mock submission with official 1:2 weighting in addition to single-task practice mode.

### 4.3 Multimodal Audio Grading for Speaking (Fixing Pronunciation & Safari/Firefox Compatibility)
* **Files Affected:** `src/app/(exam-engine)/exam/[testId]/speaking/page.tsx`, `src/app/api/grade-speaking/route.ts`
* **Root Cause:** `speaking/page.tsx` relies on `webkitSpeechRecognition` for live transcription (which fails in Safari, iOS, and Firefox) and only sends the text transcript to `/api/grade-speaking`. As a result, Gemini grades "Pronunciation" and "Fluency" purely from unpunctuated text without hearing the candidate's voice, intonation, pauses, or phonological clarity.
* **Fix Scope:**
  * Upload the recorded `audio/webm` / `audio/mp4` blobs (already captured by `MediaRecorder` in `speaking/page.tsx`!) to `/api/grade-speaking` as `FormData` or base64 inline data.
  * Pass the audio directly to `gemini-2.5-flash` multimodal input so Gemini both transcribes the speech (working across Chrome, Safari, Firefox, and iOS) and evaluates actual acoustic pronunciation, intonation, and hesitation.

### 4.4 Atomic AI Quota Enforcement
* **Files Affected:** `src/app/api/grade-writing/route.ts` (lines 48–71, 204–228), `src/app/api/grade-speaking/route.ts` (lines 73–99, 257–282)
* **Root Cause:** Both routes read `free_ai_credits_used` or `ai_usage_logs` before calling Gemini and update them afterward using non-atomic queries. Two simultaneous requests from the same user bypass the limit.
* **Fix Scope:**
  * Create an atomic PostgreSQL RPC function `consume_ai_credit(p_user_id UUID)` in `schema.sql` using `INSERT ... ON CONFLICT (user_id, used_date) DO UPDATE SET usage_count = ai_usage_logs.usage_count + 1` and check constraints before invoking Gemini.

## 5. P2: Content, UX & Feature Completeness

### 5.1 Seed Missing Listening & Speaking Mock Tests and Fix Fallback UUID Collision
* **Files Affected:** `src/app/(dashboard)/tests/page.tsx` (lines 68–97), `seed_mock_tests.sql`, `scripts/seed-database.js`
* **Root Cause:** In `tests/page.tsx`, fallback UUID `c3333333-3333-3333-3333-333333333333` is mapped to `Academic Listening Mock Test 1`, whereas in `seed_mock_tests.sql` that exact UUID is used for `Cambridge 18 - Test 1 Reading` (`cambridge_companion`). Moreover, zero `listening` or `speaking` full mock tests are seeded in `seed_mock_tests.sql`, leaving those tabs empty in `/tests`.
* **Fix Scope:**
  * Assign distinct UUIDs for Listening (`e5555555-...`) and Speaking (`f6666666-...`) full mock tests and seed complete 40-question Listening and 3-part Speaking mock tests in `seed_mock_tests.sql`.
  * Update `scripts/seed-database.js` to use `SUPABASE_SERVICE_ROLE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 5.2 Implement True Sticky Notes & Robust DOM Range Highlighting
* **Files Affected:** `src/components/exam/HighlightableText.tsx`
* **Root Cause:** Despite `README.md` and `ARCHITECTURE.md` advertising "right-click text highlighting & sticky notes", `HighlightableText.tsx` only implements yellow regex text replacement. Highlighting common short words (`"the"`, `"in"`) highlights every match in the passage, and selections crossing HTML tags fail silently.
* **Fix Scope:**
  * Add "Add Note" to the right-click context menu in `HighlightableText.tsx`, storing `{ id, quote, noteText, paragraphId }` in `useExamStore` and rendering an inline note indicator icon with a popover editor.
  * Sanitize `passageHtml` with `isomorphic-dompurify` (or safe HTML parsing) and anchor highlights by character offsets within the paragraph rather than global regex replacement.

### 5.3 Expand Question Types for Authentic CD-IELTS Coverage
* **Files Affected:** `src/lib/types.ts`, `src/components/exam/QuestionRenderer.tsx`, `src/lib/ielts-scoring.ts`
* **Root Cause:** Currently only 6 question categories (`TFNG`, `YNNG`, `MCQ_SINGLE`, `MATCHING_HEADINGS`, `FILL_BLANKS`, `SUMMARY_COMPLETION`) exist. Official IELTS Reading and Listening tests also include **Multiple Choice (Choose Two/Three Letters)**, **Matching Information / Features**, **Diagram / Map Labeling**, and **Sentence Ending Matching**. Also, General Training Reading band conversion (which has different raw-score thresholds from Academic Reading) is missing from `ielts-scoring.ts`.
* **Fix Scope:**
  * Add `MCQ_MULTIPLE`, `MATCHING_FEATURES`, and `MAP_LABELING` to `QuestionCategory` and `QuestionRenderer.tsx`.
  * Add `calculateGeneralReadingBand(rawScore)` to `src/lib/ielts-scoring.ts` for General Training candidates.

### 5.4 Dynamic Chart Renderer for Writing Task 1
* **Files Affected:** `src/app/(exam-engine)/exam/[testId]/writing/page.tsx` (lines 58–125, 577–587)
* **Root Cause:** `InternetAccessBarChart` is hardcoded to render whenever `prompts.task1.imageUrl` is undefined, meaning any new Task 1 test without an external image displays the 2005–2015 Internet Access chart regardless of its prompt.
* **Fix Scope:**
  * Render `InternetAccessBarChart` only when `chartType === 'bar_chart'` and chart data matches, or drive the chart dynamically from structured `chartData` inside `content_json.tasks[0]`.

### 5.5 Automated Testing, Dependency Cleanup & PDF Score Reports
* **Files Affected:** `package.json`, `src/lib/utils.ts`, `src/app/(exam-engine)/exam/[testId]/results/[attemptId]/page.tsx`
* **Root Cause:**
  * Zero automated tests exist in the repository.
  * `package.json` depends on `"cn": "^0.5.0"` instead of standard `clsx` + `tailwind-merge`.
  * Results page lacks a printable/downloadable Test Report Form (TRF) PDF.
* **Fix Scope:**
  * Add Vitest unit tests covering `src/lib/ielts-scoring.ts` (`calculateListeningBand`, `calculateAcademicReadingBand`, `checkObjectiveAnswer`, `generateWeaknessBreakdown`) and API route validation.
  * Add a `@media print` / printable TRF report view on `/exam/[testId]/results/[attemptId]` so students can save an official-style PDF scorecard.

## 6. Phased Implementation Roadmap

| Phase | Milestone | Key Deliverables | Target Files |
| :--- | :--- | :--- | :--- |
| **Phase 1 (Days 1–2)** | **Security, RLS & Auth Hardening (P0)** | Enable RLS on all 6 tables; add `on_auth_user_created` DB trigger; add `/auth/callback` route; move Admin approve/reject/upload to server API routes; strip `correctAnswers` from client exam queries. | `schema.sql`, `src/app/(auth)/auth/callback/route.ts`, `src/app/(dashboard)/admin/page.tsx`, `src/app/api/admin/*` |
| **Phase 2 (Days 3–4)** | **Scoring & Exam Engine Fixes (P0/P1)** | Fix `MCQ_SINGLE` & `MATCHING_HEADINGS` option value matching; stop `cambridge-grader` from inserting blank tests; enforce timer auto-submit and timestamp-based countdown; isolate `useExamStore` by user/module. | `src/components/exam/QuestionRenderer.tsx`, `src/lib/ielts-scoring.ts`, `src/app/(dashboard)/cambridge-grader/page.tsx`, `src/components/exam/InsperaHeader.tsx`, `src/store/useExamStore.ts` |
| **Phase 3 (Days 5–6)** | **AI Grader & Billing Calibration (P1)** | Replace invalid Gemini model names with `gemini-2.5-flash` + `responseSchema`; inject Task 1/2 prompts & chart descriptions into Writing grader; add multimodal audio input to Speaking grader; enforce `subscription_expires_at` and server-side plan price lookup. | `src/app/api/grade-writing/route.ts`, `src/app/api/grade-speaking/route.ts`, `src/app/api/payments/submit/route.ts`, `src/app/(dashboard)/pricing/page.tsx` |
| **Phase 4 (Days 7–10)** | **Content Expansion, Sticky Notes & QA (P2)** | Seed full Listening & Speaking mock tests + Cambridge 15–19 keys; add sticky notes to `HighlightableText.tsx`; add `MCQ_MULTIPLE` & General Training scoring; add Vitest unit test suite & printable TRF report. | `seed_mock_tests.sql`, `src/components/exam/HighlightableText.tsx`, `src/app/(exam-engine)/exam/[testId]/results/[attemptId]/page.tsx` |
