const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/api' : '/.netlify/functions';

export function apiUrl(endpoint: string): string {
  return `${API_BASE}/${endpoint}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { token?: string; query?: Record<string, string> }
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let url = apiUrl(endpoint);
  if (options?.query) {
    const params = new URLSearchParams(options.query);
    url += '?' + params.toString();
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
