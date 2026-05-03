import { fetchJson, fetchText } from '@/services/apiClient';
import type {
  NodeExecution,
  Run,
  RunFilterField,
  RunListParams,
  RunListResponse,
} from '@/types/api';

const FILTER_FIELDS: RunFilterField[] = ['pipeline_name', 'repo', 'sha'];

function tenantBase(slug: string): string {
  return `/api/${encodeURIComponent(slug)}/runs`;
}

export function listRuns(slug: string, params: RunListParams): Promise<RunListResponse> {
  const search = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
    sort_by: params.sort_by ?? 'created_at',
    order: params.order ?? 'desc',
  });
  if (params.filters) {
    for (const field of FILTER_FIELDS) {
      const value = params.filters[field];
      if (value && value.length > 0) search.set(field, value);
    }
  }
  return fetchJson<RunListResponse>(`${tenantBase(slug)}?${search.toString()}`);
}

export function getRun(slug: string, runId: string): Promise<Run> {
  return fetchJson<Run>(`${tenantBase(slug)}/${encodeURIComponent(runId)}`);
}

export function getRunNodes(slug: string, runId: string): Promise<NodeExecution[]> {
  return fetchJson<NodeExecution[]>(`${tenantBase(slug)}/${encodeURIComponent(runId)}/nodes`);
}

export function getRunNode(slug: string, runId: string, nodeName: string): Promise<NodeExecution> {
  return fetchJson<NodeExecution>(
    `${tenantBase(slug)}/${encodeURIComponent(runId)}/nodes/${encodeURIComponent(nodeName)}`,
  );
}

export function getRunNodeLogs(slug: string, runId: string, nodeName: string): Promise<string> {
  return fetchText(
    `${tenantBase(slug)}/${encodeURIComponent(runId)}/nodes/${encodeURIComponent(nodeName)}/logs`,
  );
}

export interface RetryResponse {
  run_id: string;
}

export function retryRun(slug: string, runId: string): Promise<RetryResponse> {
  return fetchJson<RetryResponse>(`${tenantBase(slug)}/${encodeURIComponent(runId)}/retry`, {
    method: 'POST',
  });
}

export function cancelRun(slug: string, runId: string): Promise<void> {
  return fetchJson<void>(`${tenantBase(slug)}/${encodeURIComponent(runId)}/cancel`, {
    method: 'POST',
  });
}
