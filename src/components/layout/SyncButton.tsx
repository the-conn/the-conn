'use client';

import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { RUNS_LIST_KEY } from '@/services/queryKeys';

export function SyncButton() {
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: RUNS_LIST_KEY });

  const handleSync = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: RUNS_LIST_KEY });
  }, [queryClient]);

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
