'use client';

import { LogViewer } from '@/components/runs/LogViewer';
import { NodeSubNav } from '@/components/runs/NodeSubNav';
import { NodeTimingSidebar } from '@/components/runs/NodeTimingSidebar';
import { HandHeader } from '@/components/ui/HandHeader';
import { Mono } from '@/components/ui/Mono';
import { useNodeDetail } from '@/hooks/useNodeDetail';
import { useNodeLogs } from '@/hooks/useNodeLogs';
import { useRun } from '@/hooks/useRun';
import { getNodeState, getRunState } from '@/utils/runStatus';

interface NodeViewDeckProps {
  runId: string;
  nodeName: string;
}

export function NodeViewDeck({ runId, nodeName }: NodeViewDeckProps) {
  const runQuery = useRun(runId);
  const runIsRunning = runQuery.data ? getRunState(runQuery.data) === 'running' : false;
  const nodeQuery = useNodeDetail(runId, nodeName, runIsRunning);

  const node = nodeQuery.data;
  const runTerminated = runQuery.data ? runQuery.data.status !== 'in_progress' : false;
  const state = node ? getNodeState(node, runTerminated) : 'pending';
  const nodeIsRunning = state === 'running' || state === 'pending';

  const logsQuery = useNodeLogs(runId, nodeName, runIsRunning && nodeIsRunning);

  if (nodeQuery.isLoading || runQuery.isLoading) {
    return (
      <Wrapper>
        <DeckMessage label="loading node telemetry…" />
      </Wrapper>
    );
  }

  if (nodeQuery.error || !node) {
    const message = nodeQuery.error?.message ?? 'node not found';
    return (
      <Wrapper>
        <DeckMessage label={`error: ${message}`} tone="error" />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <NodeSubNav runId={runId} node={node} state={state} />
      <div className="flex flex-1 min-h-0">
        <NodeTimingSidebar node={node} state={state} />
        <LogViewer
          raw={logsQuery.data?.raw ?? ''}
          lines={logsQuery.data?.lines ?? []}
          loading={logsQuery.isLoading}
          error={logsQuery.error as Error | null}
          downloadName={buildDownloadName(runId, nodeName)}
        />
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 -mx-6 -my-4 border-t border-ink-trace">
      {children}
    </div>
  );
}

function DeckMessage({ label, tone }: { label: string; tone?: 'error' }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="rounded-[3px] border border-dashed border-ink/35 px-8 py-10 text-center bg-paper">
        <HandHeader className="mb-2">Node View</HandHeader>
        <Mono size={11} dim={tone !== 'error'}>
          {label}
        </Mono>
      </div>
    </div>
  );
}

function buildDownloadName(runId: string, nodeName: string): string {
  const safeNode = nodeName.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const safeRun = runId.slice(0, 8);
  return `${safeRun}-${safeNode}.log`;
}
