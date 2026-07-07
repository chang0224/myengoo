export interface B2WordEntry {
	word: string;
	ipa: string;
	pos: string;
	definitionKo: string;
	bodyQuote: {
		paraRef: string;
		link: string;
		text: string;
	};
	exampleEn: string;
}

export interface KeyExpressionEntry {
	expression: string;
	paraRef: string;
	link: string;
	definitionKo: string;
	bodyQuoteText?: string;
	usageNoteKo?: string;
}

export interface UsefulExpressionEntry {
	expression: string;
	paraRef: string;
	link: string;
	meaningKo: string;
	bodyQuoteText: string;
	exampleEn: string;
}

export interface WordsParseResult {
	b2: B2WordEntry[];
	keyExpressions: KeyExpressionEntry[];
	usefulExpressions: UsefulExpressionEntry[];
}
