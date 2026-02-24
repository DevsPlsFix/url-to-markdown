let jsdomErrorHandler: ((error: any) => void) | undefined;

jest.mock('jsdom', () => {
  const VirtualConsoleMock = jest.fn().mockImplementation(() => ({
    on: jest.fn((event: string, handler: (error: any) => void) => {
      if (event === 'jsdomError') {
        jsdomErrorHandler = handler;
      }
    }),
  }));

  const JSDOMMock = jest.fn(() => {
    if (jsdomErrorHandler) {
      jsdomErrorHandler({
        message: 'Could not parse CSS stylesheet: big blob',
      });
      jsdomErrorHandler(new Error('some other jsdom error'));
    }
    throw new Error('boom');
  });

  return {
    __esModule: true,
    JSDOM: JSDOMMock,
    VirtualConsole: VirtualConsoleMock,
  };
});

import { parseHtmlWithJSDOM } from '../parseHtml';

describe('parseHtmlWithJSDOM error handling', () => {
  it('ignores noisy CSS parse errors and still wraps constructor failures', () => {
    expect(() =>
      parseHtmlWithJSDOM('<html></html>', 'https://example.com/page'),
    ).toThrow(
      'Failed to parse HTML from "https://example.com/page": Error: boom',
    );
  });
});
