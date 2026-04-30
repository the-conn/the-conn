import type { NodeExecution, Run } from '@/types/api';
import type { NodeState, RunState } from '@/types/ui';

export function getRunState(run: Run): RunState {
  switch (run.status) {
    case 'success':
      return 'pass';
    case 'failure':
      return 'fail';
    case 'cancelled':
      return 'cancelled';
    case 'in_progress':
      return 'running';
  }
}

export function getNodeState(node: NodeExecution, runTerminated = false): NodeState {
  if (node.success === true) return 'pass';
  if (node.success === false) return 'fail';
  if (runTerminated) return 'cancelled';
  if (node.started_at !== null && node.completed_at === null) return 'running';
  if (node.started_at === null) return 'pending';
  return 'cancelled';
}

interface BannerSpec {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  dotVar: string;
}

export const BANNER_SPEC: Record<RunState, BannerSpec> = {
  pass: {
    label: 'ALL SYSTEMS OPERATIONAL',
    textClass: 'text-emerald-conn',
    bgClass: 'bg-emerald-soft',
    borderClass: 'border-emerald-conn',
    dotVar: 'var(--status-emerald)',
  },
  fail: {
    label: 'RED ALERT',
    textClass: 'text-rose-conn',
    bgClass: 'bg-rose-soft',
    borderClass: 'border-rose-conn',
    dotVar: 'var(--status-rose)',
  },
  running: {
    label: 'ENGAGED',
    textClass: 'text-amber-conn',
    bgClass: 'bg-amber-soft',
    borderClass: 'border-amber-conn',
    dotVar: 'var(--status-amber)',
  },
  cancelled: {
    label: 'DECOMMISSIONED',
    textClass: 'text-slate-conn',
    bgClass: 'bg-slate-soft',
    borderClass: 'border-slate-conn',
    dotVar: 'var(--status-slate)',
  },
};

interface NodeStateSpec {
  colorVar: string;
  softVar: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
}

export const NODE_SPEC: Record<NodeState, NodeStateSpec> = {
  pass: {
    colorVar: 'var(--status-emerald)',
    softVar: 'var(--status-emerald-soft)',
    textClass: 'text-emerald-conn',
    borderClass: 'border-emerald-conn',
    bgClass: 'bg-emerald-soft',
  },
  fail: {
    colorVar: 'var(--status-rose)',
    softVar: 'var(--status-rose-soft)',
    textClass: 'text-rose-conn',
    borderClass: 'border-rose-conn',
    bgClass: 'bg-rose-soft',
  },
  running: {
    colorVar: 'var(--status-amber)',
    softVar: 'var(--status-amber-soft)',
    textClass: 'text-amber-conn',
    borderClass: 'border-amber-conn',
    bgClass: 'bg-amber-soft',
  },
  pending: {
    colorVar: 'var(--ink-faint)',
    softVar: 'var(--paper-2)',
    textClass: 'text-ink-faint',
    borderClass: 'border-ink-faint',
    bgClass: 'bg-paper-2',
  },
  cancelled: {
    colorVar: 'var(--status-slate)',
    softVar: 'var(--status-slate-soft)',
    textClass: 'text-slate-conn',
    borderClass: 'border-slate-conn',
    bgClass: 'bg-slate-soft',
  },
};

export function getTriggerKind(run: Run): 'branch' | 'tag' | 'pr' | 'retry' {
  if (run.retry_of) return 'retry';
  if (run.tag) return 'tag';
  if (run.pr_number !== null && run.pr_number !== undefined) return 'pr';
  return 'branch';
}
