'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ACADEMY_LESSONS } from '@/lib/curriculum-data';
import { useAcademyStore } from '@/store/useAcademyStore';
import {
  Flame,
  Trophy,
  Lock,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Keyboard,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export default function AcademyCatalogPage() {
  const completedLessons = useAcademyStore((state) => state.completedLessons);
  const lessonScores = useAcademyStore((state) => state.lessonScores);
  const xp = useAcademyStore((state) => state.xp);
  const streakDays = useAcademyStore((state) => state.streakDays);
  const bestWpm = useAcademyStore((state) => state.bestWpm);
  const recordDailyActivity = useAcademyStore((state) => state.recordDailyActivity);

  useEffect(() => {
    recordDailyActivity();
  }, [recordDailyActivity]);

  return (
    <div className="space-y-6 sm:space-y-8 py-2">
      {/* Header & Gamified Stats Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <GraduationCap className="h-3.5 w-3.5" />
            15 Minutes a Day to Band 7.5+
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Master CD-IELTS Curriculum
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Bite-sized 5-Step Learning Sprints engineered for Bangladeshi candidates. Pass each lesson&apos;s 80% Mastery Gate to unlock the next module.
          </p>
        </div>

        {/* Streak, XP & WPM Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{streakDays}-Day Streak</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
            <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>{xp} Band Mastery XP</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Keyboard className="h-4 w-4 text-slate-500" />
            <span>WPM: {bestWpm > 0 ? `${bestWpm} / 35` : 'Not tested'}</span>
          </div>
        </div>
      </div>

      {/* Gated Progression Roadmap */}
      <div className="space-y-4">
        {ACADEMY_LESSONS.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isUnlocked = idx === 0 || completedLessons.includes(ACADEMY_LESSONS[idx - 1].id);
          const score = lessonScores[lesson.id];

          return (
            <div
              key={lesson.id}
              className={`relative rounded-2xl border p-5 sm:p-6 transition-all ${
                isCompleted
                  ? 'border-emerald-200 bg-white dark:border-emerald-900/50 dark:bg-slate-900'
                  : isUnlocked
                  ? 'border-blue-400 bg-white shadow-sm ring-1 ring-blue-500/20 dark:border-blue-500 dark:bg-slate-900'
                  : 'border-slate-200 bg-slate-50/70 opacity-75 dark:border-slate-800 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white dark:bg-slate-800 dark:text-blue-400">
                      Lesson {lesson.code}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {lesson.moduleTitle}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} mins
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-3.5 w-3.5" /> +{lesson.xpReward} XP
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Passed ({score ?? 100}%)
                      </span>
                      <Link
                        href={`/academy/${lesson.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Review
                      </Link>
                    </div>
                  ) : isUnlocked ? (
                    <Link
                      href={`/academy/${lesson.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-500 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start 5-Step Sprint</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Pass {ACADEMY_LESSONS[idx - 1].code} to Unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
