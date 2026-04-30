export type RunTrigger = 'pull_request' | 'push' | 'tag' | 'manual' | string;

export type RunStatus = 'in_progress' | 'success' | 'failure' | 'cancelled';

export interface Run {
  run_id: string;
  pipeline_name: string;
  owner: string;
  repo: string;
  sha: string;
  branch: string | null;
  target_branch: string | null;
  tag: string | null;
  pr_number: number | null;
  trigger: RunTrigger;
  pipeline_definition: string;
  status: RunStatus;
  created_at: string;
  completed_at: string | null;
  retry_of: string | null;
}

export interface NodeExecution {
  id: number;
  run_id: string;
  node_name: string;
  node_definition: string;
  success: boolean | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export type LogStream = 'stdout' | 'stderr';

export interface LogLine {
  ts: number;
  stream: LogStream;
  text: string;
}

export interface NodeLogsPayload {
  raw: string;
  lines: LogLine[];
}

export type RunFilterField = 'pipeline_name' | 'owner' | 'repo';

export type RunFilters = Partial<Record<RunFilterField, string>>;

export interface RunListParams {
  limit: number;
  offset: number;
  sort_by?: 'created_at' | 'completed_at' | 'pipeline_name' | 'owner' | 'status';
  order?: 'asc' | 'desc';
  filters?: RunFilters;
}
