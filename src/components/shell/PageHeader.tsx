import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  action,
  back = false,
  backLabel = 'Back'







}: {title: string;subtitle?: string;action?: React.ReactNode; /** Detail screens pass true to show a back link above the title. */back?: boolean;backLabel?: string;}) {
  const navigate = useNavigate();
  return (
    <div className="pb-5 pt-7">
      {back &&
      <button
        onClick={() => navigate(-1)}
        className="mb-2 -ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-[12.5px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
        
          <ChevronLeftIcon className="h-4 w-4" />
          {backLabel}
        </button>
      }
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="display-tight text-[26px] font-extrabold leading-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1 text-[13.5px] text-ink-500">{subtitle}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>);

}