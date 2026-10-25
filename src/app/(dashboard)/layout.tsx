'use client';

import { useState, useEffect } from 'react';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tests', label: 'Full Mock Tests', icon: FileText },
    { href: '/cambridge-grader', label: 'Cambridge Book Grader', icon: BookOpen },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
    ...(profile?.role === 'admin'
      ? [{ href: '/admin', label: 'Admin', icon: Shield }]
      : []),
  ];

  const currentTier = getEffectiveSubscriptionTier(profile);
  const tierConfig = TIER_LABELS[currentTier];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white p-4 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <Link
              href="/dashboard"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              IELTS Master BD
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CD-IELTS Simulator
            </p>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
              {profile?.full_name || profile?.email || 'Student'}
            </span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tierConfig.badgeClass}`}
            >
              {tierConfig.label}
            </span>
          </div>
        </div>

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
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 md:block dark:border-slate-800">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
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
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-white">
            IELTS Master BD
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${tierConfig.badgeClass}`}
          >
            {tierConfig.label}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
