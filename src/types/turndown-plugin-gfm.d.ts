declare module 'turndown-plugin-gfm' {
  export function tables(service: import('turndown').default): void;
  export function gfm(service: import('turndown').default): void;
  export function strikethrough(service: import('turndown').default): void;
  export function taskListItems(service: import('turndown').default): void;
  export function highlightedCodeBlock(
    service: import('turndown').default,
  ): void;
}
