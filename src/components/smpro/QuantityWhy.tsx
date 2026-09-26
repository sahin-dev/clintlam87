import React from 'react';
import { ScaleIcon } from 'lucide-react';
import { QuantityDerivation } from '../../types/takeoff';
import { derivedTotal } from '../../data/takeoffEngine';
import { SpecLabel } from './Primitives';
import { qty } from '../../utils/format';

/**
 * The "Why?" behind a quantity. Every number in a takeoff has to be
 * defensible in front of a supplier, so the contributions, the rule that
 * generated them, the waste allowance and the sheets they came from are all
 * shown as a single derivation — not hidden behind a confidence score.
 */
export function QuantityWhy({
  derivation,
  unit,
  finalQuantity





}: {derivation: QuantityDerivation;unit: string; /** The quantity actually carried on the line, so a mismatch is visible. */finalQuantity: number;}) {
  const base = derivation.components.reduce((sum, c) => sum + c.value, 0);
  const computed = derivedTotal(derivation);
  const waste = computed - base;
  const max = Math.max(...derivation.components.map((c) => c.value), 1);

  return (
    <div>
      <div className="flex items-center gap-2">
        <ScaleIcon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        <SpecLabel>How this quantity was derived</SpecLabel>
      </div>

      <ul className="mt-2.5 space-y-2">
        {derivation.components.map((c) =>
        <li key={c.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[12.5px] font-semibold text-ink-800">{c.label}</p>
              <span className="measure shrink-0 text-[13px] font-bold text-ink-900">
                {qty(c.value)}
              </span>
            </div>
            {/* Contribution bar — makes the dominant driver obvious. */}
            <div className="mt-1 h-[3px] w-full bg-ink-100">
              <div
              className="h-full bg-ink-400"
              style={{ width: `${Math.max(2, c.value / max * 100)}%` }}
              aria-hidden />
            
            </div>
            {c.note && <p className="mt-1 text-[11px] leading-snug text-ink-400">{c.note}</p>}
          </li>
        )}
      </ul>

      <dl className="mt-3 border-t border-ink-100 pt-2.5">
        <div className="flex items-baseline justify-between gap-3 py-1">
          <dt className="text-[12.5px] font-semibold text-ink-600">Subtotal</dt>
          <dd className="measure text-[13px] font-bold text-ink-900">{qty(base)}</dd>
        </div>
        {derivation.wastePercent > 0 &&
        <div className="flex items-baseline justify-between gap-3 py-1">
            <dt className="text-[12.5px] font-semibold text-ink-600">
              Waste allowance {derivation.wastePercent}%
            </dt>
            <dd className="measure text-[13px] font-bold text-ink-900">+{qty(waste)}</dd>
          </div>
        }
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-ink-200 pt-2">
          <dt className="spec-label">Derived quantity</dt>
          <dd className="measure text-[17px] font-extrabold text-ink-900">
            {qty(computed)}
            <span className="ml-1 text-[10.5px] font-medium text-ink-400">{unit}</span>
          </dd>
        </div>
        {computed !== finalQuantity &&
        <p className="mt-2 border border-brand-200 bg-brand-50/60 px-2.5 py-2 text-[11.5px] leading-relaxed text-brand-800">
            The line carries {qty(finalQuantity)} {unit} — a human decision overrides the derivation.
            The derivation is kept as the AI's original reasoning.
          </p>
        }
      </dl>

      <div className="mt-3 border-t border-ink-100 pt-2.5">
        <SpecLabel>Rule applied</SpecLabel>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-600">{derivation.rule}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <SpecLabel className="mr-1">Measured from</SpecLabel>
          {derivation.sourceSheets.map((s) =>
          <span
            key={s}
            className="measure border border-ink-200 bg-white px-1.5 py-[2px] text-[10.5px] font-bold text-ink-700">
            
              {s}
            </span>
          )}
        </div>
      </div>
    </div>);

}