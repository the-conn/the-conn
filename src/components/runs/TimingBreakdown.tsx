'use client';

import { styled } from '@linaria/react';
import type { NodeState } from '@/types/ui';
import { NODE_SPEC } from '@/utils/runStatus';
import { formatElapsedMs } from '@/utils/time';

interface TimingBreakdownProps {
  waitMs: number | null;
  runMs: number | null;
  totalMs: number | null;
  state: NodeState;
}

const Bar = styled.div`
  display: flex;
  height: 8px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--ink-trace);
`;

const WaitSeg = styled.div`
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0,
    transparent 3px,
    rgba(136, 136, 136, 0.35) 3px,
    rgba(136, 136, 136, 0.35) 4px
  );
  background-color: var(--paper-3);
`;

const RunSeg = styled.div<{ color: string; soft: string }>`
  background: ${(p) => p.soft};
  border-left: 1px solid ${(p) => p.color};
`;

export function TimingBreakdown({ waitMs, runMs, totalMs, state }: TimingBreakdownProps) {
  const spec = NODE_SPEC[state];
  const wait = waitMs ?? 0;
  const run = runMs ?? 0;
  const denom = wait + run;
  const waitPct = denom > 0 ? (wait / denom) * 100 : 0;
  const runPct = denom > 0 ? (run / denom) * 100 : 0;

  return (
    <div className="mb-[8px]">
      <Bar aria-hidden>
        <WaitSeg style={{ width: `${waitPct}%` }} title={waitMs != null ? `wait ${wait}ms` : ''} />
        <RunSeg
          color={spec.colorVar}
          soft={spec.softVar}
          style={{ width: `${runPct}%` }}
          title={runMs != null ? `run ${run}ms` : ''}
        />
      </Bar>
      <div className="flex justify-between mt-[6px] font-mono text-[11px]">
        <Cell label="queued" value={formatElapsedMs(waitMs)} className="text-ink-soft" />
        <Cell
          label="ran"
          value={formatElapsedMs(runMs)}
          style={{ color: spec.colorVar }}
          align="center"
        />
        <Cell label="total" value={formatElapsedMs(totalMs)} className="text-ink" align="right" />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  className,
  style,
  align = 'left',
}: {
  label: string;
  value: string;
  className?: string;
  style?: React.CSSProperties;
  align?: 'left' | 'center' | 'right';
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <div className={alignClass}>
      <div className="text-[9px] tracking-[0.1em] uppercase text-ink-faint">{label}</div>
      <div className={`font-semibold ${className ?? ''}`} style={style}>
        {value}
      </div>
    </div>
  );
}
