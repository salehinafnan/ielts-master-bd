'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Sparkles,
  Phone,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface PricingPlan {
  id: 'crash_7d' | 'pro_1m' | 'pro_3m' | 'pro_1y';
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  badge?: string;
  tagline: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: 'crash_7d',
    name: '7-Day Crash Pass',
    price: 199,
    duration: '7 days',
    durationDays: 7,
    tagline: 'Ideal for emergency exam preparation and last-minute drills',
    features: [
      '7 days full platform access',
      'All Cambridge 15–19 Answer Graders',
      'Inspera Real-Exam UI simulator',
      'Reading & Listening instant scoring',
      '3 Daily AI Writing & Speaking gradings',
    ],
  },
  {
    id: 'pro_1m',
    name: '1-Month Pro',
    price: 499,
    duration: '30 days',
    durationDays: 30,
    badge: 'MOST POPULAR',
    popular: true,
    tagline: 'The most comprehensive plan for structured 4-week preparation',
    features: [
      '30 days unlimited access',
      'All Full Mock Tests (R, L, W, S)',
      'Unlimited Cambridge Companion grader',
      'Daily AI Examiner feedback & model answers',
      'Target University Eligibility Matcher',
      'Question-Type Weakness Analytics',
    ],
  },
  {
    id: 'pro_3m',
    name: '3-Month Band 7.5+ Guarantee',
    price: 999,
    duration: '90 days',
    durationDays: 90,
    tagline: 'Extended practice to master exam strategies and hit top bands',
    features: [
      '90 days unrestricted access',
      'Complete library of 20+ Mock Tests',
      'Unlimited Cambridge Graders',
      '3 Daily AI evaluations (Writing + Speaking)',
      'Band 8.0 model essays & audio excerpts',
      'Priority WhatsApp/Telegram support',
    ],
  },
  {
    id: 'pro_1y',
    name: '1-Year Abroad Journey',
    price: 1999,
    duration: '365 days',
    durationDays: 365,
    tagline: 'Long-term support for university applications & retake insurance',
    features: [
      '365 days unlimited access',
      'All future mock tests & Cambridge updates',
      'Unlimited AI Examiner grading',
      'University admission band benchmark',
      'Full longitudinal performance history',
      'Dedicated VIP student community',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const merchantNumber = process.env.NEXT_PUBLIC_MERCHANT_BKASH_NUMBER || '017XXXXXXXX';

  const handleOpenModal = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod('bkash');
    setSenderPhone('');
    setTrxId('');
    setErrorMsg(null);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setSelectedPlan(null);
    setErrorMsg(null);
    setIsSuccess(false);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setErrorMsg(null);

    // Validation
    const cleanPhone = senderPhone.trim();
    if (!/^01\d{9}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number starting with 01.');
      return;
    }

    const cleanTrx = trxId.trim();
    if (!cleanTrx) {
      setErrorMsg('Please enter your transaction ID (TrxID).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planRequested: selectedPlan.id,
          amountBdt: selectedPlan.price,
          paymentMethod,
          senderPhone: cleanPhone,
          trxId: cleanTrx,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment request.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment submission failed. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" />
          Affordable Pricing for Bangladeshi Students
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Invest in Your Dream IELTS Band Score
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Full access to authentic Inspera CD-IELTS computer mock exams, AI writing &amp; speaking examiners,
          and diagnostic band analytics. Instant bKash and Nagad payment.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    ৳{plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    BDT / {plan.duration}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    What&apos;s included:
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className={`w-full rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-sm ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  }`}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Verification Guarantee */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Direct manual verification via bKash / Nagad</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Account activation within 1 hour</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Strict Cambridge &amp; British Council exam standards</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            {!submitting && (
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {!isSuccess ? (
              <div>
                {/* Modal Title */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Complete Your Subscription
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      bKash &amp; Nagad Personal Send Money
                    </p>
                  </div>
                </div>

                {/* Plan Summary Banner */}
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        {selectedPlan.name}
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-400">
                        Validity: {selectedPlan.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-950 dark:text-white">
                        ৳{selectedPlan.price} BDT
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1.5">
                    <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Send Money via bKash/Nagad to:
                  </div>
                  <div className="rounded-lg bg-white/80 p-2 font-mono text-sm font-bold text-slate-900 text-center tracking-wider border border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-800">
                    {merchantNumber}
                  </div>
                  <ol className="mt-2 list-decimal list-inside space-y-1 text-[11px]">
                    <li>
                      Open bKash or Nagad and select <strong>Send Money</strong>.
                    </li>
                    <li>
                      Enter the number above and send exactly <strong>৳{selectedPlan.price}</strong>.
                    </li>
                    <li>
                      Copy the <strong>TrxID (Transaction ID)</strong> from your confirmation SMS.
                    </li>
                  </ol>
                </div>

                {/* Submission Form */}
                <form onSubmit={handleSubmitPayment} className="mt-4 space-y-4">
                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold cursor-pointer transition-all ${
                          paymentMethod === 'bkash'
                            ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-500/20 dark:bg-pink-950/30 dark:text-pink-300'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bkash"
                          checked={paymentMethod === 'bkash'}
                          onChange={() => setPaymentMethod('bkash')}
                          className="sr-only"
                        />
                        <span>bKash</span>
                      </label>

                      <label
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold cursor-pointer transition-all ${
                          paymentMethod === 'nagad'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20 dark:bg-orange-950/30 dark:text-orange-300'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="nagad"
                          checked={paymentMethod === 'nagad'}
                          onChange={() => setPaymentMethod('nagad')}
                          className="sr-only"
                        />
                        <span>Nagad</span>
                      </label>
                    </div>
                  </div>

                  {/* Sender Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Phone Number (11 digits)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BL92A8ZK91"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="w-full uppercase rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs font-bold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Payment</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success Screen */
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Payment Submitted Successfully!
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    Payment being verified. Access within 1 hour.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-1.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ৳{selectedPlan.price} BDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-semibold uppercase text-slate-900 dark:text-white">
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TrxID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {trxId.trim().toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleCloseModal();
                    router.push('/dashboard');
                  }}
                  className="w-full rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
