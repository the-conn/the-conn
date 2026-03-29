import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'ghost' | 'command' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  default:
    'border border-ink/20 bg-paper text-ink hover:bg-paper-2 hover:border-ink/40 active:bg-paper-3',
  ghost:
    'border border-transparent bg-transparent text-ink-soft hover:bg-paper-2 hover:border-ink/20 hover:text-ink',
  command:
    'border border-ink/25 bg-paper text-ink uppercase tracking-[0.08em] font-semibold hover:bg-paper-2 hover:border-ink/45',
  danger:
    'border border-rose-conn/45 bg-paper text-rose-conn hover:bg-rose-soft hover:border-rose-conn',
};

const SIZE: Record<Size, string> = {
  sm: 'text-[11px] px-2 py-[3px]',
  md: 'text-[12px] px-3 py-[5px]',
};

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-[6px] font-ui font-medium rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${VARIANT[variant]} ${SIZE[size]} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
