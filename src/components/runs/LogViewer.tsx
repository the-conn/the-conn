'use client';

import { styled } from '@linaria/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { HandHeader } from '@/components/ui/HandHeader';
import { SearchBox } from '@/components/ui/SearchBox';
import { StreamFilter, type StreamFilterValue } from '@/components/ui/StreamFilter';
import type { LogLine } from '@/types/api';

interface LogViewerProps {
  raw: string;
  lines: LogLine[];
  loading: boolean;
  error: Error | null;
  downloadName: string;
}

const ROW_NUM_W = 56;
const ELAPSED_W = 86;
const STREAM_W = 64;

const Surface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--paper);
`;

const Body = styled.div`
  flex: 1;
  background: #1a1a1a;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: #d8d4c8;
  overflow: hidden;
`;

const Row = styled.div<{ isErr: boolean; wrap: boolean }>`
  display: grid;
  grid-template-columns: ${ROW_NUM_W}px ${ELAPSED_W}px ${STREAM_W}px 1fr;
  background: ${(p) => (p.isErr ? 'rgba(212,68,68,0.08)' : 'transparent')};
  color: ${(p) => (p.isErr ? '#f5b8b8' : '#d8d4c8')};
  align-items: start;
  white-space: ${(p) => (p.wrap ? 'pre-wrap' : 'pre')};
  word-break: ${(p) => (p.wrap ? 'break-all' : 'normal')};
`;

const Cell = styled.div`
  padding: 1px 8px;
  vertical-align: top;
`;

const NumCell = styled(Cell)`
  color: #5a5a55;
  text-align: right;
  user-select: none;
`;

const ElapsedCell = styled(Cell)`
  color: #8a8a82;
  text-align: right;
  user-select: none;
`;

const StreamBadge = styled.span<{ isErr: boolean }>`
  display: inline-block;
  padding: 0 5px;
  border-radius: 2px;
  font-size: 9px;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: ${(p) => (p.isErr ? '#ff8e8e' : '#7fb59d')};
  border: 1px solid ${(p) => (p.isErr ? '#7a3535' : '#3a6655')};
  background: ${(p) => (p.isErr ? 'rgba(212,68,68,0.12)' : 'rgba(58,170,136,0.08)')};
`;

const TextCell = styled(Cell)<{ wrap: boolean }>`
  padding-right: 12px;
  white-space: ${(p) => (p.wrap ? 'pre-wrap' : 'pre')};
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: ${(p) => (p.wrap ? 'break-all' : 'normal')};
`;

const ToolbarBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(26, 26, 26, 0.18);
  background: var(--paper);
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--paper-2);
    color: var(--ink);
  }

  &[data-active='true'] {
    background: var(--paper-3);
    color: var(--ink);
    border-color: rgba(26, 26, 26, 0.35);
  }
`;

export function LogViewer({ raw, lines, loading, error, downloadName }: LogViewerProps) {
  const [stream, setStream] = useState<StreamFilterValue>('all');
  const [query, setQuery] = useState('');
  const [wrap, setWrap] = useState(false);
  const [tail, setTail] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const counts = useMemo(
    () => ({
      all: lines.length,
      stdout: lines.filter((l) => l.stream === 'stdout').length,
      stderr: lines.filter((l) => l.stream === 'stderr').length,
    }),
    [lines],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter((l) => {
      if (stream !== 'all' && l.stream !== stream) return false;
      if (q && !l.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lines, stream, query]);

  const base = useMemo(() => {
    let min = 0;
    for (const l of lines) {
      if (!l.ts) continue;
      if (min === 0 || l.ts < min) min = l.ts;
    }
    return min;
  }, [lines]);

  const handleTailToggle = useCallback(() => {
    setTail((prev) => {
      const next = !prev;
      if (next) {
        virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'auto' });
      }
      return next;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (!raw) return;
    const blob = new Blob([raw], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [raw, downloadName]);

  return (
    <Surface>
      <div className="flex items-center gap-[10px] px-[16px] py-[10px] border-b border-ink-trace bg-paper">
        <HandHeader>Log Output</HandHeader>
        <StreamFilter value={stream} counts={counts} onChange={setStream} />
        <span className="flex-1" />
        <SearchBox value={query} count={filtered.length} total={lines.length} onChange={setQuery} />
        <ToolbarBtn
          type="button"
          title="Wrap long lines"
          data-active={wrap}
          onClick={() => setWrap((w) => !w)}
        >
          ↵ wrap
        </ToolbarBtn>
        <ToolbarBtn
          type="button"
          title="Follow new log lines"
          data-active={tail}
          onClick={handleTailToggle}
        >
          ↡ tail
        </ToolbarBtn>
        <ToolbarBtn type="button" title="Download logs" onClick={handleDownload} disabled={!raw}>
          ⤓ download
        </ToolbarBtn>
      </div>

      <Body>
        {loading && lines.length === 0 ? (
          <div className="px-4 py-3 font-mono text-[11px] text-[#8a8a82]">loading logs…</div>
        ) : error ? (
          <div className="px-4 py-3 font-mono text-[11px] text-[#f5b8b8]">
            failed to load logs: {error.message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-3 font-mono text-[11px] text-[#8a8a82]">
            {lines.length === 0 ? 'no log output yet' : 'no lines match filter'}
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: '100%' }}
            data={filtered}
            followOutput={tail ? 'auto' : false}
            atBottomStateChange={(atBottom) => {
              if (tail && !atBottom) setTail(false);
            }}
            itemContent={(index, line) => {
              const isErr = line.stream === 'stderr';
              const elapsed = line.ts && base ? (line.ts - base) / 1000 : 0;
              return (
                <Row isErr={isErr} wrap={wrap}>
                  <NumCell>{index + 1}</NumCell>
                  <ElapsedCell>+{elapsed.toFixed(3)}s</ElapsedCell>
                  <Cell style={{ userSelect: 'none' }}>
                    <StreamBadge isErr={isErr}>{isErr ? 'ERR' : 'OUT'}</StreamBadge>
                  </Cell>
                  <TextCell wrap={wrap}>{line.text}</TextCell>
                </Row>
              );
            }}
          />
        )}
      </Body>
    </Surface>
  );
}
