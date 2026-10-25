'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExamState {
  activeTestId: string | null;
  answers: Record<number, string>;
  flaggedQuestions: number[];
  highlights: Record<string, string[]>;
  remainingSeconds: number;
  setAnswer: (questionNumber: number, answer: string) => void;
  toggleFlag: (questionNumber: number) => void;
  addHighlight: (paragraphId: string, text: string) => void;
  removeHighlight: (paragraphId: string, text: string) => void;
  tickTimer: () => void;
  resetExam: () => void;
  initExam: (testId: string, totalSeconds: number) => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      activeTestId: null,
      answers: {},
      flaggedQuestions: [],
      highlights: {},
      remainingSeconds: 0,
      setAnswer: (questionNumber, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionNumber]: answer },
        })),
      toggleFlag: (questionNumber) =>
        set((state) => ({
          flaggedQuestions: state.flaggedQuestions.includes(questionNumber)
            ? state.flaggedQuestions.filter((q) => q !== questionNumber)
            : [...state.flaggedQuestions, questionNumber],
        })),
      addHighlight: (paragraphId, text) =>
        set((state) => {
          const list = state.highlights[paragraphId] ?? [];
          if (list.includes(text)) return state;
          return {
            highlights: { ...state.highlights, [paragraphId]: [...list, text] },
          };
        }),
      removeHighlight: (paragraphId, text) =>
        set((state) => {
          const list = state.highlights[paragraphId];
          if (!list) return state;
          return {
            highlights: {
              ...state.highlights,
              [paragraphId]: list.filter((item) => item !== text),
            },
          };
        }),
      tickTimer: () =>
        set((state) => ({
          remainingSeconds: state.remainingSeconds > 0 ? state.remainingSeconds - 1 : 0,
        })),
      resetExam: () =>
        set({
          activeTestId: null,
          answers: {},
          flaggedQuestions: [],
          highlights: {},
          remainingSeconds: 0,
        }),
      initExam: (testId, totalSeconds) =>
        set((state) => {
          if (state.activeTestId === testId) return state;
          return {
            activeTestId: testId,
            remainingSeconds: totalSeconds,
            answers: {},
            flaggedQuestions: [],
            highlights: {},
          };
        }),
    }),
    {
      name: 'ielts-active-exam',
    }
  )
);
