import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SIDEBAR_LIMIT } from '@/services/apiClient';
import { queryKeys } from '@/services/queryKeys';
import { listRuns } from '@/services/runs';
import type { Run, RunFilters } from '@/types/api';

export interface UseRunsResult {
  runs: Run[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const EMPTY_FILTERS: RunFilters = {};

export function useRuns(
  slug: string,
  page: number,
  filters: RunFilters = EMPTY_FILTERS,
): UseRunsResult {
  const limit = SIDEBAR_LIMIT;
  const query = useQuery({
    queryKey: queryKeys.runs.list(slug, page, limit, filters),
    queryFn: () =>
      listRuns(slug, {
        limit,
        offset: page * limit,
        sort_by: 'created_at',
        order: 'desc',
        filters,
      }),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
  });
  const runs = query.data?.runs ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    runs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    hasMore: page + 1 < totalPages,
    page,
    limit,
    total,
    totalPages,
  };
}
