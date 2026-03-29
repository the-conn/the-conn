import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type BoxProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'solid' | 'dashed' | 'soft';
  children?: ReactNode;
  style?: CSSProperties;
};

export function Box({ variant = 'solid', className, children, style, ...rest }: BoxProps) {
  const base = 'rounded-[3px] bg-paper relative';
  const stroke =
    variant === 'dashed'
      ? 'border border-dashed border-ink/45'
      : variant === 'soft'
        ? 'border border-ink-trace'
        : 'border-[1.5px] border-ink/85';
  return (
    <div className={`${base} ${stroke} ${className ?? ''}`} style={style} {...rest}>
      {children}
    </div>
  );
}
