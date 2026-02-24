import {
  extractLinksFromMarkdown,
  filterMarkdownToLinkLines,
} from '../extractLinks';

describe('extractLinksFromMarkdown', () => {
  it('extracts targets from markdown links and bare URLs', () => {
    const markdown = `
Intro text with a bare URL https://example.com and another http://example.org.

- See the [Docs](https://example.com/docs)
- Jump to the [API](#api-section)
- Relative [Guide](/guide/getting-started)
`;

    const links = extractLinksFromMarkdown(markdown);

    expect(links).toEqual(
      expect.arrayContaining([
        'https://example.com',
        'http://example.org',
        'https://example.com/docs',
        '#api-section',
        '/guide/getting-started',
      ]),
    );

    // Should be unique
    const unique = new Set(links);
    expect(unique.size).toBe(links.length);
  });

  it('strips trailing punctuation from link targets', () => {
    const markdown = `
Check [site](https://example.com/docs), and [another](https://example.com/other).
Bare: https://example.org/path/,
`;

    const links = extractLinksFromMarkdown(markdown);

    expect(links).toEqual(
      expect.arrayContaining([
        'https://example.com/docs',
        'https://example.com/other',
        'https://example.org/path/',
      ]),
    );
  });
});

describe('filterMarkdownToLinkLines', () => {
  it('returns only link tokens, one per line, from markdown links', () => {
    const markdown = `
Intro line without links.
- See [Docs](https://example.com/docs) and [API](#api-section)
Footer with [Contact](/contact).
`;

    const filtered = filterMarkdownToLinkLines(markdown);

    expect(filtered.split('\n')).toEqual([
      '[Docs](https://example.com/docs)',
      '[API](#api-section)',
      '[Contact](/contact)',
    ]);
  });

  it('returns bare URLs as rows when no markdown links on a line', () => {
    const markdown = `
Go to https://example.com or http://example.org now.
No links here.
Also see https://example.net.
`;

    const filtered = filterMarkdownToLinkLines(markdown);

    expect(filtered.split('\n')).toEqual([
      'https://example.com',
      'http://example.org',
      'https://example.net',
    ]);
  });
});
