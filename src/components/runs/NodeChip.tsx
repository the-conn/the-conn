import { Mono } from '@/components/ui/Mono';
import { StatusGlyph } from '@/components/ui/StatusGlyph';
import type { NodeExecution } from '@/types/api';
import { NODE_SPEC, getNodeState } from '@/utils/runStatus';
import { formatDurationSeconds, parseIso } from '@/utils/time';

interface NodeChipProps {
  node: NodeExecution;
  pipelineCompletedAt: string | null;
}

export function NodeChip({ node, pipelineCompletedAt }: NodeChipProps) {
  const state = getNodeState(node);
  const spec = NODE_SPEC[state];

  const created = parseIso(node.created_at);
  const started = parseIso(node.started_at);
  const completed = parseIso(node.completed_at);
  const settled = completed ?? parseIso(pipelineCompletedAt) ?? Date.now();

  const waitedSec = started !== null && created !== null ? (started - created) / 1000 : 0;
  const ranSec =
    started !== null
      ? completed !== null
        ? (completed - started) / 1000
        : (settled - started) / 1000
      : 0;

  return (
    <div
      className="relative overflow-hidden rounded-[3px] border-[1.5px] border-ink/85 px-[12px] py-[6px] pl-[14px]"
      style={{ background: spec.softVar }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[4px]"
        style={{ background: spec.colorVar }}
      />
      <div className="flex items-center gap-[6px]">
        <StatusGlyph state={state} size={11} />
        <span
          className="font-mono text-[11px] font-semibold text-ink truncate"
          title={node.node_name}
        >
          {node.node_name}
        </span>
        <span className="flex-1" />
        <Mono size={10}>{started !== null ? formatDurationSeconds(ranSec) : '—'}</Mono>
      </div>
      {started !== null && (
        <div className="mt-[2px] font-mono text-[9px] text-ink-faint">
          wait {formatDurationSeconds(waitedSec)} · run {formatDurationSeconds(ranSec)}
        </div>
      )}
      {state === 'pending' && (
        <div className="mt-[2px] font-mono text-[9px] text-ink-faint">queued</div>
      )}
    </div>
  );
}
