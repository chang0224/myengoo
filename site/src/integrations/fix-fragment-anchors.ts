import type { AstroIntegration } from 'astro';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

export function fixFragmentAnchors(): AstroIntegration {
  return {
    name: 'fix-fragment-anchors',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distPath = dir.pathname;
        const htmlFiles = await glob('**/*.html', { cwd: distPath, absolute: true });
        for (const file of htmlFiles) {
          let content = readFileSync(file, 'utf-8');
          let changed = false;
          const updated = content
            .replace(/href="#¶(\d+)"/g, (_, n) => { changed = true; return `href="#para-${n}"`; })
            .replace(/href="#Ex\.(\d+)"/gi, (_, n) => { changed = true; return `href="#ex-${n}"`; });
          if (changed) writeFileSync(file, updated, 'utf-8');
        }
      },
    },
  };
}
