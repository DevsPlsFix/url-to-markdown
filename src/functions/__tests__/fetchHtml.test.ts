import axios from 'axios';
import { fetchHtml } from '../fetchHtml';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchHtml', () => {
  it('fetches URL with browser-like User-Agent and returns HTML', async () => {
    const html = '<html><body>Hello</body></html>';
    mockedAxios.get.mockResolvedValue({ data: html, status: 200 });

    const result = await fetchHtml('https://example.com/page');

    expect(result).toBe(html);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.com/page',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Chrome'),
          Accept: expect.stringContaining('text/html'),
        }),
        responseType: 'text',
        timeout: 15000,
        maxRedirects: 5,
      }),
    );
  });

  it('uses validateStatus to only accept 2xx/3xx responses', async () => {
    mockedAxios.get.mockResolvedValue({ data: '<html></html>', status: 200 });

    await fetchHtml('https://example.com/status');

    const config = mockedAxios.get.mock.calls[0][1] as {
      validateStatus: (status: number) => boolean;
    };

    expect(config.validateStatus(199)).toBe(false);
    expect(config.validateStatus(200)).toBe(true);
    expect(config.validateStatus(301)).toBe(true);
    expect(config.validateStatus(400)).toBe(false);
  });

  it('throws with HTTP status when axios get fails with response', async () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    mockedAxios.get.mockRejectedValue({
      response: { status: 404, statusText: 'Not Found' },
    });

    await expect(fetchHtml('https://example.com/missing')).rejects.toThrow(
      'Failed to fetch URL "https://example.com/missing": HTTP 404 Not Found',
    );
  });

  it('throws with code when network error occurs', async () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    mockedAxios.get.mockRejectedValue({ code: 'ENOTFOUND' });

    await expect(fetchHtml('https://example.com')).rejects.toThrow(
      'Failed to fetch URL "https://example.com": code ENOTFOUND',
    );
  });

  it('throws generic message for non-axios errors', async () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('custom'));

    await expect(fetchHtml('https://example.com')).rejects.toThrow(
      'Failed to fetch URL "https://example.com": Error: custom',
    );
  });
});
