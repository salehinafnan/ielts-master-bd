# PROJECT BIBLE: IELTS Master BD (CD-IELTS Simulator & AI Coach)

## 1. SYSTEM RULES FOR THE AI AGENT (STRICT COMPLIANCE)
1. **Tech Stack:** Next.js 14+ (App Router), TypeScript (Strict), Tailwind CSS, Shadcn UI, Lucide React (icons), Zustand (State Management), Supabase (`@supabase/ssr`), Google Gemini API (`@google/genai`).
2. **No Hallucinated Packages:** Only use standard packages listed above. Do not install heavy external text-highlighting libraries; build custom React state components.
3. **Offline/Load-Shedding Resilience:** Because users in Bangladesh experience internet drops or power cuts, all active exam states MUST use Zustand with `persist` middleware (`localStorage`) so users never lose progress during a 60-minute test.
4. **Server vs Client Components:** Put `"use client"` at the top of any file using React hooks (`useState`, `useEffect`), Zustand, or browser APIs (`window`, `MediaRecorder`, `speechSynthesis`). Keep API keys strictly inside `/app/api/*` server routes.
5. **Preserve Existing Code:** When editing a file, never delete existing functions or imports unless explicitly instructed.

## 2. EXACT DIRECTORY STRUCTURE
```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          # Analytics, Weakness Radar & Uni Matcher
│   │   ├── tests/page.tsx              # Catalog of Full Mock Tests
│   │   ├── cambridge-grader/page.tsx   # Legal Cambridge Book 15-19 Answer Grader
│   │   ├── pricing/page.tsx            # bKash/Nagad Subscription Checkout
│   │   └── admin/page.tsx              # TrxID Approval & Test Uploader
│   ├── (exam-engine)/
│   │   └── exam/[testId]/
│   │       ├── listening/page.tsx      # Inspera CD-IELTS Listening UI
│   │       ├── reading/page.tsx        # Inspera Split-Screen Reading UI
│   │       ├── writing/page.tsx        # Split-Screen Writing + Timer + AI Grader
│   │       ├── speaking/page.tsx       # AI Audio Examiner + Mic Recorder
│   │       └── results/[attemptId]/page.tsx # Detailed Breakdown + Improvement Plan
│   └── api/
│       ├── grade-objective/route.ts    # Deterministic Reading/Listening Grader
│       ├── grade-writing/route.ts      # Gemini AI Writing Grader + Rate Limiter
│       ├── grade-speaking/route.ts     # Gemini AI Speaking Grader + Rate Limiter
│       └── payments/submit/route.ts    # bKash/Nagad TrxID Handler + Telegram Alert
├── components/
│   ├── exam/
│   │   ├── InsperaHeader.tsx           # Official CD-IELTS Top Bar (Timer, Hide Screen)
│   │   ├── InsperaFooter.tsx           # Question 1-40 Bottom Palette + Review Flag
│   │   ├── HighlightableText.tsx       # Custom Right-Click Highlight & Note Component
│   │   └── QuestionRenderer.tsx        # Renders TFNG, MCQ, Fill-in-blanks dynamically
│   └── dashboard/
│       ├── UniversityMatcher.tsx        # Target Uni Band Gap Progress Bar
│       └── WeaknessAnalytics.tsx        # Question-type accuracy breakdown
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   └── server.ts                   # Server Supabase client
│   ├── ielts-scoring.ts                # Raw Score (0-40) to Band (0-9.0) Converter
│   └── types.ts                        # Global TypeScript Interfaces
└── store/
    └── useExamStore.ts                 # Zustand persisted store for active tests
```

## 3. COMPLETE SUPABASE SQL SCHEMA (`schema.sql`)
*Run this directly in your Supabase SQL Editor.*

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE & SUBSCRIPTION TABLE
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'crash_7d', 'pro_1m', 'pro_3m', 'pro_1y')),
  subscription_expires_at TIMESTAMPTZ,
  target_university_id UUID,
  target_overall_band NUMERIC(2,1) DEFAULT 7.0,
  free_ai_credits_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. UNIVERSITIES TABLE (BONUS FEATURE: BAND MATCHER)
CREATE TABLE public.universities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  min_overall_band NUMERIC(2,1) NOT NULL,
  min_listening NUMERIC(2,1) NOT NULL,
  min_reading NUMERIC(2,1) NOT NULL,
  min_writing NUMERIC(2,1) NOT NULL,
  min_speaking NUMERIC(2,1) NOT NULL
);

-- Seed initial universities popular with Bangladeshi students
INSERT INTO public.universities (name, country, min_overall_band, min_listening, min_reading, min_writing, min_speaking) VALUES
('University of Toronto', 'Canada', 6.5, 6.0, 6.0, 6.0, 6.0),
('Monash University', 'Australia', 6.5, 6.0, 6.0, 6.0, 6.0),
('TU Munich (TUM)', 'Germany', 6.5, 6.0, 6.0, 6.0, 6.0),
('University of Manchester', 'UK', 7.0, 6.5, 6.5, 6.5, 6.5),
('Arizona State University', 'USA', 6.5, 6.0, 6.0, 6.0, 6.0);

-- 3. MOCK TESTS & CAMBRIDGE ANSWER KEYS TABLE
CREATE TABLE public.tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL, -- e.g., "Full Mock Test 1" or "Cambridge 18 Test 1 (Answer Grader)"
  test_category TEXT NOT NULL CHECK (test_category IN ('full_mock', 'cambridge_companion')),
  module_type TEXT NOT NULL CHECK (module_type IN ('listening', 'reading', 'writing', 'speaking')),
  is_premium BOOLEAN DEFAULT true,
  audio_url TEXT, -- Cloudflare R2 URL for listening tests
  content_json JSONB NOT NULL, -- Stores passages, prompts, and question arrays
  answer_key_json JSONB, -- Stores correct answers and question_type tags for analytics
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER TEST ATTEMPTS & ANALYTICS
CREATE TABLE public.test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL,
  user_answers_json JSONB NOT NULL,
  raw_score INT, -- 0 to 40 for Reading/Listening
  band_score NUMERIC(2,1) NOT NULL,
  weakness_breakdown_json JSONB, -- e.g., {"TFNG": {"correct": 2, "total": 6}, "MCQ": {"correct": 5, "total": 5}}
  ai_feedback_json JSONB, -- Detailed JSON output from Gemini for Writing/Speaking
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI DAILY USAGE RATE LIMITER (Protects Free Tier Gemini API)
CREATE TABLE public.ai_usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  used_date DATE DEFAULT CURRENT_DATE NOT NULL,
  usage_count INT DEFAULT 1,
  UNIQUE(user_id, used_date)
);

-- 6. BKASH / NAGAD PAYMENT REQUESTS
CREATE TABLE public.payment_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_requested TEXT NOT NULL CHECK (plan_requested IN ('crash_7d', 'pro_1m', 'pro_3m', 'pro_1y')),
  amount_bdt INT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  sender_phone TEXT NOT NULL,
  trx_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. STRICT TYPESCRIPT & JSON CONTRACTS (`src/lib/types.ts`)
*This is the source of truth for all TypeScript interfaces. Create `src/lib/types.ts` in Phase 1 matching these exactly.*

```typescript
export type QuestionCategory = 
  | 'TFNG'              // True / False / Not Given
  | 'YNNG'              // Yes / No / Not Given
  | 'MCQ_SINGLE'        // Multiple Choice (1 answer)
  | 'MATCHING_HEADINGS' // Matching Headings to Paragraphs
  | 'FILL_BLANKS'       // One word and/or a number
  | 'SUMMARY_COMPLETION';

export interface QuestionItem {
  questionNumber: number; // 1 to 40
  category: QuestionCategory;
  promptText: string;
  options?: string[]; // Used for MCQ or Matching
  correctAnswers: string[]; // Array of acceptable answers, e.g. ["car", "the car"]
  explanation: string; // Shown after test completion
}

export interface ReadingListeningTestContent {
  sections: {
    sectionNumber: 1 | 2 | 3 | 4;
    title: string;
    passageHtml?: string; // For Reading passages
    audioTimestampStart?: number; // For Listening sections
    questions: QuestionItem[];
  }[];
}

export interface AIWritingEvaluation {
  overallBand: number;
  taskResponse: { band: number; feedback: string };
  coherenceCohesion: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRange: { band: number; feedback: string };
  sentenceCorrections: {
    original: string;
    corrected: string;
    reason: string;
  }[];
  vocabularyUpgrades: {
    basicWord: string;
    band8Alternative: string;
    contextExample: string;
  }[];
  modelBand8Essay: string;
  actionableNextSteps: string[];
}
```
