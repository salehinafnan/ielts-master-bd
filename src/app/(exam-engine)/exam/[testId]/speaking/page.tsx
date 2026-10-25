'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AISpeakingEvaluation } from '@/lib/types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  Award,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Lock,
  BookOpen,
  HelpCircle,
  FileText,
  Radio,
  ExternalLink,
} from 'lucide-react';

type SpeakingPhase =
  | 'INTRO'
  | 'PART_1'
  | 'PART_2_PREP'
  | 'PART_2_SPEAK'
  | 'PART_3'
  | 'COMPLETED';

interface SpokenSegment {
  part: string;
  question: string;
  response: string;
  audioUrl?: string;
}

interface SpeakingContent {
  part1: {
    topic: string;
    questions: string[];
  };
  part2: {
    topic: string;
    cueCard: {
      title: string;
      prompts: string[];
    };
  };
  part3: {
    topic: string;
    questions: string[];
  };
}

const DEFAULT_CONTENT: SpeakingContent = {
  part1: {
    topic: 'Hometown & Daily Routine',
    questions: [
      'Where is your hometown, and what do you like most about living there?',
      'How has your hometown developed or changed over the past few years?',
      'Do you prefer studying or working in the early morning or at night? Why?',
      'What kinds of leisure activities do you enjoy most on your weekends?',
    ],
  },
  part2: {
    topic: 'An Important Decision',
    cueCard: {
      title: 'Describe a difficult decision that you made recently.',
      prompts: [
        'What the decision was',
        'When and why you had to make it',
        'What other options or choices were available to you',
        'And explain how you felt after making this decision.',
      ],
    },
  },
  part3: {
    topic: 'Decision Making & Society',
    questions: [
      'Why do you think some people find it especially difficult to make important decisions?',
      'Should young adults always consult their family before making career choices?',
      'How has modern artificial intelligence and data impacted personal decision-making?',
      'In what ways do business leaders make balanced choices when under immense public pressure?',
    ],
  },
};

function SpeakingExamContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  // Exam Phase State Machine
  const [phase, setPhase] = useState<SpeakingPhase>('INTRO');
  const [testTitle, setTestTitle] = useState<string>('IELTS Speaking Official Simulator');
  const [content, setContent] = useState<SpeakingContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState<boolean>(true);

  // Question Iterators
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(60);
  const [speakSecondsLeft, setSpeakSecondsLeft] = useState<number>(120);
  const [prepNotes, setPrepNotes] = useState<string>('');

  // Audio & Speech Recognition State
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [segments, setSegments] = useState<SpokenSegment[]>([]);

  // AI Evaluation State
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AISpeakingEvaluation | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string>('');

  // Refs for audio media recording & speech recognition
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // 1. Initial test data & speech API verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSpeechSupported(Boolean(hasSpeech));
    }

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
          console.warn('Could not load test from database, using official defaults:', error.message);
        }

        if (data?.title) {
          setTestTitle(data.title);
        }

        if (data?.content_json) {
          const c = data.content_json as any;
          if (c.part1 && c.part2 && c.part3) {
            setContent(c as SpeakingContent);
          }
        }
      } catch (err) {
        console.error('Error fetching speaking test:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTest();

    return () => {
      stopRecording();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [testId]);

  // 2. Browser Voice Synthesis (British Council Examiner style)
  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.lang = 'en-GB';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang === 'en-GB' ||
        v.name.includes('British') ||
        v.name.includes('UK') ||
        v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setIsExaminerSpeaking(true);
    utterance.onend = () => {
      setIsExaminerSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsExaminerSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 3. Start Media Recording + Speech Recognition
  const startRecording = async () => {
    try {
      if (isRecordingRef.current) return;

      // Request microphone access
      if (!activeStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        activeStreamRef.current = stream;
      }

      // Initialize MediaRecorder
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(activeStreamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      // Initialize SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final) {
            setCurrentResponse((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e.error);
        };

        recognition.onend = () => {
          // Restart recognition if phase is actively recording
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      isRecordingRef.current = true;
      setIsMicActive(true);
    } catch (err: any) {
      console.error('Microphone initialization error:', err);
      alert('Microphone access is required for the IELTS Speaking test. Please allow mic permissions.');
    }
  };

  // 4. Stop Recording & extract audio URL
  const stopRecording = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      isRecordingRef.current = false;
      setIsMicActive(false);
      setInterimTranscript('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        recognitionRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(undefined);
          }
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(undefined);
      }
    });
  };

  // 5. State Machine Transition Handlers
  const handleStartExam = () => {
    setPhase('PART_1');
    setCurrentQIndex(0);
    setCurrentResponse('');
    setSegments([]);

    // Prompt the first question
    const q1 = content.part1.questions[0];
    speakText(`Let's start with Part 1. ${q1}`, () => {
      startRecording();
    });
  };

  // Handle advancing through questions in Part 1
  const handleNextPart1Question = async () => {
    const audioUrl = await stopRecording();
    const currentQText = content.part1.questions[currentQIndex];

    const newSegment: SpokenSegment = {
      part: 'Part 1: Introduction & Interview',
      question: currentQText,
      response: currentResponse.trim(),
      audioUrl,
    };

    setSegments((prev) => [...prev, newSegment]);
    setCurrentResponse('');

    const nextIndex = currentQIndex + 1;
    if (nextIndex < content.part1.questions.length) {
      setCurrentQIndex(nextIndex);
      const nextQText = content.part1.questions[nextIndex];
      speakText(nextQText, () => {
        startRecording();
      });
    } else {
      // Transition to Part 2 Preparation
      setPhase('PART_2_PREP');
      setPrepSecondsLeft(60);
      speakText(
        'Thank you. That is the end of Part 1. Now, we will move on to Part 2. You will have one minute to prepare your notes, then you will speak for two minutes.'
      );
    }
  };

  // Countdown timer for Part 2 Prep (60 seconds)
  useEffect(() => {
    let timer: any = null;
    if (phase === 'PART_2_PREP') {
      timer = setInterval(() => {
        setPrepSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleStartPart2Speaking();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);

  // Start Part 2 Speaking (2 minutes)
  const handleStartPart2Speaking = () => {
    setPhase('PART_2_SPEAK');
    setSpeakSecondsLeft(120);
    setCurrentResponse('');

    speakText('Your preparation time is up. Please begin speaking now.', () => {
      startRecording();
    });
  };

  // Countdown timer for Part 2 Speaking (120 seconds)
  useEffect(() => {
    let timer: any = null;
    if (phase === 'PART_2_SPEAK') {
      timer = setInterval(() => {
        setSpeakSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishPart2();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);

  // Finish Part 2 & Transition to Part 3
  const handleFinishPart2 = async () => {
    const audioUrl = await stopRecording();
    const cueCard = content.part2.cueCard;

    const newSegment: SpokenSegment = {
      part: 'Part 2: Individual Long Turn',
      question: `${cueCard.title} (${cueCard.prompts.join('; ')})`,
      response: currentResponse.trim(),
      audioUrl,
    };

    setSegments((prev) => [...prev, newSegment]);
    setCurrentResponse('');
    setCurrentQIndex(0);
    setPhase('PART_3');

    const p3q1 = content.part3.questions[0];
    speakText(
      `Thank you. We have been discussing an important decision, and I would now like to ask you some more general questions related to this in Part 3. ${p3q1}`,
      () => {
        startRecording();
      }
    );
  };

  // Handle advancing through questions in Part 3
  const handleNextPart3Question = async () => {
    const audioUrl = await stopRecording();
    const currentQText = content.part3.questions[currentQIndex];

    const newSegment: SpokenSegment = {
      part: 'Part 3: Two-way Discussion',
      question: currentQText,
      response: currentResponse.trim(),
      audioUrl,
    };

    const updatedSegments = [...segments, newSegment];
    setSegments(updatedSegments);
    setCurrentResponse('');

    const nextIndex = currentQIndex + 1;
    if (nextIndex < content.part3.questions.length) {
      setCurrentQIndex(nextIndex);
      const nextQText = content.part3.questions[nextIndex];
      speakText(nextQText, () => {
        startRecording();
      });
    } else {
      // Exam Completed
      setPhase('COMPLETED');
      speakText(
        'Thank you very much. That is the end of the speaking test. You may now review your responses and receive your instant AI evaluation.'
      );
    }
  };

  // 6. Submit Speaking Attempt for Instant AI Grading
  const handleGetAIFeedback = async () => {
    try {
      setIsGrading(true);
      const res = await fetch('/api/grade-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          transcripts: segments.map((s) => ({
            part: s.part,
            question: s.question,
            response: s.response,
          })),
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
        throw new Error(data.error || 'Failed to grade speaking test.');
      }

      setEvaluation(data as AISpeakingEvaluation);
      if (data.attemptId) {
        setAttemptId(data.attemptId);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while evaluating speaking attempt.');
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-neutral-400">Loading IELTS Speaking Examiner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col select-none">
      {/* HEADER BAR */}
      <header className="h-14 bg-neutral-900 border-b border-neutral-800 text-white px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="font-semibold text-sm md:text-base text-neutral-200 truncate">
            {testTitle}
          </span>
        </div>

        {/* Live Mic Indicator */}
        <div className="flex items-center gap-4">
          {isMicActive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-bold tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>RECORDING</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-medium">
              <MicOff className="w-3.5 h-3.5" />
              <span>MIC IDLE</span>
            </div>
          )}

          {isExaminerSpeaking && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400 text-xs font-semibold animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Examiner Speaking</span>
            </div>
          )}
        </div>
      </header>

      {/* SPEECH RECOGNITION FALLBACK WARNING */}
      {!isSpeechSupported && (
        <div className="bg-amber-950/80 border-b border-amber-600/50 px-4 py-2.5 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your browser doesn&apos;t support the Web Speech Recognition API. For live transcription,
              we strongly recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
            </span>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* ================= 1. INTRO PHASE ================= */}
        {phase === 'INTRO' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-8">
            <div className="w-20 h-20 rounded-3xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/50">
              <Mic className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-blue-400 border border-neutral-700">
                Official British Council Format
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                IELTS Speaking Test Simulator
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                This test simulates the real IELTS Speaking interview. Your computer acts as the
                certified examiner, asking questions aloud and recording your responses with live
                transcription.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                <span className="font-bold text-blue-400 block uppercase">Part 1 (4-5 mins)</span>
                <p className="text-neutral-300">Introduction & familiar everyday topics.</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                <span className="font-bold text-blue-400 block uppercase">Part 2 (3-4 mins)</span>
                <p className="text-neutral-300">Cue card talk with 1 min prep & 2 mins speaking.</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                <span className="font-bold text-blue-400 block uppercase">Part 3 (4-5 mins)</span>
                <p className="text-neutral-300">Two-way in-depth analytical discussion.</p>
              </div>
            </div>

            <div className="pt-4 w-full max-w-xs">
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <span>Start Speaking Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-neutral-500 mt-2">
                Make sure you are in a quiet room and your microphone is plugged in.
              </p>
            </div>
          </div>
        )}

        {/* ================= 2. PART 1: INTERVIEW ================= */}
        {phase === 'PART_1' && (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Part 1: Introduction & Interview &bull; Question {currentQIndex + 1} of{' '}
                  {content.part1.questions.length}
                </span>
                <span className="text-xs text-neutral-400">Topic: {content.part1.topic}</span>
              </div>

              {/* Examiner Question Card */}
              <div className="p-6 md:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 block mb-1">
                      Examiner:
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                      &quot;{content.part1.questions[currentQIndex]}&quot;
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => speakText(content.part1.questions[currentQIndex])}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Repeat Question
                  </button>
                </div>
              </div>

              {/* Live Transcript Area */}
              <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2 min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800/80">
                  <span className="font-semibold uppercase tracking-wider">Candidate Live Transcript</span>
                  {isMicActive && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Listening...
                    </span>
                  )}
                </div>

                <div className="flex-1 text-sm md:text-base text-neutral-200 leading-relaxed font-sans select-text pt-2">
                  {currentResponse ? (
                    <span>{currentResponse}</span>
                  ) : (
                    <span className="text-neutral-500 italic">
                      Start speaking your answer... Live transcription will appear here.
                    </span>
                  )}
                  {interimTranscript && (
                    <span className="text-neutral-400 italic"> {interimTranscript}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                Aim for 3-4 full sentences per question.
              </span>

              <button
                type="button"
                onClick={handleNextPart1Question}
                className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {currentQIndex + 1 < content.part1.questions.length
                    ? 'Next Question'
                    : 'Proceed to Part 2'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. PART 2 PREP: 60 SECONDS ================= */}
        {phase === 'PART_2_PREP' && (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Part 2: Preparation Time (1 Minute)
                </span>
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40">
                  <Clock className="w-4 h-4" />
                  <span>00:{String(prepSecondsLeft).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Cue Card */}
              <div className="p-6 md:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                    Candidate Task Card
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {content.part2.cueCard.title}
                  </h2>
                </div>

                <div className="space-y-2 text-sm text-neutral-300">
                  <p className="font-semibold text-neutral-200">You should say:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-300">
                    {content.part2.cueCard.prompts.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scratchpad for notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Candidate Scratchpad (Rough Notes)
                  </span>
                  <span>Microphone is currently OFF</span>
                </div>
                <textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  placeholder="Type rough keywords and bullet points here to structure your 2-minute response..."
                  className="w-full h-32 bg-neutral-900 text-neutral-100 rounded-xl p-4 text-sm border border-neutral-800 focus:border-blue-500 focus:outline-none resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                You will speak continuously for 1 to 2 minutes when the timer ends.
              </span>

              <button
                type="button"
                onClick={handleStartPart2Speaking}
                className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>I&apos;m Ready &bull; Start Speaking Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= 4. PART 2 SPEAK: 2 MINUTES ================= */}
        {phase === 'PART_2_SPEAK' && (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Part 2: Long Turn &bull; Speaking Time
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor(speakSecondsLeft / 60)}:
                    {String(speakSecondsLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Cue Card & Notes Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">
                    Cue Card Reference
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {content.part2.cueCard.title}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 pl-1">
                    {content.part2.cueCard.prompts.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">
                    Your Prepared Notes
                  </span>
                  <div className="text-xs font-mono text-neutral-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {prepNotes ? prepNotes : <span className="text-neutral-500 italic">No notes written.</span>}
                  </div>
                </div>
              </div>

              {/* Live Transcript Area */}
              <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2 min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800/80">
                  <span className="font-semibold uppercase tracking-wider">Candidate Live Transcript</span>
                  {isMicActive && (
                    <span className="text-red-400 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Recording Spoken Turn...
                    </span>
                  )}
                </div>

                <div className="flex-1 text-sm md:text-base text-neutral-200 leading-relaxed font-sans select-text pt-2">
                  {currentResponse ? (
                    <span>{currentResponse}</span>
                  ) : (
                    <span className="text-neutral-500 italic">
                      Speak clearly into your microphone... Your 2-minute talk is being recorded.
                    </span>
                  )}
                  {interimTranscript && (
                    <span className="text-neutral-400 italic"> {interimTranscript}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                Recording auto-stops when the 2-minute timer reaches 00:00.
              </span>

              <button
                type="button"
                onClick={handleFinishPart2}
                className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Done Speaking (Advance to Part 3)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. PART 3: DISCUSSION ================= */}
        {phase === 'PART_3' && (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Part 3: Two-way Discussion &bull; Question {currentQIndex + 1} of{' '}
                  {content.part3.questions.length}
                </span>
                <span className="text-xs text-neutral-400">Topic: {content.part3.topic}</span>
              </div>

              {/* Examiner Question Card */}
              <div className="p-6 md:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 block mb-1">
                      Examiner:
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                      &quot;{content.part3.questions[currentQIndex]}&quot;
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => speakText(content.part3.questions[currentQIndex])}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Repeat Question
                  </button>
                </div>
              </div>

              {/* Live Transcript Area */}
              <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2 min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800/80">
                  <span className="font-semibold uppercase tracking-wider">Candidate Live Transcript</span>
                  {isMicActive && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Listening...
                    </span>
                  )}
                </div>

                <div className="flex-1 text-sm md:text-base text-neutral-200 leading-relaxed font-sans select-text pt-2">
                  {currentResponse ? (
                    <span>{currentResponse}</span>
                  ) : (
                    <span className="text-neutral-500 italic">
                      Start speaking your analytical answer...
                    </span>
                  )}
                  {interimTranscript && (
                    <span className="text-neutral-400 italic"> {interimTranscript}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                Provide reasoned arguments and illustrative examples.
              </span>

              <button
                type="button"
                onClick={handleNextPart3Question}
                className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {currentQIndex + 1 < content.part3.questions.length
                    ? 'Next Question'
                    : 'Complete Speaking Exam'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= 6. COMPLETED & AI REPORT CARD ================= */}
        {phase === 'COMPLETED' && (
          <div className="flex-1 space-y-8 select-text pb-12">
            {!evaluation ? (
              /* Review Transcript Summary before AI Grading */
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-emerald-400 border border-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Interview Completed
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                      Full Speaking Transcript Summary
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-400">
                      Review your transcribed spoken responses and listen to audio recordings below
                      before submitting for certified AI examiner evaluation.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isGrading}
                    onClick={handleGetAIFeedback}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Fluency & Band...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        <span>Get Instant AI Feedback</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Segments List with Audio Playback */}
                <div className="space-y-4">
                  {segments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="font-bold text-blue-400 uppercase tracking-wider">
                          {seg.part}
                        </span>
                        <span>Item #{idx + 1}</span>
                      </div>

                      <div className="text-sm font-semibold text-white">
                        Q: {seg.question}
                      </div>

                      <div className="p-3.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 text-xs md:text-sm text-neutral-300 leading-relaxed">
                        {seg.response || (
                          <span className="text-neutral-500 italic">(No response transcribed)</span>
                        )}
                      </div>

                      {seg.audioUrl && (
                        <div className="pt-1">
                          <audio
                            controls
                            src={seg.audioUrl}
                            className="w-full h-8 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Display Rich AI Evaluation Report Card */
              <div className="space-y-6">
                {/* Hero Overall Band */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-blue-400 border border-neutral-700">
                      <Award className="w-3.5 h-3.5" />
                      Official IELTS Speaking Band Assessment
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                      Examiner Speaking Evaluation
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-400">
                      Total Words Spoken: <strong className="text-white">{evaluation.wordCount}</strong> &bull; Filler
                      Words Detected:{' '}
                      <strong className="text-amber-400">
                        {evaluation.fillerWordsDetected?.length || 0}
                      </strong>
                    </p>
                  </div>

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

                {/* 4 Official Criteria Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-between justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Fluency & Coherence
                      </span>
                      <span className="text-lg font-black text-blue-400">
                        {evaluation.fluencyCoherence?.band?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {evaluation.fluencyCoherence?.feedback}
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-between justify-between">
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
                    <div className="flex items-between justify-between">
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

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-between justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Pronunciation
                      </span>
                      <span className="text-lg font-black text-blue-400">
                        {evaluation.pronunciation?.band?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {evaluation.pronunciation?.feedback}
                    </p>
                  </div>
                </div>

                {/* Filler Words Detected */}
                {evaluation.fillerWordsDetected && evaluation.fillerWordsDetected.length > 0 && (
                  <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Filler Words Detected &bull; Practice Pausing Silently
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.fillerWordsDetected.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold"
                        >
                          &quot;{w}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Answer Excerpt */}
                {evaluation.modelAnswerExcerpt && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      Examiner&apos;s Band 8.5+ Spoken Model Excerpt
                    </h3>
                    <div className="p-4 bg-neutral-950/80 rounded-lg border border-neutral-800 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                      {evaluation.modelAnswerExcerpt}
                    </div>
                  </div>
                )}

                {/* Actionable Next Steps */}
                {evaluation.actionableNextSteps && evaluation.actionableNextSteps.length > 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Actionable Steps to Reach Your Target Speaking Band
                    </h3>
                    <div className="space-y-2.5">
                      {evaluation.actionableNextSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-neutral-950/70 rounded-lg border border-neutral-800/60 flex items-start gap-3 text-xs md:text-sm text-neutral-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluation(null);
                      setPhase('INTRO');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                  >
                    Practice Another Topic
                  </button>

                  <div className="flex items-center gap-3">
                    {attemptId && (
                      <button
                        type="button"
                        onClick={() => router.push(`/exam/${testId}/results/${attemptId}`)}
                        className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                      >
                        View Official Report
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
            )}
          </div>
        )}
      </main>

      {/* UPGRADE MODAL (403 RATE LIMIT) */}
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
                <li>Unlimited AI Speaking & Writing evaluations</li>
                <li>Live pronunciation & fluency feedback</li>
                <li>Instant bKash / Nagad automated checkout</li>
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

export default function SpeakingExamPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <SpeakingExamContent />
    </React.Suspense>
  );
}
