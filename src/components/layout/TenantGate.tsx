'use client';

import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSession } from '@/contexts/SessionContext';

interface TenantGateProps {
  slug: string;
  children: ReactNode;
}

export function TenantGate({ slug, children }: TenantGateProps) {
  const { status, authorizedSlugs } = useSession();
  if (status === 'loading') return null;
  if (status === 'unauthenticated') return null;
  if (!authorizedSlugs.includes(slug)) notFound();
  return <>{children}</>;
}
