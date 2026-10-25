'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  FileUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Phone,
  Hash,
  AlertTriangle,
  Upload,
  Code2,
  RefreshCw,
} from 'lucide-react';

interface PaymentRequestItem {
  id: string;
  user_id: string;
  plan_requested: string;
  amount_bdt: number;
  payment_method: string;
  sender_phone: string;
  trx_id: string;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const PLAN_DURATION_DAYS: Record<string, number> = {
  crash_7d: 7,
  pro_1m: 30,
  pro_3m: 90,
  pro_1y: 365,
};

const SAMPLE_CONTENT_JSON = JSON.stringify(
  {
    sections: [
      {
        sectionNumber: 1,
        title: 'Section 1: Academic Reading Passage 1',
        passageHtml: '<p>The history of civil engineering dates back thousands of years...</p>',
        questions: [
          {
            questionNumber: 1,
            category: 'TFNG',
            promptText: 'Civil engineering began during the industrial revolution.',
            correctAnswers: ['FALSE', 'F'],
            explanation: 'The passage explicitly states that civil engineering dates back thousands of years.',
          },
        ],
      },
    ],
  },
  null,
  2
);

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'test-uploader'>('payments');

  // Payments Tab State
  const [payments, setPayments] = useState<PaymentRequestItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Test Uploader Tab State
  const [testTitle, setTestTitle] = useState('');
  const [testCategory, setTestCategory] = useState<'full_mock' | 'cambridge_companion'>('full_mock');
  const [moduleType, setModuleType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');
  const [isPremium, setIsPremium] = useState(true);
  const [audioUrl, setAudioUrl] = useState('');
  const [contentJson, setContentJson] = useState('');
  const [answerKeyJson, setAnswerKeyJson] = useState('');
  const [jsonValidationResult, setJsonValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [uploadingTest, setUploadingTest] = useState(false);

  // Check Admin Authorization
  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthorized(false);
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        setIsAuthorized(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      setIsAuthorized(true);
      fetchPendingPayments();
    }

    checkRole();
  }, [router]);

  // Fetch pending payments with user profile information
  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('payment_requests')
        .select(
          `
          id,
          user_id,
          plan_requested,
          amount_bdt,
          payment_method,
          sender_phone,
          trx_id,
          status,
          created_at,
          profiles (
            email,
            full_name
          )
        `
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      // If postgrest join didn't populate profiles directly, query profiles
      const missingUserIds = (data || [])
        .filter((r: any) => !r.profiles?.email)
        .map((r: any) => r.user_id);

      let profileMap: Record<string, { email: string; full_name: string }> = {};
      if (missingUserIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', Array.from(new Set(missingUserIds)));

        if (profs) {
          profs.forEach((p) => {
            profileMap[p.id] = { email: p.email, full_name: p.full_name || '' };
          });
        }
      }

      const formatted: PaymentRequestItem[] = (data || []).map((row: any) => {
        const email = row.profiles?.email || profileMap[row.user_id]?.email || 'N/A';
        const name = row.profiles?.full_name || profileMap[row.user_id]?.full_name || '';
        return {
          id: row.id,
          user_id: row.user_id,
          plan_requested: row.plan_requested,
          amount_bdt: row.amount_bdt,
          payment_method: row.payment_method,
          sender_phone: row.sender_phone,
          trx_id: row.trx_id,
          status: row.status,
          created_at: row.created_at,
          user_email: email,
          user_name: name,
        };
      });

      setPayments(formatted);
    } catch (err) {
      console.error('Failed to load pending payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Approve Payment
  const handleApprove = async (req: PaymentRequestItem) => {
    try {
      setActionInProgress(req.id);
      setStatusMessage(null);

      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: req.id, action: 'approve' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve payment');

      setStatusMessage({
        type: 'success',
        text: `Approved payment for ${req.user_email}. ${data.message}`,
      });

      setPayments((prev) => prev.filter((p) => p.id !== req.id));
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Approval failed: ${err.message}`,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Reject Payment
  const handleReject = async (req: PaymentRequestItem) => {
    try {
      setActionInProgress(req.id);
      setStatusMessage(null);

      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: req.id, action: 'reject' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject payment');

      setStatusMessage({
        type: 'success',
        text: data.message || `Rejected payment request TrxID: ${req.trx_id}.`,
      });

      setPayments((prev) => prev.filter((p) => p.id !== req.id));
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Rejection failed: ${err.message}`,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Validate Test JSON
  const handleValidateJson = () => {
    setJsonValidationResult(null);
    if (!contentJson.trim()) {
      setJsonValidationResult({ valid: false, message: 'Content JSON cannot be empty.' });
      return;
    }

    try {
      const parsedContent = JSON.parse(contentJson);
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        throw new Error('Content JSON must be an object or array.');
      }

      if (answerKeyJson.trim()) {
        const parsedKey = JSON.parse(answerKeyJson);
        if (typeof parsedKey !== 'object' || parsedKey === null) {
          throw new Error('Answer Key JSON must be a valid JSON object.');
        }
      }

      setJsonValidationResult({
        valid: true,
        message: 'JSON structure is valid and ready to upload!',
      });
    } catch (e: any) {
      setJsonValidationResult({
        valid: false,
        message: `JSON Syntax Error: ${e.message}`,
      });
    }
  };

  // Upload Test
  const handleUploadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) {
      alert('Test title is required.');
      return;
    }

    let parsedContent: any = null;
    let parsedAnswerKey: any = null;

    try {
      parsedContent = JSON.parse(contentJson);
    } catch (e: any) {
      alert(`Invalid Content JSON: ${e.message}`);
      return;
    }

    if (answerKeyJson.trim()) {
      try {
        parsedAnswerKey = JSON.parse(answerKeyJson);
      } catch (e: any) {
        alert(`Invalid Answer Key JSON: ${e.message}`);
        return;
      }
    }

    try {
      setUploadingTest(true);

      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle.trim(),
          test_category: testCategory,
          module_type: moduleType,
          is_premium: isPremium,
          audio_url: audioUrl.trim() || null,
          content_json: parsedContent,
          answer_key_json: parsedAnswerKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload test');

      alert(`Test uploaded successfully! Test ID: ${data?.id}`);
      setTestTitle('');
      setContentJson('');
      setAnswerKeyJson('');
      setAudioUrl('');
      setJsonValidationResult(null);
    } catch (err: any) {
      alert(`Failed to upload test: ${err.message}`);
    } finally {
      setUploadingTest(false);
    }
  };

  // Access Denied Screen
  if (isAuthorized === false) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950/70 dark:text-red-400">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Access Denied
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You do not have administrative privileges to access this control center. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  // Authorization Checking Screen
  if (isAuthorized === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              Admin Portal
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify manual bKash/Nagad transactions, upgrade student subscriptions, and manage mock test content.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payments ({payments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('test-uploader')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'test-uploader'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileUp className="h-4 w-4" />
            <span>Test Uploader</span>
          </button>
        </div>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pending bKash &amp; Nagad Payment Requests
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Approving sets the user subscription tier and calculates validity automatically
              </p>
            </div>
            <button
              onClick={fetchPendingPayments}
              disabled={loadingPayments}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingPayments ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                All caught up!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                There are no pending bKash or Nagad payment requests at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="py-3.5 pl-5">User Email</th>
                    <th className="py-3.5">Plan</th>
                    <th className="py-3.5 text-center">Amount</th>
                    <th className="py-3.5 text-center">Method</th>
                    <th className="py-3.5">Sender Phone</th>
                    <th className="py-3.5 font-mono">TrxID</th>
                    <th className="py-3.5">Date</th>
                    <th className="py-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payments.map((p) => {
                    const isProcessing = actionInProgress === p.id;
                    const formattedDate = new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 pl-5">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.user_email}
                          </div>
                          {p.user_name && (
                            <div className="text-[11px] text-slate-400">{p.user_name}</div>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {p.plan_requested}
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-900 dark:text-white">
                          ৳{p.amount_bdt}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                              p.payment_method === 'bkash'
                                ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                            }`}
                          >
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {p.sender_phone}
                        </td>
                        <td className="py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {p.trx_id}
                        </td>
                        <td className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 pr-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={isProcessing}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isProcessing ? 'Saving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              disabled={isProcessing}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEST UPLOADER */}
      {activeTab === 'test-uploader' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Exam Content Uploader
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload authentic mock tests or Cambridge Companion answer keys directly to the database
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setContentJson(SAMPLE_CONTENT_JSON);
                setTestTitle('Academic Reading Mock Test 1');
                setModuleType('reading');
                setTestCategory('full_mock');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Load Sample Template</span>
            </button>
          </div>

          <form onSubmit={handleUploadTest} className="mt-6 space-y-6">
            {/* Meta Row: Title & Category & Module */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge 18 Test 2 (Reading)"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Category *
                </label>
                <select
                  value={testCategory}
                  onChange={(e: any) => setTestCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="full_mock">Full Mock Test</option>
                  <option value="cambridge_companion">Cambridge Companion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Module Type *
                </label>
                <select
                  value={moduleType}
                  onChange={(e: any) => setModuleType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>
            </div>

            {/* Audio URL & Premium Toggle */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audio URL (Optional, for Listening tests)
                </label>
                <input
                  type="url"
                  placeholder="https://r2.yourdomain.com/audio/mock1.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700"
                  />
                  <span>Require Pro Subscription (is_premium)</span>
                </label>
              </div>
            </div>

            {/* Content JSON Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  content_json (Passages, Prompts, and Question Items) *
                </label>
                <span className="text-[11px] text-slate-400">Strict JSON format</span>
              </div>
              <textarea
                required
                rows={12}
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
                placeholder='{ "sections": [ ... ] }'
                className="w-full rounded-xl border border-slate-300 bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Answer Key JSON Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  answer_key_json (Optional, for objective test answer analytics)
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <textarea
                rows={5}
                value={answerKeyJson}
                onChange={(e) => setAnswerKeyJson(e.target.value)}
                placeholder='{ "1": { "category": "TFNG", "correctAnswers": ["FALSE"] } }'
                className="w-full rounded-xl border border-slate-300 bg-slate-950 p-3.5 font-mono text-xs text-blue-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Validation Feedback */}
            {jsonValidationResult && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                  jsonValidationResult.valid
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {jsonValidationResult.valid ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{jsonValidationResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleValidateJson}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Validate JSON
              </button>
              <button
                type="submit"
                disabled={uploadingTest}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload Test to Database</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
