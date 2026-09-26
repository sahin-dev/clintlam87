import React from 'react';
import { twMerge } from 'tailwind-merge';
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';

const base =
'w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10';

export function Label({ children, hint }: {children: React.ReactNode;hint?: string;}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-bold text-ink-700">{children}</span>
      {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
    </div>);

}

export function ErrorText({ children }: {children: React.ReactNode;}) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-danger-600">
      <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>);

}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export function Input({ label, hint, error, suffix, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <div className="relative">
        <input
          id={inputId}
          {...rest}
          aria-invalid={!!error}
          className={twMerge(base, 'h-12', error && 'border-danger-500 focus:ring-danger-500/10', suffix && 'pr-11', className)} />
        
        {suffix &&
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400">{suffix}</div>
        }
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>);

}

export function TextArea({
  label,
  hint,
  error,
  className,
  ...rest




}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label?: string;hint?: string;error?: string;}) {
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <textarea
        {...rest}
        className={twMerge(base, 'min-h-[96px] py-3 leading-relaxed', error && 'border-danger-500', className)} />
      
      {error && <ErrorText>{error}</ErrorText>}
    </div>);

}

export function Select({
  label,
  hint,
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {label?: string;hint?: string;}) {
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <div className="relative">
        <select
          {...rest}
          className={twMerge(base, 'h-12 appearance-none pr-10 font-medium', className)}>
          
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
    </div>);

}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  onFocus





}: {value: string;onChange: (v: string) => void;placeholder?: string;onFocus?: () => void;}) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={twMerge(base, 'h-11 pl-10 text-sm')} />
      
    </div>);

}

export function Checkbox({
  checked,
  onChange,
  children




}: {checked: boolean;onChange: (v: boolean) => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-2.5 text-left">
      
      <span
        className={twMerge(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ease-smooth',
          checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300 bg-white'
        )}>
        
        {checked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="text-[13px] leading-5 text-ink-600">{children}</span>
    </button>);

}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange




}: {options: {value: T;label: string;}[];value: T;onChange: (v: T) => void;}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
      {options.map((opt) =>
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={twMerge(
          'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150 ease-smooth',
          value === opt.value ?
          'border-ink-900 bg-ink-900 text-white' :
          'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
        )}>
        
          {opt.label}
        </button>
      )}
    </div>);

}