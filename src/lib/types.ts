export type QuestionCategory =
  | 'TFNG' // True / False / Not Given
  | 'YNNG' // Yes / No / Not Given
  | 'MCQ_SINGLE' // Multiple Choice (1 answer)
  | 'MCQ_MULTIPLE' // Multiple Choice (Multiple answers)
  | 'MATCHING_HEADINGS' // Matching Headings to Paragraphs
  | 'FILL_BLANKS' // One word and/or a number
  | 'SUMMARY_COMPLETION';

export interface QuestionItem {
  questionNumber: number; // 1 to 40
  category: QuestionCategory;
  promptText: string;
  options?: string[]; // Used for MCQ or Matching
  correctAnswers: string[]; // Array of acceptable answers, e.g. ["car", "the car"]
  explanation: string; // Shown after test completion
}

export interface ReadingListeningTestContent {
  sections: {
    sectionNumber: 1 | 2 | 3 | 4;
    title: string;
    passageHtml?: string; // For Reading passages
    audioTimestampStart?: number; // For Listening sections
    questions: QuestionItem[];
  }[];
}

export interface StickyNoteItem {
  id: string;
  paragraphId: string;
  quote: string;
  noteText: string;
  createdAt: number;
}

export interface AIWritingEvaluation {
  overallBand: number;
  taskResponse: { band: number; feedback: string };
  coherenceCohesion: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRange: { band: number; feedback: string };
  sentenceCorrections: {
    original: string;
    corrected: string;
    reason: string;
  }[];
  vocabularyUpgrades: {
    basicWord: string;
    band8Alternative: string;
    contextExample: string;
  }[];
  modelBand8Essay: string;
  actionableNextSteps: string[];
}

export interface AISpeakingEvaluation {
  overallBand: number;
  fluencyCoherence: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRange: { band: number; feedback: string };
  pronunciation: { band: number; feedback: string };
  fillerWordsDetected: string[];
  wordCount: number;
  modelAnswerExcerpt: string;
  actionableNextSteps: string[];
}

export type SubscriptionPlanId = 'crash_7d' | 'pro_1m' | 'pro_3m' | 'pro_1y';
export type SubscriptionTier = 'free' | SubscriptionPlanId;

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: 'student' | 'admin';
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  target_university_id: string | null;
  target_overall_band: number;
  free_ai_credits_used: number;
  created_at: string;
}

export interface PricingPlanConfig {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  dailyAiLimit: number;
  badge?: string;
  tagline: string;
  features: string[];
  popular?: boolean;
}

export const PLAN_CATALOG: Record<SubscriptionPlanId, PricingPlanConfig> = {
  crash_7d: {
    id: 'crash_7d',
    name: '7-Day Crash Pass',
    price: 199,
    duration: '7 days',
    durationDays: 7,
    dailyAiLimit: 3,
    tagline: 'Ideal for emergency exam preparation and last-minute drills',
    features: [
      '7 days full platform access',
      'All Cambridge 15–19 Answer Graders',
      'Inspera Real-Exam UI simulator',
      'Reading & Listening instant scoring',
      '3 Daily AI Writing & Speaking gradings',
    ],
  },
  pro_1m: {
    id: 'pro_1m',
    name: '1-Month Pro',
    price: 499,
    duration: '30 days',
    durationDays: 30,
    dailyAiLimit: 5,
    badge: 'MOST POPULAR',
    popular: true,
    tagline: 'The most comprehensive plan for structured 4-week preparation',
    features: [
      '30 days full platform access',
      'All Full Mock Tests (R, L, W, S)',
      'Unlimited Cambridge Companion grader',
      '5 Daily AI Examiner evaluations & model answers',
      'Target University Eligibility Matcher',
      'Question-Type Weakness Analytics',
    ],
  },
  pro_3m: {
    id: 'pro_3m',
    name: '3-Month Band 7.5+ Guarantee',
    price: 999,
    duration: '90 days',
    durationDays: 90,
    dailyAiLimit: 10,
    tagline: 'Extended practice to master exam strategies and hit top bands',
    features: [
      '90 days unrestricted access',
      'Complete library of Mock Tests',
      'Unlimited Cambridge Graders',
      '10 Daily AI evaluations (Writing + Speaking)',
      'Band 8.5 model essays & audio excerpts',
      'Priority WhatsApp/Telegram support',
    ],
  },
  pro_1y: {
    id: 'pro_1y',
    name: '1-Year Abroad Journey',
    price: 1999,
    duration: '365 days',
    durationDays: 365,
    dailyAiLimit: 15,
    tagline: 'Long-term support for university applications & retake insurance',
    features: [
      '365 days full platform access',
      'All future mock tests & Cambridge updates',
      '15 Daily AI Examiner evaluations',
      'University admission band benchmark',
      'Full longitudinal performance history',
      'Dedicated VIP student community',
    ],
  },
};
