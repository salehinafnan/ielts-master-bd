import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_CATALOG, SubscriptionPlanId } from '@/lib/types';

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
    const { paymentId, action } = body as {
      paymentId: string;
      action: 'approve' | 'reject';
    };

    if (!paymentId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid paymentId or action' }, { status: 400 });
    }

    const adminDb = createAdminClient();

    const { data: paymentReq, error: fetchErr } = await adminDb
      .from('payment_requests')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchErr || !paymentReq) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    if (action === 'reject') {
      const { error: rejErr } = await adminDb
        .from('payment_requests')
        .update({ status: 'rejected' })
        .eq('id', paymentId);

      if (rejErr) throw new Error(rejErr.message);

      return NextResponse.json({
        success: true,
        message: `Rejected payment request TrxID: ${paymentReq.trx_id}.`,
      });
    }

    const planId = paymentReq.plan_requested as SubscriptionPlanId;
    const days = PLAN_CATALOG[planId]?.durationDays || 30;

    const { data: targetProfile } = await adminDb
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', paymentReq.user_id)
      .maybeSingle();

    const currentExpiryMs = targetProfile?.subscription_expires_at
      ? new Date(targetProfile.subscription_expires_at).getTime()
      : 0;
    const baseTimeMs =
      !Number.isNaN(currentExpiryMs) && currentExpiryMs > Date.now()
        ? currentExpiryMs
        : Date.now();

    const expiresAt = new Date(baseTimeMs + days * 24 * 60 * 60 * 1000).toISOString();

    const { error: reqErr } = await adminDb
      .from('payment_requests')
      .update({ status: 'approved' })
      .eq('id', paymentId);

    if (reqErr) throw new Error(reqErr.message);

    const { error: profErr } = await adminDb
      .from('profiles')
      .update({
        subscription_tier: planId,
        subscription_expires_at: expiresAt,
      })
      .eq('id', paymentReq.user_id);

    if (profErr) throw new Error(profErr.message);

    return NextResponse.json({
      success: true,
      days,
      expiresAt,
      message: `Account upgraded to ${planId} for ${days} days.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process payment action' },
      { status: 500 }
    );
  }
}
