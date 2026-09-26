import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Panel, SpecLabel, TickRule } from '../smpro/Primitives';
import { ServiceState } from '../../types/admin';

/** Shared furniture for the control plane. Reuses SM PRO drafting geometry. */

export function UsageMeter({
  label,
  used,
  limit,
  unit,
  format






}: {label: string;used: number;limit: number;unit?: string;format?: (n: number) => string;}) {
  const pct = limit > 0 ? Math.min(100, Math.round(used / limit * 100)) : 0;
  const tone = pct >= 90 ? 'bg-danger-500' : pct >= 75 ? 'bg-caution-500' : 'bg-brand-500';
  const fmt = format ?? ((n: number) => n.toLocaleString());

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <SpecLabel>{label}</SpecLabel>
        <span className="measure text-[11.5px] font-semibold text-ink-700">
          {fmt(used)} <span className="text-ink-400">/ {fmt(limit)}{unit ? ` ${unit}` : ''}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-[1px] bg-ink-100">
        <div className={twMerge('h-full rounded-[1px]', tone)} style={{ width: `${pct}%` }} />
      </div>
      <p className="measure mt-1 text-[10.5px] text-ink-400">{pct}% OF LIMIT</p>
    </div>);

}

export function StateDot({ state }: {state: ServiceState | 'Unknown';}) {
  const tone = {
    Operational: 'bg-positive-500',
    Degraded: 'bg-caution-500',
    Down: 'bg-danger-500',
    Unknown: 'bg-ink-300'
  }[state];
  return <span className={twMerge('inline-block h-2 w-2 shrink-0 rounded-[1px]', tone)} aria-hidden />;
}

/** A decision surface: what needs the platform team, with the evidence attached. */
export function AttentionRow({
  severity,
  title,
  org,
  facts,
  action,
  onAction







}: {severity: 'Critical' | 'High' | 'Medium' | 'Low';title: string;org: string;facts: {label: string;value: string;}[];action: string;onAction: () => void;}) {
  const spine = {
    Critical: 'shadow-[inset_3px_0_0_0_#DC2626]',
    High: 'shadow-[inset_3px_0_0_0_#D97706]',
    Medium: 'shadow-[inset_3px_0_0_0_#2563EB]',
    Low: 'shadow-[inset_3px_0_0_0_#AEB4BE]'
  }[severity];

  return (
    <li className={twMerge('border-b border-ink-100 bg-white last:border-b-0', spine)}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
        <div className="min-w-[240px] flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={twMerge(
                'measure rounded-[2px] px-1.5 py-0.5 text-[10px] font-semibold',
                severity === 'Critical' && 'bg-danger-50 text-danger-700',
                severity === 'High' && 'bg-caution-50 text-caution-700',
                severity === 'Medium' && 'bg-info-50 text-info-700',
                severity === 'Low' && 'bg-ink-100 text-ink-500'
              )}>
              
              {severity.toUpperCase()}
            </span>
            <span className="measure min-w-0 truncate text-[11px] text-ink-400">{org}</span>
          </div>
          <p className="mt-1.5 text-[13.5px] font-semibold leading-snug text-ink-900">{title}</p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          {facts.map((f) =>
          <div key={f.label} className="min-w-0">
              <dt className="spec-label">{f.label}</dt>
              <dd className="measure mt-0.5 text-[12px] font-semibold text-ink-800">{f.value}</dd>
            </div>
          )}
        </dl>
        <button
          onClick={onAction}
          className="ml-auto shrink-0 self-center rounded-[3px] border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-700 transition-colors duration-150 ease-smooth hover:border-brand-500 hover:text-brand-600">
          
          {action}
        </button>
      </div>
    </li>);

}

export function PanelSection({
  label,
  title,
  reference,
  action,
  children,
  className







}: {label: string;title?: string;reference?: string;action?: React.ReactNode;children: React.ReactNode;className?: string;}) {
  return (
    <Panel className={twMerge('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
        <div className="min-w-0">
          <SpecLabel>{label}</SpecLabel>
          {title && <p className="mt-0.5 truncate text-[14px] font-semibold text-ink-900">{title}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {reference && <span className="measure text-[11px] text-ink-400">{reference}</span>}
          {action}
        </div>
      </div>
      {children}
    </Panel>);

}

/** Confirmation body for an action that changes what a tenant can do. */
export function ImpactList({ items }: {items: string[];}) {
  return (
    <>
      <TickRule />
      <ul className="space-y-1.5 px-4 py-3">
        {items.map((i) =>
        <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-600">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-[1px] bg-ink-300" />
            {i}
          </li>
        )}
      </ul>
    </>);

}