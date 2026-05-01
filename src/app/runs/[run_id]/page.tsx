import { ExecutionDeck } from '@/components/runs/ExecutionDeck';

interface RunPageProps {
  params: Promise<{ run_id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { run_id } = await params;
  return <ExecutionDeck runId={run_id} />;
}
