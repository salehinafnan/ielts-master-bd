import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      test_category,
      module_type,
      is_premium,
      audio_url,
      content_json,
      answer_key_json,
    } = body;

    if (!title || !test_category || !module_type || !content_json) {
      return NextResponse.json(
        { error: 'Missing required fields: title, test_category, module_type, content_json' },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from('tests')
      .insert({
        title: String(title).trim(),
        test_category,
        module_type,
        is_premium: Boolean(is_premium),
        audio_url: audio_url ? String(audio_url).trim() : null,
        content_json,
        answer_key_json: answer_key_json || null,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ id: data?.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to upload test' },
      { status: 500 }
    );
  }
}
