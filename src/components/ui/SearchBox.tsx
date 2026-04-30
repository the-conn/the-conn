'use client';

import type { ChangeEvent } from 'react';

interface SearchBoxProps {
  value: string;
  count: number;
  total: number;
  placeholder?: string;
  onChange: (next: string) => void;
}

export function SearchBox({ value, count, total, placeholder, onChange }: SearchBoxProps) {
  return (
    <div className="inline-flex items-center gap-[6px] rounded-[4px] border border-ink/20 bg-paper px-[8px] py-[3px] font-mono text-[11px] min-w-[240px]">
      <span className="text-ink-faint" aria-hidden>
        ⌕
      </span>
      <input
        value={value}
        placeholder={placeholder ?? 'search logs…'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="flex-1 border-none outline-none bg-transparent font-mono text-[11px] text-ink p-0"
      />
      <span className="text-ink-faint text-[10px] whitespace-nowrap">
        {value && count !== total ? `${count}/${total}` : `${total}`}
      </span>
    </div>
  );
}
