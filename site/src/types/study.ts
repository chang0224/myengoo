export interface VocabularySource {
	articleSlug: string;
	articleDate: string;
	articleTitle: string;
	paraRef: string;
	link: string;
	bodyQuote: string;
}

export interface UnifiedWord {
	type: 'word';
	id: string;
	word: string;
	ipa: string;
	pos: string;
	definitionKo: string;
	exampleEn: string;
	sources: VocabularySource[];
}

export interface UnifiedExpression {
	type: 'expression';
	id: string;
	expression: string;
	definitionKo: string;
	usageNoteKo?: string;
	sources: VocabularySource[];
}

export interface UnifiedUsefulExpression {
	type: 'useful-expression';
	id: string;
	expression: string;
	meaningKo: string;
	exampleEn: string;
	sources: VocabularySource[];
}

export type StudyItem = UnifiedWord | UnifiedExpression | UnifiedUsefulExpression;

export function makeWordId(word: string, ipa: string): string {
	return `w:${word.toLowerCase().trim()}|${ipa.trim()}`;
}

export function makeExpressionId(expression: string): string {
	return `e:${expression.toLowerCase().trim()}`;
}

export function makeUsefulExpressionId(expression: string): string {
	return `ue:${expression.toLowerCase().trim()}`;
}

export type SRSRating = 0 | 2 | 3 | 5;

export const SRS_RATING_AGAIN: SRSRating = 0;
export const SRS_RATING_HARD: SRSRating = 2;
export const SRS_RATING_GOOD: SRSRating = 3;
export const SRS_RATING_EASY: SRSRating = 5;

export interface SRSRecord {
	itemId: string;
	easeFactor: number;
	interval: number;
	repetitions: number;
	nextReviewDate: string;
	lastReviewDate: string;
}

export interface StudySettings {
	quizDirection: 'en-to-kr' | 'kr-to-en';
	lastStudyDate: string;
}

export const DEFAULT_SETTINGS: StudySettings = {
	quizDirection: 'en-to-kr',
	lastStudyDate: '',
};

export interface ExcludedRecord {
	itemId: string;
	excludedAt: string;
}
