import { makeTraceparent } from './tracing';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function tracingHeaders(): Record<string, string> {
  return { traceparent: makeTraceparent() };
}

interface PipelineNode {
  name: string;
  image: string;
  environment: Record<string, string>;
  steps: string[];
}

interface DefaultPipelineResponse {
  name: string;
  nodes: PipelineNode[];
  source?: unknown;
}

function yamlStr(s: string): string {
  return JSON.stringify(s);
}

function pipelineToYaml(pipeline: { name: string; nodes: PipelineNode[] }): string {
  const lines: string[] = [`name: ${yamlStr(pipeline.name)}`, 'nodes:'];
  for (const node of pipeline.nodes) {
    lines.push(`  - name: ${yamlStr(node.name)}`);
    lines.push(`    image: ${yamlStr(node.image)}`);
    const envEntries = Object.entries(node.environment ?? {});
    if (envEntries.length === 0) {
      lines.push(`    environment: {}`);
    } else {
      lines.push(`    environment:`);
      for (const [k, v] of envEntries) {
        lines.push(`      ${yamlStr(k)}: ${yamlStr(v)}`);
      }
    }
    lines.push(`    steps:`);
    for (const step of node.steps) {
      lines.push(`      - ${yamlStr(step)}`);
    }
  }
  return lines.join('\n') + '\n';
}

export async function getDefaultPipeline(): Promise<string> {
  const res = await fetch(`${BASE_URL}/pipelines/default`, {
    headers: tracingHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch default pipeline: ${res.statusText}`);
  const data: DefaultPipelineResponse = await res.json();
  return pipelineToYaml({ name: data.name, nodes: data.nodes });
}

export async function fetchPipelines(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/pipelines`, {
    headers: tracingHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch pipelines: ${res.statusText}`);
  return res.json();
}

export async function savePipeline(name: string, yaml: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/pipelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tracingHeaders() },
    body: JSON.stringify({ name, yaml }),
  });
  if (!res.ok) throw new Error(`Failed to save pipeline: ${res.statusText}`);
}

interface PipelineGetResponse {
  name: string;
  yaml?: string;
  nodes?: PipelineNode[];
}

export async function loadPipeline(name: string): Promise<{ name: string; yaml: string }> {
  const res = await fetch(`${BASE_URL}/pipelines/${encodeURIComponent(name)}`, {
    headers: tracingHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load pipeline: ${res.statusText}`);
  const data: PipelineGetResponse = await res.json();
  if (typeof data.yaml === 'string') {
    return { name: data.name, yaml: data.yaml };
  }
  if (Array.isArray(data.nodes)) {
    return { name: data.name, yaml: pipelineToYaml({ name: data.name, nodes: data.nodes }) };
  }
  throw new Error(`Pipeline "${name}" returned no content`);
}

export async function runPipeline(yaml: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tracingHeaders() },
    body: JSON.stringify({ source: 'inline', yaml }),
  });
  if (!res.ok) throw new Error(`Failed to run pipeline: ${res.statusText}`);
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/health`, {
    headers: tracingHeaders(),
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}
