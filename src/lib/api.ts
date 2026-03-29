const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchPipelines(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/pipelines`);
  if (!res.ok) throw new Error(`Failed to fetch pipelines: ${res.statusText}`);
  return res.json();
}

export async function savePipeline(name: string, yaml: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/pipelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, yaml }),
  });
  if (!res.ok) throw new Error(`Failed to save pipeline: ${res.statusText}`);
}

export async function loadPipeline(name: string): Promise<{ name: string; yaml: string }> {
  const res = await fetch(`${BASE_URL}/pipelines/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to load pipeline: ${res.statusText}`);
  return res.json();
}

export async function runPipeline(yaml: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'inline', yaml }),
  });
  if (!res.ok) throw new Error(`Failed to run pipeline: ${res.statusText}`);
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}
