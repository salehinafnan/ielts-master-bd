'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff, AlertTriangle, CheckCircle2, ListChecks, Flag, Clock, ArrowLeft } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';

interface InsperaHeaderProps {
  testTitle: string;
  totalQuestions?: number;
  onSubmit?: () => void;
  onNavigate?: (questionNumber: number) => void;
}

export function InsperaHeader({
  testTitle,
  totalQuestions = 40,
  onSubmit,
  onNavigate,
}: InsperaHeaderProps) {
  const router = useRouter();
  const remainingSeconds = useExamStore((state) => state.remainingSeconds);
  const activeTestId = useExamStore((state) => state.activeTestId);
  const tickTimer = useExamStore((state) => state.tickTimer);
  const answers = useExamStore((state) => state.answers);
  const flaggedQuestions = useExamStore((state) => state.flaggedQuestions);

  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const hasAutoSubmittedRef = React.useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  useEffect(() => {
    if (
      activeTestId &&
      remainingSeconds === 0 &&
      !hasAutoSubmittedRef.current &&
      onSubmit
    ) {
      hasAutoSubmittedRef.current = true;
      onSubmit();
    }
  }, [activeTestId, remainingSeconds, onSubmit]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = remainingSeconds > 0 && remainingSeconds <= 300;

  const unansweredQuestions: number[] = [];
  for (let i = 1; i <= totalQuestions; i++) {
    if (!answers[i] || answers[i].trim() === '') {
      unansweredQuestions.push(i);
    }
  }

  const activeFlagged = flaggedQuestions.filter((q) => q <= totalQuestions);

  return (
    <>
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 select-none z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.push('/tests')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Exit to Tests Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-xs sm:text-sm md:text-base text-slate-100 truncate">
            {testTitle}
          </span>
        </div>

        <div className="flex items-center justify-center shrink-0">
          <div
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm md:text-base font-mono font-bold tracking-wider border flex items-center gap-1.5 ${
              isTimeCritical
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                : 'bg-slate-800/90 border-slate-700 text-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 hidden xs:inline" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1">
          <button
            type="button"
            onClick={() => setIsScreenHidden(true)}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            title="Hide Screen"
          >
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Hide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            title="Review Questions"
          >
            <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Review</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {isScreenHidden && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md space-y-4">
            <EyeOff className="w-14 h-14 mx-auto text-slate-400" />
            <h2 className="text-2xl font-bold">Screen Hidden</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your exam screen is currently hidden. The official countdown timer continues in the background per CD-IELTS regulations.
            </p>
            <button
              type="button"
              onClick={() => setIsScreenHidden(false)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow transition-colors text-sm"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-400" />
                Question Palette &amp; Review Overview
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs sm:text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-400 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                Answered ({totalQuestions - unansweredQuestions.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
                Unanswered ({unansweredQuestions.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Flagged ({activeFlagged.length})
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 py-4 overflow-y-auto flex-1">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                const isAnswered = Boolean(answers[qNum] && answers[qNum].trim() !== '');
                const isFlagged = flaggedQuestions.includes(qNum);

                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => {
                      if (onNavigate) onNavigate(qNum);
                      setIsReviewModalOpen(false);
                    }}
                    className={`relative h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                      isAnswered
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800/70 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {qNum}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-medium"
              >
                Back to Test
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Test Submission</h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span>Total Questions / Tasks:</span>
                <span className="font-semibold text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed:</span>
                <span className="font-semibold text-emerald-400">
                  {totalQuestions - unansweredQuestions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unanswered:</span>
                <span className={`font-semibold ${unansweredQuestions.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {unansweredQuestions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Flagged for Review:</span>
                <span className={`font-semibold ${activeFlagged.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {activeFlagged.length}
                </span>
              </div>
            </div>

            {unansweredQuestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">
                  Unanswered Items (tap to jump):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  {unansweredQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(q);
                        setIsSubmitModalOpen(false);
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Q{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFlagged.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-amber-400" /> Flagged Items:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  {activeFlagged.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(q);
                        setIsSubmitModalOpen(false);
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/60"
                    >
                      Q{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  if (onSubmit) onSubmit();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}