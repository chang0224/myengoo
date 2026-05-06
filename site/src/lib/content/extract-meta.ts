export interface ArticleMeta {
	title: string;
	date?: string;
	sourceUrl?: string;
}

export function extractMeta(body: string): ArticleMeta {
	const titleMatch = body.match(/^#\s+(.+)$/m);
	const title = titleMatch ? titleMatch[1].trim() : '';

	const dateMatch = body.match(/^>\s+(?:저장일|학습일):\s*(\d{4}-\d{2}-\d{2})/m);
	const date = dateMatch ? dateMatch[1] : undefined;

	const urlMatch = body.match(/^>\s+출처:\s*(https?:\/\/\S+)/m);
	const sourceUrl = urlMatch ? urlMatch[1] : undefined;

	return { title, date, sourceUrl };
}
