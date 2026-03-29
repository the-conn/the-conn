import { AppShell } from '@/components/layout/AppShell';
import { ExecutionDeck } from '@/components/runs/ExecutionDeck';

interface RunPageProps {
  params: { run_id: string };
}

export default function RunPage({ params }: RunPageProps) {
  return (
    <AppShell activeRunId={params.run_id}>
      <ExecutionDeck runId={params.run_id} />
    </AppShell>
  );
}
