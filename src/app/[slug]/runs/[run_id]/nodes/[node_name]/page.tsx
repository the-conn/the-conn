import { NodeViewDeck } from '@/components/runs/NodeViewDeck';

interface NodePageProps {
  params: Promise<{ slug: string; run_id: string; node_name: string }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { slug, run_id, node_name } = await params;
  return (
    <NodeViewDeck
      slug={decodeURIComponent(slug)}
      runId={run_id}
      nodeName={decodeURIComponent(node_name)}
    />
  );
}
