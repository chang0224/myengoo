import type { StudyItem, UnifiedExpression, UnifiedWord } from '../types/study';

export type QuizDirection = 'en-to-kr' | 'kr-to-en';

export interface QuizQuestion {
	item: StudyItem;
	options: string[];
	correctIndex: number;
	question: string;
	correctAnswer: string;
	direction: QuizDirection;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function getEnglishText(item: StudyItem): string {
	return item.type === 'word' ? item.word : item.expression;
}

function getKoreanText(item: StudyItem): string {
	return item.definitionKo;
}

export function getQuestionText(item: StudyItem, direction: QuizDirection): string {
	return direction === 'en-to-kr' ? getEnglishText(item) : getKoreanText(item);
}

export function getAnswerText(item: StudyItem, direction: QuizDirection): string {
	return direction === 'en-to-kr' ? getKoreanText(item) : getEnglishText(item);
}

export function generateQuizQuestion(
	item: StudyItem,
	pool: StudyItem[],
	direction: QuizDirection
): QuizQuestion | null {
	const sameTypePool = pool.filter((p) => p.type === item.type && p.id !== item.id);

	if (sameTypePool.length < 3) {
		return null;
	}

	const distractors = shuffle(sameTypePool).slice(0, 3);
	const correctAnswer = getAnswerText(item, direction);
	const distractorTexts = distractors.map((d) => getAnswerText(d, direction));
	const allOptions = shuffle([correctAnswer, ...distractorTexts]);

	return {
		item,
		options: allOptions,
		correctIndex: allOptions.indexOf(correctAnswer),
		question: getQuestionText(item, direction),
		correctAnswer,
		direction,
	};
}

export function generateQuizSession(
	items: StudyItem[],
	direction: QuizDirection
): QuizQuestion[] {
	const questions: QuizQuestion[] = [];
	const shuffled = shuffle(items);

	for (const item of shuffled) {
		const question = generateQuizQuestion(item, items, direction);
		if (question) {
			questions.push(question);
		}
	}

	return questions;
}

export function isWord(item: StudyItem): item is UnifiedWord {
	return item.type === 'word';
}

export function isExpression(item: StudyItem): item is UnifiedExpression {
	return item.type === 'expression';
}
