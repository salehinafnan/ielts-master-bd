'use client';

import React, { useState, useRef } from 'react';
import {
  InteractiveLabType,
  BANNED_CLICHES_DICTIONARY,
  TOP_10_LETHAL_SPELLINGS,
} from '@/lib/curriculum-data';
import { useAcademyStore } from '@/store/useAcademyStore';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Volume2,
  Keyboard,
  Copy,
  Eye,
  AlertTriangle,
  Mic,
  Square,
  RotateCcw,
} from 'lucide-react';

interface InteractiveLabsProps {
  labType: InteractiveLabType;
}

const SAMPLE_WPM_SENTENCE =
  'In conclusion, I firmly support the inclusion of mandatory community work in high school curricula because it broadens social perspectives and equips young people with practical competencies.';

export function InteractiveLabs({ labType }: InteractiveLabsProps) {
  switch (labType) {
    case 'cd1-copy-paste':
      return <Cd1CopyPasteAndWpmLab />;
    case 'l3-audio-sync':
      return <L3AudioSyncAndSpellingLab />;
    case 'r5-tfng-split':
      return <R5TfngSplitScreenLab />;
    case 'wt1-report-lab':
      return <Wt1ReportDeconstructorLab />;
    case 'wt2-examiner-vision':
      return <Wt2ExaminerVisionAndClicheLab />;
    case 's1-phonetic-mirror':
      return <S1PhoneticMirrorAndAreaLab />;
    case 'bg1-article-fixer':
    case 'bg2-preposition-pyramid':
    default:
      return <Bg1ArticleAndPrepositionLab />;
  }
}

/* 1. CD-1 LAB: Copy-Paste Split Screen + Typing Speed (WPM) Benchmark */
function Cd1CopyPasteAndWpmLab() {
  const updateWpm = useAcademyStore((state) => state.updateWpm);
  const bestWpm = useAcademyStore((state) => state.bestWpm);

  const [blank1, setBlank1] = useState('');
  const [blank2, setBlank2] = useState('');

  // WPM tester state
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [liveWpm, setLiveWpm] = useState<number>(0);

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const now = Date.now();
    let start = startTime;
    if (!start && val.length === 1) {
      start = now;
      setStartTime(now);
    }
    setTypedText(val);

    if (start && val.trim().length > 5) {
      const elapsedMinutes = Math.max((now - start) / 60000, 0.05);
      const words = val.trim().split(/\s+/).length;
      const calculated = Math.round(words / elapsedMinutes);
      setLiveWpm(calculated);
      if (val.trim().length >= 60) {
        updateWpm(calculated);
      }
    }
  };

  const handleResetWpm = () => {
    setTypedText('');
    setStartTime(null);
    setLiveWpm(0);
  };

  const b1Correct = blank1.trim().toLowerCase() === 'photosynthesis';
  const b2Correct = blank2.trim().toLowerCase() === 'infrastructure';

  return (
    <div className="space-y-6">
      {/* Part A: Split-Screen Copy-Paste Drill */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            Part A: Split-Screen Ctrl+C / Ctrl+V Accuracy Drill
          </span>
          <span className="text-slate-400">Double-click bold words to copy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          <div className="p-4 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed select-text">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Simulated Reading Passage (Left Pane)
            </div>
            <p>
              Botanical researchers confirmed that artificial LED arrays accelerate{' '}
              <strong className="text-blue-600 dark:text-blue-400 underline decoration-dotted cursor-pointer">
                photosynthesis
              </strong>{' '}
              in vertical urban farms while reducing municipal water{' '}
              <strong className="text-blue-600 dark:text-blue-400 underline decoration-dotted cursor-pointer">
                infrastructure
              </strong>{' '}
              demands by nearly forty percent.
            </p>
          </div>

          <div className="p-4 space-y-3 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Question Input Boxes (Right Pane)
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300 block">
                1. LED arrays accelerate ____________ in vertical farms.
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={blank1}
                  onChange={(e) => setBlank1(e.target.value)}
                  placeholder="Paste or type exact word..."
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
                {blank1 && (
                  b1Correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300 block">
                2. Reduces municipal water ____________ demands.
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={blank2}
                  onChange={(e) => setBlank2(e.target.value)}
                  placeholder="Paste or type exact word..."
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
                {blank2 && (
                  b2Correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Physical Keyboard WPM Benchmark */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Part B: CD-IELTS 35 WPM Typing Speed Benchmark
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                liveWpm >= 35
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              Live Speed: {liveWpm} WPM
            </span>
            {bestWpm > 0 && (
              <span className="text-xs text-slate-500">Best: {bestWpm} WPM</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed select-none">
          {SAMPLE_WPM_SENTENCE}
        </div>

        <textarea
          rows={3}
          value={typedText}
          onChange={handleTypingChange}
          placeholder="Start typing the sentence above on your keyboard to measure your real CD-IELTS WPM..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
        />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Target Benchmark: <strong>35+ WPM</strong> (Allows finishing 300 words in ~8.5 mins)
          </span>
          <button
            type="button"
            onClick={handleResetWpm}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Timer
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2. L-3 LAB: Audio-Sync Distractor Reveal + Top 10 Lethal Spellings */
function L3AudioSyncAndSpellingLab() {
  const [activeLine, setActiveLine] = useState<number | null>(0);
  const [revealDistractors, setRevealDistractors] = useState(true);
  const [spellingAttempt, setSpellingAttempt] = useState<Record<number, string>>({});

  const transcriptLines = [
    {
      speaker: 'Agent',
      text: 'Thank you for calling Skyward Air. Can I take your preliminary booking code?',
      distractor: null,
      answer: null,
      note: 'Listen for the anchor phrase "booking code" (matches "Flight Reference").',
    },
    {
      speaker: 'Customer',
      text: 'Yes, it’s JX-401... no, hold on, my wife handed me the old receipt. The current one is JX-411.',
      distractor: 'JX-401',
      answer: 'JX-411',
      note: 'Mind-Changer Trap! "JX-401" is spoken first, then negated with "no, hold on".',
    },
    {
      speaker: 'Customer',
      text: 'We must be there for my brother’s wedding on the 21st of July, though we depart Dhaka on the 20th.',
      distractor: '20th July (Departure)',
      answer: '21st July (Target Arrival)',
      note: 'Anchor Alignment: Question asks for "Target Arrival Date", not departure date.',
    },
    {
      speaker: 'Agent',
      text: 'Seats are open for that leg at eighty pounds (£80), although an expired flash promo was eighteen pounds (£18).',
      distractor: '18 (-teen stress)',
      answer: '80 (-ty stress, type digits only)',
      note: 'Teen vs. Ty + Static Symbol Rule: Since "£" is already printed before the box, type only "80".',
    },
  ];

  const speakSegment = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Interactive Audio-Sync Transcript (Click any line to hear &amp; dissect)
          </h4>
          <button
            type="button"
            onClick={() => setRevealDistractors((p) => !p)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              revealDistractors
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {revealDistractors ? 'Distractor Radar: ON' : 'Distractor Radar: OFF'}
          </button>
        </div>

        <div className="space-y-2.5">
          {transcriptLines.map((line, idx) => {
            const isSelected = activeLine === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveLine(idx);
                  speakSegment(line.text);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs sm:text-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {line.speaker}:
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Play Audio
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{line.text}</p>

                {revealDistractors && (line.distractor || line.answer) && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-xs">
                    {line.distractor && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold line-through">
                        Distractor: {line.distractor}
                      </span>
                    )}
                    {line.answer && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                        Correct Key: {line.answer}
                      </span>
                    )}
                    <span className="text-slate-500 dark:text-slate-400 italic">
                      {line.note}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Double-Consonant Quick Check */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Double-Consonant Spelling Check (Type the correct spelling)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOP_10_LETHAL_SPELLINGS.slice(0, 4).map((item, idx) => {
            const val = spellingAttempt[idx] || '';
            const isMatch = val.trim().toLowerCase() === item.correct.toLowerCase();
            return (
              <div
                key={item.correct}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-rose-500 line-through font-mono">
                    Trap: {item.misspellings[0]}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.tip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) =>
                      setSpellingAttempt((p) => ({ ...p, [idx]: e.target.value }))
                    }
                    placeholder="Type correct spelling..."
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  {val && (
                    isMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* 3. R-5 LAB: 1:1 Split-Screen T/F/NG Mini-Simulator with Reveal Logic Switch */
function R5TfngSplitScreenLab() {
  const [revealEvidence, setRevealEvidence] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = [
    {
      num: 1,
      stem: 'Early commercial flights using turbo-propeller engines were unable to travel across whole continents without landing.',
      correct: 'FALSE',
      evidenceQuote: 'permitted non-stop travel across continental distances',
      reason: 'Direct contradiction: "non-stop travel" directly contradicts "unable to travel... without landing".',
    },
    {
      num: 2,
      stem: 'The Boeing 747 was cheaper to manufacture than earlier commercial aircraft.',
      correct: 'NOT GIVEN',
      evidenceQuote: 'economics of scale reduced airfares sufficiently',
      reason: 'The text mentions lower ticket airfares, NOT factory manufacturing costs.',
    },
    {
      num: 3,
      stem: 'Before 1970, international holiday travel was unaffordable for average-income households.',
      correct: 'TRUE',
      evidenceQuote: 'exclusive luxury of high-net-worth individuals... until 1970',
      reason: '100% semantic alignment: exclusive to high-net-worth individuals until 1970 = unaffordable for average households before 1970.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Split-Screen Reading Verification Lab
        </span>
        <button
          type="button"
          onClick={() => setRevealEvidence((p) => !p)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            revealEvidence
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {revealEvidence ? 'Evidence Links Active' : 'Reveal Evidence Links'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Passage Pane */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Passage Excerpt: Commercial Aviation
          </div>
          <p>
            The development of commercial aviation in the mid-twentieth century dramatically reshaped international tourism. Initial operations relied on turbo-propeller airliners, which, although significantly slower than modern aircraft,{' '}
            <span
              className={
                revealEvidence
                  ? 'bg-rose-200/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 px-1 rounded font-semibold border-b-2 border-rose-500'
                  : ''
              }
            >
              [Q1 Proof: permitted non-stop travel across continental distances]
            </span>
            . Early market penetration was severely constrained by exorbitant operating costs, meaning that{' '}
            <span
              className={
                revealEvidence
                  ? 'bg-emerald-200/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-1 rounded font-semibold border-b-2 border-emerald-500'
                  : ''
              }
            >
              [Q3 Proof: foreign excursions remained the exclusive luxury of high-net-worth individuals]
            </span>
            . It was not until the introduction of wide-body jet airliners, such as the Boeing 747 in 1970, that{' '}
            <span
              className={
                revealEvidence
                  ? 'bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-1 rounded font-semibold border-b-2 border-amber-500'
                  : ''
              }
            >
              [Q2 Trap: the economics of scale reduced airfares sufficiently to allow middle-income families to travel internationally]
            </span>
            .
          </p>
        </div>

        {/* Right Questions Pane */}
        <div className="space-y-3">
          {questions.map((q) => {
            const selected = answers[q.num];
            const isCorrect = selected === q.correct;

            return (
              <div
                key={q.num}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 text-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white">
                  {q.num}. {q.stem}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['TRUE', 'FALSE', 'NOT GIVEN'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, [q.num]: opt }))}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                        selected === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {(selected || revealEvidence) && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                        : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                    }`}
                  >
                    <strong>Official Verdict ({q.correct}):</strong> {q.reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* 4. W-T1-1 LAB: Band 9 Report Deconstructor */
function Wt1ReportDeconstructorLab() {
  const [selectedPara, setSelectedPara] = useState<number>(1);

  const paragraphs = [
    {
      num: 1,
      label: 'Paragraph 1: Introduction (29 words)',
      badge: 'Paraphrase Prompt',
      text: 'The line graph illustrates the weekly per capita intake of three varieties of meat—beef, chicken, and fish—in a European nation over a 40-year period from 1980 to 2020.',
      examinerNote:
        'Swaps "consumption" for "weekly per capita intake" and "between 1980 and 2020" for "over a 40-year period from 1980 to 2020".',
    },
    {
      num: 2,
      label: 'Paragraph 2: The Overview (46 words — CRITICAL)',
      badge: 'Zero Numbers Rule',
      text: 'Overall, it is readily apparent that chicken experienced significant growth over the period, eventually replacing beef as the most consumed meat. In stark contrast, beef consumption witnessed a precipitous decline, while fish intake remained remarkably stable at comparatively low levels throughout the timeline.',
      examinerNote:
        'Secures Band 8+ Task Achievement by summarizing all 3 macro trajectories (chicken rose, beef fell, fish stayed flat) without quoting a single number.',
    },
    {
      num: 3,
      label: 'Paragraph 3: Body 1 — Dominant & Declining Trend (47 words)',
      badge: 'Exact Data + Prepositions',
      text: 'In 1980, beef was by far the most popular protein source, standing at approximately 220 grams per person per week, compared to roughly 150 grams for chicken. Over the subsequent two decades, beef consumption declined steadily before plummeting to a low of approximately 100 grams by 2020.',
      examinerNote:
        'Uses high-precision prepositions: "standing at 220 grams", "compared to 150 grams", "plummeting to a low of 100 grams".',
    },
    {
      num: 4,
      label: 'Paragraph 4: Body 2 — Overtaking & Stable Trends (56 words)',
      badge: 'Complex Comparison',
      text: 'Conversely, the figures for chicken saw an uninterrupted upward trajectory. Chicken overtook beef around the turn of the millennium at roughly 180 grams, continuing its ascent to reach a peak of 250 grams per person weekly at the close of the period. Throughout this duration, fish consumption demonstrated minimal variation, fluctuating narrowly between 50 and 60 grams per week.',
      examinerNote:
        'Highlights the intersection point ("overtook beef... at roughly 180 grams") and pairs "fluctuating narrowly between 50 and 60 grams".',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {paragraphs.map((p) => (
          <button
            key={p.num}
            type="button"
            onClick={() => setSelectedPara(p.num)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedPara === p.num
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Paragraph {p.num}
          </button>
        ))}
      </div>

      {paragraphs
        .filter((p) => p.num === selectedPara)
        .map((p) => (
          <div
            key={p.num}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {p.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[11px] font-bold">
                {p.badge}
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800">
              {p.text}
            </p>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200">
              <strong>Examiner Analysis:</strong> {p.examinerNote}
            </div>
          </div>
        ))}
    </div>
  );
}

/* 5. W-T2-1 LAB: "Examiner Vision" Essay Deconstructor + Live Banned Cliché Scanner */
function Wt2ExaminerVisionAndClicheLab() {
  const [showCohesion, setShowCohesion] = useState(true);
  const [showLexical, setShowLexical] = useState(true);
  const [showGrammar, setShowGrammar] = useState(true);
  const [activeNote, setActiveNote] = useState<string>(
    'Click any highlighted segment in the Band 9 essay below to inspect why it scores Band 9 vs. Band 6.'
  );
  const [draftCheck, setDraftCheck] = useState(
    'Since the dawn of human civilization, this topic has a plethora of merits because every coin has two sides.'
  );

  const detectedCliches = BANNED_CLICHES_DICTIONARY.filter((c) =>
    draftCheck.toLowerCase().includes(c.phrase.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Examiner Vision Interactive Canvas */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Examiner Vision: Band 9 Essay Lab (&quot;Compulsory Community Service&quot;)
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowCohesion((p) => !p)}
              className={`px-2.5 py-1 rounded-lg font-bold border ${
                showCohesion
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              [✓] Cohesion
            </button>
            <button
              type="button"
              onClick={() => setShowLexical((p) => !p)}
              className={`px-2.5 py-1 rounded-lg font-bold border ${
                showLexical
                  ? 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              [✓] Lexical Resource
            </button>
            <button
              type="button"
              onClick={() => setShowGrammar((p) => !p)}
              className={`px-2.5 py-1 rounded-lg font-bold border ${
                showGrammar
                  ? 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              [✓] Complex Grammar
            </button>
          </div>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-3 font-serif">
          <p>
            It is often suggested that voluntary work within the community should be instituted as a mandatory component of secondary school curricula.{' '}
            <span
              onClick={() =>
                setActiveNote(
                  'COHESION & TASK RESPONSE (Band 9): "I wholeheartedly agree with this proposition" establishes an unmistakable, unambiguous position in Sentence 2 (Band 6 equivalent: "This essay will discuss both sides").'
                )
              }
              className={
                showCohesion
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-500 px-1 rounded cursor-pointer'
                  : 'cursor-pointer'
              }
            >
              I wholeheartedly agree with this proposition
            </span>
            , as mandatory service{' '}
            <span
              onClick={() =>
                setActiveNote(
                  'COMPLEX GRAMMAR & LEXICAL RESOURCE (Band 9): Non-finite participial clause ("while imparting indispensable real-world competencies") combines two high-level ideas seamlessly.'
                )
              }
              className={
                showGrammar
                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-b-2 border-purple-500 px-1 rounded cursor-pointer'
                  : 'cursor-pointer'
              }
            >
              cultivates civic responsibility in adolescents while imparting indispensable real-world competencies
            </span>{' '}
            that traditional academic study cannot provide.
          </p>

          <p>
            The primary rationale for making public service compulsory is that it{' '}
            <span
              onClick={() =>
                setActiveNote(
                  'LEXICAL RESOURCE (Band 9): Precise academic collocations ("nurtures social empathy", "marginalized segments of society") replace repetitive Band 6 words like "helps poor people".'
                )
              }
              className={
                showLexical
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border-b-2 border-blue-500 px-1 rounded cursor-pointer'
                  : 'cursor-pointer'
              }
            >
              nurtures social empathy and civic mindedness from an early age
            </span>
            . By participating in organized community initiatives—such as assisting at food distribution centers—students gain firsthand exposure to societal challenges.{' '}
            <span
              onClick={() =>
                setActiveNote(
                  'COHESION (Band 9): "Consequently, institutionalizing this requirement..." links the concrete example directly back to the overarching thesis (PEEL Link).'
                )
              }
              className={
                showCohesion
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-500 px-1 rounded cursor-pointer'
                  : 'cursor-pointer'
              }
            >
              Consequently, institutionalizing this requirement ensures that schools develop socially conscious citizens.
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
              Examiner Inspection Drawer:
            </span>
            <span>{activeNote}</span>
          </div>
        </div>
      </div>

      {/* Live Banned Cliché Detector */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Live Banned Cliché &amp; Bangla L1 Scanner
          </h4>
          <span className="text-xs font-semibold text-slate-500">
            {detectedCliches.length} cliché(s) flagged
          </span>
        </div>

        <textarea
          rows={2}
          value={draftCheck}
          onChange={(e) => setDraftCheck(e.target.value)}
          placeholder="Paste or type a sentence to scan for banned coaching clichés..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
        />

        {detectedCliches.length > 0 ? (
          <div className="space-y-2">
            {detectedCliches.map((c) => (
              <div
                key={c.phrase}
                className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 line-through mr-2">
                    &ldquo;{c.phrase}&rdquo;
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{c.reason}</span>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  Use: {c.replacement}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Zero banned templates or L1 preposition traps detected!
          </div>
        )}
      </div>
    </div>
  );
}

/* 6. S-1 LAB: Phonetic Mirror (/f/, /v/, /z/) & Browser Voice Recorder */
function S1PhoneticMirrorAndAreaLab() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const drills = [
    {
      phoneme: '/f/ vs /pʰ/',
      trap: 'Pripar a kopee for myutta friend',
      model: 'I prefer a cup of coffee with my close friends.',
      articulation: 'Rest upper front teeth gently on lower lip; blow air continuously.',
    },
    {
      phoneme: '/v/ vs /bʱ/',
      trap: 'I am bhery fond of trabeling to barious places',
      model: 'I am very fond of traveling to various vibrant cities.',
      articulation: 'Upper teeth on lower lip + vocal cord vibration.',
    },
    {
      phoneme: '/z/ vs /dʒ/',
      trap: 'The rejult of the reajon is jero',
      model: 'The positive result of this decision is easy to observe.',
      articulation: 'Tongue tip buzzing behind upper teeth like a bee.',
    },
  ];

  const speakModel = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert('Please allow microphone access to compare your pronunciation.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {drills.map((d) => (
          <div
            key={d.phoneme}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold">
                Target Sound: {d.phoneme}
              </span>
              <button
                type="button"
                onClick={() => speakModel(d.model)}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> Hear Band 9 Model
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
                <span className="font-bold block">Bangla L1 Trap:</span>
                &ldquo;{d.trap}&rdquo;
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">Band 9 Target:</span>
                &ldquo;{d.model}&rdquo;
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 italic">{d.articulation}</p>
          </div>
        ))}
      </div>

      {/* Self-Recording Mirror */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleRecord}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 ${
              isRecording ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {isRecording ? 'Stop Recording' : 'Record Your Pronunciation'}
          </button>
          <span className="text-xs text-slate-500">
            Read the 3 green Band 9 target sentences aloud
          </span>
        </div>

        {recordedUrl && (
          <audio controls src={recordedUrl} className="h-8 w-full sm:w-60" />
        )}
      </div>
    </div>
  );
}

/* 7. BG-1 LAB: Interactive Article & Preposition Fixer */
function Bg1ArticleAndPrepositionLab() {
  const [selectedFixes, setSelectedFixes] = useState<Record<number, string>>({});

  const slots = [
    {
      id: 1,
      before: '',
      options: ['The pollution', 'Pollution', 'A pollution'],
      correct: 'Pollution',
      after: ' is ',
    },
    {
      id: 2,
      before: '',
      options: ['major challenge', 'a major challenge', 'the major challenge'],
      correct: 'a major challenge',
      after: ' in ',
    },
    {
      id: 3,
      before: '',
      options: ['the developing cities.', 'developing cities.', 'a developing cities.'],
      correct: 'developing cities.',
      after: ' When ',
    },
    {
      id: 4,
      before: '',
      options: ['citizen uses private vehicle,', 'a citizen uses a private vehicle,', 'the citizen uses vehicle,'],
      correct: 'a citizen uses a private vehicle,',
      after: ' carbon emissions increase ',
    },
    {
      id: 5,
      before: '',
      options: ['with 20%.', 'by 20%.', 'on 20%.'],
      correct: 'by 20%.',
      after: '',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
        Interactive Bangla-to-English Article &amp; Preposition Diagnostic
      </h4>
      <p className="text-xs text-slate-500">
        Select the grammatically accurate English phrase for each numbered slot below:
      </p>

      <div className="space-y-3">
        {slots.map((slot) => {
          const chosen = selectedFixes[slot.id];
          const isRight = chosen === slot.correct;
          return (
            <div
              key={slot.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-400">#{slot.id}</span>
                {slot.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedFixes((p) => ({ ...p, [slot.id]: opt }))}
                    className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                      chosen === opt
                        ? isRight
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {chosen && (
                <span
                  className={`font-bold ${
                    isRight ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isRight ? '✓ Band 9 Grammar' : `✗ Use: "${slot.correct}"`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
