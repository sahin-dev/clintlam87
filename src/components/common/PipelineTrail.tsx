import { CheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface TrailStage {
  label: string;
  detail?: string;
  state: 'done' | 'active' | 'todo' | 'blocked';
}

/**
 * Vertical trace of the plan → takeoff → order → delivery → payment chain.
 * Used on the dashboard and project overview so the workflow stays visible.
 */
export function PipelineTrail({ stages, onStage }: {stages: TrailStage[];onStage?: (i: number) => void;}) {
  return (
    <ol className="relative">
      {stages.map((stage, i) => {
        const last = i === stages.length - 1;
        const dot =
        stage.state === 'done' ?
        'bg-positive-500 text-white' :
        stage.state === 'active' ?
        'bg-brand-500 text-white' :
        stage.state === 'blocked' ?
        'bg-danger-500 text-white' :
        'bg-white text-ink-300 border border-ink-200';
        return (
          <li key={stage.label} className="relative flex gap-3 pb-4 last:pb-0">
            {!last &&
            <span
              className={twMerge(
                'absolute left-[9px] top-6 bottom-0 w-px',
                stage.state === 'done' ? 'bg-positive-500/50' : 'bg-ink-200'
              )} />

            }
            <span
              className={twMerge(
                'measure relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[3px] text-[9.5px] font-bold',
                dot
              )}>
              
              {stage.state === 'done' ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <button
              disabled={!onStage}
              onClick={() => onStage?.(i)}
              className="min-w-0 flex-1 text-left disabled:cursor-default">
              
              <span
                className={twMerge(
                  'block text-[13.5px] font-bold',
                  stage.state === 'todo' ? 'text-ink-400' : 'text-ink-900'
                )}>
                
                {stage.label}
              </span>
              {stage.detail &&
              <span
                className={twMerge(
                  'mt-0.5 block text-[12px] leading-snug',
                  stage.state === 'blocked' ? 'text-danger-600' : 'text-ink-400'
                )}>
                
                  {stage.detail}
                </span>
              }
            </button>
          </li>);

      })}
    </ol>);

}

/** Compact horizontal version for list rows. */
export function TrailStrip({ stages }: {stages: TrailStage[];}) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((s) =>
      <span
        key={s.label}
        title={`${s.label}${s.detail ? ` — ${s.detail}` : ''}`}
        className={twMerge(
          'h-1.5 flex-1 rounded-[1px]',
          s.state === 'done' ?
          'bg-positive-500' :
          s.state === 'active' ?
          'bg-brand-500' :
          s.state === 'blocked' ?
          'bg-danger-500' :
          'bg-ink-200'
        )} />

      )}
    </div>);

}