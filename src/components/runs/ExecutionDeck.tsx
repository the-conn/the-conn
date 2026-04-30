'use client';

import { ExecutionActions } from '@/components/runs/ExecutionActions';
import { GanttTimeline } from '@/components/runs/GanttTimeline';
import { MetadataGrid } from '@/components/runs/MetadataGrid';
import { NodeGrid } from '@/components/runs/NodeGrid';
import { StatusBanner } from '@/components/runs/StatusBanner';
import { useRun } from '@/hooks/useRun';
import { useRunNodes } from '@/hooks/useRunNodes';
import { Mono } from '@/components/ui/Mono';
import { HandHeader } from '@/components/ui/HandHeader';
import { getRunState } from '@/utils/runStatus';

interface ExecutionDeckProps {
  runId: string;
}

export function ExecutionDeck({ runId }: ExecutionDeckProps) {
  const runQuery = useRun(runId);
  const isRunning = runQuery.data ? getRunState(runQuery.data) === 'running' : false;
  const nodesQuery = useRunNodes(runId, isRunning);

  if (runQuery.isLoading) {
    return <DeckMessage label="loading run telemetry…" />;
  }
  if (runQuery.error || !runQuery.data) {
    const message = runQuery.error?.message ?? 'run not found';
    return <DeckMessage label={`error: ${message}`} tone="error" />;
  }

  const run = runQuery.data;
  const nodes = nodesQuery.data ?? [];

  return (
    <>
      <StatusBanner run={run} nodes={nodes} />
      <MetadataGrid run={run} />
      {nodesQuery.error && (
        <div className="font-mono text-[10px] text-rose-conn">
          failed to load nodes: {nodesQuery.error.message}
        </div>
      )}
      <GanttTimeline
        runId={runId}
        run={run}
        nodes={nodes}
        actions={<ExecutionActions run={run} />}
      />
      <NodeGrid
        runId={runId}
        nodes={nodes}
        pipelineCompletedAt={run.completed_at}
        runTerminated={run.status !== 'in_progress'}
      />
    </>
  );
}

function DeckMessage({ label, tone }: { label: string; tone?: 'error' }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="rounded-[3px] border border-dashed border-ink/35 px-8 py-10 text-center bg-paper">
        <HandHeader className="mb-2">Execution Deck</HandHeader>
        <Mono size={11} dim={tone !== 'error'}>
          {label}
        </Mono>
      </div>
    </div>
  );
}
