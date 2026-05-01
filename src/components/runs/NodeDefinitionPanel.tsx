import { Fragment, useMemo } from 'react';
import { HandHeader } from '@/components/ui/HandHeader';
import { jsonToYaml } from '@/utils/jsonToYaml';

interface NodeDefinitionPanelProps {
  definition: string;
}

const KEY_PATTERN = /^(\s*-?\s*)([A-Za-z0-9_.-]+)(:)(\s*)(.*)$/;
const ITEM_PATTERN = /^(\s*)(- )(.*)$/;

export function NodeDefinitionPanel({ definition }: NodeDefinitionPanelProps) {
  const yaml = useMemo(() => jsonToYaml(definition), [definition]);
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center justify-between">
        <HandHeader>Node Definition</HandHeader>
        <span className="font-mono text-[9px] text-ink-faint tracking-[0.08em]">YAML</span>
      </div>
      <pre className="m-0 px-[10px] py-[8px] bg-paper-2 border border-dashed border-ink-trace rounded-[2px] font-mono text-[10.5px] leading-[1.55] text-ink-soft whitespace-pre overflow-auto max-h-[280px]">
        {renderYaml(yaml)}
      </pre>
    </div>
  );
}

function renderYaml(src: string) {
  if (!src) return null;
  const lines = src.split('\n');
  return lines.map((line, i) => {
    const kv = KEY_PATTERN.exec(line);
    if (kv) {
      const [, lead, key, colon, sp, val] = kv;
      return (
        <Fragment key={i}>
          <span style={{ whiteSpace: 'pre' }}>{lead}</span>
          <span className="text-ink font-medium">{key}</span>
          <span className="text-ink-faint">{colon}</span>
          <span style={{ whiteSpace: 'pre' }}>{sp}</span>
          <span className="text-ink-soft">{val}</span>
          {'\n'}
        </Fragment>
      );
    }
    const li = ITEM_PATTERN.exec(line);
    if (li) {
      const [, lead, dash, rest] = li;
      return (
        <Fragment key={i}>
          <span style={{ whiteSpace: 'pre' }}>{lead}</span>
          <span className="text-ink-faint">{dash}</span>
          <span className="text-ink-soft">{rest}</span>
          {'\n'}
        </Fragment>
      );
    }
    return <Fragment key={i}>{`${line || ' '}\n`}</Fragment>;
  });
}
