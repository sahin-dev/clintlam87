import React from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
  'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-[0_1px_2px_rgba(249,99,23,0.35)] disabled:bg-ink-100 disabled:text-ink-400 disabled:shadow-none disabled:opacity-100',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 disabled:bg-ink-100 disabled:text-ink-400 disabled:opacity-100',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 disabled:bg-ink-100 disabled:text-ink-400 disabled:opacity-100'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] rounded-[3px] gap-1.5',
  md: 'h-10 px-4 text-[13.5px] rounded-[3px] gap-2',
  lg: 'h-12 px-5 text-[14.5px] rounded-[3px] gap-2'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={twMerge(
        'inline-flex items-center justify-center font-bold leading-none transition-[background-color,color,transform,box-shadow] duration-150 ease-smooth active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className
      )}>
      
      {loading ?
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> :

      icon
      }
      {children}
    </button>);

}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {label: string;}) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={twMerge(
        'inline-flex h-9 w-9 items-center justify-center rounded-[3px] text-ink-600 transition-colors duration-150 ease-smooth hover:bg-ink-100 active:bg-ink-200',
        className
      )}>
      
      {children}
    </button>);

}