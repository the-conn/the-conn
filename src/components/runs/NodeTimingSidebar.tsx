'use client';

import type { ReactNode } from 'react';
import { HandHeader } from '@/components/ui/HandHeader';
import { Mono } from '@/components/ui/Mono';
import { NodeDefinitionPanel } from '@/components/runs/NodeDefinitionPanel';
import { TimingBreakdown } from '@/components/runs/TimingBreakdown';
import type { NodeExecution } from '@/types/api';
import type { NodeState } from '@/types/ui';
import { useFormatTime } from '@/hooks/useFormatTime';
import { parseIso } from '@/utils/time';

interface NodeTimingSidebarProps {
  node: NodeExecution;
  state: NodeState;
}

export function NodeTimingSidebar({ node, state }: NodeTimingSidebarProps) {
  const created = parseIso(node.created_at);
  const started = parseIso(node.started_at);
  const completed = parseIso(node.completed_at);
  const waitMs = started !== null && created !== null ? started - created : null;
  const runMs = completed !== null && started !== null ? completed - started : null;
  const totalMs = completed !== null && created !== null ? completed - created : null;

  const exitLabel =
    node.success === true ? 'success (code 0)' : node.success === false ? 'failure (code 1)' : '—';
  const exitClass = node.success === false ? 'text-rose-conn' : 'text-ink';

  return (
    <aside className="w-[320px] shrink-0 border-r-[1.2px] border-ink/85 bg-paper px-[16px] pt-[16px] pb-[14px] flex flex-col gap-[14px] overflow-auto">
      <Section title="Timing">
        <TimingBreakdown waitMs={waitMs} runMs={runMs} totalMs={totalMs} state={state} />
        <TimestampRow label="created" iso={node.created_at} />
        <TimestampRow label="started" iso={node.started_at} />
        <TimestampRow label="completed" iso={node.completed_at} />
      </Section>

      <Section title="Result">
        <KV label="exit">
          <span className={`font-mono text-[12px] font-semibold ${exitClass}`}>{exitLabel}</span>
        </KV>
        <KV label="success">
          <Mono size={12}>{String(node.success)}</Mono>
        </KV>
      </Section>

      <NodeDefinitionPanel definition={node.node_definition} />
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <HandHeader>{title}</HandHeader>
      <div className="flex flex-col gap-[4px]">{children}</div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-[2px]">
      <span className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="ml-3">{children}</span>
    </div>
  );
}

function TimestampRow({ label, iso }: { label: string; iso: string | null }) {
  const formatTime = useFormatTime();
  return (
    <div className="flex flex-col py-[4px] border-t border-dashed border-ink-trace">
      <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-ink-faint mb-px">
        {label}
      </div>
      <div className={`font-mono text-[11px] font-medium ${iso ? 'text-ink' : 'text-ink-faint'}`}>
        {formatTime(iso)}
      </div>
    </div>
  );
}
