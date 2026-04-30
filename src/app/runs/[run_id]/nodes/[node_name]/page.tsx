import { AppShell } from '@/components/layout/AppShell';
import { NodeViewDeck } from '@/components/runs/NodeViewDeck';

interface NodePageProps {
  params: Promise<{ run_id: string; node_name: string }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { run_id, node_name } = await params;
  const decodedNodeName = decodeURIComponent(node_name);
  return (
    <AppShell activeRunId={run_id}>
      <NodeViewDeck runId={run_id} nodeName={decodedNodeName} />
    </AppShell>
  );
}
