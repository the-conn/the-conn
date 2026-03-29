import type { ReactNode } from 'react';

interface MonoProps {
  children: ReactNode;
  size?: 9 | 10 | 11 | 12 | 13;
  dim?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<MonoProps['size']>, string> = {
  9: 'text-[9px] leading-[12px]',
  10: 'text-[10px] leading-[13px]',
  11: 'text-[11px] leading-[14px]',
  12: 'text-[12px] leading-[15px]',
  13: 'text-[13px] leading-[16px]',
};

export function Mono({ children, size = 11, dim, className }: MonoProps) {
  const colorClass = dim ? 'text-ink-faint' : 'text-ink-soft';
  return (
    <span
      className={`font-mono tracking-[0.01em] ${SIZE_CLASS[size]} ${colorClass} ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
