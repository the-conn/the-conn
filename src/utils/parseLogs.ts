import type { LogLine } from '@/types/api';

const LINE_PATTERN = /^\[(\d+)\] \[(stdout|stderr)\] (.*)$/;

export function parseLogs(raw: string): LogLine[] {
  if (!raw) return [];
  const lines: LogLine[] = [];
  for (const line of raw.split('\n')) {
    if (!line) continue;
    const match = LINE_PATTERN.exec(line);
    if (match) {
      lines.push({
        ts: Number(match[1]),
        stream: match[2] as LogLine['stream'],
        text: match[3] ?? '',
      });
    } else {
      const last = lines[lines.length - 1];
      if (last) {
        last.text = `${last.text}\n${line}`;
      } else {
        lines.push({ ts: 0, stream: 'stdout', text: line });
      }
    }
  }
  return lines;
}
