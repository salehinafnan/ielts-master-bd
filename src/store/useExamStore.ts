'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StickyNoteItem } from '@/lib/types';

export interface ExamState {
  activeTestId: string | null;
  answers: Record<number, string>;
  flaggedQuestions: number[];
  highlights: Record<string, string[]>;
  notes: Record<string, StickyNoteItem[]>;
  remainingSeconds: number;
  examEndsAt: number | null;
  setAnswer: (questionNumber: number, answer: string) => void;
  toggleFlag: (questionNumber: number) => void;
  addHighlight: (paragraphId: string, text: string) => void;
  removeHighlight: (paragraphId: string, text: string) => void;
  addNote: (paragraphId: string, quote: string, noteText: string) => void;
  removeNote: (paragraphId: string, noteId: string) => void;
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
      notes: {},
      remainingSeconds: 0,
      examEndsAt: null,
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
      addNote: (paragraphId, quote, noteText) =>
        set((state) => {
          const list = state.notes[paragraphId] ?? [];
          const newItem: StickyNoteItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            paragraphId,
            quote,
            noteText,
            createdAt: Date.now(),
          };
          return {
            notes: { ...state.notes, [paragraphId]: [...list, newItem] },
          };
        }),
      removeNote: (paragraphId, noteId) =>
        set((state) => {
          const list = state.notes[paragraphId];
          if (!list) return state;
          return {
            notes: {
              ...state.notes,
              [paragraphId]: list.filter((n) => n.id !== noteId),
            },
          };
        }),
      tickTimer: () =>
        set((state) => {
          if (state.examEndsAt) {
            const diffSec = Math.max(0, Math.ceil((state.examEndsAt - Date.now()) / 1000));
            return { remainingSeconds: diffSec };
          }
          return {
            remainingSeconds: state.remainingSeconds > 0 ? state.remainingSeconds - 1 : 0,
          };
        }),
      resetExam: () =>
        set({
          activeTestId: null,
          answers: {},
          flaggedQuestions: [],
          highlights: {},
          notes: {},
          remainingSeconds: 0,
          examEndsAt: null,
        }),
      initExam: (testId, totalSeconds) =>
        set((state) => {
          if (state.activeTestId === testId && state.remainingSeconds > 0) {
            const endsAt = state.examEndsAt || Date.now() + state.remainingSeconds * 1000;
            const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
            return {
              ...state,
              examEndsAt: endsAt,
              remainingSeconds: remaining,
            };
          }
          return {
            activeTestId: testId,
            remainingSeconds: totalSeconds,
            examEndsAt: Date.now() + totalSeconds * 1000,
            answers: {},
            flaggedQuestions: [],
            highlights: {},
            notes: {},
          };
        }),
    }),
    {
      name: 'ielts-active-exam',
    }
  )
);
