import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Laptop,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm font-extrabold tracking-wider">
                IELTS
              </span>
              <span>Master BD</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/tests"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Mock Tests
            </Link>
            <Link
              href="/cambridge-grader"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cambridge Grader
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Tailored for Bangladeshi IELTS Candidates
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-none">
              Master the Official{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                CD-IELTS Interface
              </span>{" "}
              with Instant AI Grading
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              1:1 replication of the British Council & IDP computer-delivered
              exam screen. Offline load-shedding resilience, Cambridge book
              graders, and instant Gemini AI band descriptors.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/tests"
                className="rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center gap-2"
              >
                Start Practice Mock Test
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/cambridge-grader"
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Grade Cambridge 15–19
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Authentic CD-IELTS UI
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Split-screen Reading, right-click text highlighting & sticky
                  notes, question palette 1–40, and official countdown timer.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Load-Shedding Resilient
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Zero progress loss. Active tests persist automatically in your
                  browser. If power or internet drops, resume right where you
                  left off.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="w-10 h-10 rounded-lg bg-purple-600/10 text-purple-400 flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  AI Writing & Speaking Examiner
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sub-band scores for TR, CC, LR, and GRA with sentence-level
                  corrections, vocabulary upgrades, and model Band 8.5 essays.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 IELTS Master BD. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-300">
              bKash / Nagad Subscriptions
            </Link>
            <Link href="/cambridge-grader" className="hover:text-slate-300">
              Cambridge Grader
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300">
              Student Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
