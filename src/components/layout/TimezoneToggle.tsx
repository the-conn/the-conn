'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTimezoneMode } from '@/contexts/TimezoneModeContext';

export function TimezoneToggle() {
  const { mode, toggle } = useTimezoneMode();
  const isLocal = mode === 'local';
  const nextLabel = isLocal ? 'UTC' : 'local timezone';
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      title={`Switch to ${nextLabel}`}
      aria-label={`Switch to ${nextLabel}`}
      aria-pressed={isLocal}
    >
      <Globe size={12} strokeWidth={2} />
      {mode}
    </Button>
  );
}
