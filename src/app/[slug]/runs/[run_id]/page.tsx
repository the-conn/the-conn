import { ExecutionDeck } from '@/components/runs/ExecutionDeck';

interface RunPageProps {
  params: Promise<{ slug: string; run_id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { slug, run_id } = await params;
  return <ExecutionDeck slug={decodeURIComponent(slug)} runId={run_id} />;
}
