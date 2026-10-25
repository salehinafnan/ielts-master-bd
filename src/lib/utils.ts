import { PLAN_CATALOG, SubscriptionPlanId, SubscriptionTier } from '@/lib/types';

export { cn } from 'cn';

export function isSubscriptionActive(profile?: {
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
} | null): boolean {
  if (!profile || !profile.subscription_tier || profile.subscription_tier === 'free') {
    return false;
  }
  if (!profile.subscription_expires_at) {
    return false;
  }
  const expiresMs = new Date(profile.subscription_expires_at).getTime();
  return !Number.isNaN(expiresMs) && expiresMs > Date.now();
}

export function getEffectiveSubscriptionTier(profile?: {
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
} | null): SubscriptionTier {
  if (!isSubscriptionActive(profile)) {
    return 'free';
  }
  return (profile?.subscription_tier as SubscriptionTier) || 'free';
}

export function getDailyAiLimit(profile?: {
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
} | null): number {
  const tier = getEffectiveSubscriptionTier(profile);
  if (tier === 'free') return 0;
  return PLAN_CATALOG[tier as SubscriptionPlanId]?.dailyAiLimit ?? 3;
}
