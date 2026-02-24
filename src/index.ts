#!/usr/bin/env ts-node

import { fetchHtml } from './functions/fetchHtml';
import { parseHtmlWithJSDOM } from './functions/parseHtml';
import { removeNonContentElements } from './functions/cleanup';
import { convertHtmlToMarkdown } from './functions/markdown';
import { filterMarkdownToLinkLines } from './functions/extractLinks';

/**
 * Fetches a web page and returns its main HTML content converted to Markdown.
 *
 * This function is the core entry point for both CLI usage and AI agent
 * integration. It:
 * - Fetches the page HTML from the given URL
 * - Parses the HTML into a DOM
 * - Removes non-content elements (script, style, noscript, nav, footer, header, etc.)
 * - Converts the cleaned HTML into Markdown
 *
 * The promise always resolves to a string for robustness in agent/tool
 * integrations: on network, parsing, or conversion failure it returns a short
 * error message instead of throwing.
 *
 * @param url - Absolute URL to fetch (for example, "https://example.com/article").
 * @returns A promise resolving to the page's main content as Markdown, or a
 *          string starting with "Error:" when the content cannot be fetched or converted.
 */
export async function fetchAsMarkdown(url: string): Promise<string> {
  if (!url || typeof url !== 'string') {
    throw new Error('fetchAsMarkdown requires a non-empty URL string.');
  }

  try {
    const html = await fetchHtml(url);
    const dom = parseHtmlWithJSDOM(html, url);
    const { document } = dom.window;

    removeNonContentElements(document);

    const body = document.body;
    const cleanedHtml = body
      ? body.innerHTML
      : document.documentElement.outerHTML;

    return convertHtmlToMarkdown(cleanedHtml);
  } catch {
    return 'Error: Could not fetch content';
  }
}

export default fetchAsMarkdown;

export * from './functions/constants';
export * from './functions/fetchHtml';
export * from './functions/parseHtml';
export * from './functions/cleanup';
export * from './functions/markdown';

// CLI entrypoint: allow `node dist/index.js <url>` usage after compilation.
// This block is exercised via manual CLI usage rather than Jest tests.
console.log('--- Script Loaded ---'); // 1. Outside the block
/* istanbul ignore next */
if (require.main === module) {
  console.log('--- Inside Gatekeeper ---'); // 2. Inside the block
  const [, , ...args] = process.argv;

  const url = args.find((arg) => !arg.startsWith('-'));
  const linksOnly = args.includes('--links');

  if (!url) {
    // Basic usage hint for CLI users; process exits non-zero on misuse.
    // eslint-disable-next-line no-console
    console.error('Usage: node dist/index.js <url> [--links]');
    process.exit(1);
  }

  fetchAsMarkdown(url)
    .then((markdown) => {
      if (markdown.startsWith('Error:')) {
        console.error(markdown);
        process.exit(1);
      }

      if (linksOnly) {
        const filteredMarkdown = filterMarkdownToLinkLines(markdown);
        // eslint-disable-next-line no-console
        console.log(filteredMarkdown);
        return;
      }

      // Always prints either Markdown or a short "Error:" message string.
      // This keeps the CLI predictable and easy to pipe into other tools.
      // eslint-disable-next-line no-console
      console.log(markdown);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(
        'Error:',
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    });
}
