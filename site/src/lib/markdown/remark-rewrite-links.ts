import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

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

const remarkRewriteLinks: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'link', (node) => {
      const url = node.url;

      // Rewrite cross-folder .md links: ../contents/slug.md#frag → /myengoo/articles/slug/?tab=original#para-N
      const mdLinkMatch = url.match(/^\.\.\/(contents|daily_news|words)\/([^#?]+\.md)(#.*)?$/);
      if (mdLinkMatch) {
        const [, folder, filename, rawFrag] = mdLinkMatch;
        const slug = filename.replace(/\.md$/, '');
        const tab = FOLDER_TO_TAB[folder];
        const frag = rawFrag ? rewriteAnchor(rawFrag) : '';
        node.url = `${BASE_URL}articles/${slug}/?tab=${tab}${frag}`;
        return;
      }

      // Rewrite same-page fragment-only links: #¶N → #para-N, #Ex.N → #ex-N
      if (url.startsWith('#')) {
        node.url = rewriteAnchor(url);
      }
    });
  };
};

export default remarkRewriteLinks;
