'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/contexts/SessionContext';

export function UserMenu() {
  const { user, status, logout } = useSession();

  if (status !== 'authenticated' || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-[10px]">
      <span className="font-mono text-[11px] text-ink-soft">
        <span className="font-semibold text-ink">{user.name}</span>, you have The Conn!
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void logout()}
        title="Log out"
        aria-label="Log out"
      >
        <LogOut size={12} strokeWidth={2} />
        log out
      </Button>
    </div>
  );
}
