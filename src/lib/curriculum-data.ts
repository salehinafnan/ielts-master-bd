export type AcademyModuleId =
  | 'module-1'
  | 'module-2'
  | 'module-3'
  | 'module-4'
  | 'module-5'
  | 'module-6';

export type InteractiveLabType =
  | 'cd1-copy-paste'
  | 'l3-audio-sync'
  | 'r5-tfng-split'
  | 'wt1-report-lab'
  | 'wt2-examiner-vision'
  | 's1-phonetic-mirror'
  | 'bg1-article-fixer'
  | 'bg2-preposition-pyramid';

export interface MasteryQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AcademyLesson {
  id: string;
  code: string;
  moduleId: AcademyModuleId;
  moduleTitle: string;
  title: string;
  subtitle: string;
  xpReward: number;
  estimatedMinutes: number;
  snapshot: {
    moduleName: string;
    targetAudienceOrImpact: string;
    coreObjective: string;
    mechanicsSummary: string;
    comparisonTable?: {
      headers: [string, string, string, string];
      rows: [string, string, string, string][];
    };
    ergonomicsSteps: {
      title: string;
      detail: string;
    }[];
  };
  conceptsAndTraps: {
    intro: string;
    traps: {
      title: string;
      badge: string;
      problem: string;
      takeaway: string;
    }[];
    strategySteps: {
      step: string;
      title: string;
      description: string;
    }[];
  };
  interactiveLab: {
    type: InteractiveLabType;
    title: string;
    instructions: string;
  };
  banglaPitfall: {
    alertTitle: string;
    rootProblem: string;
    consequence: string;
    fixSummary: string;
    comparisons: {
      wrongOrTrap: string;
      whyOrContext: string;
      band9Fix: string;
    }[];
  };
  masteryGate: {
    passingScorePercent: number;
    questions: MasteryQuestion[];
  };
}

export const BANNED_CLICHES_DICTIONARY: {
  phrase: string;
  reason: string;
  replacement: string;
}[] = [
  {
    phrase: 'since the dawn of human civilization',
    reason: 'Melodramatic memorized opening flagged by IELTS examiners.',
    replacement: 'In recent decades / Historically',
  },
  {
    phrase: 'since the dawn of time',
    reason: 'Overused memorized template opener.',
    replacement: 'Throughout modern history / In recent years',
  },
  {
    phrase: 'a plethora of',
    reason: 'Archaic and frequently misused with non-count nouns.',
    replacement: 'a substantial number of / a wide array of',
  },
  {
    phrase: 'every coin has two sides',
    reason: 'Conversational cliché inappropriate for academic register.',
    replacement: 'This issue presents distinct advantages and disadvantages',
  },
  {
    phrase: 'in a nutshell',
    reason: 'Informal idiom unsuitable for Academic Task 2 conclusions.',
    replacement: 'In conclusion / To summarize',
  },
  {
    phrase: 'discuss about',
    reason: 'Bangla L1 transitive verb error ("discuss" takes no preposition).',
    replacement: 'discuss [topic] / examine',
  },
  {
    phrase: 'increased with',
    reason: 'Bangla L1 preposition transfer error ("দিয়ে বৃদ্ধি পেয়েছে").',
    replacement: 'increased by [margin] / rose to [level]',
  },
  {
    phrase: 'peaked on',
    reason: 'Preposition error for numerical peak data.',
    replacement: 'peaked at',
  },
];

export const TOP_10_LETHAL_SPELLINGS: {
  correct: string;
  misspellings: string[];
  tip: string;
}[] = [
  {
    correct: 'Accommodation',
    misspellings: ['Acommodation', 'Accomodation'],
    tip: 'Double C and Double M (2 Cs, 2 Ms).',
  },
  {
    correct: 'Environment',
    misspellings: ['Enviroment'],
    tip: 'Don\'t drop the silent "n" before "m" (iron in environment).',
  },
  {
    correct: 'Government',
    misspellings: ['Goverment'],
    tip: 'Keep the "n" in "govern" + "ment".',
  },
  {
    correct: 'Millennium',
    misspellings: ['Millenium', 'Milenium'],
    tip: 'Double L and Double N (1,000 years).',
  },
  {
    correct: 'Occurrence',
    misspellings: ['Occurence', 'Ocurrence'],
    tip: 'Double C, Double R, ends in -ence.',
  },
  {
    correct: 'Necessary',
    misspellings: ['Necesary', 'Neccessary'],
    tip: 'One Collar (1 C) and Two Socks (2 Ss).',
  },
  {
    correct: 'Restaurant',
    misspellings: ['Resturant', 'Restaurent'],
    tip: 'au in the middle, ant at the end (rest-au-rant).',
  },
  {
    correct: 'Colleague',
    misspellings: ['Collegue', 'Coleague'],
    tip: 'Double L, ea before gue.',
  },
  {
    correct: 'Privilege',
    misspellings: ['Priviledge', 'Privelege'],
    tip: 'No "d" before the "g" (priv-i-lege).',
  },
  {
    correct: 'Maintenance',
    misspellings: ['Maintainance'],
    tip: 'Changes from "maintain" to "main-ten-ance".',
  },
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'cd-1',
    code: 'CD-1',
    moduleId: 'module-1',
    moduleTitle: 'Module 1: CD-IELTS Orientation',
    title: 'The Mechanical Shift — Paper vs. Computer-Delivered IELTS',
    subtitle:
      'Eliminate interface anxiety, eradicate transfer-time errors, and use keyboard/mouse mechanics for an immediate Band 0.5–1.0 efficiency gain.',
    xpReward: 50,
    estimatedMinutes: 12,
    snapshot: {
      moduleName: 'General Onboarding / CD-IELTS Mechanics',
      targetAudienceOrImpact:
        'Bangladeshi candidates transitioning from SSC/HSC paper-based exam habits.',
      coreObjective:
        'Master the locked CD-IELTS interface, 2-minute Listening check window, split-screen Reading, and live word counters.',
      mechanicsSummary:
        'The official British Council & IDP computer test interface behaves differently from a regular web page. Knowing how split-screen scrolling, Tab navigation, and Ctrl+C / Ctrl+V work saves up to 8 minutes per module.',
      comparisonTable: {
        headers: [
          'Feature',
          'Paper-Based Exam',
          'CD-IELTS Software Reality',
          'Tactical Implication',
        ],
        rows: [
          [
            'Listening Transfer Time',
            '10 minutes at the end',
            'Only 2 minutes at the end',
            'You must type directly into the input boxes as you listen.',
          ],
          [
            'Reading Layout',
            'Booklet (flipping pages constantly)',
            'Split-Screen (Passage Left, Questions Right)',
            'Zero page-flipping; independent scrolling on both panes.',
          ],
          [
            'Writing Word Counter',
            'Manual estimation (counting lines)',
            'Live Dynamic Word Counter beneath editor',
            'Automatic word-count tracking with zero manual counting.',
          ],
          [
            'Editing in Writing',
            'Pencil erasers, arrows, carets',
            'Ctrl + C, Ctrl + V, Ctrl + X, Backspace',
            'Fluid sentence restructuring and clean proofreading.',
          ],
          [
            'Navigation',
            'Flipping physical pages',
            'Bottom Question Palette (1–40)',
            'Instant status visibility for Answered, Unanswered, and Review flags.',
          ],
        ],
      },
      ergonomicsSteps: [
        {
          title: '1. Calibrate Equipment Instantly (0:00–1:00)',
          detail:
            'Adjust your chair so wrists stay parallel to the desk. Set on-screen volume to 70–80% — never 100%, which causes digital clipping on plosive sounds (/p/, /b/).',
        },
        {
          title: '2. Master the Two-Handed Stance',
          detail:
            'Keep your left hand on the keyboard (thumb near Tab, index near Ctrl) and your right hand on the mouse throughout Listening and Reading.',
        },
        {
          title: '3. Use the "Review" Marker Systematically',
          detail:
            'If a question takes more than 15 seconds of hesitation, enter your best educated guess, tick Review on the bottom bar, and move on.',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Three mechanical traps cause first-time Bangladeshi CD-IELTS test takers to lose marks even when their English is strong:',
      traps: [
        {
          title: 'The "Bengali Transfer-Time" Trap',
          badge: 'Critical Risk',
          problem:
            'In SSC/HSC exams, students scribble rough answers on question sheets and copy them neatly at the end. In CD-IELTS Listening, there is NO 10-minute transfer window — only 2 minutes.',
          takeaway:
            'Type answers directly into the screen boxes while listening. Only use the paper scratchpad for quick two-letter notes.',
        },
        {
          title: 'The Split-Screen Scroll Blindspot',
          badge: 'Navigation Trap',
          problem:
            'On split-screen Reading, questions 6–13 are often further down the right pane. Candidates sometimes advance to the next passage without scrolling down the right pane.',
          takeaway:
            'Always check the bottom 1–40 Question Palette to confirm every number in the current passage is highlighted as answered.',
        },
        {
          title: 'The Accidental Tab Jump',
          badge: 'Input Focus Trap',
          problem:
            'Pressing Tab carelessly can move your cursor into the next question box, causing you to type Question 4\'s answer into Question 5.',
          takeaway:
            'Verify the active blue highlight ring around the question number before typing.',
        },
      ],
      strategySteps: [
        {
          step: 'Step 1',
          title: 'Double-Click Target Word in Passage',
          description:
            'In Reading Fill-in-the-Blank questions, double-click the exact word in the left passage pane to highlight it cleanly.',
        },
        {
          step: 'Step 2',
          title: 'Press Ctrl + C to Copy',
          description:
            'Copy the exact character sequence from the passage rather than re-typing long academic words from memory.',
        },
        {
          step: 'Step 3',
          title: 'Click Input Box & Press Ctrl + V',
          description:
            'Paste directly into the answer box on the right pane to eliminate 100% of transcription spelling errors.',
        },
      ],
    },
    interactiveLab: {
      type: 'cd1-copy-paste',
      title: 'Interactive CD-IELTS Copy-Paste & Typing WPM Lab',
      instructions:
        'Practice copying exact academic terms from the left passage into the right-hand blanks, then test your QWERTY typing speed against the 35 WPM CD-IELTS benchmark.',
    },
    banglaPitfall: {
      alertTitle: 'Typing Speed & QWERTY Muscle Memory Deficit',
      rootProblem:
        'Most Bangladeshi students type fast on smartphone phonetic keyboards (Ridmik/Avro) but type at only 15–20 WPM on physical PC keyboards using a 2-finger hunt-and-peck style.',
      consequence:
        'Writing Task 2 requires 280–300 words for a Band 8+ response. At 18 WPM, you spend 17 full minutes purely pressing keys, leaving no time for planning or proofreading.',
      fixSummary:
        'Build a minimum benchmark of 35 WPM at 95% accuracy on a physical desktop keyboard before exam day.',
      comparisons: [
        {
          wrongOrTrap: 'Practicing essays on a smartphone touch screen',
          whyOrContext: 'Auto-correct and predictive text mask your real spelling errors',
          band9Fix: 'Practice exclusively on a PC with spell-check disabled',
        },
        {
          wrongOrTrap: 'Re-typing long Reading words like "photosynthesis" manually',
          whyOrContext: 'High risk of dropping a letter under time pressure',
          band9Fix: 'Double-click word in passage -> Ctrl + C -> Ctrl + V into answer box',
        },
        {
          wrongOrTrap: 'Writing full Listening answers on desk paper first',
          whyOrContext: 'Only 2 minutes remain when the audio stops',
          band9Fix: 'Type directly into the input fields while the recording plays',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'cd1-q1',
          question:
            'In the CD-IELTS Listening test, how much time do you receive after the audio recording stops to check your answers?',
          options: ['10 minutes', '5 minutes', '2 minutes', '30 seconds'],
          correctIndex: 2,
          explanation:
            'Paper-based IELTS gives 10 minutes to transfer answers, but CD-IELTS gives exactly 2 minutes because you type answers directly into the screen during the audio.',
        },
        {
          id: 'cd1-q2',
          question:
            'What happens if you type an answer into an input box, check the "Review" flag, and the 60-minute timer expires before you uncheck it?',
          options: [
            'The answer is discarded and receives 0 marks',
            'The answer remains submitted and is graded normally',
            'The software blocks auto-submission until you uncheck it',
            'Half marks are deducted',
          ],
          correctIndex: 1,
          explanation:
            'The Review checkbox is purely a visual bookmark for your own navigation. Whatever text is inside the input field at 00:00 is automatically graded.',
        },
        {
          id: 'cd1-q3',
          question:
            'What is the recommended minimum physical keyboard typing speed (WPM) for Bangladeshi candidates to comfortably write and proofread Task 2?',
          options: ['15 WPM', '20 WPM', '35 WPM', '80 WPM'],
          correctIndex: 2,
          explanation:
            'At 35+ WPM, typing a 290-word Task 2 essay takes around 8 minutes, leaving over 30 minutes for planning, lexical refinement, and grammar checking.',
        },
      ],
    },
  },
  {
    id: 'l-3',
    code: 'L-3',
    moduleId: 'module-2',
    moduleTitle: 'Module 2: IELTS Listening',
    title: 'Spelling, Numbers, Dates & Bangladeshi Acoustic Blindspots',
    subtitle:
      'Conquer the -teen vs -ty stress trap, final consonant clusters, speaker mind-changers, and the Top 10 misspelled academic words.',
    xpReward: 50,
    estimatedMinutes: 14,
    snapshot: {
      moduleName: 'Listening (All Parts, especially Part 1 & Part 4)',
      targetAudienceOrImpact:
        'Directly determines 8–12 raw marks out of 40 across form and note completion.',
      coreObjective:
        'Decode real-time connected speech, spot self-correction distractors, and achieve 100% spelling accuracy.',
      mechanicsSummary:
        'In CD-IELTS Listening Part 1, use the Tab key to jump cleanly between form fields. All-lowercase or ALL-CAPS answers are both accepted without penalty, but a single misspelled letter scores 0.',
      ergonomicsSteps: [
        {
          title: '1. Predict Slot Grammar During the 30s Silence',
          detail:
            'Before the audio starts, check whether each blank needs a Date, Currency, Phone Number, Singular Noun, or Plural Noun.',
        },
        {
          title: '2. Spot Static Unit Symbols Outside the Box',
          detail:
            'If the prompt prints "£" or "$" before the input box, type only the number (e.g., 80) to avoid duplicate unit issues.',
        },
        {
          title: '3. Keep Distractor Radar Active',
          detail:
            'In Part 1, the first date, time, or price spoken is frequently corrected a second later by the speaker ("Oh, wait, apologies...").',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Bangladeshi learners face three systematic acoustic hurdles when listening to native British, Australian, and North American speakers:',
      traps: [
        {
          title: 'Acoustic Blindspot A: The -Teen vs. -Ty Trap',
          badge: 'Stress & Pitch',
          problem:
            '15 (fif-TEEN /fɪfˈtiːn/) has high pitch and long vowel stress on the second syllable, whereas 50 (FIF-ty /ˈfɪf.ti/) has falling pitch and strong stress on the first syllable.',
          takeaway:
            'Listen for syllable length and stress placement rather than just the final "n" sound, which is often nasalized in fast speech.',
        },
        {
          title: 'Acoustic Blindspot B: Final Consonant Clusters',
          badge: 'Plural -s Drop',
          problem:
            'English words like "months" (/mʌnθs/) and "facts" (/fækts/) end in tight consonant clusters absent in Bangla phonology, causing students to miss the plural "s".',
          takeaway:
            'Always cross-check grammar: if there is no article ("a/an") before a countable noun blank, the answer is almost certainly plural.',
        },
        {
          title: 'Distractor Trap: The Mind-Changer Pattern',
          badge: 'Self-Correction',
          problem:
            'Speakers state an initial booking code or date ("Tuesday the 14th"), pause, and correct themselves ("Oh wait, the hall is closed — Thursday the 16th").',
          takeaway:
            'Never stop listening after typing the first number; wait until the speaker moves to the next topic.',
        },
      ],
      strategySteps: [
        {
          step: 'Step 1',
          title: 'Identify Prompt Slot Grammar',
          description:
            'Scan the blank during the 30-second prep pause: does it expect a proper code, date, or base price?',
        },
        {
          step: 'Step 2',
          title: 'Lock onto Acoustic Anchor Words',
          description:
            'Listen for synonyms of the words immediately preceding the blank (e.g., "quoted fare" -> "seats open at").',
        },
        {
          step: 'Step 3',
          title: 'Filter Out the Distractor & Key In',
          description:
            'Overwrite the initial distractor immediately if you hear "actually", "no, hold on", or "however".',
        },
      ],
    },
    interactiveLab: {
      type: 'l3-audio-sync',
      title: 'Audio-Sync Distractor Reveal & Lethal Spelling Drill',
      instructions:
        'Click any segment in the synchronized Skyward Air transcript to inspect the distractor vs. true answer, then test your spelling on the Top 10 Lethal IELTS words.',
    },
    banglaPitfall: {
      alertTitle: 'The "Double Consonant" Spelling Deficit',
      rootProblem:
        'Bengali spelling is phonetically regular (যুক্তবর্ণ rules map directly to sound), whereas English academic vocabulary relies on irregular Latin/French double consonants.',
      consequence:
        'Writing "Acommodation" or "Goverment" in a Listening blank results in 0 marks — there is zero partial credit for spelling.',
      fixSummary:
        'Memorize the visual double-letter patterns of the 10 most frequently tested IELTS Listening words.',
      comparisons: [
        {
          wrongOrTrap: 'Accomodation / Acommodation',
          whyOrContext: 'Missing double C or double M',
          band9Fix: 'Accommodation (2 Cs + 2 Ms)',
        },
        {
          wrongOrTrap: 'Enviroment / Goverment',
          whyOrContext: 'Dropping the silent "n" before "-ment"',
          band9Fix: 'Environment / Government',
        },
        {
          wrongOrTrap: 'Necesary / Neccessary',
          whyOrContext: 'Confusing C and S counts',
          band9Fix: 'Necessary (1 C, 2 Ss — One Collar, Two Socks)',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'l3-q1',
          question:
            'Transcript: "We can schedule the delivery for Tuesday... actually, let\'s lock in Thursday afternoon, as our warehouse is closed Tuesday." What is the correct Delivery Day?',
          options: ['Tuesday', 'Thursday', 'Wednesday', 'Friday'],
          correctIndex: 1,
          explanation:
            'Tuesday is the classic mind-changer distractor; the speaker corrects it to Thursday.',
        },
        {
          id: 'l3-q2',
          question:
            'Transcript: "My phone number is zero-double-seven, double-three, nine-eight, six-one." Which digit sequence is correct?',
          options: ['0739861', '077339861', '0077339861', '07739861'],
          correctIndex: 1,
          explanation:
            'In British English dictation, "double-seven" means 77 and "double-three" means 33, yielding 077339861.',
        },
        {
          id: 'l3-q3',
          question: 'Which of the following spellings is 100% accurate for IELTS Listening?',
          options: ['Accomodation', 'Acommodation', 'Accommodation', 'Acomodation'],
          correctIndex: 2,
          explanation:
            'Accommodation requires both a double C and a double M.',
        },
      ],
    },
  },
  {
    id: 'r-5',
    code: 'R-5',
    moduleId: 'module-3',
    moduleTitle: 'Module 3: IELTS Reading',
    title: 'True / False / Not Given (T/F/NG) Mastery',
    subtitle:
      'Replace HSC speculative inference habits with the 4-Stage Contradiction Acid Test to solve T/F/NG questions in under 75 seconds.',
    xpReward: 50,
    estimatedMinutes: 15,
    snapshot: {
      moduleName: 'Academic Reading (Passages 1, 2, and 3)',
      targetAudienceOrImpact:
        'Appears in over 90% of official IELTS Reading tests; primary source of Band 6.0 plateaus.',
      coreObjective:
        'Distinguish explicit contradiction (FALSE) from absent information (NOT GIVEN) without using outside knowledge.',
      mechanicsSummary:
        'On CD-IELTS, T/F/NG questions use radio buttons so you never lose marks for writing "T" vs "TRUE". Use right-click Highlight on the passage pane to isolate the exact target sentence before choosing your radio button.',
      ergonomicsSteps: [
        {
          title: '1. Scan for Unbreakable Anchors',
          detail:
            'Spot proper nouns, dates, and technical terms (e.g., "Boeing 747", "1970", "turbo-propeller") that cannot be paraphrased.',
        },
        {
          title: '2. Exploit Strict Sequential Order',
          detail:
            'T/F/NG answers appear in exact passage order. If you found Q1 in Paragraph 1 and Q3 in Paragraph 3, Q2 is guaranteed to be in between.',
        },
        {
          title: '3. Apply the Contradiction Acid Test',
          detail:
            'Ask: "Can I point to a sentence in the passage that proves this statement is factually opposite?" If yes -> FALSE. If the text simply doesn\'t mention that detail -> NOT GIVEN.',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'You are tested strictly on what the passage states — never on real-world general knowledge or speculative leaps:',
      traps: [
        {
          title: '1. The Qualifier Shift Trap',
          badge: 'FALSE Trigger',
          problem:
            'The passage uses a moderate qualifier ("often", "some", "primarily"), while the question swaps in an absolute qualifier ("always", "all", "exclusively").',
          takeaway:
            'An absolute claim that contradicts a partial/moderate statement in the text is FALSE.',
        },
        {
          title: '2. The "Common Knowledge" Trap',
          badge: 'NOT GIVEN Trigger',
          problem:
            'A statement sounds scientifically true (e.g., "Deforestation raises local tropical temperatures"), so students mark TRUE without checking if the passage actually states it.',
          takeaway:
            'Even if a fact is 100% true in science, if the passage does not state it, the answer is NOT GIVEN.',
        },
        {
          title: '3. The Logical Leap Trap',
          badge: 'NOT GIVEN Trigger',
          problem:
            'Passage: "Boeing 747 economies of scale reduced airfares." Question: "The Boeing 747 was cheaper to manufacture than earlier planes."',
          takeaway:
            'Lower ticket prices per passenger do not prove the factory cost of building the aircraft was lower -> NOT GIVEN.',
        },
      ],
      strategySteps: [
        {
          step: 'TRUE',
          title: '100% Semantic Match via Paraphrase',
          description:
            'The passage explicitly confirms the claim using synonymous phrasing (e.g., "exclusive luxury of the wealthy" = "unaffordable for average-income families").',
        },
        {
          step: 'FALSE',
          title: 'Direct Factual Contradiction',
          description:
            'The passage states the exact opposite (e.g., "permitted non-stop continental travel" vs "unable to cross continents without landing").',
        },
        {
          step: 'NOT GIVEN',
          title: 'Impossible to Verify from the Text',
          description:
            'The target concept or comparison is neither confirmed nor contradicted anywhere in the passage.',
        },
      ],
    },
    interactiveLab: {
      type: 'r5-tfng-split',
      title: '1:1 CD-IELTS Split-Screen T/F/NG Lab with Evidence Reveal',
      instructions:
        'Read the commercial aviation passage on the left, answer Questions 1–3 on the right, and toggle "Reveal Evidence Links" to highlight the exact proof sentences in the text.',
    },
    banglaPitfall: {
      alertTitle: 'The "HSC Comprehension Inference" Habit',
      rootProblem:
        'In SSC/HSC English 1st Paper, comprehension questions reward students for making broad socio-economic or moral assumptions beyond the literal text.',
      consequence:
        'In IELTS Reading, assuming "Karim lives in a rural village in Kurigram with scarce jobs" means "Karim lives below the poverty line" turns a NOT GIVEN answer into an incorrect TRUE.',
      fixSummary:
        'Treat every Reading passage like a legal contract: if a specific fact is not written on the page, it is NOT GIVEN.',
      comparisons: [
        {
          wrongOrTrap: 'Text: "Scarce jobs in Kurigram" -> Claim: "Karim is below the poverty line"',
          whyOrContext: 'Speculative socio-economic assumption',
          band9Fix: 'NOT GIVEN (Karim\'s personal income is never stated)',
        },
        {
          wrongOrTrap: 'Text: "Airfares fell in 1970" -> Claim: "Planes cost less to build"',
          whyOrContext: 'Confusing ticket prices with factory manufacturing cost',
          band9Fix: 'NOT GIVEN (Production cost is unmentioned)',
        },
        {
          wrongOrTrap: 'Text: "Exclusively carnivorous diet" -> Claim: "Eats plants in winter"',
          whyOrContext: '"Exclusively carnivorous" makes eating plants impossible',
          band9Fix: 'FALSE (Direct contradiction)',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'r5-q1',
          question:
            'Passage: "The Asiatic wild dog, or dhole, maintains an exclusively carnivorous diet, pack-hunting medium-sized ungulates primarily during early morning hours to avoid peak daytime temperatures." Statement: The dhole consumes plant matter during periods of food scarcity.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctIndex: 1,
          explanation:
            'FALSE — The passage states its diet is "exclusively carnivorous" (meat only), which directly contradicts eating plant matter.',
        },
        {
          id: 'r5-q2',
          question:
            'Using the same dhole passage above — Statement: Dholes hunt in groups rather than targeting prey as solitary individuals.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctIndex: 0,
          explanation:
            'TRUE — "pack-hunting" directly paraphrases hunting in groups.',
        },
        {
          id: 'r5-q3',
          question:
            'Using the same dhole passage above — Statement: Morning hunting by dholes leads to higher hunting success rates compared to night hunting.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctIndex: 2,
          explanation:
            'NOT GIVEN — The passage says they hunt in the morning to avoid daytime heat, but never compares hunting success rates against night hunting.',
        },
      ],
    },
  },
  {
    id: 'w-t1-1',
    code: 'W-T1-1',
    moduleId: 'module-4',
    moduleTitle: 'Module 4: IELTS Academic Writing',
    title: 'Academic Task 1 — The 4-Paragraph Blueprint & Data Prepositions',
    subtitle:
      'Avoid the Band 5.0 "No Overview" cap and master high-precision data prepositions (by, to, at, of, between/and).',
    xpReward: 50,
    estimatedMinutes: 14,
    snapshot: {
      moduleName: 'Academic Writing Task 1 (150+ words | 20 minutes | 33% weight)',
      targetAudienceOrImpact:
        'Essential for candidates who lose marks by writing mechanical year-by-year "data dumps".',
      coreObjective:
        'Structure a 175-word report in 4 clean paragraphs with a number-free macro Overview and accurate trend grammar.',
      mechanicsSummary:
        'In CD-IELTS Task 1, the chart stays visible on the left pane while you type on the right. Write your Overview immediately after the 1-sentence Introduction so you are guaranteed Band 7+ Task Achievement even if time gets tight.',
      ergonomicsSteps: [
        {
          title: 'Paragraph 1: Introduction (~30 words)',
          detail:
            'Paraphrase the chart title in 1 sentence using synonyms and time-period restructuring.',
        },
        {
          title: 'Paragraph 2: The Overview (~40 words — CRITICAL)',
          detail:
            'Summarize 2–3 macro trends (highest/lowest, biggest growth/decline) with ZERO specific numbers or percentages.',
        },
        {
          title: 'Paragraphs 3 & 4: Grouped Data Comparisons (~105 words)',
          detail:
            'Group categories logically (e.g., rising trends in Body 1, falling/stable trends in Body 2) supported by exact figures.',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Task 1 is an analytical summary test, not a descriptive list. Watch out for these two score-lowering habits:',
      traps: [
        {
          title: 'The Missing Overview Penalty (Hard Cap at Band 5.0)',
          badge: 'Task Achievement',
          problem:
            'Candidates jump straight from the introduction into listing numbers from 1980 to 2020 without writing a macro Overview paragraph.',
          takeaway:
            'Without a clear Overview paragraph, Task Achievement cannot exceed Band 5.0 regardless of grammar quality.',
        },
        {
          title: 'The Mechanical "Data Dump"',
          badge: 'Coherence Penalty',
          problem:
            'Writing "In 1980 it was 220, then in 1990 it was 180, then in 2000 it was 160..." without comparing categories.',
          takeaway:
            'Always link figures using comparative structures ("compared to", "overtook", "whereas", "in stark contrast").',
        },
      ],
      strategySteps: [
        {
          step: 'Preposition 1',
          title: 'Increased BY vs. Increased TO',
          description:
            'Use "by" for the margin of change ("rose by 20%") and "to" for the final destination level ("rose to 85%").',
        },
        {
          step: 'Preposition 2',
          title: 'Peaked AT / Stood AT',
          description:
            'Use "at" for static points on a graph ("stood at 220 grams", "peaked at 250 grams").',
        },
        {
          step: 'Preposition 3',
          title: 'Fluctuated BETWEEN X AND Y',
          description:
            'Pair "between" with "and" (never "between 50 to 60"). Pair "from" with "to".',
        },
      ],
    },
    interactiveLab: {
      type: 'wt1-report-lab',
      title: 'Band 9 Task 1 Report Deconstructor & Preposition Precision Lab',
      instructions:
        'Inspect each paragraph of the Band 9 European Meat Consumption report (178 words) and test your command of data prepositions.',
    },
    banglaPitfall: {
      alertTitle: 'Task 1 Preposition & Collocation Interference',
      rootProblem:
        'Bengali uses broad suffixes like "-এ", "-র", or "দিয়ে" for margins and points, causing direct translation errors in English data reporting.',
      consequence:
        'Repeated preposition errors ("increased with 20%", "peaked on 500") lower Grammatical Range and Accuracy to Band 5.5–6.0.',
      fixSummary:
        'Audit every number in your Task 1 draft to verify the preposition immediately before it.',
      comparisons: [
        {
          wrongOrTrap: 'Sales increased with 20%.',
          whyOrContext: 'Literal translation of "২০% দিয়ে বৃদ্ধি পেয়েছে"',
          band9Fix: 'Sales increased by 20%.',
        },
        {
          wrongOrTrap: 'The figure peaked on 250 grams.',
          whyOrContext: 'Misusing "on" for a numerical point',
          band9Fix: 'The figure peaked at 250 grams.',
        },
        {
          wrongOrTrap: 'According to the graph, we can see that...',
          whyOrContext: 'Conversational filler; graphs are not human authors',
          band9Fix: 'The graph illustrates that... / It is evident that...',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'wt1-q1',
          question:
            'Choose the correct prepositions: "Beef consumption dropped dramatically ___ 100 grams in 2020, representing an overall decline ___ 120 grams."',
          options: ['by / with', 'to / of', 'at / by', 'in / from'],
          correctIndex: 1,
          explanation:
            'Dropped "to" 100 grams (final resting point) and a decline "of" 120 grams (noun phrase + of + margin).',
        },
        {
          id: 'wt1-q2',
          question:
            'What is the maximum Task Achievement band score if your Task 1 report has no clear Overview?',
          options: ['Band 7.0', 'Band 6.5', 'Band 5.0', 'Band 8.0'],
          correctIndex: 2,
          explanation:
            'Official IELTS Task 1 descriptors cap Task Achievement at Band 5.0 if there is no clear overview.',
        },
        {
          id: 'wt1-q3',
          question:
            'Which sentence is grammatically accurate for an IELTS Task 1 report?',
          options: [
            'Fish intake fluctuated narrowly between 50 to 60 grams.',
            'Fish intake fluctuated narrowly between 50 and 60 grams.',
            'Fish intake fluctuated narrowly from 50 and 60 grams.',
            'Fish intake remained steady on 50 grams.',
          ],
          correctIndex: 1,
          explanation:
            '"Between" must be paired with "and" ("between 50 and 60 grams").',
        },
      ],
    },
  },
  {
    id: 'w-t2-1',
    code: 'W-T2-1',
    moduleId: 'module-4',
    moduleTitle: 'Module 4: IELTS Academic Writing',
    title: 'Task 2 — Opinion Essays, The PEEL Engine & Banned Clichés',
    subtitle:
      'Overcome the indecisive "both sides" Band 6.0 trap, structure body paragraphs with PEEL, and eliminate memorized coaching clichés.',
    xpReward: 50,
    estimatedMinutes: 15,
    snapshot: {
      moduleName: 'Writing Task 2 (250+ words | 40 minutes | 67% weight)',
      targetAudienceOrImpact:
        'Task 2 carries double the weight of Task 1 and is the decisive module for University admission cutoffs (minimum 6.5).',
      coreObjective:
        'Maintain a crystal-clear position from introduction to conclusion using the 4-part PEEL paragraph architecture.',
      mechanicsSummary:
        'In CD-IELTS Task 2, separate paragraphs by pressing Enter twice to leave a clean blank line. Never indent first lines. If you spot a weak argument during your final review, click directly inside the paragraph to insert a concrete example.',
      ergonomicsSteps: [
        {
          title: 'P — Point (Topic Sentence, ~1 sentence)',
          detail:
            'State the single central reason for the paragraph clearly in the first sentence.',
        },
        {
          title: 'E — Explanation (~2 sentences)',
          detail:
            'Unpack the cause-and-effect chain: WHY and HOW does this policy or trend lead to that outcome?',
        },
        {
          title: 'E — Example (~1–2 sentences) & L — Link (~1 sentence)',
          detail:
            'Anchor the logic in a concrete real-world scenario, then link the outcome back to the essay prompt.',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Why do thousands of Bangladeshi students with good grammar remain stuck at Band 6.0 in Writing?',
      traps: [
        {
          title: 'The Indecisive "Balanced" Fallacy',
          badge: 'Task Response Cap 6.0',
          problem:
            'Writing "I completely agree" in the intro, writing Body 2 against your own thesis, and concluding "Every coin has two sides."',
          takeaway:
            'Band 7+ Task Response requires a consistent, unambiguous position sustained from the first sentence to the final word.',
        },
        {
          title: 'Memorized Coaching Templates',
          badge: 'Lexical Penalty',
          problem:
            'Opening essays with "Since the dawn of human civilization, this topic has sparked a heated debate..."',
          takeaway:
            'Examiners immediately discount memorized boilerplate and grade only your original topic-specific language.',
        },
      ],
      strategySteps: [
        {
          step: 'Intro (45w)',
          title: 'Paraphrase Prompt + Direct Thesis Statement',
          description:
            'Paraphrase the debate in 1 sentence, then state your exact stance and two core reasons in sentence 2.',
        },
        {
          step: 'Body 1 & 2 (200w)',
          title: 'Two Fully Developed PEEL Paragraphs',
          description:
            'Dedicate each body paragraph to one distinct reason, supported by causal explanation and a specific example.',
        },
        {
          step: 'Conclusion (45w)',
          title: 'Synthesize Stance Without New Arguments',
          description:
            'Begin with "In conclusion," restate your position using fresh phrasing, and close with a final summarizing thought.',
        },
      ],
    },
    interactiveLab: {
      type: 'wt2-examiner-vision',
      title: '"Examiner Vision" Band 9 Essay Deconstructor & Live Cliché Scanner',
      instructions:
        'Toggle Cohesion, Lexical Resource, and Complex Grammar filters on the Band 9 Community Service essay, click highlighted phrases to read Examiner Notes, and test your own draft in the Live Banned Cliché Scanner.',
    },
    banglaPitfall: {
      alertTitle: 'Banned Coaching Clichés & Pseudo-Academic Filler',
      rootProblem:
        'Local guidebooks encourage memorizing dramatic idioms ("every coin has two sides", "in a nutshell", "a plethora of") that clash with formal academic English.',
      consequence:
        'Examiners recognize these prefabricated templates immediately, capping Lexical Resource and Coherence.',
      fixSummary:
        'Replace theatrical clichés with natural, precise academic collocations.',
      comparisons: [
        {
          wrongOrTrap: '"Since the dawn of human civilization..."',
          whyOrContext: 'Melodramatic template opener',
          band9Fix: '"In recent decades..." / "It is often suggested that..."',
        },
        {
          wrongOrTrap: '"Every coin has two sides."',
          whyOrContext: 'Conversational cliché',
          band9Fix: '"This policy presents both merits and drawbacks."',
        },
        {
          wrongOrTrap: '"In a nutshell..."',
          whyOrContext: 'Informal spoken idiom in a formal conclusion',
          band9Fix: '"In conclusion, I firmly support..."',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'wt2-q1',
          question:
            'Identify the role of this sentence in the PEEL framework: "For instance, adolescent learners who participate in municipal recycling drives often develop a lifelong commitment to sustainable habits."',
          options: [
            'Point (Topic Sentence)',
            'Explanation',
            'Example / Evidence',
            'Thesis Statement',
          ],
          correctIndex: 2,
          explanation:
            'It provides a concrete, empirical real-world scenario ("For instance...") to ground the preceding explanation.',
        },
        {
          id: 'wt2-q2',
          question:
            'Which conclusion opener is appropriate for an Academic Writing Task 2 essay?',
          options: [
            'In a nutshell,',
            'Last but not least,',
            'In conclusion,',
            'As every coin has two sides,',
          ],
          correctIndex: 2,
          explanation:
            '"In conclusion," is clean, academic, and universally accepted at Band 9.',
        },
        {
          id: 'wt2-q3',
          question:
            'How should you visually separate paragraphs in the CD-IELTS Writing computer editor?',
          options: [
            'Press Spacebar 5 times on the first line',
            'Press Enter twice to leave a clean blank line between paragraphs',
            'Use bullet points for every sentence',
            'Write the entire essay as a single block of text',
          ],
          correctIndex: 1,
          explanation:
            'Pressing Enter twice creates an unmistakable blank line between paragraphs on screen.',
        },
      ],
    },
  },
  {
    id: 's-1',
    code: 'S-1',
    moduleId: 'module-5',
    moduleTitle: 'Module 5: IELTS Speaking',
    title: 'Part 1 Fluency — The AREA Strategy & Phonetic Mirror (/f/, /v/, /z/)',
    subtitle:
      'Break out of flat syllable-timed rhythm, structure 4-sentence Part 1 answers with AREA, and master labiodental fricatives.',
    xpReward: 50,
    estimatedMinutes: 12,
    snapshot: {
      moduleName: 'Speaking Part 1 (4–5 minutes | In-Centre Video Call or Face-to-Face)',
      targetAudienceOrImpact:
        'Sets the examiner\'s immediate impression of your Fluency, Lexical Resource, and Pronunciation.',
      coreObjective:
        'Deliver natural 3–4 sentence responses using AREA while articulating /f/, /v/, and /z/ cleanly.',
      mechanicsSummary:
        'At British Council & IDP centres in Dhaka and Chittagong, Speaking is frequently conducted via High-Definition Video Call Speaking (VCS) with a boom headset. Speak at a natural conversational volume and look toward the monitor camera.',
      ergonomicsSteps: [
        {
          title: '[A] Answer — Direct & Natural Opening',
          detail:
            'Avoid robotic "Yes, I do." Open with natural spoken framing ("To be perfectly honest, I\'m more of a night owl...").',
        },
        {
          title: '[R] Reason & [E] Example',
          detail:
            'Explain why ("because of Dhaka\'s morning traffic...") and give a quick personal example ("if I leave after 7 AM, my commute doubles").',
        },
        {
          title: '[A] Alternative / Wrap-Up',
          detail:
            'Close cleanly with a contrast ("On the weekends, though, I happily sleep in until ten").',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Two opposite extremes hold candidates back in Speaking Part 1:',
      traps: [
        {
          title: 'The Monosyllabic "Yes/No" Stop',
          badge: 'Band 5.0 Fluency',
          problem:
            'Examiner: "Do you enjoy cooking?" Candidate: "Yes, I like cooking very much. It is my hobby." (Silence).',
          takeaway:
            'Short 1-sentence answers starve the examiner of speech samples, making it impossible to award Band 7+.',
        },
        {
          title: 'The Memorized Essay Monologue',
          badge: 'Immediate Interruption',
          problem:
            'Reciting a formal Task 2 speech in Part 1 ("Since the earliest dawns of human existence, food has played a vital role...").',
          takeaway:
            'Part 1 is a personal interview; use conversational idiomatic English, not memorized essay templates.',
        },
      ],
      strategySteps: [
        {
          step: 'Phoneme /f/',
          title: 'Voiceless Labiodental Fricative (Fan, Coffee, Prefer)',
          description:
            'Rest your upper front teeth gently on your lower lip and blow air continuously — do NOT press both lips together like Bangla "ফ" (/pʰ/).',
        },
        {
          step: 'Phoneme /v/',
          title: 'Voiced Labiodental Fricative (Very, Travel, Environment)',
          description:
            'Keep upper teeth on your lower lip and vibrate your vocal cords — do NOT close both lips like Bangla "ভ" (/bʱ/).',
        },
        {
          step: 'Phoneme /z/',
          title: 'Voiced Alveolar Fricative (Zero, Reason, Result)',
          description:
            'Buzz the tip of your tongue behind your upper teeth — do NOT substitute a hard Bangla "জ" (/dʒ/) sound.',
        },
      ],
    },
    interactiveLab: {
      type: 's1-phonetic-mirror',
      title: 'Bangla Trap Audio/Phonetic Mirror & AREA Response Builder',
      instructions:
        'Listen to side-by-side pronunciation contrasts, record your own voice to practice /f/, /v/, and /z/ drills, and build a 4-part AREA response.',
    },
    banglaPitfall: {
      alertTitle: 'Syllable-Timed Rhythm & /f/-/v/-/z/ Substitutions',
      rootProblem:
        'Bengali is syllable-timed (every syllable gets equal duration), whereas English is stress-timed (content words are stretched while function words like "to", "of", "for" reduce to schwa /ə/).',
      consequence:
        'Substituting /pʰ/ for /f/ ("Pripar" for "Prefer") and /bʱ/ for /v/ ("Bhery" for "Very") combined with flat syllable timing caps Pronunciation at Band 5.5–6.0.',
      fixSummary:
        'Anchor your top teeth on your bottom lip for every F and V word, and stress key content words.',
      comparisons: [
        {
          wrongOrTrap: '"I bhery much pripar kopee in the morning"',
          whyOrContext: 'Bilabial /bʱ/ and /pʰ/ substitution for /v/ and /f/',
          band9Fix: '"I very much prefer coffee in the morning" (top teeth on lower lip)',
        },
        {
          wrongOrTrap: '"The rejult of the reajon is jero"',
          whyOrContext: 'Substituting affricate /dʒ/ (জ) for alveolar buzz /z/',
          band9Fix: '"The result of the reason is zero" (buzzing /z/)',
        },
        {
          wrongOrTrap: '1-sentence reply: "Yes, I listen to rock music."',
          whyOrContext: 'No Reason, Example, or Alternative provided',
          band9Fix: '4-sentence AREA response with a concrete personal example',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 's1-q1',
          question:
            'How are the English sounds /f/ (as in "fan") and /v/ (as in "very") physically produced?',
          options: [
            'By pressing both lips tightly together and releasing a puff of air',
            'By resting the upper front teeth gently on the lower lip while airflow passes through',
            'By curling the tongue backward against the roof of the mouth',
            'By tapping the tongue against the back of the lower teeth',
          ],
          correctIndex: 1,
          explanation:
            '/f/ and /v/ are labiodental fricatives: upper teeth gently touch the lower lip.',
        },
        {
          id: 's1-q2',
          question: 'What does the "AREA" framework stand for in IELTS Speaking Part 1?',
          options: [
            'Argument, Rhetoric, Evidence, Analysis',
            'Answer, Reason, Example, Alternative',
            'Ask, Repeat, Explain, Agree',
            'Abstract, Review, Elaborate, Assert',
          ],
          correctIndex: 1,
          explanation:
            'AREA stands for Answer, Reason, Example, Alternative — giving you 3 to 4 natural sentences on any Part 1 question.',
        },
        {
          id: 's1-q3',
          question:
            'Why does English sound different in rhythm from Bengali?',
          options: [
            'English is stress-timed (content words stressed, function words reduced to schwa), whereas Bengali is syllable-timed',
            'English speakers pronounce every syllable for the exact same duration',
            'English has no stressed syllables',
            'English requires speaking as fast as possible without pausing',
          ],
          correctIndex: 0,
          explanation:
            'English is stress-timed, meaning key content words receive stress while small grammar words ("to", "of") reduce to quick schwa sounds.',
        },
      ],
    },
  },
  {
    id: 'bg-1',
    code: 'BG-1',
    moduleId: 'module-6',
    moduleTitle: 'Module 6: The Bangladesh Linguistic Bridge',
    title: 'Eradicating the Zero-Article & Preposition Blindspots',
    subtitle:
      'Fix the #1 grammatical accuracy leak for Bangladeshi candidates: missing "a/an/the" articles and locative "-এ / -তে" preposition confusion.',
    xpReward: 50,
    estimatedMinutes: 14,
    snapshot: {
      moduleName: 'Bangla-to-English Grammar Bridge (Writing & Speaking GRA)',
      targetAudienceOrImpact:
        'Directly raises Grammatical Range & Accuracy (GRA) by eliminating systematic L1 transfer errors in every paragraph.',
      coreObjective:
        'Apply the Countable/Specificity Article Flowchart and the In/On/At Preposition Pyramid automatically while writing.',
      mechanicsSummary:
        'Bengali uses suffixes (-টি, -টা) and a single versatile locative marker (-এ / -তে) for in, on, and at. In English, leaving a singular countable noun bare ("Citizen uses private vehicle") is an immediate grammatical error.',
      ergonomicsSteps: [
        {
          title: 'Rule 1: Never Leave a Singular Countable Noun Bare',
          detail:
            'Every singular countable noun ("citizen", "vehicle", "method", "challenge") MUST have a determiner (a, an, the, this, my) in front of it.',
        },
        {
          title: 'Rule 2: Use Zero Article for Plural/Uncountable Generalizations',
          detail:
            'When speaking about a category in general, use plural or uncountable nouns with NO "the" ("Pollution is a major challenge in developing cities", "Students should wear uniforms").',
        },
        {
          title: 'Rule 3: Apply the IN -> ON -> AT Spatial/Temporal Pyramid',
          detail:
            'IN = broad (decades, years, months, countries, cities); ON = surfaces/days/dates; AT = exact pinpoints (clock times, specific junctions, numerical peaks).',
        },
      ],
    },
    conceptsAndTraps: {
      intro:
        'Master these high-frequency Bangla-to-English structural rules:',
      traps: [
        {
          title: 'Trap 1: Overusing "The" with General Plural/Uncountable Nouns',
          badge: 'Article Error',
          problem:
            'Writing "The pollution is a major challenge" or "The technology has changed human communication."',
          takeaway:
            'Drop "The" when referring to uncountable or plural nouns in a universal, general sense.',
        },
        {
          title: 'Trap 2: Dropping "A/An" Before Singular Countable Nouns',
          badge: 'Bare Noun Error',
          problem:
            'Translating "গবেষক নতুন পদ্ধতি আবিষ্কার করেছেন" literally as "Researcher discovered new method."',
          takeaway:
            'Write "The researcher discovered a new method." Singular countable nouns cannot stand alone.',
        },
        {
          title: 'Trap 3: Locative "-এ / -তে" Preposition Blending',
          badge: 'In / On / At',
          problem:
            'In Bangla, টেবিলে (on the table), ঘরে (in the room), and স্টেশনে (at the station) all use "-এ", leading to "in Monday" or "at Dhaka".',
          takeaway:
            'Use IN for cities/countries/years (in Dhaka, in 2026), ON for days/dates/surfaces (on Monday), and AT for exact points/times (at 5:00 PM).',
        },
      ],
      strategySteps: [
        {
          step: 'IN (Broad)',
          title: 'Years, Months, Decades, Countries & Cities',
          description:
            'in 2020, in September, in the 21st century, in Bangladesh, in Chittagong, in comparison with.',
        },
        {
          step: 'ON (Surface/Day)',
          title: 'Days, Specific Dates, Streets & Surfaces',
          description:
            'on Tuesday, on 21st July, on Mirpur Road, on the graph, have an impact on, spend money on.',
        },
        {
          step: 'AT (Pinpoint)',
          title: 'Exact Clock Times, Junctions & Numerical Levels',
          description:
            'at 7:30 AM, at midnight, at the bus stop, peaked at 80%, remained steady at, at an alarming rate.',
        },
      ],
    },
    interactiveLab: {
      type: 'bg1-article-fixer',
      title: 'Interactive Article Diagnostic & Preposition Pyramid Lab',
      instructions:
        'Fix the 6 article and preposition errors in the Dhaka traffic paragraph below and test your speed on the Bangla-to-English Preposition Pyramid.',
    },
    banglaPitfall: {
      alertTitle: 'Direct Bangla Verb-Preposition Translation Traps',
      rootProblem:
        'Translating Bengali postpositions ("নিয়ে আলোচনা করা", "তাকে বলেছিলাম") word-for-word into English.',
      consequence:
        'Produces fossilized errors like "discuss about", "told to him", and "comprise of" that immediately stand out to examiners.',
      fixSummary:
        'Use transitive English verbs directly without redundant prepositions.',
      comparisons: [
        {
          wrongOrTrap: '"We will discuss about this issue."',
          whyOrContext: 'Bangla: "এই সমস্যা নিয়ে আলোচনা করব"',
          band9Fix: '"We will discuss this issue." (No "about")',
        },
        {
          wrongOrTrap: '"I told to him."',
          whyOrContext: 'Bangla: "আমি তাকে বলেছিলাম"',
          band9Fix: '"I told him." OR "I said to him."',
        },
        {
          wrongOrTrap: '"The pollution is major challenge in the developing cities."',
          whyOrContext: 'Redundant "The" + missing "a" before singular noun',
          band9Fix: '"Pollution is a major challenge in developing cities."',
        },
      ],
    },
    masteryGate: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'bg1-q1',
          question:
            'Choose the grammatically accurate correction for: "The pollution is major challenge in the developing cities."',
          options: [
            'The pollution is a major challenge in the developing cities.',
            'Pollution is a major challenge in developing cities.',
            'A pollution is major challenge in developing cities.',
            'Pollution is the major challenge in the developing city.',
          ],
          correctIndex: 1,
          explanation:
            '"Pollution" (uncountable general) and "developing cities" (plural general) take zero article, while "challenge" (singular countable) requires "a".',
        },
        {
          id: 'bg1-q2',
          question:
            'Which sentence uses prepositions accurately?',
          options: [
            'The seminar will be held in Tuesday on 5:00 PM at Dhaka.',
            'The seminar will be held on Tuesday at 5:00 PM in Dhaka.',
            'The seminar will be held at Tuesday in 5:00 PM on Dhaka.',
            'We will discuss about the seminar on Tuesday.',
          ],
          correctIndex: 1,
          explanation:
            'Days take ON (on Tuesday), exact times take AT (at 5:00 PM), and cities take IN (in Dhaka).',
        },
        {
          id: 'bg1-q3',
          question:
            'Which geographic country name requires the definite article "the" in Academic Writing?',
          options: [
            'the Bangladesh',
            'the Germany',
            'the United Kingdom',
            'the Australia',
          ],
          correctIndex: 2,
          explanation:
            'Countries with political union nouns or plural names (the United Kingdom, the United States, the Netherlands, the UAE) require "the".',
        },
      ],
    },
  },
];
