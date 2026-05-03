'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { SessionProvider } from '@/contexts/SessionContext';
import { TimezoneModeProvider } from '@/contexts/TimezoneModeContext';
import { ForbiddenError, UnauthorizedError } from '@/services/apiClient';
import { loginUrl } from '@/services/session';

interface ProvidersProps {
  children: ReactNode;
}

function handleAuthError(error: unknown): void {
  if (typeof window === 'undefined') return;
  if (!(error instanceof UnauthorizedError)) return;
  const returnTo = window.location.pathname + window.location.search;
  window.location.href = loginUrl(returnTo);
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof UnauthorizedError || error instanceof ForbiddenError) return false;
  return failureCount < 1;
}

export function Providers({ children }: ProvidersProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            gcTime: 5 * 60_000,
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
        },
        queryCache: new QueryCache({ onError: handleAuthError }),
        mutationCache: new MutationCache({ onError: handleAuthError }),
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <TimezoneModeProvider>{children}</TimezoneModeProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
