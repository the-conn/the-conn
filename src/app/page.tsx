import { AppShell } from '@/components/layout/AppShell';
import { ExecutionDeckIdle } from '@/components/runs/ExecutionDeckIdle';

export default function HomePage() {
  return (
    <AppShell activeRunId={null}>
      <ExecutionDeckIdle />
    </AppShell>
  );
}
