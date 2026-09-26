import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon, CheckIcon, PencilIcon, SparklesIcon } from 'lucide-react';
import { qty } from '../../utils/format';

/**
 * Signature SM Pro component. Shows the full chain of custody for a quantity —
 * what the model produced, what a person changed it to, and what was finally
 * approved — so an approved number can never be confused with a raw AI number.
 */
export function QuantityLadder({
  aiQuantity,
  correctedQuantity,
  approvedQuantity,
  unit,
  correctedBy,
  correctedAt,
  reason,
  className









}: {aiQuantity: number;correctedQuantity: number | null;approvedQuantity: number | null;unit: string;correctedBy?: string;correctedAt?: string;reason?: string;className?: string;}) {
  const delta =
  correctedQuantity !== null ? correctedQuantity - aiQuantity : null;

  return (
    <div className={twMerge('border border-ink-100', className)}>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch">
        <Rung
          tone="ai"
          icon={<SparklesIcon className="h-3 w-3" />}
          label="AI quantity"
          value={qty(aiQuantity)}
          unit={unit} />
        
        <Arrow />
        <Rung
          tone={correctedQuantity !== null ? 'human' : 'empty'}
          icon={<PencilIcon className="h-3 w-3" />}
          label="Human correction"
          value={correctedQuantity !== null ? qty(correctedQuantity) : '—'}
          unit={correctedQuantity !== null ? unit : undefined}
          delta={
          delta !== null && delta !== 0 ?
          `${delta > 0 ? '+' : ''}${qty(delta)}` :
          undefined
          } />
        
        <Arrow />
        <Rung
          tone={approvedQuantity !== null ? 'approved' : 'empty'}
          icon={<CheckIcon className="h-3 w-3" strokeWidth={3} />}
          label="Approved"
          value={approvedQuantity !== null ? qty(approvedQuantity) : 'Pending'}
          unit={approvedQuantity !== null ? unit : undefined} />
        
      </div>

      {(reason || correctedBy) &&
      <div className="border-t border-ink-100 bg-ink-50/60 px-3 py-2.5">
          {reason && <p className="text-[12.5px] leading-relaxed text-ink-700">{reason}</p>}
          {correctedBy &&
        <p className="measure mt-1 text-[11px] text-ink-400">
              {correctedBy} · {correctedAt}
            </p>
        }
        </div>
      }
    </div>);

}

function Arrow() {
  return (
    <div className="flex items-center bg-white px-1 text-ink-200" aria-hidden>
      <ArrowRightIcon className="h-3.5 w-3.5" />
    </div>);

}

function Rung({
  tone,
  icon,
  label,
  value,
  unit,
  delta







}: {tone: 'ai' | 'human' | 'approved' | 'empty';icon: React.ReactNode;label: string;value: string;unit?: string;delta?: string;}) {
  const skin = {
    ai: 'bg-violet-50 text-violet-600',
    human: 'bg-brand-50 text-brand-700',
    approved: 'bg-positive-50 text-positive-700',
    empty: 'bg-white text-ink-300'
  }[tone];
  const valueTone = {
    ai: 'text-ink-900',
    human: 'text-ink-900',
    approved: 'text-positive-700',
    empty: 'text-ink-300'
  }[tone];

  return (
    <div className="min-w-0 px-3 py-2.5">
      <span className={twMerge('inline-flex items-center gap-1.5 rounded-[3px] px-1.5 py-0.5', skin)}>
        {icon}
        <span className="spec-label text-current">{label}</span>
      </span>
      <p className={twMerge('measure mt-1.5 truncate text-[17px] font-bold leading-none', valueTone)}>
        {value}
        {unit && <span className="ml-1 text-[10.5px] font-medium text-ink-400">{unit}</span>}
      </p>
      {delta && <p className="measure mt-1 text-[11px] font-semibold text-brand-600">{delta}</p>}
    </div>);

}