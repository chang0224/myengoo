import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import rehypeAnchorSlug from './src/lib/markdown/rehype-anchor-slug.ts';
import remarkRewriteLinks from './src/lib/markdown/remark-rewrite-links.ts';
import { fixFragmentAnchors } from './src/integrations/fix-fragment-anchors.ts';

export default defineConfig({
  site: 'https://cmlee.github.io',
  base: '/myengoo/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [pagefind({ indexConfig: { forceLanguage: 'ko' } }), fixFragmentAnchors()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeAnchorSlug],
    remarkPlugins: [remarkRewriteLinks],
  },
});
