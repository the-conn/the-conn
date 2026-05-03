'use client';

import { useParams } from 'next/navigation';

export function useTenantSlug(): string {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  if (!slug) {
    throw new Error('useTenantSlug called outside of a /[slug]/... route');
  }
  return decodeURIComponent(slug);
}

export function useOptionalTenantSlug(): string | null {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;
  return slug ? decodeURIComponent(slug) : null;
}
