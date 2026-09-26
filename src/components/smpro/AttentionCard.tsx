import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon } from 'lucide-react';
import { SpecLabel } from './Primitives';

export type Urgency = 'critical' | 'action' | 'operational' | 'ai';

const SPINE: Record<Urgency, string> = {
  critical: 'text-danger-500',
  action: 'text-brand-500',
  operational: 'text-info-500',
  ai: 'text-violet-500'
};

const KIND_LABEL: Record<Urgency, string> = {
  critical: 'Critical',
  action: 'Approval',
  operational: 'Operations',
  ai: 'AI review'
};

/**
 * Signature SM Pro component. The dashboard is a work queue, not a metrics
 * wall — each card states the construction context, the evidence behind it and
 * the single next action, with a coloured spine encoding urgency.
 */
export function AttentionCard({
  urgency,
  kind,
  title,
  project,
  facts,
  cta,
  onAction,
  meta,
  className












}: {urgency: Urgency; /** Overrides the default urgency label. */kind?: string;title: string;project: string; /** Two to four short evidence facts that justify acting. */facts: {label: string;value: string;tone?: 'default' | 'brand' | 'danger' | 'positive';}[];cta: string;onAction: () => void;meta?: string;className?: string;}) {
  return (
    <article
      className={twMerge(
        'spine border border-ink-100 bg-white transition-shadow duration-150 ease-smooth hover:shadow-card',
        SPINE[urgency],
        className
      )}>
      
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SpecLabel className={SPINE[urgency]}>{kind ?? KIND_LABEL[urgency]}</SpecLabel>
            <span className="h-px w-4 bg-ink-200" aria-hidden />
            <span className="measure truncate text-[10.5px] text-ink-400">{project}</span>
          </div>
          <h3 className="display-tight mt-1.5 text-[15.5px] font-bold leading-snug text-ink-900">
            {title}
          </h3>
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink-100 px-4 py-2.5">
        {facts.map((f) =>
        <div key={f.label} className="min-w-0">
            <dt className="spec-label">{f.label}</dt>
            <dd
            className={twMerge(
              'measure mt-0.5 text-[13.5px] font-bold',
              f.tone === 'brand' ?
              'text-brand-600' :
              f.tone === 'danger' ?
              'text-danger-600' :
              f.tone === 'positive' ?
              'text-positive-600' :
              'text-ink-900'
            )}>
            
              {f.value}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/60 px-4 py-2">
        <span className="truncate text-[11.5px] text-ink-400">{meta}</span>
        <button
          onClick={onAction}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] bg-ink-900 px-3 py-1.5 text-[12px] font-bold text-white transition-colors duration-150 ease-smooth hover:bg-brand-600">
          
          {cta}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>);

}