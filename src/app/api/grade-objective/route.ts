import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkObjectiveAnswer,
  calculateAcademicReadingBand,
  calculateListeningBand,
  generateWeaknessBreakdown,
} from '@/lib/ielts-scoring';
import { QuestionItem, ReadingListeningTestContent } from '@/lib/types';

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
    const { testId, moduleType, userAnswers } = body as {
      testId: string;
      moduleType: 'reading' | 'listening';
      userAnswers: Record<number, string>;
    };

    if (!testId || !moduleType || !userAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields: testId, moduleType, userAnswers' },
        { status: 400 }
      );
    }

    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, title, content_json, answer_key_json')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    let questions: QuestionItem[] = [];
    const content = test.content_json as ReadingListeningTestContent;

    if (content?.sections && Array.isArray(content.sections)) {
      questions = content.sections.flatMap((s) => s.questions || []);
    } else if (Array.isArray((content as any)?.questions)) {
      questions = (content as any).questions;
    } else if (Array.isArray(content)) {
      questions = content as any;
    }

    if (questions.length === 0 && test.answer_key_json) {
      questions = Object.entries(test.answer_key_json).map(([qNumStr, val]: [string, any]) => {
        const qNum = parseInt(qNumStr, 10);
        if (typeof val === 'object' && val !== null) {
          return {
            questionNumber: qNum,
            category: val.category || 'FILL_BLANKS',
            promptText: val.promptText || `Question ${qNum}`,
            options: val.options,
            correctAnswers: Array.isArray(val.correctAnswers)
              ? val.correctAnswers
              : [String(val.correctAnswers || '')],
            explanation: val.explanation || '',
          };
        }
        return {
          questionNumber: qNum,
          category: 'FILL_BLANKS',
          promptText: `Question ${qNum}`,
          correctAnswers: Array.isArray(val) ? val : [String(val)],
          explanation: '',
        };
      });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No question data or answer key found for this test.' },
        { status: 422 }
      );
    }

    let rawScore = 0;
    for (const q of questions) {
      const uAns = userAnswers[q.questionNumber];
      if (uAns && checkObjectiveAnswer(uAns, q.correctAnswers)) {
        rawScore += 1;
      }
    }

    const bandScore =
      moduleType === 'listening'
        ? calculateListeningBand(rawScore)
        : calculateAcademicReadingBand(rawScore);

    const weaknessBreakdown = generateWeaknessBreakdown(questions, userAnswers);

    const { data: attempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: testId,
        module_type: moduleType,
        user_answers_json: userAnswers,
        raw_score: rawScore,
        band_score: bandScore,
        weakness_breakdown_json: weaknessBreakdown,
      })
      .select('id')
      .single();

    if (insertError || !attempt) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to save test attempt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attemptId: attempt.id,
      rawScore,
      bandScore,
      weaknessBreakdown,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}