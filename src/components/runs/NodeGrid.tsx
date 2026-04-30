'use client';

import { useEffect, useState } from 'react';
import { HandHeader } from '@/components/ui/HandHeader';
import { NodeChip } from '@/components/runs/NodeChip';
import type { NodeExecution } from '@/types/api';

interface NodeGridProps {
  runId: string;
  nodes: NodeExecution[];
  pipelineCompletedAt: string | null;
  runTerminated: boolean;
}

export function NodeGrid({ runId, nodes, pipelineCompletedAt, runTerminated }: NodeGridProps) {
  const [now, setNow] = useState(() => Date.now());
  const isTicking = !runTerminated && pipelineCompletedAt === null;

  useEffect(() => {
    if (!isTicking) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isTicking]);

  return (
    <section className="flex flex-col gap-[8px]">
      <HandHeader>Nodes</HandHeader>
      {nodes.length === 0 ? (
        <div className="font-mono text-[10px] text-ink-faint">no nodes yet</div>
      ) : (
        <div className="grid gap-[8px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {nodes.map((node) => (
            <NodeChip
              key={node.id}
              runId={runId}
              node={node}
              pipelineCompletedAt={pipelineCompletedAt}
              runTerminated={runTerminated}
              nowMs={now}
            />
          ))}
        </div>
      )}
    </section>
  );
}
