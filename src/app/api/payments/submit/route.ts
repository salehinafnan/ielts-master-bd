import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLAN_CATALOG, SubscriptionPlanId } from '@/lib/types';

const VALID_PLANS = ['crash_7d', 'pro_1m', 'pro_3m', 'pro_1y'] as const;
const VALID_METHODS = ['bkash', 'nagad'] as const;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to submit a payment.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planRequested, paymentMethod, senderPhone, trxId } = body;

    if (!VALID_PLANS.includes(planRequested)) {
      return NextResponse.json(
        { error: 'Invalid plan selected.' },
        { status: 400 }
      );
    }

    if (!VALID_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Only bKash and Nagad are accepted.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(senderPhone || '').trim();
    if (!/^01\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be an 11-digit Bangladeshi number starting with 01.' },
        { status: 400 }
      );
    }

    const cleanTrx = String(trxId || '').trim().toUpperCase();
    if (!cleanTrx || cleanTrx.length < 4) {
      return NextResponse.json(
        { error: 'Invalid or missing Transaction ID (TrxID).' },
        { status: 400 }
      );
    }

    const canonicalAmountBdt = PLAN_CATALOG[planRequested as SubscriptionPlanId].price;

    const { data: requestRecord, error: dbErr } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id,
        plan_requested: planRequested,
        amount_bdt: canonicalAmountBdt,
        payment_method: paymentMethod,
        sender_phone: cleanPhone,
        trx_id: cleanTrx,
        status: 'pending',
      })
      .select('id')
      .single();

    if (dbErr) {
      if (dbErr.code === '23505') {
        return NextResponse.json(
          { error: 'This Transaction ID (TrxID) has already been submitted.' },
          { status: 400 }
        );
      }
      console.error('Error inserting payment request:', dbErr);
      return NextResponse.json(
        { error: 'Failed to record payment request in database.' },
        { status: 500 }
      );
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: `💰 New Payment!\nUser: ${user.email}\nPlan: ${planRequested}\nAmount: ${canonicalAmountBdt} BDT\nMethod: ${paymentMethod}\nPhone: ${cleanPhone}\nTrxID: ${cleanTrx}`,
            }),
          }
        );
      } catch (telegramErr) {
        console.error('Telegram alert failed:', telegramErr);
      }
    }

    return NextResponse.json({ success: true, paymentId: requestRecord?.id }, { status: 200 });
  } catch (err: any) {
    console.error('Payment submission exception:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing payment request.' },
      { status: 500 }
    );
  }
}
