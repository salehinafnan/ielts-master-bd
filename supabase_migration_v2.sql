-- =========================================================================
-- IELTS Master BD — Complete Production SQL Migration (v2)
-- Run this entire script in: Supabase Dashboard -> SQL Editor -> New Query
-- Safe & Idempotent: Can be run on an existing database without losing data.
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- STEP 1: Ensure Base Tables Exist (Safe IF NOT EXISTS checks)
-- -------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
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

CREATE TABLE IF NOT EXISTS public.universities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  min_overall_band NUMERIC(2,1) NOT NULL,
  min_listening NUMERIC(2,1) NOT NULL,
  min_reading NUMERIC(2,1) NOT NULL,
  min_writing NUMERIC(2,1) NOT NULL,
  min_speaking NUMERIC(2,1) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tests (
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

CREATE TABLE IF NOT EXISTS public.test_attempts (
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

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  used_date DATE DEFAULT CURRENT_DATE NOT NULL,
  usage_count INT DEFAULT 1,
  UNIQUE(user_id, used_date)
);

CREATE TABLE IF NOT EXISTS public.payment_requests (
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

-- -------------------------------------------------------------------------
-- STEP 2: Backfill Any Existing auth.users Missing from public.profiles
-- -------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, role, subscription_tier)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  'student',
  'free'
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

-- -------------------------------------------------------------------------
-- STEP 3: Auto-Create Profile Trigger for Future Signups & Google OAuth
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student',
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------------------
-- STEP 4: Protect Sensitive Profile Columns from Client-Side Tampering
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Allow service_role or postgres superuser (SQL Editor) to update any column
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- Allow authenticated admins to update any column
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Lock billing and role columns for standard students
  NEW.role := OLD.role;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.subscription_expires_at := OLD.subscription_expires_at;
  NEW.free_ai_credits_used := OLD.free_ai_credits_used;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- -------------------------------------------------------------------------
-- STEP 5: Atomic AI Credit Consumption RPC
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_ai_credit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_is_active_pro BOOLEAN;
  v_daily_limit INT;
  v_current_used INT;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'PROFILE_NOT_FOUND', 'message', 'User profile not found.');
  END IF;

  v_is_active_pro := (
    v_profile.subscription_tier <> 'free'
    AND v_profile.subscription_expires_at IS NOT NULL
    AND v_profile.subscription_expires_at > NOW()
  );

  IF NOT v_is_active_pro THEN
    IF COALESCE(v_profile.free_ai_credits_used, 0) >= 1 THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'error', 'LIMIT_REACHED',
        'message', 'Free users get 1 complimentary AI grading. Upgrade to Pro for daily AI evaluations.'
      );
    END IF;

    UPDATE public.profiles
    SET free_ai_credits_used = COALESCE(free_ai_credits_used, 0) + 1
    WHERE id = p_user_id;

    RETURN jsonb_build_object('allowed', true, 'tier', 'free', 'used', 1, 'limit', 1);
  END IF;

  v_daily_limit := CASE v_profile.subscription_tier
    WHEN 'crash_7d' THEN 3
    WHEN 'pro_1m' THEN 5
    WHEN 'pro_3m' THEN 10
    WHEN 'pro_1y' THEN 15
    ELSE 3
  END;

  INSERT INTO public.ai_usage_logs (user_id, used_date, usage_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, used_date)
  DO UPDATE SET usage_count = public.ai_usage_logs.usage_count + 1
  WHERE public.ai_usage_logs.usage_count < v_daily_limit
  RETURNING usage_count INTO v_current_used;

  IF v_current_used IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'error', 'DAILY_LIMIT_REACHED',
      'message', format('You have used all %s/%s AI gradings for today. Your quota resets tomorrow.', v_daily_limit, v_daily_limit)
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'tier', v_profile.subscription_tier, 'used', v_current_used, 'limit', v_daily_limit);
END;
$$;

-- -------------------------------------------------------------------------
-- STEP 6: Enable Row Level Security (RLS) & Create Table Policies
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 6.1 profiles policies
DROP POLICY IF EXISTS "Users can view own profile or admin views all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin views all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile or admin updates all" ON public.profiles;
CREATE POLICY "Users can update own profile or admin updates all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- 6.2 universities policies
DROP POLICY IF EXISTS "Anyone can view universities" ON public.universities;
CREATE POLICY "Anyone can view universities"
  ON public.universities FOR SELECT
  USING (true);

-- 6.3 tests policies
DROP POLICY IF EXISTS "Anyone can view tests" ON public.tests;
CREATE POLICY "Anyone can view tests"
  ON public.tests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert tests" ON public.tests;
CREATE POLICY "Admins can insert tests"
  ON public.tests FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tests" ON public.tests;
CREATE POLICY "Admins can update tests"
  ON public.tests FOR UPDATE
  USING (public.is_admin());

-- 6.4 test_attempts policies
DROP POLICY IF EXISTS "Users can view own attempts or admin views all" ON public.test_attempts;
CREATE POLICY "Users can view own attempts or admin views all"
  ON public.test_attempts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.test_attempts;
CREATE POLICY "Users can insert own attempts"
  ON public.test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6.5 ai_usage_logs policies
DROP POLICY IF EXISTS "Users can view own ai logs" ON public.ai_usage_logs;
CREATE POLICY "Users can view own ai logs"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own ai logs" ON public.ai_usage_logs;
CREATE POLICY "Users can insert own ai logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai logs" ON public.ai_usage_logs;
CREATE POLICY "Users can update own ai logs"
  ON public.ai_usage_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- 6.6 payment_requests policies
DROP POLICY IF EXISTS "Users can view own payments or admin views all" ON public.payment_requests;
CREATE POLICY "Users can view own payments or admin views all"
  ON public.payment_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own payment requests" ON public.payment_requests;
CREATE POLICY "Users can insert own payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (public.is_admin());

-- -------------------------------------------------------------------------
-- STEP 7: Seed Academic Speaking Mock Test 1
-- -------------------------------------------------------------------------
INSERT INTO public.tests (
  id,
  title,
  test_category,
  module_type,
  is_premium,
  content_json,
  answer_key_json
)
VALUES (
  'd4444444-4444-4444-4444-444444444444',
  'Academic Speaking Mock Test 1',
  'full_mock',
  'speaking',
  false,
  '{
    "part1": {
      "topic": "Hometown & Daily Routine",
      "questions": [
        "Where is your hometown, and what do you like most about living there?",
        "How has your hometown developed or changed over the past few years?",
        "Do you prefer studying or working in the early morning or at night? Why?",
        "What kinds of leisure activities do you enjoy most on your weekends?"
      ]
    },
    "part2": {
      "topic": "An Important Decision",
      "cueCard": {
        "title": "Describe a difficult decision that you made recently.",
        "prompts": [
          "What the decision was",
          "When and why you had to make it",
          "What other options or choices were available to you",
          "And explain how you felt after making this decision."
        ]
      }
    },
    "part3": {
      "topic": "Decision Making & Society",
      "questions": [
        "Why do you think some people find it especially difficult to make important decisions?",
        "Should young adults always consult their family before making career choices?",
        "How has modern artificial intelligence and data impacted personal decision-making?",
        "In what ways do business leaders make balanced choices when under immense public pressure?"
      ]
    }
  }'::jsonb,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content_json = EXCLUDED.content_json;

COMMIT;