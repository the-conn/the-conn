import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { getRunNodeLogs } from '@/services/runs';
import type { NodeLogsPayload } from '@/types/api';
import { parseLogs } from '@/utils/parseLogs';

const RUNNING_INTERVAL = 5_000;
const SETTLED_INTERVAL = 60_000;

export function useNodeLogs(runId: string | null, nodeName: string | null, isRunning: boolean) {
  return useQuery<NodeLogsPayload>({
    queryKey:
      runId && nodeName ? queryKeys.runs.nodeLogs(runId, nodeName) : ['runs', 'nodeLogs', '__none'],
    queryFn: async () => {
      if (!runId || !nodeName) throw new Error('runId and nodeName are required');
      const raw = await getRunNodeLogs(runId, nodeName);
      return { raw, lines: parseLogs(raw) };
    },
    enabled: !!runId && !!nodeName,
    refetchInterval: isRunning ? RUNNING_INTERVAL : SETTLED_INTERVAL,
    refetchIntervalInBackground: false,
  });
}
