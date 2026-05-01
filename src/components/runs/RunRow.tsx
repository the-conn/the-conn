'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mono } from '@/components/ui/Mono';
import { StatusGlyph } from '@/components/ui/StatusGlyph';
import { TriggerChip } from '@/components/ui/TriggerChip';
import type { Run } from '@/types/api';
import { withSearchParams } from '@/utils/href';
import { NODE_SPEC, getRunState } from '@/utils/runStatus';
import { formatRelative, shortSha } from '@/utils/time';

interface RunRowProps {
  run: Run;
  isActive: boolean;
}

export function RunRow({ run, isActive }: RunRowProps) {
  const searchParams = useSearchParams();
  const state = getRunState(run);
  const spec = NODE_SPEC[state];
  const recency = formatRelative(run.created_at);
  const repoTail = run.repo;
  const href = withSearchParams(`/runs/${run.run_id}`, searchParams);

  return (
    <Link
      href={href}
      className={`relative block rounded-[3px] border bg-paper px-[12px] pl-[14px] py-[7px] transition-colors hover:bg-paper-2 ${
        isActive ? 'border-[1.5px] border-ink/85 bg-paper-2' : 'border border-ink/85'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[2px]"
        style={{ background: spec.colorVar }}
      />
      <div className="flex items-center gap-[6px] mb-[3px]">
        <StatusGlyph state={state} size={10} />
        <Mono size={10}>{shortRunId(run.run_id)}</Mono>
        <span className="flex-1" />
        <span className="font-mono text-[9px] text-ink-faint opacity-65">{recency}</span>
      </div>
      <div className="font-ui font-semibold text-[13px] leading-tight text-ink mb-[3px] truncate">
        {run.pipeline_name}
      </div>
      <div className="flex items-center gap-[6px] flex-wrap">
        <TriggerChip run={run} size={10} />
      </div>
      <div className="mt-[2px] flex items-center gap-[6px]">
        <Mono size={9}>
          {repoTail} · {shortSha(run.sha)}
        </Mono>
      </div>
      {run.retry_of && (
        <div className="mt-[3px] font-mono text-[9px] text-trigger-retry">
          ↪ retry of <span className="underline">{shortRunId(run.retry_of)}</span>
        </div>
      )}
    </Link>
  );
}

function shortRunId(runId: string): string {
  return runId.slice(0, 8);
}
