import { JSDOM, VirtualConsole } from 'jsdom';

/**
 * Parse an HTML string into a JSDOM instance (for URL resolution and DOM access).
 */
export function parseHtmlWithJSDOM(html: string, url: string): JSDOM {
  try {
    const virtualConsole = new VirtualConsole();

    // Reddit and other modern sites often include huge CSS bundles that jsdom's
    // CSS parser can't handle cleanly. By default, jsdom logs those parse
    // errors (including large chunks of CSS) to stderr, which pollutes CLI
    // output even though we don't care about stylesheet parsing for Markdown.
    virtualConsole.on('jsdomError', (error) => {
      if (
        error &&
        typeof (error as Error).message === 'string' &&
        (error as Error).message.includes('Could not parse CSS stylesheet')
      ) {
        return;
      }
      // Optionally forward other jsdom errors if you want to see them:
      // // eslint-disable-next-line no-console
      // console.error(error);
    });

    return new JSDOM(html, { url, virtualConsole });
  } catch (error) {
    throw new Error(`Failed to parse HTML from "${url}": ${String(error)}`);
  }
}
