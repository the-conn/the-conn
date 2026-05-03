import { fetchJson } from '@/services/apiClient';

export interface AuthSession {
  user_id: string;
  email: string;
  name: string;
  authorized_slugs: string[];
  active_tenant_context: string;
}

export function getMe(): Promise<AuthSession> {
  return fetchJson<AuthSession>('/api/auth/me');
}

export function logout(): Promise<void> {
  return fetchJson<void>('/api/auth/logout', { method: 'POST' });
}

export function setActiveTenant(slug: string): Promise<void> {
  return fetchJson<void>('/api/auth/active-tenant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  });
}

export function loginUrl(returnTo: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
  return `${base}/api/auth/login?return_to=${encodeURIComponent(returnTo)}`;
}
