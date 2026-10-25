'use client';

import React from 'react';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';

interface SectionRange {
  start: number;
  end: number;
  label: string;
}

interface InsperaFooterProps {
  totalQuestions: number;
  sections: SectionRange[];
  currentQuestion: number;
  onNavigate: (questionNumber: number) => void;
}

export function InsperaFooter({
  totalQuestions,
  sections,
  currentQuestion,
  onNavigate,
}: InsperaFooterProps) {
  const answers = useExamStore((state) => state.answers);
  const flaggedQuestions = useExamStore((state) => state.flaggedQuestions);
  const toggleFlag = useExamStore((state) => state.toggleFlag);

  const isCurrentFlagged = flaggedQuestions.includes(currentQuestion);

  return (
    <footer className="h-16 bg-neutral-900 border-t border-neutral-800 text-white px-3 md:px-6 flex items-center justify-between shrink-0 select-none z-20">
      <div className="flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 px-2.5 py-1.5 rounded text-xs md:text-sm font-medium transition-colors">
          <input
            type="checkbox"
            checked={isCurrentFlagged}
            onChange={() => toggleFlag(currentQuestion)}
            className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-yellow-400 focus:ring-yellow-400/50 cursor-pointer"
          />
          <Flag
            className={`w-3.5 h-3.5 ${
              isCurrentFlagged ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'
            }`}
          />
          <span className={isCurrentFlagged ? 'text-yellow-400 font-semibold' : 'text-neutral-300'}>
            Review
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-1 px-2 mx-2">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 shrink-0 border-r border-neutral-800 pr-3 last:border-r-0 last:pr-0"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hidden lg:inline mr-1">
              {section.label}
            </span>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: section.end - section.start + 1 },
                (_, i) => section.start + i
              ).map((qNum) => {
                const isAnswered = Boolean(answers[qNum] && answers[qNum].trim() !== '');
                const isFlagged = flaggedQuestions.includes(qNum);
                const isActive = currentQuestion === qNum;

                let stateClasses = 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 bg-neutral-900/60';
                if (isActive) {
                  stateClasses = 'border-2 border-blue-500 ring-2 ring-blue-500/30 text-white font-bold bg-neutral-800';
                } else if (isAnswered) {
                  stateClasses = 'bg-neutral-700 text-white border border-neutral-600 font-semibold';
                }

                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => onNavigate(qNum)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded text-xs transition-all flex items-center justify-center ${stateClasses}`}
                    title={`Question ${qNum}`}
                  >
                    {qNum}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-400 rounded-full border border-neutral-900 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate(Math.max(1, currentQuestion - 1))}
          disabled={currentQuestion <= 1}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 border border-neutral-700 text-neutral-200 transition-colors"
          title="Previous Question"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(Math.min(totalQuestions, currentQuestion + 1))}
          disabled={currentQuestion >= totalQuestions}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 border border-neutral-700 text-neutral-200 transition-colors"
          title="Next Question"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}