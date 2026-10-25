'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react';

const CAMBRIDGE_BOOKS = [19, 18, 17, 16, 15];
const CAMBRIDGE_TESTS = [1, 2, 3, 4];
const MODULES: Array<'Reading' | 'Listening'> = ['Reading', 'Listening'];

export default function CambridgeGraderPage() {
  const router = useRouter();

  const [book, setBook] = useState<number>(18);
  const [testNum, setTestNum] = useState<number>(1);
  const [moduleType, setModuleType] = useState<'Reading' | 'Listening'>('Reading');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAnswerChange = (qNum: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: value,
    }));
  };

  const handleClearAll = () => {
    if (confirm('Clear all entered answers?')) {
      setAnswers({});
    }
  };

  const handleGradeAndAnalyze = async () => {
    const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== '').length;
    if (answeredCount === 0) {
      alert('Please fill in at least one answer before grading.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage('Locating official Cambridge answer key...');
      const supabase = createClient();

      const { data: existingTest, error: searchError } = await supabase
        .from('tests')
        .select('id, title')
        .eq('test_category', 'cambridge_companion')
        .eq('module_type', moduleType.toLowerCase())
        .ilike('title', `%Cambridge%${book}%Test%${testNum}%`)
        .limit(1)
        .maybeSingle();

      if (searchError) {
        throw new Error(searchError.message);
      }

      if (!existingTest?.id) {
        throw new Error(
          `The official answer key for Cambridge ${book} Test ${testNum} (${moduleType}) has not been uploaded to the database yet. Try Cambridge 18 Test 1 (Reading) or ask an administrator to upload this answer key in the Admin Portal.`
        );
      }

      const targetTestId = existingTest.id;

      setStatusMessage('Grading answers and generating weakness analytics...');

      const response = await fetch('/api/grade-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: targetTestId,
          moduleType: moduleType.toLowerCase(),
          userAnswers: answers,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.attemptId) {
        throw new Error(result.error || 'Failed to grade Cambridge test.');
      }

      router.push(`/exam/${targetTestId}/results/${result.attemptId}`);
    } catch (err: any) {
      alert(`Grading Error: ${err.message}`);
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== '').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <BookOpen className="w-3.5 h-3.5" />
          Cambridge IELTS Companion Grader
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
          Grade Practice from Physical Cambridge Books
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Completed a paper test in your Cambridge book? Enter your 40 answers here to get instant IELTS band scores, detailed question diagnostics, and weakness radar analytics.
        </p>
      </div>

      {/* Legal & Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Legal Disclaimer:</span> You need the physical Cambridge IELTS book (15–19). We do not host or pirate Cambridge copyrighted reading passages or audio tracks. We solely accept and grade your objective answers against official keys.
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Cambridge Book
            </label>
            <select
              value={book}
              onChange={(e) => setBook(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CAMBRIDGE_BOOKS.map((b) => (
                <option key={b} value={b}>
                  Cambridge IELTS {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Test Number
            </label>
            <select
              value={testNum}
              onChange={(e) => setTestNum(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CAMBRIDGE_TESTS.map((t) => (
                <option key={t} value={t}>
                  Test {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Module
            </label>
            <select
              value={moduleType}
              onChange={(e) => setModuleType(e.target.value as 'Reading' | 'Listening')}
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="text-neutral-600 dark:text-neutral-400">
            Selected:{' '}
            <span className="font-bold text-neutral-900 dark:text-white">
              Cambridge {book} — Test {testNum} ({moduleType})
            </span>
            <span className="ml-3 text-neutral-500">
              ({answeredCount}/40 answers entered)
            </span>
          </div>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Answers
            </button>
          )}
        </div>
      </div>

      {/* 4x10 Question Inputs Grid */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Enter Answers (Questions 1 to 40)
          </h2>
          <span className="text-xs text-neutral-500">Use Tab to advance to next field</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, colIdx) => {
            const startQ = colIdx * 10 + 1;
            const endQ = (colIdx + 1) * 10;

            return (
              <div
                key={colIdx}
                className="space-y-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                  Questions {startQ} – {endQ}
                </div>

                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, rowIdx) => {
                    const qNum = startQ + rowIdx;
                    const val = answers[qNum] || '';

                    return (
                      <div key={qNum} className="flex items-center gap-2">
                        <span className="w-7 text-right text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                          {qNum}.
                        </span>
                        <input
                          type="text"
                          tabIndex={qNum}
                          value={val}
                          onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                          placeholder="Answer"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            {statusMessage ? (
              <span className="flex items-center gap-2 text-blue-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              <span>Review your spelling and word limit before scoring.</span>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting || answeredCount === 0}
            onClick={handleGradeAndAnalyze}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 shadow transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Grading Answers...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Grade & Analyze Performance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}