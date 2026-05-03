'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import {
  getMe,
  logout as logoutRequest,
  setActiveTenant,
  type AuthSession,
} from '@/services/session';

export const SESSION_QUERY_KEY = ['session', 'me'] as const;

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextValue {
  status: SessionStatus;
  user: AuthSession | null;
  authorizedSlugs: string[];
  activeSlug: string | null;
  switchTenant: (slug: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getMe,
    staleTime: Infinity,
    retry: false,
  });

  const switchMutation = useMutation({
    mutationFn: (slug: string) => setActiveTenant(slug).then(() => slug),
    onSuccess: (slug) => {
      queryClient.setQueryData<AuthSession>(SESSION_QUERY_KEY, (prev) =>
        prev ? { ...prev, active_tenant_context: slug } : prev,
      );
      queryClient.removeQueries({ queryKey: ['runs'] });
      router.push(`/${encodeURIComponent(slug)}/runs`);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
  });

  const switchTenant = useCallback(
    async (slug: string) => {
      await switchMutation.mutateAsync(slug);
    },
    [switchMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<SessionContextValue>(() => {
    const data = sessionQuery.data ?? null;
    const status: SessionStatus = sessionQuery.isLoading
      ? 'loading'
      : data
        ? 'authenticated'
        : 'unauthenticated';
    return {
      status,
      user: data,
      authorizedSlugs: data?.authorized_slugs ?? [],
      activeSlug: data?.active_tenant_context ?? null,
      switchTenant,
      logout,
    };
  }, [sessionQuery.data, sessionQuery.isLoading, switchTenant, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
