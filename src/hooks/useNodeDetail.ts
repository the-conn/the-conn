import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRunNode } from '@/services/runs';
import type { NodeExecution } from '@/types/api';

const RUNNING_INTERVAL = 5_000;
const SETTLED_INTERVAL = 60_000;

export function useNodeDetail(runId: string | null, nodeName: string | null, isRunning: boolean) {
  return useQuery({
    queryKey:
      runId && nodeName
        ? queryKeys.runs.nodeDetail(runId, nodeName)
        : ['runs', 'nodeDetail', '__none'],
    queryFn: () => {
      if (!runId || !nodeName) throw new Error('runId and nodeName are required');
      return getRunNode(runId, nodeName);
    },
    enabled: !!runId && !!nodeName,
    refetchInterval: isRunning ? RUNNING_INTERVAL : SETTLED_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export type { NodeExecution };
