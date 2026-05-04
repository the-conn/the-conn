'use client';

import { useEffect, useRef } from 'react';
import { ExecutionActions } from '@/components/runs/ExecutionActions';
import { GanttTimeline } from '@/components/runs/GanttTimeline';
import { MetadataGrid } from '@/components/runs/MetadataGrid';
import { NodeGrid } from '@/components/runs/NodeGrid';
import { StatusBanner } from '@/components/runs/StatusBanner';
import { useRun } from '@/hooks/useRun';
import { useRunNodes } from '@/hooks/useRunNodes';
import { Mono } from '@/components/ui/Mono';
import { HandHeader } from '@/components/ui/HandHeader';

interface ExecutionDeckProps {
  slug: string;
  runId: string;
}

export function ExecutionDeck({ slug, runId }: ExecutionDeckProps) {
  const runQuery = useRun(slug, runId);
  const nodesQuery = useRunNodes(slug, runId);

  const runStatus = runQuery.data?.status;
  const prevStatusRef = useRef(runStatus);
  const refetchNodes = nodesQuery.refetch;
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = runStatus;
    if (prev === 'in_progress' && runStatus !== undefined && runStatus !== 'in_progress') {
      refetchNodes();
    }
  }, [runStatus, refetchNodes]);

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
      <MetadataGrid slug={slug} run={run} />
      {nodesQuery.error && (
        <div className="font-mono text-[10px] text-rose-conn">
          failed to load nodes: {nodesQuery.error.message}
        </div>
      )}
      <GanttTimeline
        slug={slug}
        runId={runId}
        run={run}
        nodes={nodes}
        actions={<ExecutionActions slug={slug} run={run} />}
      />
      <NodeGrid
        slug={slug}
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
