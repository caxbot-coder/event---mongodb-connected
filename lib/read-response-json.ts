/**
 * Parse a fetch Response body as JSON when it looks like JSON.
 * Avoids throwing when the platform returns HTML/plain text (502/504 pages).
 */
export async function readResponseJson<T = unknown>(response: Response): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    if (!response.ok) {
      if (response.status === 504 || response.status === 502) {
        throw new Error('The server took too long to respond. Please try again.');
      }
      throw new Error(`Request failed (${response.status})`);
    }
    return {} as T;
  }

  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[');

  if (looksJson) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      throw new Error('The server returned invalid JSON. Please try again.');
    }
  }

  if (!response.ok) {
    if (response.status === 504 || response.status === 502) {
      throw new Error('The server took too long to respond. Please try again.');
    }
    if (response.status === 503) {
      throw new Error('The service is temporarily unavailable. Please try again.');
    }
    const snippet = trimmed.replace(/\s+/g, ' ').slice(0, 160);
    throw new Error(snippet || `Request failed (${response.status})`);
  }

  throw new Error(trimmed.replace(/\s+/g, ' ').slice(0, 160));
}
