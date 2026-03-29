import type { RunFilterField, RunFilters } from '@/types/api';

export const FILTER_FIELDS: readonly RunFilterField[] = ['pipeline_name', 'owner', 'repo'] as const;

export const FILTER_LABELS: Record<RunFilterField, string> = {
  pipeline_name: 'pipeline',
  owner: 'owner',
  repo: 'repo',
};

export function readFiltersFromSearchParams(
  params: URLSearchParams | ReadonlyURLSearchParamsLike | null,
): RunFilters {
  if (!params) return {};
  const result: RunFilters = {};
  for (const field of FILTER_FIELDS) {
    const raw = params.get(field);
    if (raw && raw.length > 0) result[field] = raw;
  }
  return result;
}

export function writeFiltersToSearchParams(
  current: URLSearchParams,
  filters: RunFilters,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  for (const field of FILTER_FIELDS) {
    next.delete(field);
  }
  for (const field of FILTER_FIELDS) {
    const value = filters[field];
    if (value && value.length > 0) next.set(field, value);
  }
  return next;
}

export function filtersAreEqual(a: RunFilters, b: RunFilters): boolean {
  for (const field of FILTER_FIELDS) {
    if ((a[field] ?? '') !== (b[field] ?? '')) return false;
  }
  return true;
}

export function activeFilterEntries(filters: RunFilters): Array<[RunFilterField, string]> {
  const entries: Array<[RunFilterField, string]> = [];
  for (const field of FILTER_FIELDS) {
    const value = filters[field];
    if (value && value.length > 0) entries.push([field, value]);
  }
  return entries;
}

interface ReadonlyURLSearchParamsLike {
  get(key: string): string | null;
}
