import type { StudyItem } from '../types';

export type QuizDirection = 'en-to-kr' | 'kr-to-en';

export interface QuizQuestion {
  item: StudyItem;
  options: string[];
  correctIndex: number;
  question: string;
  correctAnswer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestion(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-kr') {
    return item.type === 'word' ? item.word : item.expression;
  }
  return item.type === 'word' ? item.definition : item.koreanExplanation;
}

function getAnswer(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-kr') {
    return item.type === 'word' ? item.definition : item.koreanExplanation;
  }
  return item.type === 'word' ? item.word : item.expression;
}

export function generateQuizQuestion(
  item: StudyItem,
  allItems: StudyItem[],
  direction: QuizDirection
): QuizQuestion {
  const correctAnswer = getAnswer(item, direction);
  const question = getQuestion(item, direction);

  const sameTypePool = allItems.filter(i => i.type === item.type && i !== item);
  const distractorItems = shuffle(sameTypePool).slice(0, 3);

  const needed = 3 - distractorItems.length;
  if (needed > 0) {
    const otherPool = allItems.filter(i => i.type !== item.type);
    distractorItems.push(...shuffle(otherPool).slice(0, needed));
  }

  const distractors = distractorItems.map(i => getAnswer(i, direction));
  const allOptions = shuffle([correctAnswer, ...distractors]);
  const correctIndex = allOptions.indexOf(correctAnswer);

  return { item, options: allOptions, correctIndex, question, correctAnswer };
}

export function generateQuizSession(items: StudyItem[], direction: QuizDirection, allItems: StudyItem[]): QuizQuestion[] {
  return shuffle(items).map(item => generateQuizQuestion(item, allItems, direction));
}
