import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { fetchAndParse } from '../webScraper';

jest.mock('puppeteer-extra', () => {
  const launch = jest.fn();
  const use = jest.fn();
  return {
    __esModule: true,
    default: {
      launch,
      use,
    },
  };
});

jest.mock('puppeteer-extra-plugin-stealth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({})),
  };
});

jest.mock('jsdom', () => {
  const JSDOMMock = jest.fn(() => ({
    window: {
      document: {
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => ({ innerHTML: '<p>main content</p>' })),
        body: { innerHTML: '<p>main content</p>' },
        documentElement: { outerHTML: '<html><body>fallback</body></html>' },
      },
    },
  }));

  return {
    __esModule: true,
    JSDOM: JSDOMMock,
    VirtualConsole: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
    })),
  };
});

const turndownInstance = {
  turndown: jest.fn(() => 'MARKDOWN_CONTENT'),
  addRule: jest.fn(),
};

jest.mock('turndown', () => ({
  __esModule: true,
  default: jest.fn(() => turndownInstance),
}));

describe('fetchAndParse', () => {
  const mockedPuppeteer = puppeteer as unknown as {
    launch: jest.Mock;
    use: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws for empty URL', async () => {
    await expect(fetchAndParse('')).rejects.toThrow(
      'fetchAndParse requires a non-empty URL string.',
    );
    expect(mockedPuppeteer.launch).not.toHaveBeenCalled();
  });

  it('scrapes page HTML and returns markdown', async () => {
    const close = jest.fn();
    const evaluate = jest.fn(
      async () => '<html><body><main><p>main content</p></main></body></html>',
    );
    const goto = jest.fn();
    const newPage = jest.fn(async () => ({ goto, evaluate }));

    mockedPuppeteer.launch.mockResolvedValue({ newPage, close });

    const result = await fetchAndParse('https://example.com/page');

    expect(result).toBe('MARKDOWN_CONTENT');
    expect(mockedPuppeteer.launch).toHaveBeenCalledWith({
      headless: true,
      args: expect.arrayContaining([
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ]),
    });
    expect(newPage).toHaveBeenCalled();
    expect(goto).toHaveBeenCalledWith('https://example.com/page', {
      waitUntil: 'networkidle2',
    });
    expect(evaluate).toHaveBeenCalled();
    expect(turndownInstance.turndown).toHaveBeenCalledWith(
      '<p>main content</p>',
    );
    expect(close).toHaveBeenCalled();
  });

  it('falls back to body content when <main> is missing', async () => {
    const close = jest.fn();
    const evaluate = jest.fn(
      async () => '<html><body><p>body content</p></body></html>',
    );
    const goto = jest.fn();
    const newPage = jest.fn(async () => ({ goto, evaluate }));

    mockedPuppeteer.launch.mockResolvedValue({ newPage, close });

    const JSDOMMock = JSDOM as unknown as jest.Mock;
    JSDOMMock.mockImplementationOnce(() => ({
      window: {
        document: {
          querySelectorAll: jest.fn(() => []),
          querySelector: jest.fn(() => null),
          body: { innerHTML: '<p>body content</p>' },
          documentElement: { innerHTML: '<html><body>fallback</body></html>' },
        },
      },
    }));

    const result = await fetchAndParse('https://example.com/body');

    expect(result).toBe('MARKDOWN_CONTENT');
    expect(turndownInstance.turndown).toHaveBeenCalledWith(
      '<p>body content</p>',
    );
  });

  it('falls back to documentElement content when body is missing', async () => {
    const close = jest.fn();
    const evaluate = jest.fn(
      async () => '<html><head></head><body></body></html>',
    );
    const goto = jest.fn();
    const newPage = jest.fn(async () => ({ goto, evaluate }));

    mockedPuppeteer.launch.mockResolvedValue({ newPage, close });

    const JSDOMMock = JSDOM as unknown as jest.Mock;
    JSDOMMock.mockImplementationOnce(() => ({
      window: {
        document: {
          querySelectorAll: jest.fn(() => []),
          querySelector: jest.fn(() => null),
          body: undefined,
          documentElement: { innerHTML: '<p>root content</p>' },
        },
      },
    }));

    const result = await fetchAndParse('https://example.com/root');

    expect(result).toBe('MARKDOWN_CONTENT');
    expect(turndownInstance.turndown).toHaveBeenCalledWith(
      '<p>root content</p>',
    );
  });

  it('wraps errors from puppeteer.launch', async () => {
    mockedPuppeteer.launch.mockRejectedValue(new Error('launch failed'));

    await expect(fetchAndParse('https://bad.example')).rejects.toThrow(
      'Failed to fetch and parse "https://bad.example": Error: launch failed',
    );
  });

  it('closes browser when page operations fail', async () => {
    const close = jest.fn();
    const goto = jest.fn(async () => {
      throw new Error('goto failed');
    });
    const newPage = jest.fn(async () => ({ goto, evaluate: jest.fn() }));

    mockedPuppeteer.launch.mockResolvedValue({ newPage, close });

    await expect(fetchAndParse('https://example.com')).rejects.toThrow(
      'Failed to fetch and parse "https://example.com": Error: goto failed',
    );

    expect(close).toHaveBeenCalled();
  });
});
