'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  QuestionItem,
  ReadingListeningTestContent,
  AIWritingEvaluation,
  AISpeakingEvaluation,
  QuestionCategory,
} from '@/lib/types';
import { checkObjectiveAnswer } from '@/lib/ielts-scoring';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  FileCheck,
} from 'lucide-react';

const CATEGORY_STUDY_TIPS: Record<string, string> = {
  TFNG: 'Pay close attention to qualifiers like "mainly", "all", "some", and "always". If the passage neither confirms nor contradicts the statement, mark it NOT GIVEN rather than guessing.',
  YNNG: 'Focus on understanding the writer\'s specific stance and perspective. Notice modal verbs such as "should", "might", and "claim" that indicate authorial opinion.',
  MCQ_SINGLE: 'Eliminate distractor options that contain identical words from the text but alter the logical meaning. Always verify the remaining option against the main argument.',
  MATCHING_HEADINGS: 'Skim the introductory and concluding sentences of each paragraph to identify the central topic before reading the list of headings. Avoid matching minor supporting examples.',
  FILL_BLANKS: 'Check the grammatical requirement of the gap (noun, verb, adjective). Ensure you copy exact spellings from the text and adhere strictly to the word limit.',
  SUMMARY_COMPLETION: 'Scan for synonyms and paraphrases of surrounding keywords in the summary. Verify that your completed sentence is grammatically sound and matches the passage meaning.',
};

function ExamResultsContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;
  const attemptId = params?.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!attemptId) return;

    async function loadResults() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const supabase = createClient();

        const { data: attemptData, error: attemptErr } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();

        if (attemptErr || !attemptData) {
          throw new Error(attemptErr?.message || 'Could not load test attempt.');
        }

        setAttempt(attemptData);

        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .select('*')
          .eq('id', attemptData.test_id || testId)
          .single();

        if (testErr) {
          console.warn('Could not load test content:', testErr.message);
        } else {
          setTest(testData);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred while loading test results.');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [attemptId, testId]);

  const questions: QuestionItem[] = useMemo(() => {
    if (!test) return [];
    const content = test.content_json as ReadingListeningTestContent;
    if (content?.sections && Array.isArray(content.sections)) {
      return content.sections.flatMap((s) => s.questions || []);
    }
    if (Array.isArray((content as any)?.questions)) {
      return (content as any).questions;
    }
    if (Array.isArray(content)) {
      return content as any;
    }
    if (test.answer_key_json) {
      return Object.entries(test.answer_key_json).map(([k, v]: [string, any]) => {
        const qNum = parseInt(k, 10);
        return {
          questionNumber: qNum,
          category: (v?.category || 'FILL_BLANKS') as QuestionCategory,
          promptText: v?.promptText || `Question ${qNum}`,
          options: v?.options,
          correctAnswers: Array.isArray(v?.correctAnswers)
            ? v.correctAnswers
            : [String(v?.correctAnswers || v || '')],
          explanation: v?.explanation || '',
        };
      });
    }
    return [];
  }, [test]);

  const userAnswers: Record<number, string> = useMemo(() => {
    return attempt?.user_answers_json || {};
  }, [attempt]);

  const weaknessBreakdown = useMemo(() => {
    return attempt?.weakness_breakdown_json || {};
  }, [attempt]);

  const worstCategories = useMemo(() => {
    const entries = Object.entries(weaknessBreakdown).map(
      ([cat, data]: [string, any]) => ({
        category: cat,
        percentage: Number(data.percentage || 0),
        recommendation: data.recommendation || '',
      })
    );
    entries.sort((a, b) => a.percentage - b.percentage);
    return entries.slice(0, 2);
  }, [weaknessBreakdown]);

  const toggleExpand = (qNum: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qNum]: !prev[qNum],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-neutral-400 text-sm">Loading Exam Performance Report...</p>
      </div>
    );
  }

  if (errorMsg || !attempt) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-6 rounded-xl text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Results Not Found</h2>
          <p className="text-neutral-400 text-sm">{errorMsg || 'Could not find attempt details.'}</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const band = Number(attempt.band_score || 0);
  let bandBadgeColor = 'border-rose-500/50 bg-rose-950/40 text-rose-400';
  if (band >= 7.0) {
    bandBadgeColor = 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400';
  } else if (band >= 5.5) {
    bandBadgeColor = 'border-amber-500/50 bg-amber-950/40 text-amber-400';
  }

  const aiWriting =
    attempt.module_type === 'writing' && attempt.ai_feedback_json
      ? (attempt.ai_feedback_json as AIWritingEvaluation)
      : null;

  const aiSpeaking =
    attempt.module_type === 'speaking' && attempt.ai_feedback_json
      ? (attempt.ai_feedback_json as AISpeakingEvaluation)
      : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
            {test?.title || `${attempt.module_type.toUpperCase()} Mock Assessment`}
          </span>
        </div>

        {/* HERO SECTION */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-neutral-300">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              IELTS {attempt.module_type.toUpperCase()} Official Assessment
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Official Test Performance Score
            </h1>
            <p className="text-sm text-neutral-400">
              Completed on {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
              {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-5 rounded-2xl border ${bandBadgeColor} flex flex-col items-center justify-center min-w-[120px]`}>
              <span className="text-xs font-bold uppercase tracking-wider">Band Score</span>
              <span className="text-4xl sm:text-5xl font-extrabold mt-1">
                {band.toFixed(1)}
              </span>
            </div>

            {attempt.raw_score !== null && attempt.raw_score !== undefined && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col items-center justify-center min-w-[110px]">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Raw Score</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  {attempt.raw_score}
                  <span className="text-base text-neutral-500 font-normal">/{questions.length || 40}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AI WRITING EVALUATION VIEW */}
        {aiWriting && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Task Response</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiWriting.taskResponse?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiWriting.taskResponse?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Coherence & Cohesion</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiWriting.coherenceCohesion?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiWriting.coherenceCohesion?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Lexical Resource</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiWriting.lexicalResource?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiWriting.lexicalResource?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Grammatical Range</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiWriting.grammaticalRange?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiWriting.grammaticalRange?.feedback}</p>
              </div>
            </div>

            {aiWriting.sentenceCorrections && aiWriting.sentenceCorrections.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  Sentence Corrections & Grammar Improvements
                </h3>
                <div className="space-y-3">
                  {aiWriting.sentenceCorrections.map((sc, idx) => (
                    <div key={idx} className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 text-xs space-y-1.5">
                      <div className="text-rose-400"><span className="font-semibold text-neutral-400">Original:</span> {sc.original}</div>
                      <div className="text-emerald-400"><span className="font-semibold text-neutral-400">Revised:</span> {sc.corrected}</div>
                      <div className="text-neutral-400 italic"><span className="font-semibold">Reason:</span> {sc.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiWriting.modelBand8Essay && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Band 8.0+ Model Answer
                </h3>
                <div className="p-4 bg-neutral-950/80 rounded-lg border border-neutral-800 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiWriting.modelBand8Essay}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI SPEAKING EVALUATION VIEW */}
        {aiSpeaking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Fluency & Coherence</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiSpeaking.fluencyCoherence?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiSpeaking.fluencyCoherence?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Lexical Resource</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiSpeaking.lexicalResource?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiSpeaking.lexicalResource?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Grammatical Range</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiSpeaking.grammaticalRange?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiSpeaking.grammaticalRange?.feedback}</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Pronunciation</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{aiSpeaking.pronunciation?.band?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-neutral-400 mt-2">{aiSpeaking.pronunciation?.feedback}</p>
              </div>
            </div>

            {aiSpeaking.fillerWordsDetected && aiSpeaking.fillerWordsDetected.length > 0 && (
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Filler Words Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {aiSpeaking.fillerWordsDetected.map((w, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WEAKNESS BREAKDOWN */}
        {Object.keys(weaknessBreakdown).length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              Question Category Accuracy Breakdown
            </h2>

            <div className="space-y-5">
              {Object.entries(weaknessBreakdown).map(([category, info]: [string, any]) => {
                const pct = Number(info.percentage || 0);
                let barColor = 'bg-rose-500';
                let textColor = 'text-rose-400';
                if (pct >= 80) {
                  barColor = 'bg-emerald-500';
                  textColor = 'text-emerald-400';
                } else if (pct >= 60) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-400';
                }

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-200 uppercase tracking-wider">
                        {category} ({info.correct || 0}/{info.total || 0})
                      </span>
                      <span className={textColor}>{pct}% Accuracy</span>
                    </div>

                    <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {info.recommendation && (
                      <p className="text-xs text-neutral-400 italic pt-0.5">
                        {info.recommendation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HOW TO IMPROVE STUDY GUIDE */}
        {worstCategories.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Targeted Study Guide: Highest-Impact Priority Areas
            </h2>
            <p className="text-xs text-neutral-400">
              Focus your upcoming study sessions on these 2 categories where you left the most points on the table:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {worstCategories.map((item) => (
                <div
                  key={item.category}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white uppercase">{item.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-semibold">
                      {item.percentage}% accuracy
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {CATEGORY_STUDY_TIPS[item.category] || item.recommendation || 'Practice dedicated question drills and review erroneous questions carefully.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FULL QUESTION REVIEW TABLE */}
        {questions.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  Comprehensive Question Analysis
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Examine correct answers, your submitted response, and rationale.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterMode === 'all'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('incorrect')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterMode === 'incorrect'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Incorrect
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('correct')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterMode === 'correct'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Correct
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {questions
                .filter((q) => {
                  const uAns = userAnswers[q.questionNumber] || '';
                  const isCorrect = checkObjectiveAnswer(uAns, q.correctAnswers);
                  if (filterMode === 'incorrect') return !isCorrect;
                  if (filterMode === 'correct') return isCorrect;
                  return true;
                })
                .map((q) => {
                  const uAns = userAnswers[q.questionNumber] || '';
                  const isCorrect = checkObjectiveAnswer(uAns, q.correctAnswers);
                  const isExpanded = Boolean(expandedQuestions[q.questionNumber]);

                  return (
                    <div
                      key={q.questionNumber}
                      className={`rounded-xl border transition-colors ${
                        isCorrect
                          ? 'border-neutral-800 bg-neutral-950/40'
                          : 'border-rose-900/40 bg-rose-950/15'
                      }`}
                    >
                      <div
                        onClick={() => toggleExpand(q.questionNumber)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <span className="w-7 h-7 shrink-0 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center border border-neutral-700">
                            {q.questionNumber}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase shrink-0">
                            {q.category}
                          </span>
                          <p className="text-xs sm:text-sm text-neutral-300 truncate">
                            {q.promptText}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                              <XCircle className="w-4 h-4" /> Incorrect
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-neutral-800/60 text-xs space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                              <span className="text-neutral-400 block font-semibold mb-1">
                                Your Submitted Answer:
                              </span>
                              <span className={uAns ? (isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold') : 'text-neutral-500 italic'}>
                                {uAns || '(Blank / Not answered)'}
                              </span>
                            </div>

                            <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                              <span className="text-neutral-400 block font-semibold mb-1">
                                Acceptable Answer(s):
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                {q.correctAnswers?.join(' OR ') || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800/80 text-neutral-300">
                              <span className="font-semibold text-blue-400 block mb-1">
                                Explanation & Official Reference:
                              </span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamResultsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ExamResultsContent />
    </React.Suspense>
  );
}