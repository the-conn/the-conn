import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRunNodes } from '@/services/runs';
import type { NodeExecution } from '@/types/api';

const RUNNING_INTERVAL = 5_000;
const SETTLED_INTERVAL = 60_000;

export function useRunNodes(slug: string, runId: string | null) {
  return useQuery({
    queryKey: runId ? queryKeys.runs.nodes(slug, runId) : ['runs', slug, 'nodes', '__none'],
    queryFn: () => {
      if (!runId) throw new Error('runId is required');
      return getRunNodes(slug, runId);
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data as NodeExecution[] | undefined;
      if (!data) return RUNNING_INTERVAL;
      const hasIncomplete = data.some((n) => n.success === null);
      return hasIncomplete ? RUNNING_INTERVAL : SETTLED_INTERVAL;
    },
    refetchIntervalInBackground: false,
  });
}

export type { NodeExecution };
