import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const markdownSchema = z.object({}).passthrough();

export const collections = {
	contents: defineCollection({
		loader: glob({ pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_*.md', base: '../contents' }),
		schema: markdownSchema,
	}),
	dailyNews: defineCollection({
		loader: glob({ pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_*.md', base: '../daily_news' }),
		schema: markdownSchema,
	}),
	words: defineCollection({
		loader: glob({ pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_*.md', base: '../words' }),
		schema: markdownSchema,
	}),
};
