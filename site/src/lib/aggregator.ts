import { getCollection } from 'astro:content';
import { extractMeta } from './content/extract-meta';
import { rewriteLink } from './markdown/rewrite-link';
import { parseWordsFile } from './parsers/words-parser';
import {
	makeExpressionId,
	makeWordId,
	type StudyItem,
	type UnifiedExpression,
	type UnifiedWord,
	type VocabularySource,
} from '../types/study';

interface ArticleMeta {
	slug: string;
	title: string;
	date: string;
}

export interface AggregatedStudy {
	words: UnifiedWord[];
	expressions: UnifiedExpression[];
	allItems: StudyItem[];
	articleMetaBySlug: Map<string, ArticleMeta>;
}

function compareByArticleDateDesc(a: VocabularySource, b: VocabularySource): number {
	if (a.articleDate === b.articleDate) {
		return a.articleSlug.localeCompare(b.articleSlug);
	}
	return b.articleDate.localeCompare(a.articleDate);
}

export async function loadStudyItems(): Promise<AggregatedStudy> {
	const [contentsEntries, wordsEntries] = await Promise.all([
		getCollection('contents'),
		getCollection('words'),
	]);

	const articleMetaBySlug = new Map<string, ArticleMeta>();
	for (const entry of contentsEntries) {
		const meta = extractMeta(entry.body ?? '');
		articleMetaBySlug.set(entry.id, {
			slug: entry.id,
			title: meta.title || entry.id,
			date: meta.date ?? '',
		});
	}

	const wordsById = new Map<string, UnifiedWord>();
	const expressionsById = new Map<string, UnifiedExpression>();

	const sortedWordsEntries = [...wordsEntries].sort((a, b) => {
		const dateA = articleMetaBySlug.get(a.id)?.date ?? '';
		const dateB = articleMetaBySlug.get(b.id)?.date ?? '';
		return dateB.localeCompare(dateA);
	});

	for (const entry of sortedWordsEntries) {
		const meta = articleMetaBySlug.get(entry.id);
		if (!meta) continue;

		const parsed = parseWordsFile(entry.body ?? '');

		for (const b2 of parsed.b2) {
			const id = makeWordId(b2.word, b2.ipa);
			const source: VocabularySource = {
				articleSlug: meta.slug,
				articleDate: meta.date,
				articleTitle: meta.title,
				paraRef: b2.bodyQuote.paraRef,
				link: rewriteLink(b2.bodyQuote.link),
				bodyQuote: b2.bodyQuote.text,
			};

			const existing = wordsById.get(id);
			if (existing) {
				if (!existing.sources.some((s) => s.articleSlug === source.articleSlug)) {
					existing.sources.push(source);
					existing.sources.sort(compareByArticleDateDesc);
				}
				continue;
			}

			wordsById.set(id, {
				type: 'word',
				id,
				word: b2.word,
				ipa: b2.ipa,
				pos: b2.pos,
				definitionKo: b2.definitionKo,
				exampleEn: b2.exampleEn,
				sources: [source],
			});
		}

		for (const ke of parsed.keyExpressions) {
			const id = makeExpressionId(ke.expression);
			const source: VocabularySource = {
				articleSlug: meta.slug,
				articleDate: meta.date,
				articleTitle: meta.title,
				paraRef: ke.paraRef,
				link: rewriteLink(ke.link),
				bodyQuote: ke.bodyQuoteText ?? '',
			};

			const existing = expressionsById.get(id);
			if (existing) {
				if (!existing.sources.some((s) => s.articleSlug === source.articleSlug)) {
					existing.sources.push(source);
					existing.sources.sort(compareByArticleDateDesc);
				}
				continue;
			}

			expressionsById.set(id, {
				type: 'expression',
				id,
				expression: ke.expression,
				definitionKo: ke.definitionKo,
				usageNoteKo: ke.usageNoteKo,
				sources: [source],
			});
		}
	}

	const words = Array.from(wordsById.values()).sort((a, b) =>
		a.word.toLowerCase().localeCompare(b.word.toLowerCase())
	);
	const expressions = Array.from(expressionsById.values()).sort((a, b) =>
		a.expression.toLowerCase().localeCompare(b.expression.toLowerCase())
	);

	return {
		words,
		expressions,
		allItems: [...words, ...expressions],
		articleMetaBySlug,
	};
}
