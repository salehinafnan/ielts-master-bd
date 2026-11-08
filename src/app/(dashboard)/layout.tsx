'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CreditCard,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';
import { getEffectiveSubscriptionTier } from '@/lib/utils';
import { useExamStore } from '@/store/useExamStore';

const TIER_LABELS: Record<
  UserProfile['subscription_tier'],
  { label: string; badgeClass: string }
> = {
  free: {
    label: 'Free Tier',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  crash_7d: {
    label: 'Crash 7-Day',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  pro_1m: {
    label: 'Pro 1 Month',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  },
  pro_3m: {
    label: 'Pro 3 Months',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  },
  pro_1y: {
    label: 'Pro 1 Year',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavLinks({
  navItems,
  onNavigate,
}: {
  navItems: NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setProfile(data as UserProfile);
      }
    }

    fetchUserProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    useExamStore.getState().resetExam();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/academy', label: 'Master Curriculum', icon: GraduationCap },
    { href: '/tests', label: 'Mock Tests', icon: FileText },
    { href: '/cambridge-grader', label: 'Cambridge Grader', icon: BookOpen },
    { href: '/pricing', label: 'Pricing & Plans', icon: CreditCard },
    ...(profile?.role === 'admin'
      ? [{ href: '/admin', label: 'Admin Portal', icon: Shield }]
      : []),
  ];

  const currentTier = getEffectiveSubscriptionTier(profile);
  const tierConfig = TIER_LABELS[currentTier];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white p-4 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs font-extrabold tracking-wider">
              IELTS
            </span>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                Master BD
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                CD-IELTS Simulator
              </span>
            </div>
          </Link>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="my-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {profile?.full_name || profile?.email?.split('@')[0] || 'Student'}
              </p>
              <span
                className={`mt-0.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${tierConfig.badgeClass}`}
              >
                {tierConfig.label}
              </span>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          }
        >
          <NavLinks navItems={navItems} onNavigate={() => setMobileOpen(false)} />
        </Suspense>
      </div>

      <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 md:block dark:border-slate-800">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out md:hidden dark:bg-slate-900 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900/90">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-extrabold">
              IELTS
            </span>
            <span>Master BD</span>
          </Link>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tierConfig.badgeClass}`}
          >
            {tierConfig.label}
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
