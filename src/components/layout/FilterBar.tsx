'use client';

import { Plus, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { RunFilterField, RunFilters } from '@/types/api';
import {
  FILTER_FIELDS,
  FILTER_LABELS,
  activeFilterEntries,
  writeFiltersToSearchParams,
} from '@/utils/runFilters';

interface FilterBarProps {
  filters: RunFilters;
}

export function FilterBar({ filters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [field, setField] = useState<RunFilterField>('pipeline_name');
  const [value, setValue] = useState('');

  const entries = useMemo(() => activeFilterEntries(filters), [filters]);

  const updateUrl = useCallback(
    (next: RunFilters) => {
      const current = new URLSearchParams(searchParams?.toString() ?? '');
      const updated = writeFiltersToSearchParams(current, next);
      const qs = updated.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleAdd = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;
      const next: RunFilters = { ...filters, [field]: trimmed };
      updateUrl(next);
      setValue('');
    },
    [field, filters, updateUrl, value],
  );

  const handleRemove = useCallback(
    (target: RunFilterField) => {
      const next: RunFilters = { ...filters };
      delete next[target];
      updateUrl(next);
    },
    [filters, updateUrl],
  );

  return (
    <div className="flex flex-col gap-[6px]">
      <form
        onSubmit={handleAdd}
        className="flex items-center gap-[6px] rounded-[3px] border border-dashed border-ink/45 px-[8px] py-[5px] focus-within:border-ink/70"
      >
        <Search size={11} strokeWidth={2} className="text-ink-faint" aria-hidden />
        <select
          aria-label="Filter field"
          value={field}
          onChange={(event) => setField(event.target.value as RunFilterField)}
          className="bg-transparent font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft border-none outline-none cursor-pointer"
        >
          {FILTER_FIELDS.map((f) => (
            <option key={f} value={f}>
              {FILTER_LABELS[f]}
            </option>
          ))}
        </select>
        <span className="text-ink-faint font-mono text-[11px]" aria-hidden>
          ·
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`exact ${FILTER_LABELS[field]}…`}
          aria-label="Filter value"
          className="flex-1 min-w-0 bg-transparent font-ui text-[11px] text-ink placeholder:text-ink-faint border-none outline-none"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          aria-label="Add filter"
          disabled={value.trim().length === 0}
          className="!px-[6px]"
        >
          <Plus size={11} strokeWidth={2} />
          add
        </Button>
      </form>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-[4px]">
          {entries.map(([target, val]) => (
            <FilterChip
              key={target}
              field={target}
              value={val}
              onRemove={() => handleRemove(target)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterChipProps {
  field: RunFilterField;
  value: string;
  onRemove: () => void;
}

function FilterChip({ field, value, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-[4px] rounded-[3px] border border-ink/35 bg-paper-2 px-[6px] py-[2px] font-mono text-[10px] text-ink">
      <span className="uppercase tracking-[0.06em] text-ink-faint">{FILTER_LABELS[field]}</span>
      <span className="text-ink-soft">·</span>
      <span className="font-medium max-w-[140px] truncate" title={value}>
        {value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${FILTER_LABELS[field]} filter`}
        className="ml-[2px] inline-flex items-center justify-center rounded-[2px] text-ink-faint hover:bg-ink/10 hover:text-ink"
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  );
}
