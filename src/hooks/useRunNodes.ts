import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRunNodes } from '@/services/runs';
import type { NodeExecution } from '@/types/api';

const RUNNING_INTERVAL = 10_000;
const SETTLED_INTERVAL = 60_000;

export function useRunNodes(runId: string | null, isRunning: boolean) {
  return useQuery({
    queryKey: runId ? queryKeys.runs.nodes(runId) : ['runs', 'nodes', '__none'],
    queryFn: () => {
      if (!runId) throw new Error('runId is required');
      return getRunNodes(runId);
    },
    enabled: !!runId,
    refetchInterval: isRunning ? RUNNING_INTERVAL : SETTLED_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export type { NodeExecution };
