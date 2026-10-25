'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  School,
  Globe,
  Loader2,
} from 'lucide-react';

interface University {
  id: string;
  name: string;
  country: string;
  min_overall_band: number;
  min_listening: number;
  min_reading: number;
  min_writing: number;
  min_speaking: number;
}

const FALLBACK_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'University of Toronto',
    country: 'Canada',
    min_overall_band: 6.5,
    min_listening: 6.0,
    min_reading: 6.0,
    min_writing: 6.0,
    min_speaking: 6.0,
  },
  {
    id: '2',
    name: 'Monash University',
    country: 'Australia',
    min_overall_band: 6.5,
    min_listening: 6.0,
    min_reading: 6.0,
    min_writing: 6.0,
    min_speaking: 6.0,
  },
  {
    id: '3',
    name: 'TU Munich (TUM)',
    country: 'Germany',
    min_overall_band: 6.5,
    min_listening: 6.0,
    min_reading: 6.0,
    min_writing: 6.0,
    min_speaking: 6.0,
  },
  {
    id: '4',
    name: 'University of Manchester',
    country: 'UK',
    min_overall_band: 7.0,
    min_listening: 6.5,
    min_reading: 6.5,
    min_writing: 6.5,
    min_speaking: 6.5,
  },
  {
    id: '5',
    name: 'Arizona State University',
    country: 'USA',
    min_overall_band: 6.5,
    min_listening: 6.0,
    min_reading: 6.0,
    min_writing: 6.0,
    min_speaking: 6.0,
  },
];

function roundIeltsBand(val: number): number {
  const base = Math.floor(val);
  const frac = val - base;
  if (frac < 0.25) return base;
  if (frac < 0.75) return base + 0.5;
  return base + 1.0;
}

export default function UniversityMatcher() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [moduleScores, setModuleScores] = useState<{
    listening: number | null;
    reading: number | null;
    writing: number | null;
    speaking: number | null;
    overall: number | null;
  }>({
    listening: null,
    reading: null,
    writing: null,
    speaking: null,
    overall: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        }

        // 1. Fetch universities
        const { data: uniData } = await supabase
          .from('universities')
          .select('*')
          .order('name', { ascending: true });

        const list = uniData && uniData.length > 0 ? (uniData as University[]) : FALLBACK_UNIVERSITIES;
        setUniversities(list);

        let targetId = list[0]?.id;

        // Check if user has target_university_id saved in profiles
        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('target_university_id')
            .eq('id', user.id)
            .maybeSingle();

          if (prof?.target_university_id && list.some((u) => u.id === prof.target_university_id)) {
            targetId = prof.target_university_id;
          }
        }
        setSelectedUniId(targetId);

        // 2. Fetch user's latest scores: average of the most recent 3 attempts per module_type
        if (user) {
          const { data: attempts } = await supabase
            .from('test_attempts')
            .select('module_type, band_score, completed_at')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false });

          if (attempts && attempts.length > 0) {
            const grouped: Record<string, number[]> = {
              listening: [],
              reading: [],
              writing: [],
              speaking: [],
            };

            for (const att of attempts) {
              const mod = (att.module_type || '').toLowerCase();
              if (grouped[mod] && grouped[mod].length < 3 && typeof att.band_score === 'number') {
                grouped[mod].push(Number(att.band_score));
              }
            }

            const calcAvg = (arr: number[]): number | null => {
              if (arr.length === 0) return null;
              const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
              return roundIeltsBand(avg);
            };

            const lScore = calcAvg(grouped.listening);
            const rScore = calcAvg(grouped.reading);
            const wScore = calcAvg(grouped.writing);
            const sScore = calcAvg(grouped.speaking);

            // Compute overall: average of tested modules rounded to IELTS band
            const valid = [lScore, rScore, wScore, sScore].filter((v): v is number => v !== null);
            const oScore =
              valid.length > 0
                ? roundIeltsBand(valid.reduce((a, b) => a + b, 0) / valid.length)
                : null;

            setModuleScores({
              listening: lScore,
              reading: rScore,
              writing: wScore,
              speaking: sScore,
              overall: oScore,
            });
          }
        }
      } catch (err) {
        console.error('Error loading university matcher:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedUniversity = useMemo(() => {
    return universities.find((u) => u.id === selectedUniId) || universities[0] || null;
  }, [universities, selectedUniId]);

  const rows = useMemo(() => {
    if (!selectedUniversity) return [];

    const items = [
      {
        key: 'overall',
        label: 'Overall Band',
        userScore: moduleScores.overall,
        required: Number(selectedUniversity.min_overall_band),
      },
      {
        key: 'listening',
        label: 'Listening',
        userScore: moduleScores.listening,
        required: Number(selectedUniversity.min_listening),
      },
      {
        key: 'reading',
        label: 'Reading',
        userScore: moduleScores.reading,
        required: Number(selectedUniversity.min_reading),
      },
      {
        key: 'writing',
        label: 'Writing',
        userScore: moduleScores.writing,
        required: Number(selectedUniversity.min_writing),
      },
      {
        key: 'speaking',
        label: 'Speaking',
        userScore: moduleScores.speaking,
        required: Number(selectedUniversity.min_speaking),
      },
    ];

    return items.map((item) => {
      const score = item.userScore ?? 0;
      const isMet = item.userScore !== null && score >= item.required;
      const gap = item.required - score;

      return {
        ...item,
        isMet,
        gap: gap > 0 ? Number(gap.toFixed(1)) : 0,
      };
    });
  }, [selectedUniversity, moduleScores]);

  const unmetCount = useMemo(() => {
    return rows.filter((r) => !r.isMet).length;
  }, [rows]);

  const handleUniversityChange = async (newId: string) => {
    setSelectedUniId(newId);
    if (userId) {
      try {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({ target_university_id: newId })
          .eq('id', userId);
      } catch {
        // silent catch
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!selectedUniversity) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Top Header / University Selector */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Target University Matcher
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Benchmark your recent 3-test average against official minimum band requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="university-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Select University:
          </label>
          <div className="relative">
            <select
              id="university-select"
              value={selectedUniId}
              onChange={(e) => handleUniversityChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 pr-8 text-sm font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.country})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Verdict Banner */}
      <div className="px-5 pt-4">
        {unmetCount === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="text-sm font-semibold">
              You qualify! Your average scores satisfy all official minimum entry criteria for{' '}
              <span className="font-bold">{selectedUniversity.name}</span>.
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm font-semibold">
              {unmetCount} {unmetCount === 1 ? 'module needs' : 'modules need'} improvement to meet
              the entry threshold for <span className="font-bold">{selectedUniversity.name}</span>.
            </div>
          </div>
        )}
      </div>

      {/* Comparison Rows */}
      <div className="overflow-x-auto p-5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="pb-3 pl-2">Module</th>
              <th className="pb-3 text-center">Your Score</th>
              <th className="pb-3 text-center">Required</th>
              <th className="pb-3 pl-4">Status & Gap Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rows.map((row) => {
              const scoreText =
                row.userScore !== null ? Number(row.userScore).toFixed(1) : 'No tests';
              return (
                <tr key={row.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 pl-2 font-semibold text-slate-900 dark:text-white">
                    {row.label}
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${
                        row.userScore === null
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : row.isMet
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                      }`}
                    >
                      {scoreText}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                    {row.required.toFixed(1)}
                  </td>
                  <td className="py-3.5 pl-4">
                    {row.isMet ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>You meet this requirement!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          You need +{row.gap.toFixed(1)} in {row.label} to qualify for{' '}
                          {selectedUniversity.name}.
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
