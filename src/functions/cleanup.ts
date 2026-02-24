import { ELEMENTS_TO_REMOVE, RemovableSelector } from './constants';

// function looksLikeTailwindCssBlob(text: string): boolean {
//   const value = text.trim();
//   if (!value) return false;

//   // Only target large chunks of CSS that clearly come from utility frameworks.
//   if (!value.includes('--tw-')) return false;

//   const hasBraces = value.includes('{') && value.includes('}');
//   const hasSemicolon = value.includes(';');
//   if (!hasBraces || !hasSemicolon) return false;

//   // Avoid nuking tiny code samples; require a reasonably big block.
//   const isLong = value.length > 200;
//   const semicolonCount = (value.match(/;/g) || []).length;

//   return isLong && semicolonCount > 5;
// }

/**
 * Remove non-content elements from the document (script, style, noscript, nav, footer, header).
 * Also strips out large Tailwind-style CSS blobs that sometimes get rendered as text.
 */
export function removeNonContentElements(
  document: Document,
  selectors: readonly RemovableSelector[] = ELEMENTS_TO_REMOVE,
): void {
  // First, drop obvious non-content tags.
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  }

  // // Then, aggressively remove giant CSS text dumps (e.g. Tailwind) that live in the body.
  // const root = document.body || document.documentElement;
  // if (!root) return;

  // const all = root.querySelectorAll<HTMLElement>('*');
  // all.forEach((el) => {
  //   const text = el.textContent || '';
  //   if (looksLikeTailwindCssBlob(text)) {
  //     el.remove();
  //   }
  // });
}
