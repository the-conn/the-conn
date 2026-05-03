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

export class UnauthorizedError extends ApiError {
  constructor(body: string, message: string) {
    super(401, body, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(body: string, message: string) {
    super(403, body, message);
    this.name = 'ForbiddenError';
  }
}

function makeError(status: number, body: string, path: string, statusText: string): ApiError {
  const message = `${status} ${statusText} for ${path}`;
  if (status === 401) return new UnauthorizedError(body, message);
  if (status === 403) return new ForbiddenError(body, message);
  return new ApiError(status, body, message);
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new ApiError(0, '', 'NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw makeError(response.status, body, path, response.statusText);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function fetchText(path: string, init?: RequestInit): Promise<string> {
  if (!API_BASE) {
    throw new ApiError(0, '', 'NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'text/plain',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw makeError(response.status, body, path, response.statusText);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return '';
  }
  return await response.text();
}

export const SIDEBAR_LIMIT = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_SIDEBAR_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
})();
