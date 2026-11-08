'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AcademyState {
  completedLessons: string[];
  lessonStepProgress: Record<string, number>;
  lessonScores: Record<string, number>;
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  bestWpm: number;
  markStepReached: (lessonId: string, stepIndex: number) => void;
  completeLesson: (lessonId: string, scorePercent: number, xpReward: number) => void;
  updateWpm: (wpm: number) => void;
  recordDailyActivity: () => void;
}

function getTodayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set) => ({
      completedLessons: [],
      lessonStepProgress: {},
      lessonScores: {},
      xp: 0,
      streakDays: 1,
      lastActiveDate: null,
      bestWpm: 0,
      recordDailyActivity: () =>
        set((state) => {
          const today = getTodayIsoDate();
          if (state.lastActiveDate === today) {
            return state;
          }
          const yesterday = getYesterdayIsoDate();
          const nextStreak =
            state.lastActiveDate === yesterday ? state.streakDays + 1 : Math.max(1, state.streakDays);
          return {
            lastActiveDate: today,
            streakDays: nextStreak,
          };
        }),
      markStepReached: (lessonId, stepIndex) =>
        set((state) => {
          const currentMax = state.lessonStepProgress[lessonId] ?? 0;
          const today = getTodayIsoDate();
          return {
            lastActiveDate: today,
            lessonStepProgress: {
              ...state.lessonStepProgress,
              [lessonId]: Math.max(currentMax, stepIndex),
            },
          };
        }),
      completeLesson: (lessonId, scorePercent, xpReward) =>
        set((state) => {
          const alreadyCompleted = state.completedLessons.includes(lessonId);
          const today = getTodayIsoDate();
          const yesterday = getYesterdayIsoDate();
          const nextStreak =
            state.lastActiveDate === today
              ? state.streakDays
              : state.lastActiveDate === yesterday
              ? state.streakDays + 1
              : Math.max(1, state.streakDays);

          return {
            completedLessons: alreadyCompleted
              ? state.completedLessons
              : [...state.completedLessons, lessonId],
            lessonScores: {
              ...state.lessonScores,
              [lessonId]: Math.max(state.lessonScores[lessonId] ?? 0, scorePercent),
            },
            lessonStepProgress: {
              ...state.lessonStepProgress,
              [lessonId]: 5,
            },
            xp: alreadyCompleted ? state.xp : state.xp + xpReward,
            streakDays: nextStreak,
            lastActiveDate: today,
          };
        }),
      updateWpm: (wpm) =>
        set((state) => ({
          bestWpm: Math.max(state.bestWpm, Math.round(wpm)),
        })),
    }),
    {
      name: 'ielts-academy-progress',
    }
  )
);
