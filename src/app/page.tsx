'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  fetchPipelines,
  savePipeline,
  loadPipeline,
  runPipeline,
  getDefaultPipeline,
  fetchRuns,
  fetchRun,
  fetchPipelineRuns,
  type PipelineRun,
} from '@/lib/api';

const MIN_FEEDBACK_MS = 500;

function extractNameFromYaml(yaml: string): string {
  const match = yaml.match(/^name:\s*(.+)$/m);
  if (!match) return '';
  const raw = match[1].trim();
  if (raw.startsWith('"') || raw.startsWith("'")) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  return raw;
}

function statusColor(status: string): string {
  switch (status) {
    case 'Success':
      return 'text-green-500';
    case 'Failure':
      return 'text-red-500';
    case 'InProgress':
      return 'text-yellow-500';
    case 'Aborted':
      return 'text-orange-500';
    case 'Skipped':
      return 'text-blue-400';
    case 'NotStarted':
    default:
      return 'text-muted-foreground';
  }
}

function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleString();
}

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const FALLBACK_YAML = `name: test-pipeline
nodes:
  name: test-node
  image: alpine:latest
  environment: {}
  steps:
    - echo "test string"
`;

export default function Home() {
  const [pipelines, setPipelines] = useState<string[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState(FALLBACK_YAML);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [loadingRunDetail, setLoadingRunDetail] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const loadDefault = useCallback(async () => {
    try {
      const yaml = await getDefaultPipeline();
      setEditorContent(yaml);
      editorRef.current?.setValue(yaml);
    } catch (err) {
      console.error('Failed to fetch default pipeline, using fallback', err);
      setEditorContent(FALLBACK_YAML);
      editorRef.current?.setValue(FALLBACK_YAML);
    }
  }, []);

  const refreshPipelines = useCallback(async () => {
    try {
      setLoadingPipelines(true);
      const list = await fetchPipelines();
      setPipelines(list);
    } catch (err) {
      toast.error('Failed to load pipelines', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingPipelines(false);
    }
  }, []);

  const refreshRuns = useCallback(async (pipelineName?: string | null) => {
    try {
      setLoadingRuns(true);
      const list = pipelineName ? await fetchPipelineRuns(pipelineName) : await fetchRuns();
      setRuns(list);
    } catch (err) {
      toast.error('Failed to load runs', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingRuns(false);
    }
  }, []);

  useEffect(() => {
    loadDefault();
    refreshPipelines();
    refreshRuns(null);
  }, [loadDefault, refreshPipelines, refreshRuns]);

  const handleNew = () => {
    setSelectedPipeline(null);
    setSelectedRun(null);
    loadDefault();
    refreshRuns(null);
  };

  const handleSelectPipeline = async (name: string) => {
    try {
      setIsLoadingPipeline(true);
      setSelectedRun(null);
      setSelectedPipeline(name);
      const pipeline = await loadPipeline(name);
      const yaml = pipeline.yaml ?? '';
      setEditorContent(yaml);
      editorRef.current?.setValue(yaml);
      refreshRuns(name);
    } catch (err) {
      toast.error('Failed to load pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoadingPipeline(false);
    }
  };

  const handleSave = async () => {
    const name = extractNameFromYaml(editorContent);
    if (!name) {
      toast.error('Pipeline name is required', {
        description: 'Add a "name:" field to your pipeline YAML.',
      });
      return;
    }
    setIsSaving(true);
    const deadline = Date.now() + MIN_FEEDBACK_MS;
    try {
      await savePipeline(name, editorContent);
      toast.success('Pipeline saved', { description: `"${name}" saved successfully.` });
      await refreshPipelines();
      setSelectedPipeline(name);
    } catch (err) {
      toast.error('Failed to save pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      const remaining = deadline - Date.now();
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    const deadline = Date.now() + MIN_FEEDBACK_MS;
    try {
      await runPipeline(editorContent);
      toast.success('Pipeline triggered', { description: 'Run accepted by the server.' });
      refreshRuns(selectedPipeline);
    } catch (err) {
      toast.error('Failed to run pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      const remaining = deadline - Date.now();
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      setIsRunning(false);
    }
  };

  const handleSelectRun = async (run: PipelineRun) => {
    try {
      setLoadingRunDetail(true);
      const detail = await fetchRun(run.id);
      setSelectedRun(detail);
    } catch (err) {
      toast.error('Failed to load run details', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingRunDetail(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-lg font-semibold tracking-tight mb-3">The Conn</h1>
          <Button onClick={handleNew} variant="outline" size="sm" className="w-full">
            + New Pipeline
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {loadingPipelines ? (
            <div className="flex flex-col gap-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : pipelines.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3 text-center">No pipelines saved yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {pipelines.map((name) => (
                <li key={name}>
                  <button
                    onClick={() => handleSelectPipeline(name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      selectedPipeline === name
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground'
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Runs section */}
        <div className="flex-shrink-0 border-t border-border flex flex-col">
          <div className="px-3 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedPipeline ? 'Pipeline Runs' : 'Recent Runs'}
            </span>
            <button
              onClick={() => refreshRuns(selectedPipeline)}
              disabled={loadingRuns}
              className="text-muted-foreground hover:text-foreground text-sm disabled:opacity-50"
              title="Refresh runs"
            >
              ↻
            </button>
          </div>
          <div className="overflow-y-auto max-h-[220px] px-2 pb-2">
            {loadingRuns ? (
              <div className="flex flex-col gap-1 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2 text-center">No runs yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {runs.map((run) => (
                  <li key={run.id}>
                    <button
                      onClick={() => handleSelectRun(run)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${
                        selectedRun?.id === run.id
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={statusColor(run.status)}>{run.status}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {formatTimestamp(run.created_at)}
                        </span>
                      </div>
                      <div className="text-muted-foreground truncate mt-0.5">{run.pipeline.name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          {selectedRun ? (
            <Button onClick={() => setSelectedRun(null)} variant="ghost" size="sm">
              ← Back to Editor
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isSaving || isLoadingPipeline} variant="default" size="sm">
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleRun} disabled={isRunning || isLoadingPipeline} variant="secondary" size="sm">
                {isRunning ? 'Running...' : '▶ Run'}
              </Button>
            </>
          )}
        </div>

        {selectedRun ? (
          /* Run detail view */
          <div className="flex-1 overflow-y-auto p-6">
            {loadingRunDetail ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-muted-foreground animate-pulse">Loading run details…</span>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-semibold">{selectedRun.pipeline.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{selectedRun.id}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span>
                      Status:{' '}
                      <span className={`font-medium ${statusColor(selectedRun.status)}`}>
                        {selectedRun.status}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Duration:{' '}
                      {selectedRun.started_at && selectedRun.ended_at
                        ? `${selectedRun.ended_at - selectedRun.started_at}s`
                        : '—'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>Created: {formatTimestamp(selectedRun.created_at)}</div>
                    <div>Started: {formatTimestamp(selectedRun.started_at)}</div>
                    <div>Ended: {formatTimestamp(selectedRun.ended_at)}</div>
                  </div>
                </div>

                {selectedRun.node_runs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Node Runs</h3>
                    <div className="space-y-2">
                      {selectedRun.node_runs.map((nr) => (
                        <div key={nr.id} className="border border-border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{nr.node.name}</span>
                            <span className={`text-sm font-medium ${statusColor(nr.status)}`}>
                              {nr.status}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-4">
                            <span>Image: {nr.node.image}</span>
                            <span>
                              Duration:{' '}
                              {nr.started_at && nr.ended_at ? `${nr.ended_at - nr.started_at}s` : '—'}
                            </span>
                          </div>
                          {Object.keys(nr.node.environment ?? {}).length > 0 && (
                            <div className="mt-2 text-xs">
                              <span className="text-muted-foreground">Environment: </span>
                              {Object.entries(nr.node.environment ?? {}).map(([k, v]) => (
                                <span key={k} className="font-mono bg-muted px-1 rounded mr-1">
                                  {k}={v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Editor */
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditor
              height="100%"
              defaultLanguage="yaml"
              value={editorContent}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              onChange={(value) => setEditorContent(value ?? '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 16, bottom: 16 },
              }}
            />
            {isLoadingPipeline && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <span className="text-sm text-muted-foreground animate-pulse">Loading pipeline…</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
