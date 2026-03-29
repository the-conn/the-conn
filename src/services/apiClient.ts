const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string, message: string) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = 'ApiError';
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new ApiError(0, '', 'NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(
      response.status,
      body,
      `${response.status} ${response.statusText} for ${path}`,
    );
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const SIDEBAR_LIMIT = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_SIDEBAR_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
})();
