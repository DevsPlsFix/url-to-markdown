export const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const ELEMENTS_TO_REMOVE = [
  'script',
  'style',
  'noscript',
  'link',
  'template',
  'svg',
  'iframe',
  'nav',
  'footer',
  'header',
] as const;

export type RemovableSelector = (typeof ELEMENTS_TO_REMOVE)[number];
