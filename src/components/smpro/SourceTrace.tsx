import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CornerDownRightIcon } from 'lucide-react';
import { SpecLabel } from './Primitives';

export interface TraceSource {
  project: string;
  planSet: string;
  revision: string;
  sheet: string;
  page: number;
  condition?: string;
}

/**
 * Signature SM Pro component. Every AI-derived quantity carries the drawing it
 * came from — plan set, revision, sheet, page and the detected condition — so a
 * reviewer can always answer "which drawing produced this number?".
 */
export function SourceTrace({
  source,
  onOpenSource,
  compact = false,
  className





}: {source: TraceSource;onOpenSource?: () => void;compact?: boolean;className?: string;}) {
  if (compact) {
    return (
      <span className={twMerge('measure inline-flex items-center gap-1.5 text-[11px] text-ink-500', className)}>
        <CornerDownRightIcon className="h-3 w-3 text-ink-300" aria-hidden />
        {source.sheet}
        <span className="text-ink-300">/</span>
        {source.revision}
        <span className="text-ink-300">/</span>p{source.page}
      </span>);

  }

  return (
    <div className={twMerge('border border-ink-100 bg-ink-50/60', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-3 py-1.5">
        <SpecLabel>Source trace</SpecLabel>
        {onOpenSource &&
        <button
          onClick={onOpenSource}
          className="text-[11.5px] font-bold text-brand-600 transition-colors duration-150 ease-smooth hover:text-brand-700">
          
            Open sheet
          </button>
        }
      </div>
      <dl className="grid grid-cols-2 gap-x-4 px-3 py-2.5 sm:grid-cols-3">
        <TraceCell label="Project" value={source.project} />
        <TraceCell label="Plan set" value={source.planSet} />
        <TraceCell label="Revision" value={source.revision} mono />
        <TraceCell label="Sheet" value={source.sheet} mono />
        <TraceCell label="Page" value={String(source.page)} mono />
        {source.condition && <TraceCell label="Condition" value={source.condition} />}
      </dl>
    </div>);

}

function TraceCell({ label, value, mono }: {label: string;value: string;mono?: boolean;}) {
  return (
    <div className="min-w-0 py-1">
      <dt className="spec-label">{label}</dt>
      <dd
        className={twMerge(
          'mt-0.5 truncate text-[12.5px] font-semibold text-ink-800',
          mono && 'measure font-medium'
        )}
        title={value}>
        
        {value}
      </dd>
    </div>);

}