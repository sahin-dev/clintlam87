import { twMerge } from 'tailwind-merge';
import {
  BotIcon,
  CheckCheckIcon,
  CheckIcon,
  EyeIcon,
  LockIcon,
  PencilIcon } from
'lucide-react';
import { GateState, ObjectVerification, VerificationGate } from '../../types/takeoff';

/**
 * SM Pro's central trust rule made visual: an AI result is never shown as
 * verified just because the model was confident. These five states are always
 * distinguishable at a glance and never collapse into one another.
 */
const STATE = {
  ai_generated: {
    label: 'AI generated',
    icon: BotIcon,
    className: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  needs_review: {
    label: 'Needs review',
    icon: EyeIcon,
    className: 'border-caution-200 bg-caution-50 text-caution-800'
  },
  human_corrected: {
    label: 'Human corrected',
    icon: PencilIcon,
    className: 'border-brand-200 bg-brand-50 text-brand-700'
  },
  verified: {
    label: 'Verified',
    icon: CheckIcon,
    className: 'border-positive-200 bg-positive-50 text-positive-700'
  },
  approved: {
    label: 'Approved',
    icon: LockIcon,
    className: 'border-positive-300 bg-positive-600 text-white'
  }
} as const;

export function VerificationChip({
  state,
  className



}: {state: ObjectVerification;className?: string;}) {
  const s = STATE[state];
  const Icon = s.icon;
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-[3px] border px-1.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.05em]',
        s.className,
        className
      )}>
      
      <Icon className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      {s.label}
    </span>);

}

/**
 * Attribute-level confidence. A single headline score hides the thing a
 * reviewer needs — which specific property of the object is shaky.
 */
export function AttributeTable({
  attributes,
  className



}: {attributes: {attribute: string;value: string;confidence: number;}[];className?: string;}) {
  return (
    <table className={twMerge('w-full border-collapse text-left', className)}>
      <caption className="sr-only">Attribute-level AI confidence</caption>
      <thead>
        <tr className="border-b border-ink-100">
          <th className="spec-label py-1.5 pr-2">Attribute</th>
          <th className="spec-label py-1.5 pr-2">Read as</th>
          <th className="spec-label py-1.5 text-right">Confidence</th>
        </tr>
      </thead>
      <tbody>
        {attributes.map((a) => {
          const low = a.confidence < 75;
          return (
            <tr key={a.attribute} className="border-b border-ink-100 last:border-0">
              <td className="py-2 pr-2 text-[12.5px] font-semibold text-ink-800">{a.attribute}</td>
              <td className="py-2 pr-2 text-[12.5px] text-ink-600">{a.value}</td>
              <td className="py-2 text-right">
                <span
                  className={twMerge(
                    'measure text-[12.5px] font-bold',
                    a.confidence >= 90 ?
                    'text-positive-700' :
                    low ?
                    'text-danger-600' :
                    'text-caution-700'
                  )}>
                  
                  {a.confidence.toFixed(1)}%
                </span>
                {low &&
                <span className="ml-2 inline-block rounded-[2px] bg-danger-50 px-1 py-[1px] text-[9px] font-bold uppercase tracking-[0.05em] text-danger-700">
                    Review
                  </span>
                }
              </td>
            </tr>);

        })}
      </tbody>
    </table>);

}

const GATE: Record<GateState, {label: string;dot: string;text: string;}> = {
  pass: { label: 'Verified', dot: 'bg-positive-500', text: 'text-positive-700' },
  pending: { label: 'Pending', dot: 'bg-ink-300', text: 'text-ink-500' },
  attention: { label: 'Needs attention', dot: 'bg-caution-500', text: 'text-caution-800' },
  fail: { label: 'Failed', dot: 'bg-danger-500', text: 'text-danger-700' }
};

/** The verification gate ledger. Approval stays locked until these clear. */
export function GateList({ gates }: {gates: VerificationGate[];}) {
  return (
    <ul className="divide-y divide-ink-100">
      {gates.map((g) => {
        const s = GATE[g.state];
        return (
          <li key={g.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={twMerge('mt-[6px] h-2 w-2 shrink-0 rounded-[1px]', s.dot)}
              aria-hidden />
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-[13px] font-bold text-ink-900">{g.label}</p>
                {!g.required &&
                <span className="spec-label text-ink-300">advisory</span>
                }
              </div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{g.detail}</p>
              {g.clearedBy &&
              <p className="measure mt-1 text-[10.5px] text-ink-400">
                  {g.clearedBy} · {g.clearedAt}
                </p>
              }
            </div>
            <span className={twMerge('spec-label shrink-0 pt-0.5', s.text)}>{s.label}</span>
          </li>);

      })}
    </ul>);

}

/** Headline banner stating whether approval is available and why not. */
export function ApprovalGateBanner({
  gates,
  approved



}: {gates: VerificationGate[];approved: boolean;}) {
  const blocking = gates.filter((g) => g.required && (g.state === 'fail' || g.state === 'pending'));
  const ready = blocking.length === 0;

  if (approved) {
    return (
      <div className="flex items-center gap-2.5 border border-positive-200 bg-positive-50 px-4 py-2.5">
        <CheckCheckIcon className="h-4 w-4 shrink-0 text-positive-600" />
        <p className="text-[12.5px] font-semibold text-positive-800">
          Approved takeoff — quantities are locked. A new plan revision creates a new takeoff.
        </p>
      </div>);

  }

  return (
    <div
      className={twMerge(
        'flex flex-wrap items-center gap-2.5 border px-4 py-2.5',
        ready ? 'border-positive-200 bg-positive-50' : 'border-danger-200 bg-danger-50'
      )}>
      
      <span
        className={twMerge(
          'spec-label rounded-[2px] px-1.5 py-1 text-white',
          ready ? 'bg-positive-600' : 'bg-danger-600'
        )}>
        
        {ready ? 'Ready for approval' : 'Cannot approve'}
      </span>
      <p
        className={twMerge(
          'text-[12.5px] font-semibold',
          ready ? 'text-positive-800' : 'text-danger-800'
        )}>
        
        {ready ?
        'Every required verification gate has cleared.' :
        `${blocking.length} required ${blocking.length === 1 ? 'gate' : 'gates'} outstanding: ${blocking.
        map((g) => g.label).
        join(', ')}.`}
      </p>
    </div>);

}