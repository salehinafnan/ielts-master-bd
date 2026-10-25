import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSubscriptionActive } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, title, test_category, module_type, is_premium, audio_url, content_json')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.is_premium) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at, role')
        .eq('id', user.id)
        .maybeSingle();

      const hasAccess = profile?.role === 'admin' || isSubscriptionActive(profile);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Active Pro subscription required to access this mock test.' },
          { status: 403 }
        );
      }
    }

    const rawContent = test.content_json as any;
    let sanitizedContent = rawContent;

    if (rawContent && Array.isArray(rawContent.sections)) {
      sanitizedContent = {
        ...rawContent,
        sections: rawContent.sections.map((sec: any) => ({
          ...sec,
          questions: Array.isArray(sec.questions)
            ? sec.questions.map((q: any) => ({
                questionNumber: q.questionNumber,
                category: q.category,
                promptText: q.promptText,
                options: q.options,
                correctAnswers: [],
                explanation: '',
              }))
            : [],
        })),
      };
    }

    return NextResponse.json({
      id: test.id,
      title: test.title,
      test_category: test.test_category,
      module_type: test.module_type,
      is_premium: test.is_premium,
      audio_url: test.audio_url,
      content_json: sanitizedContent,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
