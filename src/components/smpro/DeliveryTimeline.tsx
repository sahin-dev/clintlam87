import { twMerge } from 'tailwind-merge';
import { CheckIcon } from 'lucide-react';
import { SpecLabel } from './Primitives';

export const DELIVERY_STAGES = [
'Confirmed',
'Scheduled',
'Loading',
'Out for Delivery',
'Arrived',
'Delivered'] as
const;

export type DeliveryStage = (typeof DELIVERY_STAGES)[number];

/**
 * Signature SM Pro component. A load moving from a supplier yard to a jobsite,
 * shown as a logistics run with timestamps per stage rather than a generic
 * status badge.
 */
export function DeliveryTimeline({
  current,
  stamps = {},
  delayed = false,
  className






}: {current: DeliveryStage; /** Timestamp per completed stage. */stamps?: Partial<Record<DeliveryStage, string>>;delayed?: boolean;className?: string;}) {
  const index = DELIVERY_STAGES.indexOf(current);

  return (
    <ol className={twMerge('relative', className)}>
      {DELIVERY_STAGES.map((stage, i) => {
        const done = i < index;
        const isCurrent = i === index;
        const pending = i > index;

        return (
          <li key={stage} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Run line between stages. */}
            {i < DELIVERY_STAGES.length - 1 &&
            <span
              aria-hidden
              className={twMerge(
                'absolute left-[9px] top-5 h-full w-px',
                done ? 'bg-positive-500' : 'bg-ink-200'
              )} />

            }
            <span
              className={twMerge(
                'relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[3px] border',
                done ?
                'border-positive-500 bg-positive-500 text-white' :
                isCurrent ?
                delayed ?
                'border-danger-500 bg-danger-500 text-white' :
                'border-brand-500 bg-brand-500 text-white' :
                'border-ink-200 bg-white'
              )}>
              
              {done ?
              <CheckIcon className="h-3 w-3" strokeWidth={3} /> :

              <span
                className={twMerge(
                  'measure text-[9.5px] font-bold',
                  isCurrent ? 'text-white' : 'text-ink-300'
                )}>
                
                  {i + 1}
                </span>
              }
            </span>

            <div className="min-w-0 flex-1 pb-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={twMerge(
                    'text-[13.5px] font-bold',
                    pending ? 'text-ink-300' : 'text-ink-900'
                  )}>
                  
                  {stage}
                </p>
                {stamps[stage] &&
                <span className="measure text-[11px] text-ink-400">{stamps[stage]}</span>
                }
              </div>
              {isCurrent &&
              <SpecLabel className={delayed ? 'mt-1 text-danger-600' : 'mt-1 text-brand-600'}>
                  {delayed ? 'Delayed — running behind window' : 'In progress now'}
                </SpecLabel>
              }
            </div>
          </li>);

      })}
    </ol>);

}