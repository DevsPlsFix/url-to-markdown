import { JSDOM } from 'jsdom';
import { removeNonContentElements } from '../cleanup';

describe('removeNonContentElements', () => {
  it('removes script, style, noscript, nav, header, footer', () => {
    const html = `
      <html><body>
        <header>Header</header>
        <nav>Nav</nav>
        <main>Main content</main>
        <script>alert(1);</script>
        <style>.x { }</style>
        <noscript>No JS</noscript>
        <footer>Footer</footer>
      </body></html>
    `;
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    removeNonContentElements(doc);

    expect(doc.querySelector('header')).toBeNull();
    expect(doc.querySelector('nav')).toBeNull();
    expect(doc.querySelector('footer')).toBeNull();
    expect(doc.querySelector('script')).toBeNull();
    expect(doc.querySelector('style')).toBeNull();
    expect(doc.querySelector('noscript')).toBeNull();
    expect(doc.querySelector('main')?.textContent).toContain('Main content');
  });

  it('accepts custom selector subset', () => {
    const html =
      '<html><body><script>x</script><style>y</style><nav>Nav</nav><p>Keep</p></body></html>';
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    removeNonContentElements(doc, ['script', 'style']);

    expect(doc.querySelector('script')).toBeNull();
    expect(doc.querySelector('style')).toBeNull();
    expect(doc.querySelector('nav')?.textContent).toBe('Nav');
    expect(doc.querySelector('p')?.textContent).toBe('Keep');
  });
});
