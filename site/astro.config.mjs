import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAnchorSlug from './src/lib/markdown/rehype-anchor-slug.ts';
import remarkRewriteLinks from './src/lib/markdown/remark-rewrite-links.ts';

export default defineConfig({
  site: 'https://cmlee.github.io',
  base: '/myengoo/',
  trailingSlash: 'always',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeAnchorSlug],
    remarkPlugins: [remarkRewriteLinks],
  },
});
