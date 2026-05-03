'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ExecutionDeckIdle } from '@/components/runs/ExecutionDeckIdle';
import { useSession } from '@/contexts/SessionContext';

export function RootRedirect() {
  const router = useRouter();
  const { status, activeSlug, authorizedSlugs } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const target = activeSlug ?? authorizedSlugs[0];
    if (target) {
      router.replace(`/${encodeURIComponent(target)}/runs`);
    }
  }, [status, activeSlug, authorizedSlugs, router]);

  return <ExecutionDeckIdle />;
}
