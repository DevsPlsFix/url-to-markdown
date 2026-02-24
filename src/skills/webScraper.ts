import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { ELEMENTS_TO_REMOVE } from '../functions/constants';

puppeteer.use(StealthPlugin());

export async function fetchAndParse(url: string): Promise<string> {
  if (!url || typeof url !== 'string') {
    throw new Error('fetchAndParse requires a non-empty URL string.');
  }

  let browser: any;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    const html = await page.evaluate(
      /* istanbul ignore next */
      () => {
        if (document.head) {
          document.head.innerHTML = '';
        }

        const nukeStyleData = (root: Node | ShadowRoot) => {
          const elements = (root as HTMLElement).querySelectorAll?.(
            'style, script, link, template',
          );
          elements?.forEach((el) => el.remove());

          const children = (root as HTMLElement).querySelectorAll?.('*') || [];
          for (const child of children) {
            if ((child as Element).shadowRoot) {
              nukeStyleData((child as Element).shadowRoot!);
            }
          }
        };

        nukeStyleData(document);

        document.querySelectorAll('body *').forEach((el) => {
          if (el.children.length === 0) {
            const text = el.textContent || '';
            if (
              text.includes('{') &&
              text.includes(';') &&
              text.includes('--tw-')
            ) {
              el.remove();
            }
          }
        });

        return document.documentElement.outerHTML;
      },
    );

    const dom = new JSDOM(html, { url });
    const { document } = dom.window;

    ELEMENTS_TO_REMOVE.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // const allElements = document.querySelectorAll('body *');
    // allElements.forEach((el) => {
    //   const text = el.textContent?.trim() || '';
    //   if (
    //     text.startsWith('.') ||
    //     text.startsWith('#') ||
    //     text.includes('--tw-') ||
    //     text.includes('--color-') ||
    //     text.includes('var(--')
    //   ) {
    //     el.remove();
    //   }
    // });

    const mainElement = document.querySelector('main');
    const contentRoot = (mainElement ||
      document.body ||
      document.documentElement) as HTMLElement;

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });

    // turndownService.addRule('nukeZombieCss', {
    //   filter: (node) => {
    //     const text = node.textContent || '';
    //     return text.includes('{') && text.includes(';') && text.includes('}');
    //   },
    //   replacement: () => '',
    // });

    const markdown = turndownService.turndown(contentRoot.innerHTML);

    return markdown.trim();
  } catch (error) {
    throw new Error(`Failed to fetch and parse "${url}": ${String(error)}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore close errors
      }
    }
  }
}
