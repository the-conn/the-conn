'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchPipelines, savePipeline, loadPipeline, runPipeline } from '@/lib/api';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEFAULT_YAML = `name: "test-pipeline"
nodes:
  - name: "producer"
    image: "alpine:latest"
    environment: {}
    steps:
      - "echo PIPELINE_VAR=hello_from_node1 >> /workspace/.pipeline-env"
      - "mkdir -p /workspace/output_dir"
      - "echo 'created by node1' > /workspace/output_dir/result.txt"
  - name: "consumer"
    image: "alpine:latest"
    environment: {}
    steps:
      - 'echo "Received: $PIPELINE_VAR"'
      - "ls /workspace/output_dir"
      - "cat /workspace/output_dir/result.txt"
`;

export default function Home() {
  const [pipelines, setPipelines] = useState<string[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [pipelineName, setPipelineName] = useState('');
  const [editorContent, setEditorContent] = useState(DEFAULT_YAML);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

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

  useEffect(() => {
    refreshPipelines();
  }, [refreshPipelines]);

  const handleNew = () => {
    setSelectedPipeline(null);
    setPipelineName('');
    setEditorContent(DEFAULT_YAML);
  };

  const handleSelectPipeline = async (name: string) => {
    try {
      setSelectedPipeline(name);
      const pipeline = await loadPipeline(name);
      setPipelineName(pipeline.name);
      setEditorContent(pipeline.yaml);
    } catch (err) {
      toast.error('Failed to load pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      toast.error('Pipeline name is required');
      return;
    }
    try {
      setIsSaving(true);
      await savePipeline(pipelineName.trim(), editorContent);
      toast.success('Pipeline saved', { description: `"${pipelineName}" saved successfully.` });
      await refreshPipelines();
      setSelectedPipeline(pipelineName.trim());
    } catch (err) {
      toast.error('Failed to save pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      await runPipeline(editorContent);
      toast.success('Pipeline triggered', { description: 'Run accepted by the server.' });
    } catch (err) {
      toast.error('Failed to run pipeline', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight mb-3">The Conn Dashboard</h1>
          <Button onClick={handleNew} variant="outline" size="sm" className="w-full">
            + New Pipeline
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <Input
            placeholder="Pipeline name..."
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleSave} disabled={isSaving} variant="default" size="sm">
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleRun} disabled={isRunning} variant="secondary" size="sm">
            {isRunning ? 'Running...' : '▶ Run'}
          </Button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            defaultLanguage="yaml"
            value={editorContent}
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
        </div>
      </main>
    </div>
  );
}
