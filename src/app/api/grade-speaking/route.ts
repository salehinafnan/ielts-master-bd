import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { AISpeakingEvaluation } from '@/lib/types';

const COMMON_FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'actually',
  'sort of',
  'kind of',
];

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function detectFillerWords(text: string): string[] {
  const detected = new Set<string>();
  const lower = text.toLowerCase();

  for (const filler of COMMON_FILLER_WORDS) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      detected.add(filler);
    }
  }

  return Array.from(detected);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { testId, transcripts } = body as {
      testId?: string;
      transcripts?: { part: string; question: string; response: string }[];
    };

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return NextResponse.json(
        { error: 'Speaking transcripts are required.' },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const isFree = profile.subscription_tier === 'free';
    const today = new Date().toISOString().split('T')[0];

    // Rate limiting: Free = 1 AI credit total; Paid = 3 AI evaluations per day
    if (isFree) {
      if ((profile.free_ai_credits_used ?? 0) >= 1) {
        return NextResponse.json(
          {
            error: 'LIMIT_REACHED',
            message:
              'Free users get 1 AI grading. Upgrade to Pro for unlimited.',
          },
          { status: 403 }
        );
      }
    } else {
      const { data: todayLog } = await supabase
        .from('ai_usage_logs')
        .select('id, usage_count')
        .eq('user_id', user.id)
        .eq('used_date', today)
        .maybeSingle();

      if (todayLog && todayLog.usage_count >= 3) {
        return NextResponse.json(
          {
            error: 'DAILY_LIMIT_REACHED',
            message: '3/3 AI gradings used today. Try again tomorrow.',
          },
          { status: 403 }
        );
      }
    }

    // Calculate aggregated spoken statistics
    const fullSpokenText = transcripts.map((t) => t.response || '').join(' ');
    const totalWordCount = countWords(fullSpokenText);
    const fillerWords = detectFillerWords(fullSpokenText);

    const formattedTranscript = transcripts
      .map(
        (t) =>
          `[${t.part}] Question: ${t.question}\nCandidate Spoken Response: ${
            t.response?.trim() || '(No response recorded)'
          }`
      )
      .join('\n\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let responseText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Evaluate this IELTS Speaking transcript. Words: ${totalWordCount}. Fillers: ${fillerWords.join(
            ', '
          )}.\n\n${formattedTranscript}`,
          config: {
            systemInstruction:
              'You are a strict IELTS Speaking Examiner. Assess Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation. Return ONLY valid JSON: { overallBand: number, fluencyCoherence: { band: number, feedback: string }, lexicalResource: { band: number, feedback: string }, grammaticalRange: { band: number, feedback: string }, pronunciation: { band: number, feedback: string }, fillerWordsDetected: string[], wordCount: number, modelAnswerExcerpt: string, actionableNextSteps: string[] }',
            responseMimeType: 'application/json',
          },
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Speaking model ${modelName} failed, falling back to next:`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from AI speaking models.');
    }
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let evaluation: AISpeakingEvaluation;
    try {
      evaluation = JSON.parse(responseText);
      if (!evaluation.fillerWordsDetected || evaluation.fillerWordsDetected.length === 0) {
        evaluation.fillerWordsDetected = fillerWords;
      }
      if (!evaluation.wordCount) {
        evaluation.wordCount = totalWordCount;
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini Speaking JSON:', responseText);
      return NextResponse.json(
        { error: 'AI grader returned an invalid format. Please try again.' },
        { status: 502 }
      );
    }

    // Resolve or fallback to valid test row in public.tests for foreign key
    let targetTestId = testId;
    let isValidUUID =
      typeof targetTestId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        targetTestId
      );

    if (isValidUUID && targetTestId) {
      const { data: testCheck } = await supabase
        .from('tests')
        .select('id')
        .eq('id', targetTestId)
        .maybeSingle();

      if (!testCheck) {
        isValidUUID = false;
      }
    }

    if (!isValidUUID) {
      const { data: defaultSpeakingTest } = await supabase
        .from('tests')
        .select('id')
        .eq('module_type', 'speaking')
        .limit(1)
        .maybeSingle();

      if (defaultSpeakingTest) {
        targetTestId = defaultSpeakingTest.id;
      } else {
        const { data: newTest } = await supabase
          .from('tests')
          .insert({
            title: 'IELTS Academic Speaking Test 1',
            test_category: 'full_mock',
            module_type: 'speaking',
            is_premium: false,
            content_json: {
              part1: {
                topic: 'Hometown & Daily Life',
                questions: [
                  'Where is your hometown, and what do you like most about living there?',
                  'How has your hometown changed in recent years?',
                  'Do you prefer studying or working in the morning or in the evening? Why?',
                  'What kinds of activities do you enjoy doing during your free time on weekends?',
                ],
              },
              part2: {
                topic: 'An Important Decision',
                cueCard: {
                  title: 'Describe a difficult decision that you made recently.',
                  prompts: [
                    'What the decision was',
                    'When and why you made it',
                    'What other choices were available',
                    'And explain how you felt after making this decision.',
                  ],
                },
              },
              part3: {
                topic: 'Decision Making in Society',
                questions: [
                  'Why do some people find it difficult to make important decisions in their daily lives?',
                  'Do you think young people should consult their parents when making significant life choices?',
                  'In what ways has modern technology and artificial intelligence influenced how people make decisions?',
                  'How do leaders of large organizations make balanced decisions under intense pressure?',
                ],
              },
            },
          })
          .select('id')
          .single();

        if (newTest) {
          targetTestId = newTest.id;
        }
      }
    }

    // Save attempt in public.test_attempts
    const { data: attempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: targetTestId,
        module_type: 'speaking',
        user_answers_json: transcripts,
        band_score: evaluation.overallBand,
        ai_feedback_json: evaluation,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error recording speaking attempt:', insertError);
    }

    // Increment AI credits
    if (isFree) {
      await supabase
        .from('profiles')
        .update({
          free_ai_credits_used: (profile.free_ai_credits_used ?? 0) + 1,
        })
        .eq('id', user.id);
    } else {
      const { data: todayLog } = await supabase
        .from('ai_usage_logs')
        .select('id, usage_count')
        .eq('user_id', user.id)
        .eq('used_date', today)
        .maybeSingle();

      if (todayLog) {
        await supabase
          .from('ai_usage_logs')
          .update({ usage_count: todayLog.usage_count + 1 })
          .eq('id', todayLog.id);
      } else {
        await supabase.from('ai_usage_logs').insert({
          user_id: user.id,
          used_date: today,
          usage_count: 1,
        });
      }
    }

    return NextResponse.json({
      ...evaluation,
      attemptId: attempt?.id,
    });
  } catch (err: any) {
    console.error('Speaking grading error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
