'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Loader2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORY_NAMES: Record<string, string> = {
  TFNG: 'True / False / Not Given',
  YNNG: 'Yes / No / Not Given',
  MCQ_SINGLE: 'Multiple Choice (Single Answer)',
  MATCHING_HEADINGS: 'Matching Headings',
  FILL_BLANKS: 'Sentence & Note Completion',
  SUMMARY_COMPLETION: 'Summary Completion',
};

const CATEGORY_TIPS: Record<string, string> = {
  TFNG: 'Pay close attention to qualifiers like "all", "some", and "always". If the passage neither confirms nor contradicts the statement, select NOT GIVEN.',
  YNNG: "Focus on distinguishing the writer's personal arguments and perspective rather than merely searching for explicit factual data.",
  MCQ_SINGLE: 'Eliminate distractor choices that lift identical words from the passage but distort the logical meaning.',
  MATCHING_HEADINGS: 'Skim the introductory and concluding sentences of each paragraph to identify main ideas before reading the options.',
  FILL_BLANKS: 'Check grammatical agreement and ensure you never exceed the instructed word and number limits.',
  SUMMARY_COMPLETION: 'Predict the required part of speech for each blank and search the text for synonyms and paraphrases.',
};

interface WeaknessItem {
  category: string;
  name: string;
  accuracy: number;
  correct: number;
  total: number;
  tip: string;
}

export default function WeaknessAnalytics() {
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAttempts, setHasAttempts] = useState(false);

  useEffect(() => {
    async function loadWeaknesses() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch last 5 Reading/Listening attempts where weakness_breakdown_json IS NOT NULL
        const { data: attempts } = await supabase
          .from('test_attempts')
          .select('weakness_breakdown_json')
          .eq('user_id', user.id)
          .in('module_type', ['reading', 'listening'])
          .not('weakness_breakdown_json', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!attempts || attempts.length === 0) {
          setHasAttempts(false);
          setLoading(false);
          return;
        }

        setHasAttempts(true);
        const categoryStats: Record<string, { correct: number; total: number }> = {};

        attempts.forEach((att) => {
          const breakdown = att.weakness_breakdown_json;
          if (!breakdown || typeof breakdown !== 'object') return;

          for (const [cat, val] of Object.entries(breakdown)) {
            const data = val as { correct?: number; total?: number };
            const correct = Number(data?.correct ?? 0);
            const total = Number(data?.total ?? 0);

            if (!categoryStats[cat]) {
              categoryStats[cat] = { correct: 0, total: 0 };
            }
            categoryStats[cat].correct += correct;
            categoryStats[cat].total += total;
          }
        });

        const list: WeaknessItem[] = Object.entries(categoryStats)
          .filter(([_, stats]) => stats.total > 0)
          .map(([cat, stats]) => {
            const accuracy = Math.round((stats.correct / stats.total) * 100);
            return {
              category: cat,
              name: CATEGORY_NAMES[cat] || cat,
              accuracy,
              correct: stats.correct,
              total: stats.total,
              tip:
                CATEGORY_TIPS[cat] ||
                'Review your errors carefully and practice focused question drills for this specific type.',
            };
          })
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3);

        setWeaknesses(list);
      } catch (err) {
        console.error('Error loading weakness analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeaknesses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Target Weakness Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated accuracy from your last 5 Reading &amp; Listening test attempts
            </p>
          </div>
        </div>

        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          All Practice Tests <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {!hasAttempts || weaknesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <HelpCircle className="h-10 w-10 text-slate-400 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No diagnostic test data available yet
            </h3>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Complete an official Reading or Listening mock test to see your top question-type
              vulnerabilities and targeted recommendations.
            </p>
            <Link
              href="/tests"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Start Practice Test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {weaknesses.map((item, idx) => {
              const barColor =
                item.accuracy >= 80
                  ? 'bg-emerald-500'
                  : item.accuracy >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500';

              const badgeColor =
                item.accuracy >= 80
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : item.accuracy >= 60
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';

              return (
                <div
                  key={item.category}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    {/* Priority badge & Name */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          #{idx + 1}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm dark:text-white">
                          {item.name}
                        </h4>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeColor}`}>
                        {item.accuracy}%
                      </span>
                    </div>

                    {/* Progress Bar & Counts */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span>Accuracy</span>
                        <span>
                          {item.correct} / {item.total} correct
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="mt-3 rounded-lg border border-amber-200/60 bg-amber-50/80 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/30">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <Link
                      href="/tests"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors"
                    >
                      Practice Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
