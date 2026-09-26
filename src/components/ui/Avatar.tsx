import React from 'react';
import { twMerge } from 'tailwind-merge';
import { initialsOf } from '../../utils/format';

export function Avatar({
  name,
  size = 'md',
  tone = 'ink',
  className





}: {name: string;size?: 'xs' | 'sm' | 'md' | 'lg';tone?: 'ink' | 'brand';className?: string;}) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-[13px]',
    lg: 'h-14 w-14 text-[17px]'
  } as const;
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        tone === 'brand' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600',
        sizes[size],
        className
      )}>
      
      {initialsOf(name)}
    </span>);

}

export function AvatarStack({ names, max = 3 }: {names: string[];max?: number;}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((n) =>
      <Avatar key={n} name={n} size="sm" className="-ml-1.5 ring-2 ring-white first:ml-0" />
      )}
      {rest > 0 &&
      <span className="-ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-[10px] font-bold text-white ring-2 ring-white">
          +{rest}
        </span>
      }
    </div>);

}