'use client';

import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { Mono } from '@/components/ui/Mono';
import type { Run } from '@/types/api';
import type { NodeExecution } from '@/types/api';
import { BANNER_SPEC, getRunState } from '@/utils/runStatus';
import { formatElapsedHms, parseIso } from '@/utils/time';

interface StatusBannerProps {
  run: Run;
  nodes: NodeExecution[];
}

const Glow = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.color};
  box-shadow: 0 0 0 4px ${(p) => p.color}33;
`;

export function StatusBanner({ run, nodes }: StatusBannerProps) {
  const state = getRunState(run);
  const spec = BANNER_SPEC[state];
  const message = buildMessage(state, nodes);
  const elapsed = useElapsed(run);

  return (
    <div
      className={`relative flex items-center gap-3 rounded-[3px] px-[14px] py-[9px] border-[1.5px] ${spec.bgClass} ${spec.borderClass}`}
    >
      <Glow color={spec.dotVar} aria-hidden />
      <span
        className={`font-mono text-[11px] font-bold tracking-cmd-loose uppercase ${spec.textClass}`}
      >
        {spec.label}
      </span>
      <span className="font-ui text-[13px] font-medium text-ink">{message}</span>
      <span className="flex-1" />
      <Mono size={11}>elapsed {elapsed}</Mono>
    </div>
  );
}

function buildMessage(state: ReturnType<typeof getRunState>, nodes: NodeExecution[]): string {
  const total = nodes.length;
  if (total === 0) {
    if (state === 'running') return 'awaiting node telemetry';
    if (state === 'pass') return 'pipeline succeeded';
    if (state === 'fail') return 'pipeline failed';
    if (state === 'cancelled') return 'pipeline decommissioned';
    return '';
  }
  const passed = nodes.filter((n) => n.success === true).length;
  const failed = nodes.filter((n) => n.success === false).length;
  const running = nodes.filter((n) => n.started_at !== null && n.completed_at === null).length;
  if (state === 'running') {
    return running > 0
      ? `${running} of ${total} node${running === 1 ? '' : 's'} running`
      : `${passed + failed} of ${total} nodes complete`;
  }
  if (state === 'fail') {
    const firstFail = nodes.find((n) => n.success === false);
    return firstFail ? `failed in node "${firstFail.node_name}"` : 'pipeline failed';
  }
  if (state === 'pass') return `${passed} of ${total} nodes succeeded`;
  return `${total} nodes decommissioned`;
}

function useElapsed(run: Run): string {
  const t0 = parseIso(run.created_at) ?? Date.now();
  const completed = parseIso(run.completed_at);
  const [now, setNow] = useState(() => Date.now());
  const isFinished = completed !== null;

  useEffect(() => {
    if (isFinished) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isFinished]);

  const end = completed ?? now;
  return formatElapsedHms(end - t0);
}
