import { SyncButton } from '@/components/layout/SyncButton';
import { TimezoneToggle } from '@/components/layout/TimezoneToggle';

export function TopNav() {
  return (
    <header className="flex items-center gap-[14px] px-[18px] py-[10px] border-b-[1.2px] border-ink/85 bg-paper">
      <span className="font-mono text-[13px] font-bold tracking-wordmark uppercase text-ink">
        THE&nbsp;CONN
      </span>
      <div className="w-px h-4 bg-ink-trace" aria-hidden />
      <span className="font-mono text-[11px] text-ink-faint">tactical pipeline console</span>
      <div className="flex-1" />
      <TimezoneToggle />
      <SyncButton />
    </header>
  );
}
