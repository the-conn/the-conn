import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { TriggerChip } from '@/components/ui/TriggerChip';
import type { Run } from '@/types/api';
import { getGitTriggerUrl } from '@/utils/gitUrl';
import { shortSha } from '@/utils/time';

interface MetadataGridProps {
  run: Run;
}

export function MetadataGrid({ run }: MetadataGridProps) {
  return (
    <div className="grid gap-[10px] grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr]">
      <Cell label="trigger">
        <a
          href={getGitTriggerUrl(run)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-[6px] hover:[&_span]:underline"
        >
          <TriggerChip run={run} size={11} detail />
          <ExternalLink size={10} strokeWidth={2} className="text-ink-faint" aria-hidden />
        </a>
      </Cell>
      <Cell label="owner" mono value={run.owner} />
      <Cell label="repo" mono value={run.repo} />
      <Cell label="sha" mono value={shortSha(run.sha)} />
      {run.retry_of ? (
        <Cell label="retry of">
          <Link
            href={`/runs/${run.retry_of}`}
            className="font-mono text-[12px] font-semibold text-trigger-retry underline hover:opacity-80"
          >
            ↪ {run.retry_of.slice(0, 8)}
          </Link>
        </Cell>
      ) : (
        <Cell label="pipeline" mono value={run.pipeline_name} />
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[3px] border border-dashed border-ink/45 px-[9px] py-[5px]">
      <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-faint opacity-60 mb-[2px]">
        {label}
      </div>
      {children ? (
        <div className="min-h-[16px]">{children}</div>
      ) : (
        <div
          className={`text-[12px] font-medium text-ink truncate ${mono ? 'font-mono' : 'font-ui'}`}
        >
          {value ?? '—'}
        </div>
      )}
    </div>
  );
}
