'use client';

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReadingListeningTestContent, QuestionItem } from '@/lib/types';
import { useExamStore } from '@/store/useExamStore';
import { InsperaHeader } from '@/components/exam/InsperaHeader';
import { InsperaFooter } from '@/components/exam/InsperaFooter';
import { HighlightableText } from '@/components/exam/HighlightableText';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { MobileExamWarning } from '@/components/exam/MobileExamWarning';
import { Loader2, AlertCircle, BookOpen, HelpCircle } from 'lucide-react';

function ReadingExamContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  const [content, setContent] = useState<ReadingListeningTestContent | null>(null);
  const [testTitle, setTestTitle] = useState<string>('IELTS Reading Test');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [mobileViewPane, setMobileViewPane] = useState<'passage' | 'questions'>('passage');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const answers = useExamStore((state) => state.answers);
  const initExam = useExamStore((state) => state.initExam);
  const resetExam = useExamStore((state) => state.resetExam);

  useEffect(() => {
    if (!testId) return;

    let isMounted = true;
    async function fetchTest() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await fetch(`/api/tests/${testId}`);
        const data = await res.json();

        if (res.status === 403) {
          router.push('/pricing');
          return;
        }

        if (!res.ok || !data) {
          throw new Error(data?.error || 'Failed to load test details.');
        }

        if (isMounted) {
          setTestTitle(data.title);
          const parsedContent = data.content_json as ReadingListeningTestContent;
          setContent(parsedContent);
          initExam(`${testId}:reading`, 3600);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTest();

    return () => {
      isMounted = false;
    };
  }, [testId, initExam, router]);

  const allQuestions = useMemo<QuestionItem[]>(() => {
    if (!content?.sections) return [];
    return content.sections.flatMap((s) => s.questions || []);
  }, [content]);

  const totalQuestions = useMemo(() => {
    if (allQuestions.length === 0) return 40;
    return Math.max(...allQuestions.map((q) => q.questionNumber), 40);
  }, [allQuestions]);

  const footerSections = useMemo(() => {
    if (!content?.sections || content.sections.length === 0) {
      return [{ start: 1, end: 40, label: 'Reading Passage' }];
    }
    return content.sections.map((sec, idx) => {
      const qNums = sec.questions.map((q) => q.questionNumber);
      const start = qNums.length > 0 ? Math.min(...qNums) : idx * 13 + 1;
      const end = qNums.length > 0 ? Math.max(...qNums) : (idx + 1) * 13;
      return {
        start,
        end,
        label: sec.title || `Passage ${sec.sectionNumber}`,
      };
    });
  }, [content]);

  const handleNavigate = (qNum: number) => {
    setCurrentQuestion(qNum);
    setMobileViewPane('questions');

    if (content?.sections) {
      const secIdx = content.sections.findIndex((sec) =>
        sec.questions.some((q) => q.questionNumber === qNum)
      );
      if (secIdx !== -1 && secIdx !== activeSectionIdx) {
        setActiveSectionIdx(secIdx);
      }
    }

    setTimeout(() => {
      const elem = document.getElementById(`question-${qNum}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/grade-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          userAnswers: answers,
          moduleType: 'reading',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.attemptId) {
        throw new Error(data.error || 'Failed to submit test.');
      }

      resetExam();
      startTransition(() => {
        router.push(`/exam/${testId}/results/${data.attemptId}`);
      });
    } catch (err: any) {
      alert(`Submission Error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm">Loading IELTS Reading Test...</p>
      </div>
    );
  }

  if (errorMsg || !content) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to Load Exam</h2>
          <p className="text-slate-400 text-sm">{errorMsg || 'Test content could not be retrieved.'}</p>
          <button
            type="button"
            onClick={() => router.push('/tests')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Back to Tests Catalog
          </button>
        </div>
      </div>
    );
  }

  const currentSection = content.sections[activeSectionIdx] || content.sections[0];

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 select-none">
      <MobileExamWarning moduleName="Academic Reading" />

      <InsperaHeader
        testTitle={testTitle}
        totalQuestions={totalQuestions}
        onSubmit={handleSubmit}
        onNavigate={handleNavigate}
      />

      {/* Mobile / Tablet Pane Switcher & Passage Tabs */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-col gap-2 shrink-0">
        {content.sections.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {content.sections.map((sec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSectionIdx === idx
                    ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {sec.title || `Passage ${sec.sectionNumber}`}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMobileViewPane('passage')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mobileViewPane === 'passage'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Passage</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewPane('questions')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mobileViewPane === 'questions'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions (1–{totalQuestions})</span>
          </button>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Passage with Highlighting */}
        <section
          className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex-col ${
            mobileViewPane === 'passage' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {content.sections.length > 1 && (
            <div className="hidden lg:flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 shrink-0 flex-wrap">
              {content.sections.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeSectionIdx === idx
                      ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {sec.title || `Passage ${sec.sectionNumber}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              {currentSection.title || `Reading Passage ${currentSection.sectionNumber}`}
            </h2>
            <HighlightableText
              paragraphId={`passage-${testId}-${currentSection.sectionNumber}`}
              html={
                currentSection.passageHtml ||
                '<p className="text-slate-500 italic">No passage text provided for this section.</p>'
              }
            />
          </div>
        </section>

        {/* Right Pane: Question Renderer */}
        <section
          className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/80 space-y-6 ${
            mobileViewPane === 'questions' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="space-y-6">
            {content.sections.map((sec, secIdx) => {
              const isCurrent = secIdx === activeSectionIdx;
              return (
                <div key={sec.sectionNumber} className="space-y-4">
                  <div className="sticky top-0 z-10 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {sec.title || `Section ${sec.sectionNumber}`} Questions
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSectionIdx(secIdx);
                        setMobileViewPane('passage');
                      }}
                      className={`text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline ${
                        isCurrent ? 'lg:hidden' : ''
                      }`}
                    >
                      View Passage
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sec.questions.map((q) => (
                      <QuestionRenderer
                        key={q.questionNumber}
                        question={q}
                        questionNumber={q.questionNumber}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <InsperaFooter
        totalQuestions={totalQuestions}
        sections={footerSections}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function ReadingExamPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ReadingExamContent />
    </React.Suspense>
  );
}