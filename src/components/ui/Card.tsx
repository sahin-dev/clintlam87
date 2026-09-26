import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronRightIcon } from 'lucide-react';

export function Card({
  children,
  className,
  as = 'div'




}: {children: React.ReactNode;className?: string;as?: 'div' | 'section' | 'article' | 'li';}) {
  const Tag = as;
  return (
    <Tag className={twMerge('rounded-[4px] border border-ink-100 bg-white', className)}>
      {children}
    </Tag>);

}

export function SectionHeader({
  title,
  action,
  onAction,
  hint,
  className






}: {title: string;action?: string;onAction?: () => void;hint?: string;className?: string;}) {
  return (
    <div className={twMerge('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        <h2 className="display-tight text-[17px] font-bold text-ink-900">{title}</h2>
        {hint && <p className="mt-0.5 text-[12px] text-ink-400">{hint}</p>}
      </div>
      {action &&
      <button
        onClick={onAction}
        className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-brand-600 transition-colors duration-150 ease-smooth hover:text-brand-700">
        
          {action}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      }
    </div>);

}

export function DataRow({
  label,
  value,
  mono




}: {label: string;value: React.ReactNode;mono?: boolean;}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-[13px] text-ink-400">{label}</dt>
      <dd
        className={twMerge(
          'max-w-[60%] text-right text-[13px] font-semibold text-ink-800',
          mono && 'font-mono text-[12px] font-medium'
        )}>
        
        {value}
      </dd>
    </div>);

}

export function Metric({
  label,
  value,
  sub,
  tone





}: {label: string;value: string;sub?: string;tone?: 'default' | 'alert';}) {
  return (
    <div className="min-w-0">
      <p className="spec-label truncate">{label}</p>
      <p
        className={twMerge(
          'measure mt-1 text-[21px] font-bold text-ink-900',
          tone === 'alert' && 'text-brand-600'
        )}>
        
        {value}
      </p>
      {sub && <p className="mt-0.5 truncate text-[12px] text-ink-400">{sub}</p>}
    </div>);

}

export function Progress({
  value,
  tone = 'brand',
  className




}: {value: number;tone?: 'brand' | 'ink' | 'positive';className?: string;}) {
  const bar =
  tone === 'brand' ? 'bg-brand-500' : tone === 'positive' ? 'bg-positive-500' : 'bg-ink-800';
  return (
    <div className={twMerge('h-1.5 w-full overflow-hidden rounded-[1px] bg-ink-100', className)}>
      <div
        className={twMerge('h-full rounded-[1px] transition-[width] duration-300 ease-smooth', bar)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      
    </div>);

}