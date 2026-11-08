'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAcademyStore } from '@/store/useAcademyStore';
import { ACADEMY_LESSONS } from '@/lib/curriculum-data';
import {
  Flame,
  Trophy,
  Keyboard,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BanglaBlindspotDashboardProps {
  recentBandAverage: number | null;
}

export default function BanglaBlindspotDashboard({
  recentBandAverage,
}: BanglaBlindspotDashboardProps) {
  const completedLessons = useAcademyStore((state) => state.completedLessons);
  const xp = useAcademyStore((state) => state.xp);
  const streakDays = useAcademyStore((state) => state.streakDays);
  const bestWpm = useAcademyStore((state) => state.bestWpm);
  const recordDailyActivity = useAcademyStore((state) => state.recordDailyActivity);

  useEffect(() => {
    recordDailyActivity();
  }, [recordDailyActivity]);

  // Calculate dynamic predicted band: base from recent test attempts (or 6.0 baseline) + 0.1 per completed mastery module (up to +0.5)
  const baseBand = recentBandAverage ?? 6.0;
  const curriculumBonus = Math.min(completedLessons.length * 0.1, 0.5);
  const rawEstimate = Math.min(9.0, baseBand + curriculumBonus);
  const predictedBand = Math.round(rawEstimate * 2) / 2;

  const nextLesson =
    ACADEMY_LESSONS.find((l) => !completedLessons.includes(l.id)) || ACADEMY_LESSONS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Card 1: Dynamic Predicted Band & 15-Min Streak */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Dynamic Band Estimator
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Predicted IELTS Band
            </h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays}d Streak</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <span className="text-[10px] font-bold uppercase opacity-80">Band</span>
            <span className="text-2xl font-black leading-none">{predictedBand.toFixed(1)}</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{xp} Band Mastery XP</span>
            </div>
            <p>
              {completedLessons.length} of {ACADEMY_LESSONS.length} Master Modules completed
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Next 15-min Sprint:</span>
          <Link
            href={`/academy/${nextLesson.id}`}
            className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 inline-flex items-center gap-1"
          >
            <span>Lesson {nextLesson.code}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Card 2: Personalized Bangla L1 Blindspot Profile */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personalized Bangla L1 Blindspot Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Targeted diagnostics for Bangladeshi CD-IELTS candidates
              </p>
            </div>
          </div>

          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Master Curriculum</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-blue-500" />
                QWERTY Typing Speed
              </span>
              <span
                className={
                  bestWpm >= 35
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }
              >
                {bestWpm > 0 ? `${bestWpm} WPM` : 'Unverified'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {bestWpm >= 35
                ? 'Meets the 35+ WPM benchmark for 300-word Task 2 essays.'
                : 'Target 35+ WPM in Lesson CD-1 to avoid running out of time on Task 2.'}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>Zero-Article &amp; Prepositions</span>
              {completedLessons.includes('bg-1') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-rose-500">Action Needed</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Eliminate bare singular nouns and Bangla &ldquo;-এ / -তে&rdquo; (in/on/at) confusion in Guide BG-1.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>Double-Consonant Spelling</span>
              {completedLessons.includes('l-3') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-amber-500">Drill Pending</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Master the Top 10 misspelled Listening words (Accommodation, Millenium) in Lesson L-3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
