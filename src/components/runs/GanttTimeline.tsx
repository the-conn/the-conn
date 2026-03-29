'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { HandHeader } from '@/components/ui/HandHeader';
import { Mono } from '@/components/ui/Mono';
import { StatusGlyph } from '@/components/ui/StatusGlyph';
import type { NodeExecution, Run } from '@/types/api';
import { NODE_SPEC, getRunState } from '@/utils/runStatus';
import { buildGanttModel, pct } from '@/utils/gantt';
import { formatDurationSeconds, formatTickOffset, parseIso } from '@/utils/time';

interface GanttTimelineProps {
  run: Run;
  nodes: NodeExecution[];
  actions?: ReactNode;
}

const ROW_H = 24;
const LABEL_W = 150;

const WaitSeg = styled.div<{ color: string; soft: string }>`
  position: absolute;
  top: 6px;
  height: 12px;
  border: 1px dashed ${(p) => p.color};
  border-radius: 2px;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0,
    transparent 3px,
    ${(p) => p.soft} 3px,
    ${(p) => p.soft} 4px
  );
`;

const RunSeg = styled.div<{ color: string; soft: string }>`
  position: absolute;
  top: 4px;
  height: 16px;
  background: ${(p) => p.soft};
  border: 1.2px solid ${(p) => p.color};
  border-radius: 2px;
  display: flex;
  align-items: center;
  padding-left: 6px;
  overflow: hidden;
`;

export function GanttTimeline({ run, nodes, actions }: GanttTimelineProps) {
  const isRunning = getRunState(run) === 'running';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const t0 = parseIso(run.created_at) ?? now;
  const model = useMemo(
    () =>
      buildGanttModel(
        nodes,
        run.created_at,
        run.completed_at,
        isRunning ? now : (parseIso(run.completed_at) ?? t0),
      ),
    [nodes, run.created_at, run.completed_at, isRunning, now, t0],
  );

  return (
    <section className="rounded-[3px] border-[1.5px] border-ink/85 bg-paper px-[14px] pt-[12px] pb-[14px]">
      <div className="flex items-center gap-3 mb-[6px]">
        <HandHeader>Timeline</HandHeader>
        <Legend />
        <span className="flex-1" />
        {actions}
      </div>

      <div className="flex">
        <div style={{ width: LABEL_W }} />
        <div className="relative flex-1 h-[14px] mb-[6px]">
          {model.ticks.map((tick) => (
            <div
              key={tick}
              className="absolute top-0"
              style={{ left: `${pct(tick, model.totalMs)}%`, transform: 'translateX(-50%)' }}
            >
              <span className="font-mono text-[9px] text-ink-faint">{formatTickOffset(tick)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col gap-[4px]">
        <div
          className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{ left: LABEL_W }}
          aria-hidden
        >
          {model.ticks.map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px bg-ink-trace opacity-55"
              style={{ left: `${pct(tick, model.totalMs)}%` }}
            />
          ))}
        </div>

        {model.rows.length === 0 && (
          <div className="font-mono text-[10px] text-ink-faint py-3">no nodes yet</div>
        )}

        {model.rows.map((row) => {
          const spec = NODE_SPEC[row.state];
          const waitLeft = pct(row.waitStartMs, model.totalMs);
          const waitWidth = Math.max(0, pct(row.waitEndMs - row.waitStartMs, model.totalMs));
          const runLeft = pct(row.runStartMs, model.totalMs);
          const runWidth = Math.max(0, pct(row.runEndMs - row.runStartMs, model.totalMs));
          const runDurationSec = (row.runEndMs - row.runStartMs) / 1000;
          const waitDurationSec = (row.waitEndMs - row.waitStartMs) / 1000;
          const showWaitLabel = waitDurationSec >= 5 && runWidth > 8;

          return (
            <div key={row.node.id} className="relative flex items-center" style={{ height: ROW_H }}>
              <div className="flex items-center gap-[6px] pr-[8px]" style={{ width: LABEL_W }}>
                <StatusGlyph state={row.state} size={11} />
                <span
                  className="font-mono text-[11px] text-ink truncate"
                  title={row.node.node_name}
                >
                  {row.node.node_name}
                </span>
              </div>
              <div className="relative flex-1" style={{ height: ROW_H }}>
                {!row.isPending && waitWidth > 0.1 && (
                  <WaitSeg
                    color={spec.colorVar}
                    soft={spec.softVar}
                    style={{ left: `${waitLeft}%`, width: `${waitWidth}%` }}
                    title={`wait ${formatDurationSeconds(waitDurationSec)}`}
                  />
                )}
                {!row.isPending && runWidth > 0.1 && (
                  <RunSeg
                    color={spec.colorVar}
                    soft={spec.softVar}
                    style={{ left: `${runLeft}%`, width: `${Math.max(1, runWidth)}%` }}
                    title={`run ${formatDurationSeconds(runDurationSec)}`}
                  >
                    <span className="font-mono text-[10px] font-semibold text-ink whitespace-nowrap">
                      {formatDurationSeconds(runDurationSec)}
                    </span>
                    {showWaitLabel && (
                      <span className="font-mono text-[9px] ml-[6px] text-ink-faint whitespace-nowrap">
                        wait {formatDurationSeconds(waitDurationSec)}
                      </span>
                    )}
                  </RunSeg>
                )}
                {row.isPending && (
                  <div
                    className="absolute top-[6px] font-mono text-[10px] text-ink-faint"
                    style={{ left: `${runLeft}%` }}
                  >
                    · · · pending
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 font-ui text-[11px] text-ink-soft">
      <span className="inline-flex items-center gap-[5px]">
        <span
          className="inline-block w-[14px] h-[8px] rounded-[1px] border border-dashed border-ink-faint bg-paper-3"
          aria-hidden
        />
        wait (queued)
      </span>
      <span className="inline-flex items-center gap-[5px]">
        <span
          className="inline-block w-[14px] h-[8px] rounded-[1px]"
          aria-hidden
          style={{
            background: 'var(--status-emerald-soft)',
            border: '1.2px solid var(--status-emerald)',
          }}
        />
        run (executing)
      </span>
      <Mono size={10} dim>
        click row in sidebar to switch
      </Mono>
    </div>
  );
}
