'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mono } from '@/components/ui/Mono';
import { StatusGlyph } from '@/components/ui/StatusGlyph';
import { StatusPill } from '@/components/ui/StatusPill';
import type { NodeExecution } from '@/types/api';
import type { NodeState } from '@/types/ui';
import { withSearchParams } from '@/utils/href';

interface NodeSubNavProps {
  runId: string;
  node: NodeExecution;
  state: NodeState;
}

export function NodeSubNav({ runId, node, state }: NodeSubNavProps) {
  const searchParams = useSearchParams();
  const backHref = withSearchParams(`/runs/${encodeURIComponent(runId)}`, searchParams);
  return (
    <div className="flex items-center gap-3 px-[18px] py-[8px] border-b border-ink-trace bg-paper-2">
      <Link
        href={backHref}
        className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] font-mono text-[11px] text-ink-soft hover:bg-paper-3 hover:text-ink"
      >
        ← run {runId.slice(0, 8)}
      </Link>
      <div className="w-px h-[14px] bg-ink-trace" aria-hidden />
      <StatusGlyph state={state} size={12} />
      <span className="font-mono font-bold text-[14px] text-ink">{node.node_name}</span>
      <StatusPill state={state} />
      <span className="flex-1" />
      <Mono size={11} dim>
        node #{node.id}
      </Mono>
      <div className="w-px h-[14px] bg-ink-trace" aria-hidden />
      <Mono size={11} dim>
        run_id
      </Mono>
      <Mono size={11}>{node.run_id.slice(0, 8)}…</Mono>
    </div>
  );
}
