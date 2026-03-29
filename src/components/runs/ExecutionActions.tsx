'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RUNS_LIST_KEY, queryKeys } from '@/services/queryKeys';
import { cancelRun, retryRun } from '@/services/runs';
import type { Run } from '@/types/api';
import { getRunState } from '@/utils/runStatus';

interface ExecutionActionsProps {
  run: Run;
}

const SETTLE_DEADLINE_MS = 30_000;
const SETTLE_INTERVAL_MS = 1_500;

export function ExecutionActions({ run }: ExecutionActionsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const state = getRunState(run);
  const [settling, setSettling] = useState(false);
  const settleAbortRef = useRef<{ aborted: boolean }>({ aborted: false });

  useEffect(() => {
    const abortFlag = settleAbortRef.current;
    return () => {
      abortFlag.aborted = true;
    };
  }, []);

  const retry = useMutation({
    mutationFn: () => retryRun(run.run_id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RUNS_LIST_KEY });
      if (data?.run_id && data.run_id !== run.run_id) {
        router.push(`/runs/${data.run_id}`);
      }
    },
  });

  const awaitSettlement = useCallback(async () => {
    const detailKey = queryKeys.runs.detail(run.run_id);
    const nodesKey = queryKeys.runs.nodes(run.run_id);
    const deadline = Date.now() + SETTLE_DEADLINE_MS;

    while (Date.now() < deadline && !settleAbortRef.current.aborted) {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: detailKey }),
        queryClient.refetchQueries({ queryKey: nodesKey }),
      ]);
      if (settleAbortRef.current.aborted) return;
      const latest = queryClient.getQueryData<Run>(detailKey);
      if (latest?.cancelled && latest.completed_at !== null) return;
      await new Promise((resolve) => setTimeout(resolve, SETTLE_INTERVAL_MS));
    }
  }, [queryClient, run.run_id]);

  const cancel = useMutation({
    mutationFn: () => cancelRun(run.run_id),
    onSuccess: async () => {
      settleAbortRef.current.aborted = false;
      setSettling(true);
      queryClient.invalidateQueries({ queryKey: RUNS_LIST_KEY });
      try {
        await awaitSettlement();
      } finally {
        if (!settleAbortRef.current.aborted) {
          queryClient.invalidateQueries({ queryKey: RUNS_LIST_KEY });
          setSettling(false);
        }
      }
    },
  });

  const canRetry = state !== 'running' && !retry.isPending;
  const canCancel = state === 'running' && !cancel.isPending && !settling;
  const error = retry.error ?? cancel.error;

  const handleRetry = useCallback(() => {
    cancel.reset();
    retry.mutate();
  }, [cancel, retry]);

  const handleCancel = useCallback(() => {
    retry.reset();
    cancel.mutate();
  }, [cancel, retry]);

  return (
    <div className="flex items-center gap-[6px]">
      {error && (
        <span
          className="font-mono text-[10px] text-rose-conn max-w-[260px] truncate"
          title={error.message}
        >
          {error.message}
        </span>
      )}
      <Button
        variant="default"
        size="sm"
        className="uppercase tracking-[0.08em] font-semibold"
        disabled={!canRetry}
        onClick={handleRetry}
        title={
          state === 'running'
            ? 'Cannot re-run a pipeline that is still in progress'
            : 'Trigger a new run from this commit'
        }
      >
        <RefreshCw
          size={11}
          strokeWidth={2}
          className={retry.isPending ? 'animate-spin' : ''}
          aria-hidden
        />
        {retry.isPending ? 'launching…' : 're-run'}
      </Button>
      <Button
        variant="danger"
        size="sm"
        className="uppercase tracking-[0.08em] font-semibold"
        disabled={!canCancel}
        onClick={handleCancel}
        title={state === 'running' ? 'Cancel this in-flight run' : 'Run is not in progress'}
      >
        {settling || cancel.isPending ? (
          <Loader2 size={11} strokeWidth={2} className="animate-spin" aria-hidden />
        ) : (
          <Square size={10} strokeWidth={0} fill="currentColor" aria-hidden />
        )}
        {settling ? 'settling…' : cancel.isPending ? 'cancelling…' : 'cancel'}
      </Button>
    </div>
  );
}
