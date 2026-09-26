import React from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { ArrowLeftIcon, LockIcon, SearchIcon } from 'lucide-react';
import { Panel, SpecLabel, Measured, TickRule } from '../smpro/Primitives';

/**
 * Shared record furniture for the supplier platform. Every list is a dense
 * table with a ruler rule under its header; every record opens with a
 * drawing-style header block. These are the pieces that make the yard's
 * screens read as one operational system rather than a card wall.
 */

export function LedgerStrip({
  items,
  className



}: {items: {label: string;value: string;note?: string;tone?: 'default' | 'brand' | 'positive' | 'danger';}[];className?: string;}) {
  return (
    <Panel className={twMerge('mb-6 overflow-hidden', className)}>
      <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
        {items.map((m) =>
        <div key={m.label} className="min-w-[164px] flex-1 px-4 py-3.5">
            <Measured label={m.label} value={m.value} note={m.note} size="md" tone={m.tone ?? 'default'} />
          </div>
        )}
      </div>
    </Panel>);

}

export function RecordHeader({
  eyebrow,
  title,
  reference,
  facts,
  status,
  actions,
  backTo








}: {eyebrow: string;title: string;reference?: string;facts?: {label: string;value: string;}[];status?: React.ReactNode;actions?: React.ReactNode;backTo?: string;}) {
  const navigate = useNavigate();
  return (
    <div className="mb-5">
      {backTo &&
      <button
        onClick={() => navigate(backTo)}
        className="mb-2.5 -ml-1 inline-flex items-center gap-1.5 px-1 text-[12.5px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
        
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back
        </button>
      }
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <SpecLabel>{eyebrow}</SpecLabel>
            <h1 className="display-tight mt-1.5 text-[22px] font-bold leading-tight text-ink-900">{title}</h1>
            {reference && <p className="measure mt-1 text-[11.5px] text-ink-400">{reference}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {status}
            {actions}
          </div>
        </div>
        {facts && facts.length > 0 &&
        <>
            <TickRule />
            <dl className="flex flex-wrap gap-x-8 gap-y-3 px-4 py-3">
              {facts.map((f) =>
            <div key={f.label} className="min-w-0">
                  <dt className="spec-label">{f.label}</dt>
                  <dd className="mt-0.5 truncate text-[12.5px] font-medium text-ink-900">{f.value}</dd>
                </div>
            )}
            </dl>
          </>
        }
      </Panel>
    </div>);

}

export function ListToolbar({
  query,
  onQuery,
  placeholder,
  filters,
  active,
  onFilter,
  trailing








}: {query: string;onQuery: (v: string) => void;placeholder: string;filters?: string[];active?: string;onFilter?: (f: string) => void;trailing?: React.ReactNode;}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[220px] flex-1">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-full rounded-[3px] border border-ink-200 bg-white pl-9 pr-3 text-[13px] text-ink-900 placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        
      </div>
      {filters && filters.length > 0 &&
      <div className="flex flex-wrap gap-1.5">
          {filters.map((f) =>
        <button
          key={f}
          onClick={() => onFilter?.(f)}
          aria-pressed={active === f}
          className={twMerge(
            'rounded-[3px] border px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-smooth',
            active === f ?
            'border-brand-500 bg-brand-50 text-brand-700' :
            'border-ink-200 bg-white text-ink-500 hover:border-ink-300 hover:text-ink-800'
          )}>
          
              {f}
            </button>
        )}
        </div>
      }
      {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
    </div>);

}

export interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right';
  width?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
}

export function RecordTable({
  columns,
  children,
  caption




}: {columns: Column[];children: React.ReactNode;caption?: string;}) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        {/* The table is labelled rather than captioned: a visually hidden
             <caption> survives as painted text in static exports and lands on
             top of the first row. aria-label carries the same information. */}
        <table className="w-full min-w-[680px] border-collapse text-left" aria-label={caption}>
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/70">
              {columns.map((c) =>
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={twMerge(
                  'spec-label px-4 py-2.5',
                  c.align === 'right' && 'text-right',
                  c.hideBelow === 'sm' && 'hidden sm:table-cell',
                  c.hideBelow === 'md' && 'hidden md:table-cell',
                  c.hideBelow === 'lg' && 'hidden lg:table-cell'
                )}>
                
                  {c.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">{children}</tbody>
        </table>
      </div>
    </Panel>);

}

export function Row({
  onClick,
  children,
  spine




}: {onClick?: () => void;children: React.ReactNode;spine?: 'brand' | 'positive' | 'caution' | 'danger' | 'info';}) {
  /* A real left border, not an inset shadow. An arbitrary inset box-shadow is
     re-read as a foreground colour by static exporters, which tinted every
     word in the row; a border exports as a border. */
  const spineColor = spine ?
  {
    brand: '#F96317',
    positive: '#16A34A',
    caution: '#D97706',
    danger: '#DC2626',
    info: '#2563EB'
  }[spine] :
  undefined;

  return (
    <tr
      onClick={onClick}
      style={spineColor ? { borderLeft: `3px solid ${spineColor}` } : undefined}
      className={twMerge(
        /* Colour is stated on the row so nothing can inherit the spine tone. */
        'align-middle text-ink-700 transition-colors duration-150 ease-smooth',
        onClick && 'cursor-pointer hover:bg-brand-50/40'
      )}>
      
      {children}
    </tr>);

}

export function Cell({
  children,
  align = 'left',
  mono,
  strong,
  muted,
  hideBelow,
  className








}: {children: React.ReactNode;align?: 'left' | 'right';mono?: boolean;strong?: boolean;muted?: boolean;hideBelow?: 'sm' | 'md' | 'lg';className?: string;}) {
  return (
    <td
      className={twMerge(
        'px-4 py-3 text-[12.5px] text-ink-700',
        align === 'right' && 'text-right',
        mono && 'measure',
        strong && 'font-semibold text-ink-900',
        muted && 'text-ink-400',
        hideBelow === 'sm' && 'hidden sm:table-cell',
        hideBelow === 'md' && 'hidden md:table-cell',
        hideBelow === 'lg' && 'hidden lg:table-cell',
        className
      )}>
      
      {children}
    </td>);

}

/** Permission-denied state used wherever a role reaches a module it cannot see. */
export function Denied({ module }: {module: string;}) {
  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
        <LockIcon className="h-5 w-5" />
      </div>
      <h1 className="display-tight mt-4 text-[18px] font-bold text-ink-900">
        {module} is outside your role
      </h1>
      <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-ink-500">
        Your current role does not include this module. Switch roles from the bottom of the sidebar, or
        ask an administrator to grant the permission.
      </p>
    </div>);

}

/** Small privacy note used wherever customer-specific commercial data is shown. */
export function ScopeNote({ children }: {children: React.ReactNode;}) {
  return (
    <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-400">
      <LockIcon className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </p>);

}