'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSubscriptionActive } from '@/lib/utils';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Lock,
  Unlock,
  Play,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface MockTestItem {
  id: string;
  title: string;
  test_category: string;
  module_type: 'reading' | 'listening' | 'writing' | 'speaking';
  is_premium: boolean;
  audio_url?: string | null;
  created_at?: string;
}

const MODULE_CONFIG = {
  reading: {
    label: 'Reading',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    time: '60 minutes',
    questions: '40 questions (3 passages)',
  },
  listening: {
    label: 'Listening',
    icon: Headphones,
    color: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    time: '30 minutes',
    questions: '40 questions (4 sections)',
  },
  writing: {
    label: 'Writing',
    icon: PenTool,
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    time: '60 minutes',
    questions: 'Task 1 (150w) & Task 2 (250w)',
  },
  speaking: {
    label: 'Speaking',
    icon: Mic,
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    time: '11–14 minutes',
    questions: 'Parts 1, 2 (Cue card), & 3',
  },
};

const DEFAULT_FALLBACK_TESTS: MockTestItem[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Academic Reading Mock Test 1',
    test_category: 'full_mock',
    module_type: 'reading',
    is_premium: false,
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    title: 'Academic Writing Mock Test 1',
    test_category: 'full_mock',
    module_type: 'writing',
    is_premium: false,
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    title: 'Academic Listening Mock Test 1',
    test_category: 'full_mock',
    module_type: 'listening',
    is_premium: true,
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    title: 'Academic Speaking Mock Test 1',
    test_category: 'full_mock',
    module_type: 'speaking',
    is_premium: true,
  },
];

export default function TestsCatalogPage() {
  const router = useRouter();
  const [tests, setTests] = useState<MockTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'all' | 'reading' | 'listening' | 'writing' | 'speaking'>('all');
  const [isUserPro, setIsUserPro] = useState<boolean>(false);

  useEffect(() => {
    async function loadTestsAndUser() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Check user subscription tier
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_expires_at')
            .eq('id', user.id)
            .maybeSingle();

          setIsUserPro(isSubscriptionActive(profile));
        }

        // Fetch all full_mock tests from public.tests
        const { data: testsData, error } = await supabase
          .from('tests')
          .select('id, title, test_category, module_type, is_premium, audio_url, created_at')
          .eq('test_category', 'full_mock')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching mock tests:', error);
          setTests(DEFAULT_FALLBACK_TESTS);
        } else if (testsData && testsData.length > 0) {
          setTests(testsData as MockTestItem[]);
        } else {
          setTests(DEFAULT_FALLBACK_TESTS);
        }
      } catch (err) {
        console.error('Failed to load tests catalog:', err);
        setTests(DEFAULT_FALLBACK_TESTS);
      } finally {
        setLoading(false);
      }
    }

    loadTestsAndUser();
  }, []);

  const filteredTests = useMemo(() => {
    if (selectedModule === 'all') return tests;
    return tests.filter((t) => t.module_type === selectedModule);
  }, [tests, selectedModule]);

  const handleStartExam = (test: MockTestItem) => {
    const isLocked = test.is_premium && !isUserPro;
    if (isLocked) {
      router.push('/pricing');
      return;
    }
    router.push(`/exam/${test.id}/${test.module_type}`);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Catalog Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Inspera CD-IELTS Exam Engine
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Full Mock Test Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practice in the exact interface used by British Council &amp; IDP for Computer-Delivered IELTS.
          </p>
        </div>

        {!isUserPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all w-fit"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro for Unlimited Tests
          </Link>
        )}
      </div>

      {/* Module Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: 'All Modules' },
            { id: 'reading', label: 'Reading' },
            { id: 'listening', label: 'Listening' },
            { id: 'writing', label: 'Writing' },
            { id: 'speaking', label: 'Speaking' },
          ] as const
        ).map((tab) => {
          const isActive = selectedModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedModule(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <FileText className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No mock tests found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            No mock tests match the selected filter. Try selecting a different module tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => {
            const config = MODULE_CONFIG[test.module_type] || MODULE_CONFIG.reading;
            const ModuleIcon = config.icon;
            const isLocked = test.is_premium && !isUserPro;

            return (
              <div
                key={test.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${config.badge}`}
                    >
                      <ModuleIcon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>

                    {test.is_premium ? (
                      isLocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Lock className="h-3 w-3" /> Pro Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                          <Unlock className="h-3 w-3" /> Pro
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Free
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                    {test.title}
                  </h3>

                  {/* Test Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{config.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{config.questions}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isLocked ? (
                    <button
                      onClick={() => router.push('/pricing')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 transition-colors"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Unlock with Pro</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartExam(test)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Mock Exam</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
