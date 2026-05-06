import type { DailyNewsResult, Paragraph, PhrasePair } from '../../types/daily-news';

const PARAGRAPH_HEADING = /^###\s+¶(\d+)\s*$/;
const EXERCISE_HEADING = /^###\s+Ex\.(\d+)(?:\s+.*)?$/;
const UNUSED_SECTION = /^##\s+(?:📚\s+B2\+\s+단어장|💡\s+핵심 표현)/;

export function parseDailyNews(body: string): DailyNewsResult {
	const paragraphs: Paragraph[] = [];
	let current: Paragraph | undefined;
	let pendingEn: string | undefined;

	for (const rawLine of body.split('\n')) {
		const line = rawLine.trim();

		if (UNUSED_SECTION.test(line)) {
			warnUnpaired(current, pendingEn);
			pendingEn = undefined;
			break;
		}

		const headingId = getHeadingId(line);
		if (headingId) {
			warnUnpaired(current, pendingEn);
			pendingEn = undefined;

			if (current) {
				paragraphs.push(current);
			}

			current = { id: headingId, pairs: [] };
			continue;
		}

		if (!current) {
			continue;
		}

		const phraseLine = cleanPhraseLine(rawLine);
		if (!phraseLine) {
			continue;
		}

		if (!pendingEn) {
			pendingEn = phraseLine;
			continue;
		}

		current.pairs.push(createPhrasePair(pendingEn, phraseLine));
		pendingEn = undefined;
	}

	warnUnpaired(current, pendingEn);

	if (current) {
		paragraphs.push(current);
	}

	return { paragraphs };
}

function getHeadingId(line: string): string | undefined {
	const paragraphMatch = line.match(PARAGRAPH_HEADING);
	if (paragraphMatch) {
		return `para-${paragraphMatch[1]}`;
	}

	const exerciseMatch = line.match(EXERCISE_HEADING);
	if (exerciseMatch) {
		return `ex-${exerciseMatch[1]}`;
	}

	return undefined;
}

function cleanPhraseLine(rawLine: string): string | undefined {
	const line = rawLine.trim();

	if (!line || line === '---' || line.startsWith('>') || isMetadataLine(line)) {
		return undefined;
	}

	return line.replace(/^-\s+/, '').trim();
}

function isMetadataLine(line: string): boolean {
	return /^\*\*.+\*\*$/.test(line) || line.startsWith('## ');
}

function createPhrasePair(enLine: string, koLine: string): PhrasePair {
	return {
		en: splitChunks(enLine),
		ko: splitChunks(koLine),
	};
}

function splitChunks(line: string): string[] {
	return line
		.split('/')
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0);
}

function warnUnpaired(paragraph: Paragraph | undefined, line: string | undefined): void {
	if (!paragraph || !line) {
		return;
	}

	console.warn(`Skipping unpaired daily news line in ${paragraph.id}: ${line}`);
}
