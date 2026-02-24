import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as fetchHtmlModule from '../functions/fetchHtml';
import { fetchAsMarkdown } from '../index';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const FIXTURES_DIR = path.join(__dirname, '..', '..', '__fixtures__');

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchAsMarkdown', () => {
  describe('validation', () => {
    it('throws when URL is empty string', async () => {
      await expect(fetchAsMarkdown('')).rejects.toThrow(
        'fetchAsMarkdown requires a non-empty URL string.',
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('throws when URL is not a string', async () => {
      await expect(fetchAsMarkdown(null as unknown as string)).rejects.toThrow(
        'fetchAsMarkdown requires a non-empty URL string.',
      );
      await expect(
        fetchAsMarkdown(undefined as unknown as string),
      ).rejects.toThrow('fetchAsMarkdown requires a non-empty URL string.');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('mock-with-non-content.html (comprehensive non-content tags)', () => {
    const html = loadFixture('mock-with-non-content.html');

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: html, status: 200 });
    });

    it('removes script, style, noscript, header, footer, nav and keeps main content', async () => {
      const markdown = await fetchAsMarkdown('https://example.com');
      expect(markdown).not.toMatch(/Inline script should be removed/);
      expect(markdown).not.toMatch(/font-family: sans-serif/);
      expect(markdown).not.toMatch(/Body noscript should also be removed/);
      expect(markdown).not.toMatch(/Site Header \(removed\)/);
      expect(markdown).not.toMatch(/Footer content should be removed/);
      expect(markdown).not.toMatch(/Home.*About.*Contact/);
      expect(markdown).toMatch(/Main Article Title/);
      expect(markdown).toMatch(/\*\*main content\*\*/);
      expect(markdown).toMatch(/First list item/);
      expect(markdown).toMatch(/const x = 42;/);
    });
  });

  describe('mock-semantic.html (semantic tags)', () => {
    const html = loadFixture('mock-semantic.html');

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: html, status: 200 });
    });

    it('removes header, nav, footer and keeps article/section/aside/figure content', async () => {
      const markdown = await fetchAsMarkdown('https://example.com');
      expect(markdown).not.toMatch(/Page Header \(removed\)/);
      expect(markdown).not.toMatch(/© 2025\. Footer is removed/);
      expect(markdown).toMatch(/Introduction/);
      expect(markdown).toMatch(/semantic HTML5/);
      expect(markdown).toMatch(/Figure 1: A sample caption/);
      expect(markdown).toMatch(/Sidebar/);
    });
  });

  describe('mock-non-semantic.html (div/span only)', () => {
    const html = loadFixture('mock-non-semantic.html');

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: html, status: 200 });
    });

    it('converts div/span content to markdown and keeps div footer text', async () => {
      const markdown = await fetchAsMarkdown('https://example.com');
      expect(markdown).toMatch(/Div-Based Article Title/);
      expect(markdown).toMatch(/\*\*div\*\*/);
      expect(markdown).toMatch(/Item one/);
      expect(markdown).toMatch(/Footer text in a div/);
    });
  });

  describe('error handling', () => {
    it('returns a friendly error string when the pipeline throws', async () => {
      const spy = jest
        .spyOn(fetchHtmlModule, 'fetchHtml')
        .mockRejectedValueOnce(new Error('network failed'));

      const markdown = await fetchAsMarkdown('https://example.com/error');

      expect(markdown).toBe('Error: Could not fetch content');

      spy.mockRestore();
    });
  });
});
