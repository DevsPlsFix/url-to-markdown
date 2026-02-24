/// <reference path="../types/turndown-plugin-gfm.d.ts" />
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

/**
 * Convert an HTML string to Markdown using Turndown.
 * Uses the GFM tables plugin so HTML tables become proper Markdown tables.
 */
export function convertHtmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    codeBlockStyle: 'fenced',
  });
  turndownService.use(tables);

  // Strip out large CSS blobs that sometimes leak into the visible page
  // as text nodes (for example from Tailwind or inlined critical CSS).
  // We keep the heuristic conservative to avoid deleting legitimate code
  // snippets while still catching noisy style dumps at the top of pages.
  turndownService.addRule('stripCssBlobs', {
    // See Turndown docs: filter can be a predicate receiving a DOM Node.
    filter: (node: Node) => {
      const text = (node.textContent || '').trim();
      if (!text) return false;

      const hasBraces = text.includes('{') && text.includes('}');
      const hasSemicolon = text.includes(';');
      if (!hasBraces || !hasSemicolon) return false;

      const startsLikeSelector =
        text.startsWith('.') ||
        text.startsWith('#') ||
        text.startsWith(':root') ||
        text.startsWith('@media');

      const mentionsCssVars =
        text.includes('--tw-') ||
        text.includes('--color-') ||
        text.includes('var(--');

      const isLong = text.length > 80;

      return (
        (startsLikeSelector || mentionsCssVars || isLong) &&
        text.split('\n').length > 2
      );
    },
    replacement: () => '',
  });

  return turndownService.turndown(html).trim();
}
