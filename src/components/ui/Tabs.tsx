import { twMerge } from 'tailwind-merge';

export function Tabs({
  tabs,
  value,
  onChange,
  className





}: {tabs: {value: string;label: string;count?: number;}[];value: string;onChange: (v: string) => void;className?: string;}) {
  return (
    <div
      role="tablist"
      className={twMerge(
        'no-scrollbar flex gap-6 overflow-x-auto border-b border-ink-100 px-5',
        className
      )}>
      
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={twMerge(
              'relative shrink-0 whitespace-nowrap py-3 text-[13px] font-semibold transition-colors duration-150 ease-smooth',
              active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'
            )}>
            
            {tab.label}
            {typeof tab.count === 'number' &&
            <span
              className={twMerge(
                'measure ml-1.5 rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold',
                active ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500'
              )}>
              
                {tab.count}
              </span>
            }
            {active &&
            <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brand-500" />
            }
          </button>);

      })}
    </div>);

}