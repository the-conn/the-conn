import { Suspense, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-dvh bg-paper text-ink">
      <TopNav />
      <div className="flex flex-1 min-h-0">
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0 px-6 py-4 flex flex-col gap-[14px] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarFallback() {
  return (
    <aside
      className="w-[296px] shrink-0 border-r-[1.2px] border-ink/85 bg-paper px-3 py-[14px]"
      aria-hidden
    />
  );
}
