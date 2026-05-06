const BASE_URL = '/myengoo/';

const FOLDER_TO_TAB: Record<string, string> = {
	contents: 'original',
	daily_news: 'daily-news',
	words: 'words',
};

function rewriteAnchor(frag: string): string {
	const paraMatch = frag.match(/^#¶(\d+)$/);
	if (paraMatch) return `#para-${paraMatch[1]}`;

	const exMatch = frag.match(/^#Ex\.(\d+)$/i);
	if (exMatch) return `#ex-${exMatch[1]}`;

	return frag;
}

export function rewriteLink(url: string): string {
	const mdLinkMatch = url.match(/^\.\.\/(contents|daily_news|words)\/([^#?]+\.md)(#.*)?$/);
	if (!mdLinkMatch) return url;

	const [, folder, filename, rawFrag] = mdLinkMatch;
	const slug = filename.replace(/\.md$/, '');
	const tab = FOLDER_TO_TAB[folder];
	const frag = rawFrag ? rewriteAnchor(rawFrag) : '';

	return `${BASE_URL}articles/${slug}/?tab=${tab}${frag}`;
}
