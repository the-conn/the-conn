import type { RunFilters } from '@/types/api';

export const queryKeys = {
  runs: {
    all: (slug: string) => ['runs', slug] as const,
    list: (slug: string, page: number, limit: number, filters: RunFilters) =>
      ['runs', slug, 'list', { page, limit, filters }] as const,
    detail: (slug: string, runId: string) => ['runs', slug, 'detail', runId] as const,
    nodes: (slug: string, runId: string) => ['runs', slug, 'nodes', runId] as const,
    nodeDetail: (slug: string, runId: string, nodeName: string) =>
      ['runs', slug, 'nodeDetail', runId, nodeName] as const,
    nodeLogs: (slug: string, runId: string, nodeName: string) =>
      ['runs', slug, 'nodeLogs', runId, nodeName] as const,
  },
};

export const runsListKey = (slug: string) => ['runs', slug, 'list'] as const;
