import { AppShell } from '@/components/layout/AppShell';
import { ExecutionDeck } from '@/components/runs/ExecutionDeck';

interface RunPageProps {
  params: Promise<{ run_id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { run_id } = await params;
  return (
    <AppShell activeRunId={run_id}>
      <ExecutionDeck runId={run_id} />
    </AppShell>
  );
}
