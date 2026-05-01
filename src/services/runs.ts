import { fetchJson, fetchText } from '@/services/apiClient';
import type {
  NodeExecution,
  Run,
  RunFilterField,
  RunListParams,
  RunListResponse,
} from '@/types/api';

const FILTER_FIELDS: RunFilterField[] = ['pipeline_name', 'owner', 'repo'];

export function listRuns(params: RunListParams): Promise<RunListResponse> {
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
  return fetchJson<RunListResponse>(`/api/v1/runs?${search.toString()}`);
}

export function getRun(runId: string): Promise<Run> {
  return fetchJson<Run>(`/api/v1/runs/${encodeURIComponent(runId)}`);
}

export function getRunNodes(runId: string): Promise<NodeExecution[]> {
  return fetchJson<NodeExecution[]>(`/api/v1/runs/${encodeURIComponent(runId)}/nodes`);
}

export function getRunNode(runId: string, nodeName: string): Promise<NodeExecution> {
  return fetchJson<NodeExecution>(
    `/api/v1/runs/${encodeURIComponent(runId)}/nodes/${encodeURIComponent(nodeName)}`,
  );
}

export function getRunNodeLogs(runId: string, nodeName: string): Promise<string> {
  return fetchText(
    `/api/v1/runs/${encodeURIComponent(runId)}/nodes/${encodeURIComponent(nodeName)}/logs`,
  );
}

export interface RetryResponse {
  run_id: string;
}

export function retryRun(runId: string): Promise<RetryResponse> {
  return fetchJson<RetryResponse>(`/api/v1/runs/${encodeURIComponent(runId)}/retry`, {
    method: 'POST',
  });
}

export function cancelRun(runId: string): Promise<void> {
  return fetchJson<void>(`/api/v1/runs/${encodeURIComponent(runId)}/cancel`, {
    method: 'POST',
  });
}
