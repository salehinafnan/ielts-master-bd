'use client';

import React, { useEffect, useState, useRef, useMemo, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReadingListeningTestContent, QuestionItem } from '@/lib/types';
import { useExamStore } from '@/store/useExamStore';
import { InsperaHeader } from '@/components/exam/InsperaHeader';
import { InsperaFooter } from '@/components/exam/InsperaFooter';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { MobileExamWarning } from '@/components/exam/MobileExamWarning';
import { Volume2, VolumeX, Play, Pause, Lock, Loader2, AlertCircle } from 'lucide-react';

function ListeningExamContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  const [content, setContent] = useState<ReadingListeningTestContent | null>(null);
  const [testTitle, setTestTitle] = useState<string>('IELTS Listening Test');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

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
          setAudioUrl(data.audio_url || null);
          const parsedContent = data.content_json as ReadingListeningTestContent;
          setContent(parsedContent);
          initExam(`${testId}:listening`, 1800);
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
      return [{ start: 1, end: 40, label: 'Part 1' }];
    }
    return content.sections.map((sec, idx) => {
      const qNums = sec.questions.map((q) => q.questionNumber);
      const start = qNums.length > 0 ? Math.min(...qNums) : idx * 10 + 1;
      const end = qNums.length > 0 ? Math.max(...qNums) : (idx + 1) * 10;
      return {
        start,
        end,
        label: sec.title || `Part ${sec.sectionNumber}`,
      };
    });
  }, [content]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      lastTimeRef.current = audioRef.current.currentTime;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeeking = () => {
    if (audioRef.current) {
      const delta = Math.abs(audioRef.current.currentTime - lastTimeRef.current);
      if (delta > 0.5) {
        audioRef.current.currentTime = lastTimeRef.current;
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio playback error:', e));
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatAudioTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNavigate = (qNum: number) => {
    setCurrentQuestion(qNum);
    setTimeout(() => {
      const elem = document.getElementById(`question-${qNum}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
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
          moduleType: 'listening',
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
        <p className="text-slate-400 text-sm">Loading IELTS Listening Test...</p>
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

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 select-none">
      <MobileExamWarning moduleName="Listening" />

      <InsperaHeader
        testTitle={testTitle}
        totalQuestions={totalQuestions}
        onSubmit={handleSubmit}
        onNavigate={handleNavigate}
      />

      {/* Audio Player Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
        {audioUrl ? (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onLoadedMetadata={() => {
              if (audioRef.current) setDuration(audioRef.current.duration);
            }}
            onEnded={() => setIsPlaying(false)}
            preload="auto"
          />
        ) : null}

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!audioUrl}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="font-mono text-xs text-slate-300">
            <span>{formatAudioTime(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatAudioTime(duration || 0)}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>CD-IELTS Mode: Audio Seeking Locked</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
            className="text-slate-400 hover:text-white"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Single-Column Questions Main Container */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8 pb-8">
          {content.sections.map((section) => (
            <section
              key={section.sectionNumber}
              id={`section-${section.sectionNumber}`}
              className="space-y-4"
            >
              <div className="sticky top-0 z-10 py-2.5 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-300 dark:border-slate-800">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {section.title || `Part ${section.sectionNumber}`}
                </h2>
              </div>

              <div className="space-y-4">
                {section.questions.map((q) => (
                  <QuestionRenderer
                    key={q.questionNumber}
                    question={q}
                    questionNumber={q.questionNumber}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
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

export default function ListeningExamPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ListeningExamContent />
    </React.Suspense>
  );
}