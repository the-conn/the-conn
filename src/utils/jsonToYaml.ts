export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const RESERVED_RE = /^(true|false|null|yes|no|on|off|~)$/i;
const NUMERIC_RE = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;
const SPECIAL_RE = /[:#&*!|>'"%@`]/;

function needsQuoting(s: string): boolean {
  if (s === '') return true;
  if (RESERVED_RE.test(s)) return true;
  if (NUMERIC_RE.test(s)) return true;
  if (SPECIAL_RE.test(s)) return true;
  if (/^[\s-]/.test(s) || /\s$/.test(s)) return true;
  return false;
}

function scalar(value: JsonValue): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') return needsQuoting(value) ? JSON.stringify(value) : value;
  return '';
}

function dumpKey(key: string, value: JsonValue, indent: number): string[] {
  const pad = '  '.repeat(indent);
  if (value === null || typeof value !== 'object') {
    return [`${pad}${key}: ${scalar(value)}`];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}${key}: []`];
    return [`${pad}${key}:`, ...dumpArray(value, indent + 1)];
  }
  const keys = Object.keys(value);
  if (keys.length === 0) return [`${pad}${key}: {}`];
  return [`${pad}${key}:`, ...dumpObject(value, indent + 1)];
}

function dumpObject(obj: { [key: string]: JsonValue }, indent: number): string[] {
  const out: string[] = [];
  for (const k of Object.keys(obj)) {
    out.push(...dumpKey(k, obj[k] as JsonValue, indent));
  }
  return out;
}

function dumpArray(arr: JsonValue[], indent: number): string[] {
  const pad = '  '.repeat(indent);
  const out: string[] = [];
  for (const item of arr) {
    if (item === null || typeof item !== 'object') {
      out.push(`${pad}- ${scalar(item)}`);
      continue;
    }
    if (Array.isArray(item)) {
      if (item.length === 0) {
        out.push(`${pad}- []`);
      } else {
        out.push(`${pad}-`);
        out.push(...dumpArray(item, indent + 1));
      }
      continue;
    }
    const keys = Object.keys(item);
    if (keys.length === 0) {
      out.push(`${pad}- {}`);
      continue;
    }
    const sub = dumpObject(item, indent + 1);
    const padPlus = '  '.repeat(indent + 1);
    const first = sub[0] ?? '';
    out.push(`${pad}- ${first.slice(padPlus.length)}`);
    for (let i = 1; i < sub.length; i++) out.push(sub[i] as string);
  }
  return out;
}

export function valueToYaml(value: JsonValue): string {
  if (value === null || typeof value !== 'object') return scalar(value);
  if (Array.isArray(value)) return dumpArray(value, 0).join('\n');
  return dumpObject(value, 0).join('\n');
}

export function jsonToYaml(input: string): string {
  if (!input) return '';
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(input) as JsonValue;
  } catch {
    return input;
  }
  return valueToYaml(parsed);
}
