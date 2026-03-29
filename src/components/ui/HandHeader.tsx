import type { ReactNode } from 'react';

interface HandHeaderProps {
  children: ReactNode;
  className?: string;
}

export function HandHeader({ children, className }: HandHeaderProps) {
  return (
    <div
      className={`font-mono text-[11px] font-bold uppercase tracking-cmd-tight text-ink-soft leading-none ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
