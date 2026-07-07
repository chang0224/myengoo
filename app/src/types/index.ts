// Vocabulary word from 📚 B2+ 단어장 section
export interface VocabularyWord {
  type: 'word';
  word: string;            // e.g., "cognitive"
  ipa: string;             // e.g., "/ˈkɑːɡnətɪv/"
  partOfSpeech: string;    // e.g., "형용사"
  definition: string;      // e.g., "인지의, 인식의"
  contextQuote: string;    // e.g., "using too much technology could..."
  contextRef: string;      // e.g., "¶2"
  exampleSentence: string; // e.g., "Puzzles and reading can improve..."
  sourceFile: string;      // e.g., "2026-04-24_technology-slow-cognitive-decline.md"
  sourceDate: string;      // e.g., "2026-04-24"
}

// Key expression from 💡 핵심 표현 section
export interface KeyExpression {
  type: 'expression';
  expression: string;         // e.g., "be associated with"
  koreanExplanation: string;  // e.g., "~와 관련되다, ~와 연관되다"
  contextQuote: string;       // e.g., "greater technology use..."
  contextRef: string;         // e.g., "¶6"
  sourceFile: string;
  sourceDate: string;
}

// Useful expression from 🗣️ 유용한 표현 section
export interface UsefulExpression {
  type: 'useful-expression';
  expression: string;         // e.g., "It's not that ~ but ~"
  koreanExplanation: string;  // 뜻: e.g., "~이 아니라 ~이다"
  contextQuote: string;       // 본문: actual sentence from article
  exampleSentence: string;    // 활용: learner example sentence
  contextRef: string;         // e.g., "¶6"
  sourceFile: string;
  sourceDate: string;
}

// Union type for study modes — discriminated by `type` field
export type StudyItem = VocabularyWord | KeyExpression | UsefulExpression;

// SRS record per study item (SM-2 algorithm fields)
export interface SRSRecord {
  itemId: string;         // stable ID: `${sourceFile}::${word|expression}`
  easeFactor: number;     // SM-2 ease factor (initial: 2.5)
  interval: number;       // days until next review
  repetitions: number;    // successful consecutive reviews
  nextReviewDate: string; // ISO date string "YYYY-MM-DD"
  lastReviewDate: string; // ISO date string "YYYY-MM-DD" or ""
}

// SRS rating from user: Again=0, Hard=2, Good=3, Easy=5
export type SRSRating = 0 | 2 | 3 | 5;

// Excluded item — user-marked "I know this" words/expressions to skip in study modes
export interface ExcludedRecord {
  itemId: string;       // stable ID matching SRS records: `${sourceFile}::${word|expression}`
  excludedAt: string;   // ISO date string "YYYY-MM-DD"
}

// Result of parsing one vocabulary markdown file
export interface ParsedVocabularyFile {
  fileName: string;          // e.g., "2026-04-24_technology-slow-cognitive-decline.md"
  date: string;              // e.g., "2026-04-24"
  title: string;             // e.g., "Technology May Slow Cognitive Decline in Older Adults"
  words: VocabularyWord[];
  expressions: KeyExpression[];
  usefulExpressions: UsefulExpression[];
}

// App-wide user settings
export interface AppSettings {
  darkMode: boolean;
  lastStudyDate: string | null;
  lastStudyMode: 'flashcard' | 'quiz' | 'fill-blank' | 'srs-review' | null;
}

// Study session configuration
export interface StudyConfig {
  mode: 'flashcard' | 'quiz' | 'fill-blank' | 'srs-review';
  dateFilter: string | null; // null = all dates
  direction?: 'en-to-kr' | 'kr-to-en'; // for quiz mode only
}
