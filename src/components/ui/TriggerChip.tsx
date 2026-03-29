import { GitBranch, GitPullRequest, RotateCcw, Tag, type LucideIcon } from 'lucide-react';
import type { Run } from '@/types/api';
import type { TriggerKind } from '@/types/ui';
import { getTriggerKind } from '@/utils/runStatus';
import { shortSha } from '@/utils/time';

interface TriggerChipProps {
  run: Run;
  detail?: boolean;
  size?: 9 | 10 | 11;
}

interface TriggerSpec {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: LucideIcon;
}

const TRIGGER_SPECS: Record<TriggerKind, TriggerSpec> = {
  branch: {
    label: 'BRANCH',
    color: '#4a7aa8',
    bg: '#dde6f0',
    border: '#4a7aa888',
    Icon: GitBranch,
  },
  tag: { label: 'TAG', color: '#8a5cb8', bg: '#e6dcef', border: '#8a5cb888', Icon: Tag },
  pr: { label: 'PR', color: '#3a8a6e', bg: '#d5e8df', border: '#3a8a6e88', Icon: GitPullRequest },
  retry: { label: 'RETRY', color: '#c47a1c', bg: '#f0dcc0', border: '#c47a1c88', Icon: RotateCcw },
};

const SIZE_CLASS: Record<NonNullable<TriggerChipProps['size']>, string> = {
  9: 'text-[9px]',
  10: 'text-[10px]',
  11: 'text-[11px]',
};

export function TriggerChip({ run, detail, size = 11 }: TriggerChipProps) {
  const kind = getTriggerKind(run);
  const spec = TRIGGER_SPECS[kind];
  const Icon = spec.Icon;
  const refText = formatRef(run, kind);
  const padding = detail ? 'px-[6px] py-[2px]' : 'px-[4px] py-[1px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono whitespace-nowrap rounded ${padding} ${SIZE_CLASS[size]}`}
      style={{
        background: detail ? spec.bg : 'transparent',
        border: detail ? `1px solid ${spec.border}` : 'none',
        color: spec.color,
      }}
    >
      <Icon size={Math.max(10, size + 1)} strokeWidth={2} />
      {detail && (
        <span
          className="font-bold uppercase tracking-[0.08em] opacity-85"
          style={{ fontSize: size - 1 }}
        >
          {spec.label}
        </span>
      )}
      <span className="text-ink font-medium">{refText}</span>
    </span>
  );
}

function formatRef(run: Run, kind: TriggerKind): string {
  if (kind === 'pr' && run.pr_number !== null) {
    const head = run.branch ?? '';
    const base = run.target_branch ?? 'main';
    return `#${run.pr_number} ${head ? `${head}→${base}` : base}`;
  }
  if (kind === 'tag' && run.tag) return run.tag;
  if (kind === 'retry') return run.branch ?? run.target_branch ?? shortSha(run.sha);
  return run.branch ?? run.target_branch ?? shortSha(run.sha);
}
