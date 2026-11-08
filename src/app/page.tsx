'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Laptop,
  Menu,
  Monitor,
  ShieldCheck,
  Sparkles,
  X,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs sm:text-sm font-extrabold tracking-wider">
                IELTS
              </span>
              <span>Master BD</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/academy"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Master Curriculum
            </Link>
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
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-5 space-y-2">
            <Link
              href="/academy"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Master Curriculum (5-Step Sprints)
            </Link>
            <Link
              href="/tests"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Full Mock Tests
            </Link>
            <Link
              href="/cambridge-grader"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Cambridge Book Grader
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Pricing &amp; Plans
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Sign In
            </Link>
            <div className="pt-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
              >
                Open Student Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.22),rgba(255,255,255,0))]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>15 Minutes a Day to Band 7.5+ for Bangladeshi Candidates</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Master the Official{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                CD-IELTS Interface
              </span>{' '}
              &amp; Bangla L1 Blindspots
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              1:1 British Council &amp; IDP computer exam simulation, interactive 5-Step Learning Sprints, live Writing cliché detection, and instant AI band descriptors.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/academy"
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                Start 15-Min Curriculum Sprint
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="/tests"
                className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Laptop className="w-4 h-4 text-slate-400" />
                Take Full Mock Test
              </Link>
            </div>

            {/* PC Recommendation Pill */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-400 max-w-xl mx-auto">
              <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Complete 5-Step Learning Sprints on any device. For full CD-IELTS mock tests, use a PC with Chrome, keyboard &amp; mouse.
              </span>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-14 sm:py-20 border-t border-slate-800/80 bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  5-Step Learning Sprints
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Gated progression across CD-IELTS Mechanics, Acoustic Blindspots, T/F/NG Logic, PEEL Writing, and Bangla L1 Grammar.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Authentic CD-IELTS UI
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Split-screen Reading, right-click text highlighting &amp; sticky notes, question palette 1–40, and load-shedding resilience.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Examiner Vision &amp; Cliché Filter
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Real-time detection of memorized coaching clichés (&ldquo;plethora&rdquo;, &ldquo;every coin has two sides&rdquo;) plus instant AI band scoring.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Bangla L1 Blindspot Radar
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Fixes zero-article omissions, locative &ldquo;-এ / -তে&rdquo; preposition confusion, /f/-/v/-/z/ pronunciation, and 35 WPM typing speed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 IELTS Master BD. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/academy" className="hover:text-slate-300 transition-colors">
              Master Curriculum
            </Link>
            <Link href="/tests" className="hover:text-slate-300 transition-colors">
              Mock Tests
            </Link>
            <Link href="/cambridge-grader" className="hover:text-slate-300 transition-colors">
              Cambridge Grader
            </Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">
              bKash / Nagad Subscriptions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
