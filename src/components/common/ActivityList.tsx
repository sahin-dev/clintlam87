import {
  ArrowRightIcon,
  CreditCardIcon,
  FileTextIcon,
  LayersIcon,
  ReceiptIcon,
  ScanSearchIcon,
  ShoppingCartIcon,
  TriangleAlertIcon,
  TruckIcon,
  BuildingIcon,
  QuoteIcon } from
'lucide-react';
import { ActivityEvent } from '../../types';
import { projectName } from '../../data/projects';

const ICONS = {
  plan: FileTextIcon,
  takeoff: ScanSearchIcon,
  request: LayersIcon,
  quote: QuoteIcon,
  order: ShoppingCartIcon,
  delivery: TruckIcon,
  invoice: ReceiptIcon,
  payment: CreditCardIcon,
  project: BuildingIcon,
  issue: TriangleAlertIcon
} as const;

export function ActivityList({
  events,
  showProject



}: {events: ActivityEvent[];showProject?: boolean;}) {
  return (
    <ul>
      {events.map((e) => {
        const Icon = ICONS[e.kind];
        return (
          <li key={e.id} className="flex gap-3 px-4 py-3.5 first:pt-4 last:pb-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] leading-snug text-ink-800">
                <span className="font-bold text-ink-900">{e.actor}</span> {e.action}{' '}
                <span className="font-semibold">{e.target}</span>
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">
                {e.at}
                {showProject && ` · ${projectName(e.projectId)}`}
              </p>
              {e.before && e.after &&
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-600">
                  <span className="text-ink-400 line-through">{e.before}</span>
                  <ArrowRightIcon className="h-3 w-3 text-ink-300" />
                  <span>{e.after}</span>
                </p>
              }
            </div>
          </li>);

      })}
    </ul>);

}