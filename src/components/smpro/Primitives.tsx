import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * SM Pro drafting primitives. These replace the generic card/stat/pill trio
 * with construction-document geometry: square-shouldered panels, annotation
 * labels, measured numerals and ruler rules.
 */

/** Square-shouldered technical panel. */
export function Panel({
  children,
  className,
  as = 'div'




}: {children: React.ReactNode;className?: string;as?: 'div' | 'section' | 'article' | 'li' | 'aside';}) {
  const Tag = as;
  return <Tag className={twMerge('panel', className)}>{children}</Tag>;
}

/**
 * Panel header styled like a drawing title block: annotation label on the
 * left, technical reference on the right.
 */
export function TitleBlock({
  label,
  title,
  reference,
  action,
  className






}: {label: string;title?: string;reference?: string;action?: React.ReactNode;className?: string;}) {
  return (
    <div
      className={twMerge(
        'flex items-center justify-between gap-4 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5',
        className
      )}>
      
      <div className="min-w-0">
        <p className="spec-label">{label}</p>
        {title && <p className="mt-1 truncate text-[14px] font-bold text-ink-900">{title}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {reference && <span className="measure text-[11px] text-ink-400">{reference}</span>}
        {action}
      </div>
    </div>);

}

/** Drafting annotation label. */
export function SpecLabel({ children, className }: {children: React.ReactNode;className?: string;}) {
  return <p className={twMerge('spec-label', className)}>{children}</p>;
}

/**
 * A measured value: annotation label above, mono numeral below, unit inline.
 * Used anywhere a quantity, price or count is the point of the element.
 */
export function Measured({
  label,
  value,
  unit,
  note,
  tone = 'default',
  size = 'md',
  className








}: {label: string;value: string;unit?: string;note?: string;tone?: 'default' | 'brand' | 'positive' | 'danger' | 'muted';size?: 'sm' | 'md' | 'lg';className?: string;}) {
  const toneClass = {
    default: 'text-ink-900',
    brand: 'text-brand-600',
    positive: 'text-positive-600',
    danger: 'text-danger-600',
    muted: 'text-ink-400'
  }[tone];
  /* Headline figures earn bold; supporting figures stay semibold. */
  const sizeClass = {
    sm: 'text-[15px] font-bold',
    md: 'text-[20px] font-bold',
    lg: 'text-[28px] font-extrabold'
  }[size];

  return (
    <div className={twMerge('min-w-0', className)}>
      <SpecLabel>{label}</SpecLabel>
      <p className={twMerge('measure mt-1 leading-none', sizeClass, toneClass)}>
        {value}
        {unit && <span className="ml-1 text-[11px] font-medium text-ink-400">{unit}</span>}
      </p>
      {note && <p className="mt-1.5 truncate text-[11.5px] text-ink-400">{note}</p>}
    </div>);

}

/** Ruler tick rule, used where a document/quantity boundary needs marking. */
export function TickRule({ className }: {className?: string;}) {
  return <div aria-hidden className={twMerge('tick-rule', className)} />;
}

/**
 * Section heading for a workspace region. Denser and more technical than a
 * marketing-style section title.
 */
export function WorkHeading({
  label,
  title,
  count,
  action,
  className






}: {label?: string;title: string;count?: string;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={twMerge('mb-3 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {label && <SpecLabel className="mb-1">{label}</SpecLabel>}
        <h2 className="display-tight text-[16px] font-bold text-ink-900">
          {title}
          {count && <span className="measure ml-2 text-[12px] font-medium text-ink-400">{count}</span>}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>);

}

/** Key/value line inside a technical panel. */
export function SpecRow({
  label,
  value,
  mono




}: {label: string;value: React.ReactNode;mono?: boolean;}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="spec-label shrink-0">{label}</dt>
      <dd
        className={twMerge(
          'min-w-0 text-right text-[12.5px] font-semibold text-ink-800',
          mono && 'measure font-medium'
        )}>
        
        {value}
      </dd>
    </div>);

}