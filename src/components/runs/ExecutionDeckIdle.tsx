import { HandHeader } from '@/components/ui/HandHeader';
import { Mono } from '@/components/ui/Mono';

export function ExecutionDeckIdle() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="rounded-[3px] border border-dashed border-ink/35 bg-paper-2/40 px-10 py-12 max-w-[480px] text-center">
        <HandHeader className="mb-3">Execution Deck</HandHeader>
        <p className="font-ui text-[15px] font-semibold text-ink mb-2">No run inspected.</p>
        <Mono size={11} dim>
          select a pipeline run from the sidebar to view its tactical timeline
        </Mono>
      </div>
    </div>
  );
}
