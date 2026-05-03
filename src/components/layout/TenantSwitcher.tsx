'use client';

import type { ChangeEvent } from 'react';
import { Building2 } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

interface TenantSwitcherProps {
  activeSlug: string | null;
}

export function TenantSwitcher({ activeSlug }: TenantSwitcherProps) {
  const { authorizedSlugs, switchTenant, status } = useSession();

  if (status !== 'authenticated' || authorizedSlugs.length === 0) {
    return null;
  }

  const current = activeSlug ?? authorizedSlugs[0];

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    if (next && next !== current) {
      void switchTenant(next);
    }
  };

  return (
    <div className="flex items-center gap-[6px] rounded-[3px] border border-ink/45 bg-paper-2 px-[8px] py-[5px]">
      <Building2 size={11} strokeWidth={2} className="text-ink-faint" aria-hidden />
      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-faint">
        tenant
      </span>
      <span className="text-ink-faint font-mono text-[11px]" aria-hidden>
        ·
      </span>
      <select
        aria-label="Active tenant"
        value={current}
        onChange={handleChange}
        className="flex-1 min-w-0 bg-transparent font-mono text-[11px] font-semibold text-ink border-none outline-none cursor-pointer"
      >
        {authorizedSlugs.map((slug) => (
          <option key={slug} value={slug}>
            {slug}
          </option>
        ))}
      </select>
    </div>
  );
}
