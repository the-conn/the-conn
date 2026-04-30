'use client';

import { useCallback } from 'react';
import { useTimezoneMode } from '@/contexts/TimezoneModeContext';
import { formatTimeLocal, formatTimeUTC } from '@/utils/time';

export function useFormatTime(): (iso: string | null) => string {
  const { mode } = useTimezoneMode();
  return useCallback(
    (iso: string | null) => (mode === 'local' ? formatTimeLocal(iso) : formatTimeUTC(iso)),
    [mode],
  );
}
