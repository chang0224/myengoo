export interface PhrasePair {
	en: string[];
	ko: string[];
}

export interface Paragraph {
	id: string;
	pairs: PhrasePair[];
}

export interface DailyNewsResult {
	paragraphs: Paragraph[];
}
