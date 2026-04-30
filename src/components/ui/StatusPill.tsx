'use client';

import { styled } from '@linaria/react';
import type { NodeState } from '@/types/ui';
import { NODE_SPEC } from '@/utils/runStatus';

interface StatusPillProps {
  state: NodeState;
  className?: string;
}

const PILL_LABEL: Record<NodeState, string> = {
  pass: 'SUCCESS',
  fail: 'FAILED',
  running: 'RUNNING',
  pending: 'PENDING',
  cancelled: 'CANCELLED',
};

const Pill = styled.span<{ color: string; soft: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 3px;
  background: ${(p) => p.soft};
  border: 1px solid ${(p) => p.color};
  color: ${(p) => p.color};
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.14em;
`;

export function StatusPill({ state, className }: StatusPillProps) {
  const spec = NODE_SPEC[state];
  return (
    <Pill color={spec.colorVar} soft={spec.softVar} className={className}>
      {PILL_LABEL[state]}
    </Pill>
  );
}
