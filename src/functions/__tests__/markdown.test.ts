import { convertHtmlToMarkdown } from '../markdown';

describe('convertHtmlToMarkdown', () => {
  it('converts headings to ATX style', () => {
    expect(convertHtmlToMarkdown('<h1>Title</h1>')).toMatch(/^# Title$/m);
    expect(convertHtmlToMarkdown('<h2>Sub</h2>')).toMatch(/^## Sub$/m);
  });

  it('converts strong and emphasis', () => {
    const out = convertHtmlToMarkdown(
      '<p><strong>bold</strong> and <em>italic</em></p>',
    );
    expect(out).toMatch(/\*\*bold\*\*/);
    expect(out).toMatch(/italic/);
  });

  it('converts links', () => {
    const out = convertHtmlToMarkdown('<a href="https://example.com">link</a>');
    expect(out).toBe('[link](https://example.com)');
  });

  it('converts lists', () => {
    const out = convertHtmlToMarkdown('<ul><li>A</li><li>B</li></ul>');
    expect(out).toMatch(/A/);
    expect(out).toMatch(/B/);
  });

  it('converts code blocks with fenced style', () => {
    const out = convertHtmlToMarkdown('<pre><code>const x = 1;</code></pre>');
    expect(out).toMatch(/```/);
    expect(out).toMatch(/const x = 1;/);
  });

  it('strips large CSS-like blobs of text', () => {
    const cssBlob = `
      .foo { color: red; }
      :root { --tw-color-primary: blue; }
      @media (min-width: 768px) {
        .bar { margin: 0; }
      }
    `;

    const html = `<div>${cssBlob}</div><p>Real content</p>`;
    const out = convertHtmlToMarkdown(html);

    expect(out).toContain('Real content');
  });

  it('does not strip short inline CSS-like snippets', () => {
    const html = '<p>span { color: red; }</p>';
    const out = convertHtmlToMarkdown(html);

    expect(out).toContain('span { color: red; }');
  });

  it('trims output', () => {
    const out = convertHtmlToMarkdown('  <p>Hi</p>  ');
    expect(out).toBe('Hi');
  });

  it('converts HTML tables to GFM pipe tables', () => {
    const html = `
      <table>
        <thead><tr><th>Name</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Alpha</td><td>1</td></tr>
          <tr><td>Beta</td><td>2</td></tr>
        </tbody>
      </table>
    `;
    const out = convertHtmlToMarkdown(html);
    expect(out).toMatch(/\| Name \| Count \|/);
    expect(out).toMatch(/\| --- \| --- \|/);
    expect(out).toMatch(/\| Alpha \| 1 \|/);
    expect(out).toMatch(/\| Beta \| 2 \|/);
  });
});
