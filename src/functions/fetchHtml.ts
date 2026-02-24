import axios from 'axios';
import { BROWSER_USER_AGENT } from './constants';

/**
 * Fetch the raw HTML of a URL using a browser-like User-Agent.
 */
export async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await axios.get<string>(url, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      responseType: 'text',
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const code = error.code;
      const details = status
        ? `HTTP ${status}${statusText ? ` ${statusText}` : ''}`
        : code
          ? `code ${code}`
          : 'network error';
      throw new Error(`Failed to fetch URL "${url}": ${details}`);
    }
    throw new Error(`Failed to fetch URL "${url}": ${String(error)}`);
  }
}
