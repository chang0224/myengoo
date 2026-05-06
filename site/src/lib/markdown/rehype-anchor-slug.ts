import GithubSlugger from 'github-slugger';
import type { Element, Root } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const paraPattern = /^¶(\d+)$/;
const exPattern = /^Ex\.(\d+)$/i;
const hrefParaPattern = /^#¶(\d+)$/;
const hrefExPattern = /^#Ex\.(\d+)$/i;

const rehypeAnchorSlug: Plugin<[], Root> = () => {
  return (tree) => {
    const slugger = new GithubSlugger();

    visit(tree, 'element', (node: Element) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        const text = hastToString(node).trim();
        const paraMatch = text.match(paraPattern);
        const exMatch = text.match(exPattern);

        if (paraMatch) {
          node.properties.id = `para-${paraMatch[1]}`;
        } else if (exMatch) {
          node.properties.id = `ex-${exMatch[1]}`;
        } else {
          node.properties.id = slugger.slug(text);
        }
        return;
      }

      if (node.tagName === 'a') {
        const href = node.properties.href as string | undefined;
        if (!href) return;
        const paraMatch = href.match(hrefParaPattern);
        if (paraMatch) { node.properties.href = `#para-${paraMatch[1]}`; return; }
        const exMatch = href.match(hrefExPattern);
        if (exMatch) { node.properties.href = `#ex-${exMatch[1]}`; }
      }
    });
  };
};

export default rehypeAnchorSlug;
