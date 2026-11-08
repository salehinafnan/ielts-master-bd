'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UniversityMatcher from '@/components/dashboard/UniversityMatcher';
import WeaknessAnalytics from '@/components/dashboard/WeaknessAnalytics';
import BanglaBlindspotDashboard from '@/components/dashboard/BanglaBlindspotDashboard';
import {
  History,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ChevronRight,
  Loader2,
  Calendar,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface RecentAttempt {
  id: string;
  test_id: string;
  module_type: string;
  band_score: number;
  raw_score: number | null;
  completed_at: string;
  test_title?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Student');
  const [attempts, setAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }

        const { data: attemptsData } = await supabase
          .from('test_attempts')
          .select('id, test_id, module_type, band_score, raw_score, completed_at, tests(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10);

        if (attemptsData && attemptsData.length > 0) {
          const testIdsWithoutTitle = attemptsData
            .filter((a: any) => !a.tests?.title)
            .map((a: any) => a.test_id);

          let titleMap: Record<string, string> = {};
          if (testIdsWithoutTitle.length > 0) {
            const { data: testsData } = await supabase
              .from('tests')
              .select('id, title')
              .in('id', testIdsWithoutTitle);

            if (testsData) {
              testsData.forEach((t) => {
                titleMap[t.id] = t.title;
              });
            }
          }

          const formatted: RecentAttempt[] = attemptsData.map((a: any) => {
            const testTitle =
              a.tests?.title ||
              titleMap[a.test_id] ||
              `${(a.module_type || 'Practice').toUpperCase()} Practice Test`;
            return {
              id: a.id,
              test_id: a.test_id,
              module_type: a.module_type,
              band_score: Number(a.band_score),
              raw_score: a.raw_score !== null ? Number(a.raw_score) : null,
              completed_at: a.completed_at,
              test_title: testTitle,
            };
          });

          setAttempts(formatted);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const recentBandAverage =
    attempts.length > 0
      ? attempts.slice(0, 3).reduce((acc, a) => acc + a.band_score, 0) /
        Math.min(attempts.length, 3)
      : null;

  const getModuleIcon = (moduleType: string) => {
    const mod = (moduleType || '').toLowerCase();
    switch (mod) {
      case 'reading':
        return <BookOpen className="h-3.5 w-3.5 text-blue-500" />;
      case 'listening':
        return <Headphones className="h-3.5 w-3.5 text-purple-500" />;
      case 'writing':
        return <PenTool className="h-3.5 w-3.5 text-emerald-500" />;
      case 'speaking':
        return <Mic className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getModuleBadge = (moduleType: string) => {
    const mod = (moduleType || '').toLowerCase();
    switch (mod) {
      case 'reading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'listening':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'writing':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'speaking':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getBandBadge = (band: number) => {
    if (band >= 7.0) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
    if (band >= 5.5) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete your 15-minute daily CD-IELTS sprint, track your Bangla L1 blindspots, and benchmark your band score.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/academy"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-colors"
          >
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Master Curriculum</span>
          </Link>
          <Link
            href="/tests"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            <span>Take a Mock Test</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Row 0: Dynamic Predicted Band & Bangla Blindspot Dashboard */}
      <section aria-label="Bangla Blindspot & Predicted Band">
        <BanglaBlindspotDashboard recentBandAverage={recentBandAverage} />
      </section>

      {/* Row 1: University Matcher */}
      <section aria-label="University Matcher">
        <UniversityMatcher />
      </section>

      {/* Row 2: Weakness Analytics */}
      <section aria-label="Weakness Analytics">
        <WeaknessAnalytics />
      </section>

      {/* Row 3: Recent Test History */}
      <section aria-label="Recent Test History">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Recent Test History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your last 10 completed mock test attempts and AI evaluations
                </p>
              </div>
            </div>

            <Link
              href="/tests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 shrink-0"
            >
              All Tests →
            </Link>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <History className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                  No tests taken yet
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Take your first Reading, Listening, Writing, or Speaking mock test to view detailed performance metrics.
                </p>
                <Link
                  href="/tests"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Start a Test
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile Stacked Cards */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 sm:hidden">
                  {attempts.map((att) => {
                    const formattedDate = new Date(att.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const resultUrl = `/exam/${att.test_id}/results/${att.id}`;

                    return (
                      <div
                        key={att.id}
                        onClick={() => router.push(resultUrl)}
                        className="p-4 space-y-2.5 active:bg-slate-50 dark:active:bg-slate-800/50 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {att.test_title}
                          </div>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${getBandBadge(
                              att.band_score
                            )}`}
                          >
                            Band {att.band_score.toFixed(1)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${getModuleBadge(
                                att.module_type
                              )}`}
                            >
                              {getModuleIcon(att.module_type)}
                              {att.module_type}
                            </span>
                            <span>
                              {att.raw_score !== null ? `${att.raw_score}/40` : 'AI Graded'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{formattedDate}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                        <th className="py-3.5 pl-5">Date</th>
                        <th className="py-3.5">Test Title</th>
                        <th className="py-3.5 text-center">Module</th>
                        <th className="py-3.5 text-center">Band Score</th>
                        <th className="py-3.5 text-center">Raw Score</th>
                        <th className="py-3.5 pr-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {attempts.map((att) => {
                        const formattedDate = new Date(att.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        const resultUrl = `/exam/${att.test_id}/results/${att.id}`;

                        return (
                          <tr
                            key={att.id}
                            onClick={() => router.push(resultUrl)}
                            className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-4 pl-5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>{formattedDate}</span>
                              </div>
                            </td>
                            <td className="py-4 font-semibold text-slate-900 dark:text-white">
                              {att.test_title}
                            </td>
                            <td className="py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getModuleBadge(
                                  att.module_type
                                )}`}
                              >
                                {getModuleIcon(att.module_type)}
                                {att.module_type}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <span
                                className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${getBandBadge(
                                  att.band_score
                                )}`}
                              >
                                Band {att.band_score.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                              {att.raw_score !== null ? `${att.raw_score} / 40` : 'AI Assessed'}
                            </td>
                            <td className="py-4 pr-5 text-right">
                              <Link
                                href={resultUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                              >
                                Analysis <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
