import { twMerge } from 'tailwind-merge';

/**
 * AI confidence rendered as a segmented gauge rather than a coloured pill.
 * Ten segments read as a measurement, and the numeric value is always shown so
 * the signal never depends on colour alone.
 */
export function ConfidenceMeter({
  value,
  size = 'md',
  showLabel = true,
  className





}: {value: number;size?: 'sm' | 'md';showLabel?: boolean;className?: string;}) {
  const filled = Math.round(Math.min(100, Math.max(0, value)) / 10);
  const band = value >= 90 ? 'high' : value >= 75 ? 'medium' : 'low';
  const fill = {
    high: 'bg-positive-500',
    medium: 'bg-caution-500',
    low: 'bg-danger-500'
  }[band];
  const text = {
    high: 'text-positive-700',
    medium: 'text-caution-700',
    low: 'text-danger-700'
  }[band];
  const bar = size === 'sm' ? 'h-2 w-[3px]' : 'h-2.5 w-[3.5px]';

  return (
    <span
      className={twMerge('inline-flex items-center gap-2', className)}
      title={`AI confidence ${value}%`}>
      
      <span className="flex items-end gap-[2px]" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) =>
        <span
          key={i}
          className={twMerge('rounded-[1px]', bar, i < filled ? fill : 'bg-ink-200')} />

        )}
      </span>
      {showLabel &&
      <span className={twMerge('measure text-[11.5px] font-bold', text)}>
          {value}%
          <span className="ml-1 font-medium text-ink-400">conf.</span>
        </span>
      }
      <span className="sr-only">AI confidence {value} percent, {band} band</span>
    </span>);

}

/**
 * Marks any surface whose content was produced by the model, so AI output is
 * never mistaken for human-entered data.
 */
export function AiStamp({ label = 'AI generated', className }: {label?: string;className?: string;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-[3px] border border-violet-100 bg-violet-50 px-2 py-1',
        className
      )}>
      
      <span className="h-1.5 w-1.5 rotate-45 bg-violet-500" aria-hidden />
      <span className="spec-label text-violet-600">{label}</span>
    </span>);

}