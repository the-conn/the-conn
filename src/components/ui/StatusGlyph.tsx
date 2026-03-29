import { Check, CircleDashed, CircleDotDashed, Minus, Slash, X } from 'lucide-react';
import type { NodeState, RunState } from '@/types/ui';
import { NODE_SPEC } from '@/utils/runStatus';

interface StatusGlyphProps {
  state: NodeState | RunState;
  size?: number;
  className?: string;
}

export function StatusGlyph({ state, size = 12, className }: StatusGlyphProps) {
  const spec = NODE_SPEC[state as NodeState] ?? NODE_SPEC.cancelled;
  const style = { color: spec.colorVar, width: size, height: size };
  const common = `inline-block ${className ?? ''}`;
  const stroke = 2;
  switch (state) {
    case 'pass':
      return <Check style={style} className={common} strokeWidth={stroke} aria-label="pass" />;
    case 'fail':
      return <X style={style} className={common} strokeWidth={stroke} aria-label="fail" />;
    case 'running':
      return (
        <CircleDashed
          style={style}
          className={`${common} animate-spin [animation-duration:2.4s]`}
          strokeWidth={stroke}
          aria-label="running"
        />
      );
    case 'pending':
      return (
        <CircleDotDashed
          style={style}
          className={common}
          strokeWidth={stroke}
          aria-label="pending"
        />
      );
    case 'cancelled':
      return <Slash style={style} className={common} strokeWidth={stroke} aria-label="cancelled" />;
    default:
      return <Minus style={style} className={common} strokeWidth={stroke} aria-label={state} />;
  }
}
