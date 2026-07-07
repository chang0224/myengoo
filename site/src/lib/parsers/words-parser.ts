import type { B2WordEntry, KeyExpressionEntry, UsefulExpressionEntry, WordsParseResult } from '../../types/vocabulary';

const B2_SECTION = '## 📚 B2+ 단어장';
const KEY_EXPRESSIONS_SECTION = '## 💡 핵심 표현';
const USEFUL_EXPRESSIONS_SECTION = '## 🗣️ 유용한 표현';

export function parseWordsFile(body: string): WordsParseResult {
	const lines = body.split('\n');

	return {
		b2: parseB2Section(getSectionLines(lines, B2_SECTION)),
		keyExpressions: parseKeyExpressionSection(getSectionLines(lines, KEY_EXPRESSIONS_SECTION)),
		usefulExpressions: parseUsefulExpressionSection(getSectionLines(lines, USEFUL_EXPRESSIONS_SECTION)),
	};
}

function getSectionLines(lines: string[], heading: string): string[] {
	const start = lines.findIndex((line) => line.trim() === heading);

	if (start === -1) {
		return [];
	}

	const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
	return lines.slice(start + 1, end === -1 ? undefined : end);
}

function parseB2Section(lines: string[]): B2WordEntry[] {
	const entries: B2WordEntry[] = [];
	let current: B2WordEntry | undefined;

	for (const line of lines) {
		const headerMatch = line.match(/^\*\*(.+?)\*\*\s+\/(.+?)\/\s+\[(.+?)\]\s+(.+)/);

		if (headerMatch) {
			if (current) {
				entries.push(current);
			}

			current = {
				word: headerMatch[1].trim(),
				ipa: headerMatch[2].trim(),
				pos: headerMatch[3].trim(),
				definitionKo: headerMatch[4].trim(),
				bodyQuote: {
					paraRef: '',
					link: '',
					text: '',
				},
				exampleEn: '',
			};
			continue;
		}

		if (!current) {
			continue;
		}

		const bodyQuoteMatch = line.match(/^- 본문 \[([^\]]+)\]\(([^)]+)\):\s*"(.+)"/);
		if (bodyQuoteMatch) {
			current.bodyQuote = {
				paraRef: bodyQuoteMatch[1].trim(),
				link: bodyQuoteMatch[2].trim(),
				text: bodyQuoteMatch[3].trim(),
			};
			continue;
		}

		const exampleMatch = line.match(/^- 예문:\s*(.+)/);
		if (exampleMatch) {
			current.exampleEn = exampleMatch[1].trim();
		}
	}

	if (current) {
		entries.push(current);
	}

	return entries;
}

function parseKeyExpressionSection(lines: string[]): KeyExpressionEntry[] {
	const entries: KeyExpressionEntry[] = [];
	let current: KeyExpressionEntry | undefined;

	for (const line of lines) {
		const entryMatch = line.match(/^- \*\*(.+?)\*\*\s+\[([^\]]+)\]\(([^)]+)\)\s+—\s+(.+)/);

		if (entryMatch) {
			if (current) {
				entries.push(current);
			}

			current = {
				expression: entryMatch[1].trim(),
				paraRef: entryMatch[2].trim(),
				link: entryMatch[3].trim(),
				definitionKo: entryMatch[4].trim(),
			};
			continue;
		}

		if (!current) {
			continue;
		}

		const bodyQuoteMatch = line.match(/^\s+-\s+"(.+)"\s*$/);
		if (bodyQuoteMatch) {
			current.bodyQuoteText = bodyQuoteMatch[1].trim();
			continue;
		}

		const usageNoteMatch = line.match(/^\s+-\s+(.+)/);
		if (usageNoteMatch) {
			current.usageNoteKo = usageNoteMatch[1].trim();
		}
	}

	if (current) {
		entries.push(current);
	}

	return entries;
}

function parseUsefulExpressionSection(lines: string[]): UsefulExpressionEntry[] {
	const entries: UsefulExpressionEntry[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const headMatch = line.match(/^- \*\*(.+?)\*\*\s+\[([^\]]+)\]\(([^)]+)\)/);

		if (!headMatch) {
			i += 1;
			continue;
		}

		const expression = headMatch[1].trim();
		const paraRef = headMatch[2].trim();
		const link = headMatch[3].trim();

		let meaningKo = '';
		let bodyQuoteText = '';
		let exampleEn = '';

		for (let j = i + 1; j < Math.min(i + 5, lines.length); j += 1) {
			const sub = lines[j];

			const meaningMatch = sub.match(/^\s+-\s*뜻:\s*(.+)/);
			if (meaningMatch) {
				meaningKo = meaningMatch[1].trim();
				continue;
			}

			const bodyMatch = sub.match(/^\s+-\s*본문:\s*"?(.+?)"?\s*$/);
			if (bodyMatch) {
				bodyQuoteText = bodyMatch[1].trim();
				continue;
			}

			const exampleMatch = sub.match(/^\s+-\s*활용:\s*(.+)/);
			if (exampleMatch) {
				exampleEn = exampleMatch[1].trim();
				continue;
			}

			if (sub.match(/^- \*\*/)) {
				break;
			}
		}

		if (meaningKo) {
			entries.push({ expression, paraRef, link, meaningKo, bodyQuoteText, exampleEn });
		}

		i += 1;
	}

	return entries;
}
