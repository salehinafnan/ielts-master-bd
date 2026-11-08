'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ACADEMY_LESSONS } from '@/lib/curriculum-data';
import { useAcademyStore } from '@/store/useAcademyStore';
import { InteractiveLabs } from '@/components/academy/InteractiveLabs';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Trophy,
  BookOpen,
  ShieldAlert,
  Target,
  FlaskConical,
  Award,
} from 'lucide-react';

const SPRINT_STEPS = [
  { id: 1, label: '1. Snapshot & Interface', shortLabel: 'Snapshot', icon: BookOpen },
  { id: 2, label: '2. Core Concept & Traps', shortLabel: 'Traps', icon: Target },
  { id: 3, label: '3. Interactive Lab', shortLabel: 'Lab', icon: FlaskConical },
  { id: 4, label: '4. Bangla Pitfall Room', shortLabel: 'Bangla L1', icon: ShieldAlert },
  { id: 5, label: '5. Mastery Gate (80%)', shortLabel: 'Mastery', icon: Award },
];

function AcademyLessonSprintContent() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;

  const lessonIndex = useMemo(
    () => ACADEMY_LESSONS.findIndex((l) => l.id === lessonId),
    [lessonId]
  );
  const lesson = ACADEMY_LESSONS[lessonIndex];
  const nextLesson = ACADEMY_LESSONS[lessonIndex + 1] || null;

  const completedLessons = useAcademyStore((state) => state.completedLessons);
  const markStepReached = useAcademyStore((state) => state.markStepReached);
  const completeLesson = useAcademyStore((state) => state.completeLesson);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (lesson) {
      markStepReached(lesson.id, activeStep);
    }
  }, [lesson, activeStep, markStepReached]);

  if (!lesson) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lesson Not Found</h2>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
        >
          Back to Academy
        </Link>
      </div>
    );
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalQuestions = lesson.masteryGate.questions.length;
  const correctCount = lesson.masteryGate.questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const passedGate = quizSubmitted && scorePercent >= lesson.masteryGate.passingScorePercent;

  const handleGradeMasteryGate = () => {
    if (Object.keys(selectedAnswers).length < totalQuestions) {
      alert('Please answer all questions in the Mastery Gate before submitting.');
      return;
    }
    setQuizSubmitted(true);
    if (scorePercent >= lesson.masteryGate.passingScorePercent) {
      completeLesson(lesson.id, scorePercent, lesson.xpReward);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="space-y-1">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Master Curriculum</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {lesson.code}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            +{lesson.xpReward} XP Sprint
          </span>
        </div>
      </div>

      {/* Mobile Horizontal Step Bar */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
        {SPRINT_STEPS.map((s) => {
          const isCurrent = activeStep === s.id;
          const isDone = activeStep > s.id || completedLessons.includes(lesson.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStepChange(s.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                  : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              <span>{s.id}.</span>
              <span>{s.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Layout: Left Sticky Progress Sidebar + Right Dynamic Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sticky Step Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sticky top-6 space-y-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {lesson.moduleTitle}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5-Step Learning Sprint
            </div>
          </div>

          <nav className="space-y-2">
            {SPRINT_STEPS.map((s) => {
              const isCurrent = activeStep === s.id;
              const isDone = activeStep > s.id || completedLessons.includes(lesson.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepChange(s.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                      : isDone
                      ? 'text-emerald-700 hover:bg-slate-50 dark:text-emerald-400 dark:hover:bg-slate-800/50'
                      : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isDone && !isCurrent ? '✓' : s.id}
                  </span>
                  <span className="truncate">{s.label.replace(/^\d+\.\s*/, '')}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Dynamic Workspace Card */}
        <div className="flex-1 w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          {/* ================= STEP 1: SNAPSHOT & INTERFACE ================= */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  Step 1 of 5 &bull; Snapshot &amp; CD-IELTS Mechanics
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {lesson.snapshot.moduleName}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lesson.snapshot.mechanicsSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Band Score Impact
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {lesson.snapshot.targetAudienceOrImpact}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Core Objective
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {lesson.snapshot.coreObjective}
                  </p>
                </div>
              </div>

              {lesson.snapshot.comparisonTable && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                        {lesson.snapshot.comparisonTable.headers.map((h, i) => (
                          <th key={i} className="p-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {lesson.snapshot.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{row[0]}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{row[1]}</td>
                          <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{row[2]}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Step-by-Step Attack Strategy
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {lesson.snapshot.ergonomicsSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1"
                    >
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CORE CONCEPT & TRAPS ================= */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Step 2 of 5 &bull; Core Concept &amp; Examiner Trap Analysis
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Deconstructing the Traps
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {lesson.conceptsAndTraps.intro}
                </p>
              </div>

              <div className="space-y-3">
                {lesson.conceptsAndTraps.traps.map((trap, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {trap.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[11px] font-bold shrink-0">
                        {trap.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {trap.problem}
                    </p>
                    <div className="pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      ✓ Band 9 Fix: {trap.takeaway}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  The Execution Algorithm
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {lesson.conceptsAndTraps.strategySteps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-blue-200/70 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-1.5"
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {st.step}
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {st.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {st.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: INTERACTIVE LAB ================= */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Step 3 of 5 &bull; Hands-On Interactive Lab
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {lesson.interactiveLab.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {lesson.interactiveLab.instructions}
                </p>
              </div>

              <InteractiveLabs labType={lesson.interactiveLab.type} />
            </div>
          )}

          {/* ================= STEP 4: BANGLA PITFALL ROOM ================= */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                  Step 4 of 5 &bull; Bangladesh L1 Interference Alert
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {lesson.banglaPitfall.alertTitle}
                </h2>
              </div>

              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 dark:border-amber-800/60 dark:bg-amber-950/30 space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block text-xs">
                    The Bangla L1 Root Cause:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {lesson.banglaPitfall.rootProblem}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block text-xs">
                    Score Consequence:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {lesson.banglaPitfall.consequence}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block text-xs">
                    The Band 9 Remedy:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium leading-relaxed">
                    {lesson.banglaPitfall.fixSummary}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                      <th className="p-3">Bangladeshi Student Error / Trap</th>
                      <th className="p-3">Why Examiners Penalize It</th>
                      <th className="p-3">Band 8.5+ Natural Replacement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {lesson.banglaPitfall.comparisons.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                          {row.wrongOrTrap}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {row.whyOrContext}
                        </td>
                        <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                          {row.band9Fix}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= STEP 5: MASTERY GATE (80% DRILL) ================= */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Step 5 of 5 &bull; Mastery Gate (Pass {lesson.masteryGate.passingScorePercent}% to Unlock Next Module)
                  </span>
                  <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Exit Diagnostic Micro-Drill
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {lesson.masteryGate.questions.map((q, qIdx) => {
                  const chosen = selectedAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                    >
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        Q{qIdx + 1}. {q.question}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = chosen === oIdx;
                          const isCorrectOption = q.correctIndex === oIdx;

                          let btnStyle =
                            'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300';
                          if (quizSubmitted) {
                            if (isCorrectOption) {
                              btnStyle =
                                'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrectOption) {
                              btnStyle =
                                'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle =
                              'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setSelectedAnswers((p) => ({ ...p, [q.id]: oIdx }));
                                }
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrectOption && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
                          <strong>Examiner Diagnostic:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleGradeMasteryGate}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Submit Mastery Gate Answers
                </button>
              ) : (
                <div
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    passedGate
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                      : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40'
                  }`}
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      {passedGate ? (
                        <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      )}
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {passedGate
                          ? `Lesson Complete! +${lesson.xpReward} Band Mastery XP`
                          : `Score: ${scorePercent}% (Requires ${lesson.masteryGate.passingScorePercent}% to Pass)`}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {passedGate
                        ? `You answered ${correctCount}/${totalQuestions} correctly (${scorePercent}%). Next curriculum module is now unlocked!`
                        : 'Review the examiner diagnostics above and retry the Mastery Gate.'}
                    </p>
                  </div>

                  {passedGate ? (
                    nextLesson ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/academy/${nextLesson.id}`)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shrink-0"
                      >
                        <span>Next: Lesson {nextLesson.code}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push('/academy')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
                      >
                        Finish Curriculum
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0"
                    >
                      Retry Mastery Gate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Step Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={activeStep <= 1}
              onClick={() => handleStepChange(activeStep - 1)}
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              ← Previous Step
            </button>

            {activeStep < 5 && (
              <button
                type="button"
                onClick={() => handleStepChange(activeStep + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-500 transition-colors"
              >
                <span>Next: {SPRINT_STEPS[activeStep].shortLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcademyLessonSprintPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-16 text-center text-slate-400">
          Loading lesson...
        </div>
      }
    >
      <AcademyLessonSprintContent />
    </React.Suspense>
  );
}
