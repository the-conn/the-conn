import type { RunFilters } from '@/types/api';

export const queryKeys = {
  runs: {
    all: ['runs'] as const,
    list: (page: number, limit: number, filters: RunFilters) =>
      ['runs', 'list', { page, limit, filters }] as const,
    detail: (runId: string) => ['runs', 'detail', runId] as const,
    nodes: (runId: string) => ['runs', 'nodes', runId] as const,
    nodeDetail: (runId: string, nodeName: string) =>
      ['runs', 'nodeDetail', runId, nodeName] as const,
    nodeLogs: (runId: string, nodeName: string) => ['runs', 'nodeLogs', runId, nodeName] as const,
  },
};

export const RUNS_LIST_KEY = ['runs', 'list'] as const;
