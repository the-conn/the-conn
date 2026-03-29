import { HandHeader } from '@/components/ui/HandHeader';
import { NodeChip } from '@/components/runs/NodeChip';
import type { NodeExecution } from '@/types/api';

interface NodeGridProps {
  nodes: NodeExecution[];
  pipelineCompletedAt: string | null;
}

export function NodeGrid({ nodes, pipelineCompletedAt }: NodeGridProps) {
  return (
    <section className="flex flex-col gap-[8px]">
      <HandHeader>Nodes</HandHeader>
      {nodes.length === 0 ? (
        <div className="font-mono text-[10px] text-ink-faint">no nodes yet</div>
      ) : (
        <div className="grid gap-[8px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {nodes.map((node) => (
            <NodeChip key={node.id} node={node} pipelineCompletedAt={pipelineCompletedAt} />
          ))}
        </div>
      )}
    </section>
  );
}
