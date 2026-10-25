import { QuestionCategory, QuestionItem } from '@/lib/types';

export function calculateListeningBand(rawScore: number): number {
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 32) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 26) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 18) return 5.5;
  if (rawScore >= 16) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 11) return 4.0;
  if (rawScore >= 8) return 3.5;
  if (rawScore >= 6) return 3.0;
  if (rawScore >= 4) return 2.5;
  if (rawScore === 3) return 2.0;
  if (rawScore === 2) return 1.0;
  return 0.0;
}

export function calculateAcademicReadingBand(rawScore: number): number {
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 33) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 27) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 19) return 5.5;
  if (rawScore >= 15) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  if (rawScore >= 8) return 3.5;
  if (rawScore >= 6) return 3.0;
  if (rawScore >= 4) return 2.5;
  if (rawScore === 3) return 2.0;
  if (rawScore === 2) return 1.0;
  return 0.0;
}

export function calculateGeneralReadingBand(rawScore: number): number {
  if (rawScore === 40) return 9.0;
  if (rawScore === 39) return 8.5;
  if (rawScore >= 37) return 8.0;
  if (rawScore === 36) return 7.5;
  if (rawScore >= 34) return 7.0;
  if (rawScore >= 32) return 6.5;
  if (rawScore >= 30) return 6.0;
  if (rawScore >= 27) return 5.5;
  if (rawScore >= 23) return 5.0;
  if (rawScore >= 19) return 4.5;
  if (rawScore >= 15) return 4.0;
  if (rawScore >= 12) return 3.5;
  if (rawScore >= 9) return 3.0;
  if (rawScore >= 6) return 2.5;
  return 0.0;
}

function cleanAnswer(val: string): string {
  return val.trim().toLowerCase().replace(/[.,]+$/, '').trim();
}

export function extractOptionToken(val: string): string {
  const trimmed = val.trim();
  const match = trimmed.match(/^([A-Za-z]{1,4})\s*[.):-]\s+.+$/);
  if (match) {
    return match[1].toLowerCase();
  }
  return cleanAnswer(trimmed);
}

export function checkObjectiveAnswer(userAnswer: string, acceptableAnswers: string[]): boolean {
  if (!userAnswer || !acceptableAnswers || acceptableAnswers.length === 0) {
    return false;
  }
  const cleanedUser = cleanAnswer(userAnswer);
  if (!cleanedUser) {
    return false;
  }

  const userToken = extractOptionToken(userAnswer);

  return acceptableAnswers.some((acceptable) => {
    const cleanedAcc = cleanAnswer(acceptable);
    const accToken = extractOptionToken(acceptable);
    return (
      cleanedAcc === cleanedUser ||
      accToken === userToken ||
      cleanedAcc === userToken ||
      accToken === cleanedUser
    );
  });
}

const CATEGORY_RECOMMENDATIONS: Record<QuestionCategory, string> = {
  TFNG: 'Practice skimming for True/False/Not Given — focus on identifying keywords that match or contradict the passage.',
  YNNG: "Focus on understanding the writer's claims and arguments rather than looking solely for factual data.",
  MCQ_SINGLE: 'Eliminate unlikely options first and look out for absolute qualifying words such as always or never.',
  MCQ_MULTIPLE: 'Verify each selected option independently against the passage rather than relying on general impressions.',
  MATCHING_HEADINGS: 'Read the topic sentences and concluding sentences of paragraphs before checking the heading list.',
  FILL_BLANKS: 'Check grammatical agreement and make sure you do not exceed the stated word or number limit.',
  SUMMARY_COMPLETION: 'Determine the expected part of speech for each gap and search for paraphrased expressions.',
};

export function generateWeaknessBreakdown(
  questions: QuestionItem[],
  userAnswers: Record<number, string>
): Record<string, { correct: number; total: number; percentage: number; recommendation: string }> {
  const breakdown: Record<
    string,
    { correct: number; total: number; percentage: number; recommendation: string }
  > = {};

  for (const q of questions) {
    if (!breakdown[q.category]) {
      breakdown[q.category] = { correct: 0, total: 0, percentage: 0, recommendation: '' };
    }
    breakdown[q.category].total += 1;
    const answer = userAnswers[q.questionNumber];
    if (answer && checkObjectiveAnswer(answer, q.correctAnswers)) {
      breakdown[q.category].correct += 1;
    }
  }

  for (const category of Object.keys(breakdown)) {
    const item = breakdown[category];
    const percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    item.percentage = percentage;
    if (percentage < 60) {
      item.recommendation =
        CATEGORY_RECOMMENDATIONS[category as QuestionCategory] ??
        'Review errors and practice focused drills for this question type.';
    }
  }

  return breakdown;
}
