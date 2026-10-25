export type QuestionCategory =
  | 'TFNG' // True / False / Not Given
  | 'YNNG' // Yes / No / Not Given
  | 'MCQ_SINGLE' // Multiple Choice (1 answer)
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

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: 'student' | 'admin';
  subscription_tier: 'free' | 'crash_7d' | 'pro_1m' | 'pro_3m' | 'pro_1y';
  subscription_expires_at: string | null;
  target_university_id: string | null;
  target_overall_band: number;
  free_ai_credits_used: number;
  created_at: string;
}
