import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { AIWritingEvaluation } from '@/lib/types';

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
    const { testId, taskNumber, essay } = body as {
      testId?: string;
      taskNumber?: number;
      essay?: string;
    };

    if (!essay || typeof essay !== 'string' || essay.trim().length === 0) {
      return NextResponse.json(
        { error: 'Essay content is required' },
        { status: 400 }
      );
    }

    const cleanTaskNumber: 1 | 2 = taskNumber === 1 ? 1 : 2;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const isFree = profile.subscription_tier === 'free';
    const today = new Date().toISOString().split('T')[0];

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
          contents: `Grade this IELTS Writing Task ${cleanTaskNumber} essay:\n\n${essay}`,
          config: {
            systemInstruction:
              'You are a strict, certified former British Council IELTS Examiner. Grade strictly per official band descriptors. Do not inflate scores. Return ONLY valid JSON: { overallBand: number, taskResponse: { band: number, feedback: string }, coherenceCohesion: { band: number, feedback: string }, lexicalResource: { band: number, feedback: string }, grammaticalRange: { band: number, feedback: string }, sentenceCorrections: [{ original: string, corrected: string, reason: string }], vocabularyUpgrades: [{ basicWord: string, band8Alternative: string, contextExample: string }], modelBand8Essay: string, actionableNextSteps: string[] }',
            responseMimeType: 'application/json',
          },
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Grading model ${modelName} failed, falling back to next:`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from AI grading models.');
    }
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let evaluation: AIWritingEvaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', responseText);
      return NextResponse.json(
        { error: 'AI grader returned an invalid format. Please try again.' },
        { status: 502 }
      );
    }

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
      const { data: defaultWritingTest } = await supabase
        .from('tests')
        .select('id')
        .eq('module_type', 'writing')
        .limit(1)
        .maybeSingle();

      if (defaultWritingTest) {
        targetTestId = defaultWritingTest.id;
      } else {
        const { data: newTest } = await supabase
          .from('tests')
          .insert({
            title: 'IELTS Academic Writing Test 1',
            test_category: 'full_mock',
            module_type: 'writing',
            is_premium: false,
            content_json: {
              task1: {
                title: 'Task 1: Academic Report',
                prompt:
                  'The chart below shows the percentage of households with internet access in several countries between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
                minWords: 150,
              },
              task2: {
                title: 'Task 2: Academic Essay',
                prompt:
                  'Some people believe that universities should focus on providing knowledge and skills related to specific careers, while others think the true function of a university is to give access to wider knowledge. Discuss both views and give your own opinion.',
                minWords: 250,
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

    const { data: attempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: targetTestId,
        module_type: 'writing',
        user_answers_json: { essay, taskNumber: cleanTaskNumber },
        band_score: evaluation.overallBand,
        ai_feedback_json: evaluation,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error recording writing test attempt:', insertError);
    }

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
    console.error('Writing evaluation error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
