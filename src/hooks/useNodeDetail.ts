import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRunNode } from '@/services/runs';
import type { NodeExecution } from '@/types/api';

const RUNNING_INTERVAL = 5_000;
const SETTLED_INTERVAL = 60_000;

export function useNodeDetail(slug: string, runId: string | null, nodeName: string | null) {
  return useQuery({
    queryKey:
      runId && nodeName
        ? queryKeys.runs.nodeDetail(slug, runId, nodeName)
        : ['runs', slug, 'nodeDetail', '__none'],
    queryFn: () => {
      if (!runId || !nodeName) throw new Error('runId and nodeName are required');
      return getRunNode(slug, runId, nodeName);
    },
    enabled: !!runId && !!nodeName,
    refetchInterval: (query) => {
      const data = query.state.data as NodeExecution | undefined;
      if (!data) return RUNNING_INTERVAL;
      return data.success === null ? RUNNING_INTERVAL : SETTLED_INTERVAL;
    },
    refetchIntervalInBackground: false,
  });
}

export type { NodeExecution };
