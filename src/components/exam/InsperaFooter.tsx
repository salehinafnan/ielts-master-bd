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
    <footer className="h-14 sm:h-16 bg-slate-900 border-t border-slate-800 text-white px-2.5 sm:px-5 flex items-center justify-between gap-2 shrink-0 select-none z-20">
      <div className="flex items-center gap-2 shrink-0">
        <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none bg-slate-800/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
          <input
            type="checkbox"
            checked={isCurrentFlagged}
            onChange={() => toggleFlag(currentQuestion)}
            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
          />
          <Flag
            className={`w-3.5 h-3.5 ${
              isCurrentFlagged ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
            }`}
          />
          <span className={`hidden xs:inline ${isCurrentFlagged ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}>
            Review
          </span>
        </label>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 flex-1 scrollbar-thin">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 shrink-0 border-r border-slate-800 pr-2.5 last:border-r-0 last:pr-0"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden xl:inline mr-1">
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

                let stateClasses =
                  'border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 bg-slate-900/60';
                if (isActive) {
                  stateClasses =
                    'border-2 border-blue-500 ring-2 ring-blue-500/30 text-white font-bold bg-slate-800';
                } else if (isAnswered) {
                  stateClasses = 'bg-blue-600/90 text-white border border-blue-500 font-semibold';
                }

                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => onNavigate(qNum)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs transition-all flex items-center justify-center shrink-0 ${stateClasses}`}
                    title={`Question ${qNum}`}
                  >
                    {qNum}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full border border-slate-900 shadow-sm" />
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
          className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 border border-slate-700 text-slate-200 transition-colors"
          title="Previous Question"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(Math.min(totalQuestions, currentQuestion + 1))}
          disabled={currentQuestion >= totalQuestions}
          className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 border border-slate-700 text-slate-200 transition-colors"
          title="Next Question"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}