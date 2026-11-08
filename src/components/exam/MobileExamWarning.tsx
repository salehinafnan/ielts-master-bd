'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Smartphone,
  Keyboard,
  MousePointer2,
  Globe,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MobileExamWarningProps {
  moduleName: string;
}

export function MobileExamWarning({ moduleName }: MobileExamWarningProps) {
  const router = useRouter();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showBannerDetail, setShowBannerDetail] = useState(false);

  useEffect(() => {
    const checkViewportAndDevice = () => {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isTouchDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isSmallViewport = window.innerWidth < 1024;
      setIsMobileOrTablet(isTouchDevice || isSmallViewport);
    };

    checkViewportAndDevice();
    window.addEventListener('resize', checkViewportAndDevice);
    return () => window.removeEventListener('resize', checkViewportAndDevice);
  }, []);

  if (!isMobileOrTablet) {
    return null;
  }

  return (
    <>
      {/* Full-Screen Advisory Modal before starting or resuming on mobile/tablet */}
      {!dismissed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Official CD-IELTS Hardware Notice
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Smartphone className="h-4 w-4 text-rose-400" />
                <ArrowRight className="h-3.5 w-3.5" />
                <Monitor className="h-4 w-4 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Use a PC for the Official CD-IELTS Experience
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your official Computer-Delivered IELTS ({moduleName}) exam at the British Council or IDP test centre will be conducted on a <strong className="text-white">desktop PC</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                Recommended Setup for Realistic Practice:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span>Desktop browser such as <strong>Google Chrome</strong> or Microsoft Edge</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Keyboard className="h-4 w-4" />
                  </div>
                  <span>Full physical <strong>keyboard</strong> for realistic typing speed &amp; shortcuts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <MousePointer2 className="h-4 w-4" />
                  </div>
                  <span>External <strong>mouse</strong> for split-screen navigation &amp; text highlighting</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              We have adapted this interface so you can still preview or practice on your mobile/tablet device, but we strongly recommend switching to a PC before your exam day.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => router.push('/tests')}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Catalog
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Continue on Mobile
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Top Banner when dismissed so the reminder stays accessible */}
      {dismissed && (
        <div className="bg-amber-950/90 border-b border-amber-500/30 px-3 py-1.5 text-amber-200 text-[11px] flex items-center justify-between gap-2 shrink-0 z-30">
          <div className="flex items-center gap-1.5 min-w-0">
            <Monitor className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>CD-IELTS Tip:</strong> Real test centres use a PC with Chrome, keyboard &amp; mouse.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(false)}
            className="shrink-0 underline text-amber-300 hover:text-white font-medium flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            <span>Details</span>
          </button>
        </div>
      )}
    </>
  );
}
