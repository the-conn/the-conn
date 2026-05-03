'use client';

import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/contexts/SessionContext';
import { useOptionalTenantSlug } from '@/hooks/useTenantSlug';
import { runsListKey } from '@/services/queryKeys';

export function SyncButton() {
  const queryClient = useQueryClient();
  const routeSlug = useOptionalTenantSlug();
  const { activeSlug } = useSession();
  const slug = routeSlug ?? activeSlug;

  const fetching = useIsFetching({ queryKey: slug ? runsListKey(slug) : ['runs', '__none'] });

  const handleSync = useCallback(() => {
    if (!slug) return;
    void queryClient.invalidateQueries({ queryKey: runsListKey(slug) });
  }, [queryClient, slug]);

  if (!slug) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSync}
      title="Refresh pipeline runs sidebar"
      aria-label="Sync pipeline runs"
    >
      <RefreshCw size={12} strokeWidth={2} className={fetching > 0 ? 'animate-spin' : ''} />
      sync
    </Button>
  );
}
