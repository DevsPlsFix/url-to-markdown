import { JSDOM } from 'jsdom';
import { parseHtmlWithJSDOM } from '../parseHtml';

describe('parseHtmlWithJSDOM', () => {
  it('returns JSDOM instance for valid HTML', () => {
    const html = '<html><body><p>Hi</p></body></html>';
    const dom = parseHtmlWithJSDOM(html, 'https://example.com');

    expect(dom).toBeInstanceOf(JSDOM);
    expect(dom.window.document.body.innerHTML).toContain('<p>Hi</p>');
    expect(dom.window.location.href).toBe('https://example.com/');
  });
});
