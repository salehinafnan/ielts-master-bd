'use client';

import React, { useState, useEffect } from 'react';
import { EyeOff, AlertTriangle, CheckCircle2, ListChecks, Flag } from 'lucide-react';
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
  const remainingSeconds = useExamStore((state) => state.remainingSeconds);
  const tickTimer = useExamStore((state) => state.tickTimer);
  const answers = useExamStore((state) => state.answers);
  const flaggedQuestions = useExamStore((state) => state.flaggedQuestions);

  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

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
      <header className="h-14 bg-neutral-900 border-b border-neutral-800 text-white px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-sm md:text-base text-neutral-200 truncate">
            {testTitle}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <div
            className={`px-3 py-1 rounded text-sm md:text-base font-mono font-bold tracking-wider border ${
              isTimeCritical
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                : 'bg-neutral-800 border-neutral-700 text-neutral-100'
            }`}
          >
            {formattedTime}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScreenHidden(true)}
            className="px-2.5 py-1.5 rounded text-xs md:text-sm font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Hide Screen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="px-2.5 py-1.5 rounded text-xs md:text-sm font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <ListChecks className="w-4 h-4" />
            <span className="hidden sm:inline">Review</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3 py-1.5 rounded text-xs md:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {isScreenHidden && (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md space-y-4">
            <EyeOff className="w-16 h-16 mx-auto text-neutral-400" />
            <h2 className="text-2xl font-bold">Screen Hidden</h2>
            <p className="text-neutral-400 text-sm">
              Your test is currently hidden. Countdown timer continues per IELTS rules.
            </p>
            <button
              type="button"
              onClick={() => setIsScreenHidden(false)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-400" />
                Test Review Overview
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4 py-3 text-xs text-neutral-400 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-700 border border-neutral-600 inline-block" />
                Answered ({totalQuestions - unansweredQuestions.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-900 border border-neutral-700 inline-block" />
                Unanswered ({unansweredQuestions.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
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
                    className={`relative h-10 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      isAnswered
                        ? 'bg-neutral-700 text-white border border-neutral-600'
                        : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {qNum}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-neutral-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-sm font-medium"
              >
                Back to Test
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-yellow-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Test Submission</h3>
            </div>

            <div className="space-y-3 text-sm text-neutral-300 bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
              <div className="flex justify-between items-center">
                <span>Total Questions:</span>
                <span className="font-semibold text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Answered:</span>
                <span className="font-semibold text-emerald-400">
                  {totalQuestions - unansweredQuestions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unanswered:</span>
                <span className={`font-semibold ${unansweredQuestions.length > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                  {unansweredQuestions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Flagged for Review:</span>
                <span className={`font-semibold ${activeFlagged.length > 0 ? 'text-yellow-400' : 'text-neutral-400'}`}>
                  {activeFlagged.length}
                </span>
              </div>
            </div>

            {unansweredQuestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-neutral-400 font-medium">
                  Unanswered Question Numbers:
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-neutral-950/60 rounded border border-neutral-800">
                  {unansweredQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(q);
                        setIsSubmitModalOpen(false);
                      }}
                      className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    >
                      Q{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFlagged.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-yellow-400" /> Flagged Question Numbers:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-neutral-950/60 rounded border border-neutral-800">
                  {activeFlagged.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(q);
                        setIsSubmitModalOpen(false);
                      }}
                      className="px-2 py-0.5 rounded text-xs bg-yellow-950/60 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/60"
                    >
                      Q{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-sm font-medium transition-colors"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  if (onSubmit) onSubmit();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors shadow"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}