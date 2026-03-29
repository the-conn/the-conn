'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FilterBar } from '@/components/layout/FilterBar';
import { HandHeader } from '@/components/ui/HandHeader';
import { Button } from '@/components/ui/Button';
import { RunRow } from '@/components/runs/RunRow';
import { useRuns } from '@/hooks/useRuns';
import { activeFilterEntries, readFiltersFromSearchParams } from '@/utils/runFilters';

interface SidebarProps {
  activeRunId: string | null;
}

export function Sidebar({ activeRunId }: SidebarProps) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const filterSignature = useMemo(
    () =>
      activeFilterEntries(filters)
        .map(([k, v]) => `${k}=${v}`)
        .join('&'),
    [filters],
  );

  const [page, setPage] = useState(0);
  const lastSignature = useRef(filterSignature);
  useEffect(() => {
    if (lastSignature.current !== filterSignature) {
      lastSignature.current = filterSignature;
      setPage(0);
    }
  }, [filterSignature]);

  const { runs, isLoading, error, hasMore, limit } = useRuns(page, filters);
  const filterCount = activeFilterEntries(filters).length;

  return (
    <aside className="w-[296px] shrink-0 border-r-[1.2px] border-ink/85 bg-paper flex flex-col gap-[10px] px-3 py-[14px] min-h-0">
      <div className="flex items-baseline gap-2">
        <HandHeader>Pipeline Runs</HandHeader>
        <span className="ml-auto font-mono text-[9px] text-ink-faint">
          {runs.length} this page
          {filterCount > 0 ? ` · ${filterCount} filter${filterCount === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      <FilterBar filters={filters} />

      <div className="flex-1 min-h-0 overflow-auto pr-[2px]">
        <div className="flex flex-col gap-[6px]">
          {isLoading && runs.length === 0 && <SidebarSkeleton />}
          {!isLoading && runs.length === 0 && !error && (
            <div className="font-mono text-[10px] text-ink-faint px-1 py-2">
              {filterCount > 0 ? 'no runs match the active filters' : 'no runs on this page'}
            </div>
          )}
          {error && (
            <div className="font-mono text-[10px] text-rose-conn px-1 py-2 leading-snug">
              failed to load runs: {error.message}
            </div>
          )}
          {runs.map((run) => (
            <RunRow key={run.run_id} run={run} isActive={run.run_id === activeRunId} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-trace pt-[6px] pb-[2px] font-mono text-[10px] text-ink-faint">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeft size={11} strokeWidth={2} />
          prev
        </Button>
        <span className="flex items-center gap-1">
          page <span className="font-semibold text-ink">{page + 1}</span>
          <span className="text-ink-faint">· {limit}/page</span>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
          next
          <ChevronRight size={11} strokeWidth={2} />
        </Button>
      </div>
    </aside>
  );
}

function SidebarSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[78px] rounded-[3px] border border-ink-trace bg-paper-2/40 animate-pulse"
        />
      ))}
    </>
  );
}
