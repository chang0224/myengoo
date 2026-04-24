import type { VocabularyWord } from '../types';

export interface FillBlankQuestion {
  word: VocabularyWord;
  sentence: string;       // example sentence with blank (_____)
  hint: string;           // e.g., "/ˈkɑːɡ.../ [형용사] c____"
}

export function createFillBlankQuestion(word: VocabularyWord): FillBlankQuestion {
  const regex = new RegExp(`\\b${escapeRegex(word.word)}\\b`, 'gi');
  const sentence = word.exampleSentence.replace(regex, '_____');

  const ipaFragment = word.ipa.length > 6 ? word.ipa.slice(0, 5) + '...' : word.ipa;
  const firstLetter = word.word[0] ?? '';
  const blanks = '_'.repeat(Math.max(word.word.length - 1, 2));
  const hint = `${ipaFragment} [${word.partOfSpeech}] ${firstLetter}${blanks}`;

  return { word, sentence, hint };
}

export function checkAnswer(input: string, word: VocabularyWord): boolean {
  return input.trim().toLowerCase() === word.word.toLowerCase();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
