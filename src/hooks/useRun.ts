import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRun } from '@/services/runs';
import type { Run } from '@/types/api';
import { getRunState } from '@/utils/runStatus';

const RUNNING_INTERVAL = 5_000;
const SETTLED_INTERVAL = 60_000;

export function useRun(slug: string, runId: string | null) {
  return useQuery({
    queryKey: runId ? queryKeys.runs.detail(slug, runId) : ['runs', slug, 'detail', '__none'],
    queryFn: () => {
      if (!runId) throw new Error('runId is required');
      return getRun(slug, runId);
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data as Run | undefined;
      if (!data) return SETTLED_INTERVAL;
      return getRunState(data) === 'running' ? RUNNING_INTERVAL : SETTLED_INTERVAL;
    },
    refetchIntervalInBackground: false,
  });
}
