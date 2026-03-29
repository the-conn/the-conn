import type { NodeExecution } from '@/types/api';
import type { NodeState } from '@/types/ui';
import { getNodeState } from '@/utils/runStatus';
import { parseIso } from '@/utils/time';

export interface GanttRow {
  node: NodeExecution;
  state: NodeState;
  waitStartMs: number;
  waitEndMs: number;
  runStartMs: number;
  runEndMs: number;
  isPending: boolean;
  isStillRunning: boolean;
}

export interface GanttModel {
  rows: GanttRow[];
  totalMs: number;
  ticks: number[];
}

const TICK_COUNT = 5;

export function buildGanttModel(
  nodes: NodeExecution[],
  pipelineCreatedAtIso: string,
  pipelineCompletedAtIso: string | null,
  nowMs: number,
): GanttModel {
  const t0 = parseIso(pipelineCreatedAtIso) ?? nowMs;
  const pipelineEnd = parseIso(pipelineCompletedAtIso);

  const rows: GanttRow[] = nodes.map((node) => {
    const state = getNodeState(node);
    const isPending = state === 'pending';
    const created = parseIso(node.created_at) ?? t0;
    const started = parseIso(node.started_at);
    const completed = parseIso(node.completed_at);

    const waitStartMs = Math.max(0, created - t0);
    const waitEndMs = started !== null ? Math.max(waitStartMs, started - t0) : waitStartMs;
    const runStartMs = waitEndMs;
    const runEndMs =
      completed !== null
        ? Math.max(runStartMs, completed - t0)
        : started !== null
          ? Math.max(runStartMs, nowMs - t0)
          : runStartMs;

    return {
      node,
      state,
      waitStartMs,
      waitEndMs,
      runStartMs,
      runEndMs,
      isPending,
      isStillRunning: started !== null && completed === null,
    };
  });

  const candidateEnds = rows.map((r) => Math.max(r.waitEndMs, r.runEndMs));
  if (pipelineEnd !== null) candidateEnds.push(pipelineEnd - t0);
  if (pipelineEnd === null) candidateEnds.push(nowMs - t0);
  const rawMax = Math.max(1000, ...candidateEnds);
  const totalMs = roundUpToTick(rawMax);
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) =>
    Math.round((i * totalMs) / (TICK_COUNT - 1)),
  );

  return { rows, totalMs, ticks };
}

function roundUpToTick(ms: number): number {
  if (ms <= 0) return 1000;
  if (ms < 30_000) return Math.ceil(ms / 5_000) * 5_000;
  if (ms < 5 * 60_000) return Math.ceil(ms / 15_000) * 15_000;
  if (ms < 30 * 60_000) return Math.ceil(ms / 60_000) * 60_000;
  return Math.ceil(ms / 300_000) * 300_000;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (part / total) * 100));
}
