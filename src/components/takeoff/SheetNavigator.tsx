import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckIcon, SearchIcon, TriangleAlertIcon } from 'lucide-react';
import { DrawingSheet, SheetDiscipline } from '../../types/takeoff';
import { SpecLabel } from '../smpro/Primitives';

/**
 * The drawing index, not a file list. A sheet navigator in takeoff software
 * has to answer three things at a glance: what kind of sheet is this, has a
 * human looked at it, and does it carry unresolved issues.
 */
const DISCIPLINE_ABBR: Record<SheetDiscipline, string> = {
  'Floor Plan': 'PLAN',
  Elevation: 'ELEV',
  Section: 'SECT',
  Foundation: 'FDN',
  Roof: 'ROOF',
  Structural: 'STRC',
  Schedule: 'SCHD',
  Detail: 'DTL',
  Unclassified: '—'
};

export function SheetNavigator({
  sheets,
  activeIndex,
  onSelect,
  onReclassify,
  className






}: {sheets: DrawingSheet[];activeIndex: number;onSelect: (index: number) => void;onReclassify: (sheetId: string, discipline: SheetDiscipline) => void;className?: string;}) {
  const [query, setQuery] = useState('');
  const [classifying, setClassifying] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = sheets.
  map((sheet, index) => ({ sheet, index })).
  filter(
    ({ sheet }) =>
    !q ||
    sheet.code.toLowerCase().includes(q) ||
    sheet.title.toLowerCase().includes(q) ||
    sheet.discipline.toLowerCase().includes(q)
  );

  return (
    <div className={twMerge('flex min-h-0 flex-col border-r border-ink-200 bg-white', className)}>
      <div className="border-b border-ink-100 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <SpecLabel>Sheet index</SpecLabel>
          <span className="measure text-[10.5px] text-ink-400">{sheets.length} analysed</span>
        </div>
        <label className="relative mt-2 block">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a sheet…"
            aria-label="Find a sheet"
            className="w-full rounded-[3px] border border-ink-200 bg-white py-1.5 pl-7 pr-2 text-[12px] text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none" />
          
        </label>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 &&
        <li className="px-3 py-6 text-center text-[12px] text-ink-400">No sheet matches.</li>
        }
        {visible.map(({ sheet, index }) => {
          const active = index === activeIndex;
          const lowClass = sheet.classificationConfidence < 80;
          return (
            <li key={sheet.id} className="border-b border-ink-100">
              <button
                onClick={() => onSelect(index)}
                aria-current={active ? 'true' : undefined}
                className={twMerge(
                  'w-full px-3 py-2.5 text-left transition-colors duration-150 ease-smooth',
                  active ? 'bg-brand-50 shadow-[inset_2px_0_0_0_#F96317]' : 'hover:bg-ink-50'
                )}>
                
                <div className="flex items-baseline justify-between gap-2">
                  <span className="measure text-[12px] font-bold text-ink-900">{sheet.code}</span>
                  <span className="measure shrink-0 text-[9.5px] font-bold text-ink-400">
                    {DISCIPLINE_ABBR[sheet.discipline]}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-500">{sheet.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  {sheet.reviewed ?
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.05em] text-positive-700">
                      <CheckIcon className="h-3 w-3" strokeWidth={3} />
                      Reviewed
                    </span> :

                  <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-ink-400">
                      Unreviewed
                    </span>
                  }
                  {sheet.issueCount > 0 &&
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.05em] text-caution-800">
                      <TriangleAlertIcon className="h-3 w-3" />
                      {sheet.issueCount}
                    </span>
                  }
                  <span className="measure ml-auto text-[10px] text-ink-300">p.{sheet.page}</span>
                </div>
              </button>

              {/* Classification review lives with the sheet it describes. */}
              {active &&
              <div className="border-t border-ink-100 bg-ink-50/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <SpecLabel>Classified as</SpecLabel>
                      <p className="mt-0.5 truncate text-[12px] font-bold text-ink-900">
                        {sheet.discipline}
                        <span
                        className={twMerge(
                          'measure ml-1.5 text-[10.5px] font-semibold',
                          lowClass ? 'text-danger-600' : 'text-ink-400'
                        )}>
                        
                          {sheet.classificationConfidence}%
                        </span>
                      </p>
                      {sheet.reclassifiedBy &&
                    <p className="measure mt-0.5 text-[10px] text-brand-600">
                          Corrected by {sheet.reclassifiedBy}
                        </p>
                    }
                    </div>
                    <button
                    onClick={() => setClassifying(classifying === sheet.id ? null : sheet.id)}
                    className="shrink-0 rounded-[3px] border border-ink-200 bg-white px-2 py-1 text-[10.5px] font-bold text-ink-600 transition-colors duration-150 ease-smooth hover:border-brand-300 hover:text-brand-600">
                    
                      {classifying === sheet.id ? 'Close' : 'Change'}
                    </button>
                  </div>
                  {classifying === sheet.id &&
                <div className="mt-2 flex flex-wrap gap-1">
                      {(Object.keys(DISCIPLINE_ABBR) as SheetDiscipline[]).
                  filter((d) => d !== 'Unclassified').
                  map((d) =>
                  <button
                    key={d}
                    onClick={() => {
                      onReclassify(sheet.id, d);
                      setClassifying(null);
                    }}
                    className={twMerge(
                      'rounded-[2px] border px-1.5 py-[3px] text-[10.5px] font-semibold transition-colors duration-150 ease-smooth',
                      d === sheet.discipline ?
                      'border-brand-400 bg-brand-500 text-white' :
                      'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
                    )}>
                    
                            {d}
                          </button>
                  )}
                    </div>
                }
                  <p className="measure mt-2 text-[10px] text-ink-400">Scale {sheet.scale}</p>
                </div>
              }
            </li>);

        })}
      </ul>
    </div>);

}