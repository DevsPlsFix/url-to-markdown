/**
 * Extract unique link targets from a Markdown string.
 *
 * Supports:
 * - Standard Markdown links: [text](target)
 * - Bare HTTP(S) URLs in the text
 *
 * It intentionally runs after HTML has already been cleaned and converted.
 */
export function extractLinksFromMarkdown(markdown: string): string[] {
  const targets: string[] = [];

  // 1) Markdown link syntax: [text](target)
  // Capture the "target" part, ignoring any optional title after a space.
  const markdownLinkRegex = /\[[^\]]*]\(([^)\s]+)[^)]*\)/g;
  let mdMatch: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((mdMatch = markdownLinkRegex.exec(markdown)) !== null) {
    targets.push(mdMatch[1]);
  }

  // 2) Bare HTTP(S) URLs that might appear outside of link syntax.
  const bareUrlRegex = /https?:\/\/[^\s)]+/g;
  const bareMatches = markdown.match(bareUrlRegex) ?? [];
  targets.push(...bareMatches);

  const cleaned = targets.map((raw) => raw.replace(/[.,);:\]'"]+$/g, ''));

  return Array.from(new Set(cleaned));
}

/**
 * Return only the Markdown link tokens themselves, one per line.
 *
 * Examples:
 *   "- See [Docs](https://ex) and [API](#foo)" →
 *     "[Docs](https://ex)\n[API](#foo)"
 *   "Check https://ex.com now" →
 *     "https://ex.com"
 */
export function filterMarkdownToLinkLines(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const results: string[] = [];

  const markdownLinkRegex = /\[[^\]]*]\([^)]*\)/g;
  const bareUrlRegex = /https?:\/\/\S+/g;

  for (const line of lines) {
    const mdLinks = line.match(markdownLinkRegex) ?? [];
    if (mdLinks.length > 0) {
      // For full Markdown link tokens, keep them as-is.
      results.push(...mdLinks);
      continue;
    }

    const bareUrls = line.match(bareUrlRegex) ?? [];
    if (bareUrls.length > 0) {
      results.push(
        ...bareUrls.map((token) => token.replace(/[.,);:\]'"]+$/g, '')),
      );
    }
  }

  return results.join('\n');
}
