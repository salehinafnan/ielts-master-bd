-- IELTS Master BD: Complete Supabase SQL Schema
-- Run this directly in your Supabase SQL Editor

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
  title TEXT NOT NULL,
  test_category TEXT NOT NULL CHECK (test_category IN ('full_mock', 'cambridge_companion')),
  module_type TEXT NOT NULL CHECK (module_type IN ('listening', 'reading', 'writing', 'speaking')),
  is_premium BOOLEAN DEFAULT true,
  audio_url TEXT,
  content_json JSONB NOT NULL,
  answer_key_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER TEST ATTEMPTS & ANALYTICS
CREATE TABLE public.test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL,
  user_answers_json JSONB NOT NULL,
  raw_score INT,
  band_score NUMERIC(2,1) NOT NULL,
  weakness_breakdown_json JSONB,
  ai_feedback_json JSONB,
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
