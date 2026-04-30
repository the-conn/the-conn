'use client';

import { styled } from '@linaria/react';
import type { LogStream } from '@/types/api';

export type StreamFilterValue = 'all' | LogStream;

interface StreamFilterProps {
  value: StreamFilterValue;
  counts: Record<StreamFilterValue, number>;
  onChange: (next: StreamFilterValue) => void;
}

interface OptionSpec {
  value: StreamFilterValue;
  label: string;
}

const OPTIONS: OptionSpec[] = [
  { value: 'all', label: 'ALL' },
  { value: 'stdout', label: 'STDOUT' },
  { value: 'stderr', label: 'STDERR' },
];

const Group = styled.div`
  display: inline-flex;
  border: 1px solid rgba(26, 26, 26, 0.18);
  border-radius: 4px;
  overflow: hidden;
  background: var(--paper);
`;

const SegBtn = styled.button<{
  active: boolean;
  isErr: boolean;
  first: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-left: ${(p) => (p.first ? 'none' : '1px solid rgba(26,26,26,0.10)')};
  border-radius: 0;
  padding: 3px 10px;
  cursor: pointer;
  background: ${(p) =>
    p.active ? (p.isErr ? 'var(--status-rose-soft)' : 'var(--paper-3)') : 'transparent'};
  color: ${(p) =>
    p.active ? (p.isErr ? 'var(--status-rose)' : 'var(--ink)') : 'var(--ink-faint)'};
  font-weight: ${(p) => (p.active ? 700 : 500)};
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
  font-size: 11px;

  &:hover {
    background: ${(p) =>
      p.active ? (p.isErr ? 'var(--status-rose-soft)' : 'var(--paper-3)') : 'var(--paper-2)'};
  }
`;

const Count = styled.span<{ active: boolean; isErr: boolean }>`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0;
  padding: 0 4px;
  border-radius: 2px;
  background: ${(p) => (p.active ? 'rgba(26,26,26,0.08)' : 'transparent')};
  color: ${(p) =>
    p.active ? (p.isErr ? 'var(--status-rose)' : 'var(--ink-soft)') : 'var(--ink-faint)'};
  opacity: ${(p) => (p.active ? 1 : 0.7)};
`;

export function StreamFilter({ value, counts, onChange }: StreamFilterProps) {
  return (
    <Group role="tablist" aria-label="filter log streams">
      {OPTIONS.map((opt, i) => {
        const active = opt.value === value;
        const isErr = opt.value === 'stderr';
        return (
          <SegBtn
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            active={active}
            isErr={isErr}
            first={i === 0}
            onClick={() => onChange(opt.value)}
          >
            <span>{opt.label}</span>
            <Count active={active} isErr={isErr}>
              {counts[opt.value]}
            </Count>
          </SegBtn>
        );
      })}
    </Group>
  );
}
