'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useExamStore } from '@/store/useExamStore';
import { InsperaHeader } from '@/components/exam/InsperaHeader';
import { AIWritingEvaluation } from '@/lib/types';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  BookOpen,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowRight,
  PenTool,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface WritingPromptData {
  task1: {
    title: string;
    prompt: string;
    imageUrl?: string;
    chartType?: string;
    imageDescription?: string;
    minWords: number;
  };
  task2: {
    title: string;
    prompt: string;
    imageUrl?: string;
    minWords: number;
  };
}

const DEFAULT_PROMPTS: WritingPromptData = {
  task1: {
    title: 'Task 1: Academic Report',
    prompt:
      'The bar chart below shows the percentage of households with access to the internet in five countries in 2005 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
    chartType: 'bar_chart',
    minWords: 150,
  },
  task2: {
    title: 'Task 2: Academic Essay',
    prompt:
      'Some people believe that universities should focus on providing academic skills and theoretical knowledge, while others think they should prepare students for employment.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.',
    minWords: 250,
  },
};

function getWordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function InternetAccessBarChart() {
  const chartData = [
    { country: 'USA', val2005: 60, val2015: 85 },
    { country: 'UK', val2005: 55, val2015: 90 },
    { country: 'Japan', val2005: 65, val2015: 93 },
    { country: 'Brazil', val2005: 20, val2015: 58 },
    { country: 'Nigeria', val2005: 5, val2015: 35 },
  ];

  return (
    <div className="mt-4 rounded-xl border border-neutral-700 bg-white p-5 text-neutral-900 shadow-sm">
      <div className="mb-4 text-center">
        <h4 className="font-bold text-sm md:text-base text-neutral-900 tracking-tight">
          Percentage of Households with Internet Access (2005 vs 2015)
        </h4>
        <p className="text-xs text-neutral-500 mt-0.5">Official IELTS Academic Writing Task 1 Data</p>
      </div>

      <div className="flex justify-center gap-6 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded bg-blue-600"></span>
          <span className="text-neutral-700">2005</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded bg-emerald-600"></span>
          <span className="text-neutral-700">2015</span>
        </div>
      </div>

      <div className="relative pt-6 pb-2 border-b-2 border-l-2 border-neutral-300">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-neutral-400 w-full"></div>
          <div className="border-b border-neutral-400 w-full"></div>
          <div className="border-b border-neutral-400 w-full"></div>
          <div className="border-b border-neutral-400 w-full"></div>
          <div className="border-b border-neutral-400 w-full"></div>
        </div>

        <div className="relative grid grid-cols-5 gap-2 sm:gap-4 items-end h-52 px-2 z-10">
          {chartData.map((item) => (
            <div key={item.country} className="flex flex-col items-center h-full justify-end">
              <div className="flex items-end justify-center gap-1.5 w-full h-full">
                <div className="flex flex-col items-center flex-1 max-w-[28px] h-full justify-end">
                  <span className="text-[10px] font-bold text-blue-700 mb-0.5">{item.val2005}%</span>
                  <div
                    className="w-full bg-blue-600 rounded-t shadow-sm transition-all duration-300"
                    style={{ height: `${item.val2005}%` }}
                    title={`2005: ${item.val2005}%`}
                  />
                </div>
                <div className="flex flex-col items-center flex-1 max-w-[28px] h-full justify-end">
                  <span className="text-[10px] font-bold text-emerald-700 mb-0.5">{item.val2015}%</span>
                  <div
                    className="w-full bg-emerald-600 rounded-t shadow-sm transition-all duration-300"
                    style={{ height: `${item.val2015}%` }}
                    title={`2015: ${item.val2015}%`}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-neutral-800 mt-2 truncate w-full text-center">
                {item.country}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400 mt-1 px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function WritingExamContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  const [activeTask, setActiveTask] = useState<1 | 2>(1);
  const [testTitle, setTestTitle] = useState<string>('IELTS Academic Writing');
  const [prompts, setPrompts] = useState<WritingPromptData>(DEFAULT_PROMPTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Upgrade prompt modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string>('');

  // AI Evaluation result state
  const [evaluation, setEvaluation] = useState<AIWritingEvaluation | null>(null);
  const [latestAttemptId, setLatestAttemptId] = useState<string | null>(null);
  const [isModelEssayOpen, setIsModelEssayOpen] = useState<boolean>(false);

  // Zustand persistent exam store
  const answers = useExamStore((state) => state.answers);
  const setAnswer = useExamStore((state) => state.setAnswer);
  const initExam = useExamStore((state) => state.initExam);

  // Load test details from Supabase
  useEffect(() => {
    if (!testId) return;

    let isMounted = true;
    async function loadTest() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('tests')
          .select('id, title, content_json')
          .eq('id', testId)
          .maybeSingle();

        if (error) {
          console.warn('Could not fetch test from supabase:', error.message);
        }

        if (isMounted) {
          if (data?.title) {
            setTestTitle(data.title);
          }

          if (data?.content_json) {
            const c = data.content_json as any;
            const t1 = Array.isArray(c?.tasks)
              ? c.tasks.find((t: any) => t.taskNumber === 1) || c.tasks[0]
              : c?.task1;
            const t2 = Array.isArray(c?.tasks)
              ? c.tasks.find((t: any) => t.taskNumber === 2) || c.tasks[1]
              : c?.task2;

            setPrompts({
              task1: {
                title: t1?.title || 'Task 1: Academic Report',
                prompt:
                  t1?.promptText ||
                  t1?.prompt ||
                  DEFAULT_PROMPTS.task1.prompt,
                imageUrl: t1?.imageUrl,
                chartType: t1?.type || t1?.chartType || 'bar_chart',
                imageDescription: t1?.imageDescription,
                minWords: t1?.minWords || 150,
              },
              task2: {
                title: t2?.title || 'Task 2: Academic Essay',
                prompt:
                  t2?.promptText ||
                  t2?.prompt ||
                  DEFAULT_PROMPTS.task2.prompt,
                imageUrl: t2?.imageUrl,
                minWords: t2?.minWords || 250,
              },
            });
          }

          // Initialize 60 minutes countdown in store
          initExam(testId, 3600);
        }
      } catch (err: any) {
        console.error('Error loading writing test:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTest();

    return () => {
      isMounted = false;
    };
  }, [testId, initExam]);

  // Current active essay
  const currentEssay = answers[activeTask] || '';
  const currentMinWords = activeTask === 1 ? prompts.task1.minWords : prompts.task2.minWords;
  const currentWordCount = useMemo(() => getWordCount(currentEssay), [currentEssay]);

  // Word counter styling logic
  let wordBadgeClass = 'text-red-400 bg-red-950/60 border-red-500/40';
  let wordStatusText = `${currentMinWords - currentWordCount} words below minimum`;

  if (currentWordCount >= currentMinWords) {
    wordBadgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    wordStatusText = 'Minimum word requirement satisfied';
  } else if (currentWordCount >= currentMinWords - 10) {
    wordBadgeClass = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    wordStatusText = `Almost there! ${currentMinWords - currentWordCount} words to minimum`;
  }

  // Handle textarea text change
  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(activeTask, e.target.value);
  };

  // Submit essay for instant AI evaluation
  const handleSubmitGrading = async () => {
    if (!currentEssay || currentEssay.trim().length === 0) {
      alert(`Please write your essay for Task ${activeTask} before submitting.`);
      return;
    }

    if (currentWordCount < 25) {
      if (
        !confirm(
          `Your Task ${activeTask} essay is only ${currentWordCount} words. IELTS requires at least ${currentMinWords} words. Are you sure you want to submit?`
        )
      ) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await fetch('/api/grade-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          taskNumber: activeTask,
          essay: currentEssay,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setUpgradeMessage(
          data.message ||
            'You have reached your AI grading limit. Upgrade to IELTS Master BD Pro for unlimited AI evaluations.'
        );
        setShowUpgradeModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to grade essay. Please try again.');
      }

      setEvaluation(data as AIWritingEvaluation);
      if (data.attemptId) {
        setLatestAttemptId(data.attemptId);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(err.message || 'An unexpected error occurred during grading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-neutral-400">Loading IELTS Writing simulator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col select-none">
      {/* INSPERA TOP HEADER BAR (Countdown timer, screen obscurer) */}
      <InsperaHeader
        testTitle={`${testTitle} (Task ${activeTask})`}
        totalQuestions={2}
        onSubmit={handleSubmitGrading}
      />

      {/* TASK SWITCHER TABS */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTask(1);
              setEvaluation(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTask === 1
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Task 1 (Report &bull; 150w)
            {answers[1] && answers[1].trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTask(2);
              setEvaluation(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTask === 2
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Task 2 (Essay &bull; 250w)
            {answers[2] && answers[2].trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {evaluation && (
          <button
            type="button"
            onClick={() => setEvaluation(null)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Return to Editor
          </button>
        )}
      </div>

      {/* MAIN CONTENT AREA: SPLIT-SCREEN OR REPORT CARD */}
      <div className="flex-1 overflow-hidden">
        {evaluation ? (
          /* ================= ON SUCCESS: AI REPORT CARD ================= */
          <div className="h-[calc(100vh-108px)] overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto space-y-6 select-text">
            {/* OVERALL HERO CARD */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-blue-400 border border-neutral-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Official British Council Examiner Standard
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  IELTS Writing Task {activeTask} Evaluation
                </h1>
                <p className="text-xs md:text-sm text-neutral-400">
                  Total Words Submitted: <strong className="text-white">{currentWordCount}</strong> &bull; Recommended Minimum:{' '}
                  <strong className="text-white">{currentMinWords}</strong>
                </p>
              </div>

              {/* OVERALL BAND CIRCLE */}
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform ${
                    evaluation.overallBand >= 7.0
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                      : evaluation.overallBand >= 6.0
                      ? 'border-amber-500 bg-amber-950/40 text-amber-400'
                      : 'border-rose-500 bg-rose-950/40 text-rose-400'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Band
                  </span>
                  <span className="text-4xl font-black">
                    {evaluation.overallBand.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 mt-2 font-medium">Overall Score</span>
              </div>
            </div>

            {/* 4 OFFICIAL CRITERIA CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Task Response
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {evaluation.taskResponse?.band?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {evaluation.taskResponse?.feedback}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Coherence & Cohesion
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {evaluation.coherenceCohesion?.band?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {evaluation.coherenceCohesion?.feedback}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Lexical Resource
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {evaluation.lexicalResource?.band?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {evaluation.lexicalResource?.feedback}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Grammatical Range
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {evaluation.grammaticalRange?.band?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {evaluation.grammaticalRange?.feedback}
                </p>
              </div>
            </div>

            {/* SENTENCE CORRECTIONS DIFF-STYLE */}
            {evaluation.sentenceCorrections && evaluation.sentenceCorrections.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  Sentence Corrections & Grammar Improvements
                </h3>
                <div className="space-y-3">
                  {evaluation.sentenceCorrections.map((sc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800/80 space-y-2 text-xs"
                    >
                      <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/40 text-rose-300">
                        <span className="font-bold text-rose-400 uppercase tracking-wider block mb-1">
                          Original:
                        </span>
                        <span className="line-through opacity-90">{sc.original}</span>
                      </div>

                      <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-300">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Revision:
                        </span>
                        <span>{sc.corrected}</span>
                      </div>

                      <div className="text-neutral-400 italic pt-1 flex items-start gap-1.5">
                        <span className="font-semibold text-neutral-300 not-italic">Reason:</span>
                        <span>{sc.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VOCABULARY UPGRADES TABLE */}
            {evaluation.vocabularyUpgrades && evaluation.vocabularyUpgrades.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Band 8+ Lexical Resource Upgrades
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="py-2.5 px-3">Basic Expression</th>
                        <th className="py-2.5 px-3">Band 8+ Alternative</th>
                        <th className="py-2.5 px-3">Contextual Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {evaluation.vocabularyUpgrades.map((vocab, idx) => (
                        <tr key={idx} className="hover:bg-neutral-800/30">
                          <td className="py-3 px-3 text-rose-300 font-medium">
                            {vocab.basicWord}
                          </td>
                          <td className="py-3 px-3 text-emerald-300 font-bold">
                            {vocab.band8Alternative}
                          </td>
                          <td className="py-3 px-3 text-neutral-300 italic">
                            &quot;{vocab.contextExample}&quot;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COLLAPSIBLE MODEL BAND 8 ESSAY */}
            {evaluation.modelBand8Essay && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsModelEssayOpen((prev) => !prev)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white">
                      Examiner&apos;s Band 8.5+ Model Essay Excerpt
                    </span>
                  </div>
                  {isModelEssayOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {isModelEssayOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-neutral-800/60 text-xs md:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-serif">
                    {evaluation.modelBand8Essay}
                  </div>
                )}
              </div>
            )}

            {/* ACTIONABLE NEXT STEPS CHECKLIST */}
            {evaluation.actionableNextSteps && evaluation.actionableNextSteps.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  Actionable Next Steps to Reach Your Target Band
                </h3>
                <div className="space-y-2.5">
                  {evaluation.actionableNextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950/70 rounded-lg border border-neutral-800/60 flex items-start gap-3 text-xs md:text-sm text-neutral-300"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEvaluation(null)}
                className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                Back to Edit Essay
              </button>

              <div className="flex items-center gap-3">
                {latestAttemptId && (
                  <button
                    type="button"
                    onClick={() => router.push(`/exam/${testId}/results/${latestAttemptId}`)}
                    className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                  >
                    View Official Results Page
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SPLIT-SCREEN EXAM ENGINE ================= */
          <div className="h-[calc(100vh-108px)] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            {/* LEFT COLUMN: TASK PROMPT & INSTRUCTIONS */}
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 bg-neutral-950">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {activeTask === 1 ? prompts.task1.title : prompts.task2.title}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Official IELTS Writing Task {activeTask} Prompt
                </h2>
                <p className="text-xs text-neutral-400">
                  {activeTask === 1
                    ? 'You should spend about 20 minutes on this task. Write at least 150 words.'
                    : 'You should spend about 40 minutes on this task. Write at least 250 words.'}
                </p>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
                <div className="text-sm md:text-base text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {activeTask === 1 ? prompts.task1.prompt : prompts.task2.prompt}
                </div>

                {(activeTask === 1 ? prompts.task1.imageUrl : prompts.task2.imageUrl) ? (
                  <div className="mt-4 rounded-lg overflow-hidden border border-neutral-800">
                    <img
                      src={activeTask === 1 ? prompts.task1.imageUrl : prompts.task2.imageUrl}
                      alt={`Writing Task ${activeTask} Chart/Diagram`}
                      className="w-full max-h-80 object-contain bg-white p-2"
                    />
                  </div>
                ) : activeTask === 1 ? (
                  <InternetAccessBarChart />
                ) : null}
              </div>

              <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80 text-xs text-neutral-400 space-y-2">
                <span className="font-bold text-neutral-300 uppercase tracking-wider block">
                  Examiner Assessment Criteria:
                </span>
                <ul className="list-disc list-inside space-y-1">
                  <li>Task Achievement / Task Response (25%)</li>
                  <li>Coherence & Cohesion (25%)</li>
                  <li>Lexical Resource (25%)</li>
                  <li>Grammatical Range & Accuracy (25%)</li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: TEXTAREA & LIVE WORD COUNTER */}
            <div className="h-full flex flex-col p-6 md:p-8 bg-neutral-950">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Your Response
                  </span>
                  <span className="text-xs text-neutral-500">
                    Auto-saved continuously in browser
                  </span>
                </div>

                <textarea
                  spellCheck={false}
                  autoComplete="off"
                  value={currentEssay}
                  onChange={handleEssayChange}
                  placeholder={`Write your IELTS Writing Task ${activeTask} essay here... (Spell-check is disabled to strictly simulate official Inspera CD-IELTS conditions)`}
                  className="flex-1 w-full bg-neutral-900 text-neutral-100 placeholder:text-neutral-600 rounded-xl p-5 text-base leading-relaxed border border-neutral-800 focus:border-blue-500 focus:outline-none resize-none font-sans"
                />
              </div>

              {/* BOTTOM TOOLBAR: WORD COUNTER & SUBMIT BUTTON */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${wordBadgeClass}`}
                  >
                    Words: {currentWordCount} / {currentMinWords} min
                  </div>
                  <span className="text-xs text-neutral-400 hidden sm:inline">
                    {wordStatusText}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {submitError && (
                    <span className="text-xs text-rose-400 truncate max-w-xs">
                      {submitError}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitGrading}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Grading with Examiner AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        <span>Submit for Instant AI Grading</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: UPGRADE TO PRO (ON 403 RATE LIMIT) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">AI Grading Limit Reached</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{upgradeMessage}</p>
            </div>

            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs space-y-2 text-neutral-300">
              <span className="font-bold text-white block uppercase tracking-wider">
                Unlock Pro Features:
              </span>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Unlimited AI Writing & Speaking evaluations</li>
                <li>Band 8+ Model Answers & Vocabulary Upgrades</li>
                <li>Instant bKash / Nagad verification</li>
                <li>Full mock tests and Cambridge Grader</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => router.push('/pricing')}
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WritingExamPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <WritingExamContent />
    </React.Suspense>
  );
}
