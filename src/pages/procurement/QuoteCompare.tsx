import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  TrendingDownIcon,
  TruckIcon,
  XIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { Measured, Panel, SpecLabel, TitleBlock, WorkHeading } from '../../components/smpro/Primitives';
import { useApp } from '../../contexts/AppContext';
import { currency } from '../../utils/format';
import { supplierName, suppliers } from '../../data/procurement';
import { projectName } from '../../data/projects';
import { Quote, Supplier } from '../../types';

/**
 * Quote comparison is a decision surface, not a table dump. Suppliers are
 * scored on the four things a purchasing manager actually weighs — price,
 * lead time, availability and delivery record — and the leader is stated
 * outright with the trade-off against each alternative made explicit.
 */
export function QuoteCompare() {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const request = app.requests.find((r) => r.id === requestId);
  const quotes = app.quotes.filter((q) => q.requestId === requestId && q.status !== 'Pending');
  const [selected, setSelected] = useState<string | null>(
    quotes.find((q) => q.status === 'Selected')?.id ?? null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const scored = useMemo(() => {
    if (quotes.length === 0) return [];
    const cheapest = Math.min(...quotes.map((q) => q.total));
    const dearest = Math.max(...quotes.map((q) => q.total));
    const fastest = Math.min(...quotes.map((q) => q.leadTimeDays));
    const slowest = Math.max(...quotes.map((q) => q.leadTimeDays));

    return quotes.
    map((q) => {
      const supplier = suppliers.find((s) => s.id === q.supplierId);
      const priceScore = dearest === cheapest ? 1 : 1 - (q.total - cheapest) / (dearest - cheapest);
      const speedScore =
      slowest === fastest ? 1 : 1 - (q.leadTimeDays - fastest) / (slowest - fastest);
      const stockScore = q.availability.startsWith('All items in stock') ? 1 : 0.4;
      const recordScore = (supplier?.onTimeRate ?? 90) / 100;
      const score = priceScore * 0.4 + speedScore * 0.25 + stockScore * 0.2 + recordScore * 0.15;

      const strengths: string[] = [];
      if (q.total === cheapest) strengths.push('Lowest total cost');
      if (q.leadTimeDays === fastest) strengths.push('Fastest to site');
      if (q.availability.startsWith('All items in stock')) strengths.push('Everything in stock');
      if ((supplier?.onTimeRate ?? 0) >= 95) strengths.push(`${supplier?.onTimeRate}% on-time record`);

      const risks: string[] = [];
      if (q.total > cheapest) risks.push(`${currency(q.total - cheapest)} above the lowest bid`);
      if (q.leadTimeDays > fastest) risks.push(`${q.leadTimeDays - fastest} days slower to site`);
      if (!q.availability.startsWith('All items in stock')) risks.push(q.availability);

      return { quote: q, supplier, score, strengths, risks, cheapest, fastest };
    }).
    sort((a, b) => b.score - a.score);
  }, [quotes]);

  if (!request || quotes.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState
          title="Nothing to compare yet"
          body="Comparison unlocks once at least two suppliers have responded with pricing."
          action="Back to procurement"
          onAction={() => navigate('/procurement')} />
        
      </div>);

  }

  const leader = scored[0];
  const alternatives = scored.slice(1);
  const spread = Math.max(...quotes.map((q) => q.total)) - Math.min(...quotes.map((q) => q.total));
  const daySpread = Math.max(...quotes.map((q) => q.leadTimeDays)) - Math.min(...quotes.map((q) => q.leadTimeDays));

  return (
    <div>
      <PageHeader
        back
        backLabel="Procurement"
        title="Supplier decision"
        subtitle={`${request.id} · ${projectName(request.projectId)} · ${quotes.length} suppliers responded`} />
      

      {/* Decision framing — the trade-off, stated before any numbers. */}
      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="The trade-off" reference={`${request.lines.length} MATERIAL LINES`} />
        <div className="grid grid-cols-2 gap-4 px-4 py-3.5 sm:grid-cols-4">
          <Measured label="Price spread" value={currency(spread)} note="Highest vs lowest bid" size="sm" />
          <Measured label="Schedule spread" value={`${daySpread} days`} note="Fastest vs slowest" size="sm" />
          <Measured label="Required on site" value={request.requiredBy} size="sm" />
          <Measured
            label="Recommended"
            value={supplierName(leader.quote.supplierId)}
            note={`Score ${Math.round(leader.score * 100)}/100`}
            size="sm"
            tone="brand" />
          
        </div>
      </Panel>

      {/* Leader gets the weight; alternatives sit beside it as the counter-case. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <QuoteLead
          entry={leader}
          selected={selected === leader.quote.id}
          onSelect={() => setSelected(leader.quote.id)}
          onAsk={() => navigate('/messages')} />
        

        <div className="space-y-4">
          <SpecLabel>Alternatives</SpecLabel>
          {alternatives.map((entry) =>
          <QuoteAlternative
            key={entry.quote.id}
            entry={entry}
            leaderTotal={leader.quote.total}
            selected={selected === entry.quote.id}
            onSelect={() => setSelected(entry.quote.id)}
            onReject={() => {
              app.decideQuote(entry.quote.id, 'rejected', 'Not selected for this request');
              app.toast({
                tone: 'info',
                title: `${supplierName(entry.quote.supplierId)}'s quote declined`,
                body: "They see the decision on their quote — without seeing any other supplier's price."
              });
            }} />

          )}
        </div>
      </div>

      {/* Line-level pricing matrix. */}
      <section className="mt-6">
        <WorkHeading label="Unit pricing" title="Line-by-line comparison" count={`${quotes[0].lines.length} lines`} />
        <Panel className="overflow-hidden">
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/70">
                  <th className="spec-label px-3 py-2">Material</th>
                  {scored.map(({ quote }) =>
                  <th key={quote.id} className="spec-label px-3 py-2 text-right">
                      {supplierName(quote.supplierId).split(' ')[0]}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {quotes[0].lines.map((line, i) => {
                  const prices = scored.map(({ quote }) => quote.lines[i]?.unitPrice ?? 0);
                  const best = Math.min(...prices);
                  return (
                    <tr key={line.item} className="border-b border-ink-100 last:border-0">
                      <td className="px-3 py-2.5">
                        <p className="text-[12.5px] font-semibold text-ink-900">{line.item}</p>
                        <p className="measure text-[11px] text-ink-400">
                          {line.qty} {line.unit}
                        </p>
                      </td>
                      {prices.map((price, qi) =>
                      <td
                        key={scored[qi].quote.id}
                        className={`measure px-3 py-2.5 text-right text-[12.5px] ${
                        price === best ? 'font-bold text-positive-700' : 'text-ink-700'}`
                        }>
                        
                          ${price.toFixed(2)}
                          {price === best && <span className="ml-1 text-[9px] text-positive-600">BEST</span>}
                        </td>
                      )}
                    </tr>);

                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <div className="mt-5">
        {app.can('proposal.create') ?
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <SpecLabel>Selected supplier</SpecLabel>
              <p className="mt-1 text-[15px] font-bold text-ink-900">
                {selected ? supplierName(quotes.find((q) => q.id === selected)!.supplierId) : 'None selected'}
                {selected &&
              <span className="measure ml-2 text-[13px] font-medium text-ink-500">
                    {currency(quotes.find((q) => q.id === selected)!.total)}
                  </span>
              }
              </p>
            </div>
            <Button size="lg" disabled={!selected} onClick={() => setConfirmOpen(true)}>
              Raise purchase proposal
            </Button>
          </div> :

        <InlineAlert
          tone="info"
          title="View-only comparison"
          body="Your role can review supplier pricing; the purchasing manager selects the supplier and raises the proposal." />

        }
        <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-400">
          <ShieldCheckIcon className="h-3.5 w-3.5" />
          Suppliers only ever see their own submission — no competitor pricing, terms or ranking is shared.
        </p>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Create proposal for owner approval"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              if (!selected) return;
              const order = app.decideQuote(selected, 'accepted', 'Selected on price and lead time');
              setConfirmOpen(false);
              app.toast({
                tone: 'success',
                title: 'Proposal sent for approval',
                body: 'The owner has been notified, and the yard sees the acceptance on their quote.'
              });
              navigate(order ? `/orders/${order.id}` : '/orders');
            }}>
            
              Create proposal
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-ink-600">
          {selected && supplierName(quotes.find((q) => q.id === selected)!.supplierId)} will be proposed at{' '}
          {selected && currency(quotes.find((q) => q.id === selected)!.total)}. The other suppliers are notified
          that they were not selected — without seeing the winning price.
        </p>
      </Modal>
    </div>);

}

interface Entry {
  quote: Quote;
  supplier?: Supplier;
  score: number;
  strengths: string[];
  risks: string[];
}

function QuoteLead({
  entry,
  selected,
  onSelect,
  onAsk





}: {entry: Entry;selected: boolean;onSelect: () => void;onAsk: () => void;}) {
  const { quote, supplier, strengths, score } = entry;
  return (
    <Panel className={`overflow-hidden ${selected ? 'border-brand-500' : 'border-ink-200'}`}>
      <div className="flex items-center justify-between gap-3 bg-ink-900 px-4 py-2">
        <SpecLabel className="text-brand-400">Recommended · best overall</SpecLabel>
        <span className="measure text-[11px] font-bold text-white">{Math.round(score * 100)}/100</span>
      </div>

      <div className="px-5 py-4">
        <p className="display-tight text-[19px] font-bold text-ink-900">{supplierName(quote.supplierId)}</p>
        <p className="measure mt-0.5 text-[11px] text-ink-400">
          {quote.id} · valid until {quote.validUntil}
        </p>

        <p className="measure display-tight mt-4 text-[34px] font-extrabold leading-none text-ink-900">
          {currency(quote.total)}
        </p>

        <ul className="mt-4 space-y-1.5">
          {strengths.map((s) =>
          <li key={s} className="flex items-center gap-2 text-[13px] font-semibold text-positive-700">
              <CheckIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              {s}
            </li>
          )}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-ink-100 px-5 py-3.5 sm:grid-cols-4">
        <Measured label="Lead time" value={`${quote.leadTimeDays}d`} size="sm" />
        <Measured label="On site" value={quote.deliveryDate} size="sm" />
        <Measured label="On-time record" value={`${supplier?.onTimeRate ?? '—'}%`} size="sm" />
        <Measured label="Terms" value={quote.terms} size="sm" />
      </dl>

      <div className="border-t border-ink-100 px-5 py-2 text-[12px] text-ink-500">{quote.availability}</div>

      <div className="flex gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-3">
        <Button
          block
          variant={selected ? 'primary' : 'secondary'}
          onClick={onSelect}
          icon={selected ? <CheckIcon className="h-4 w-4" /> : undefined}>
          
          {selected ? 'Selected for proposal' : 'Select this supplier'}
        </Button>
        <Button variant="ghost" onClick={onAsk} icon={<MessageSquareIcon className="h-4 w-4" />}>
          Ask
        </Button>
      </div>
    </Panel>);

}

function QuoteAlternative({
  entry,
  leaderTotal,
  selected,
  onSelect,
  onReject






}: {entry: Entry;leaderTotal: number;selected: boolean;onSelect: () => void;onReject: () => void;}) {
  const { quote, supplier, risks, score } = entry;
  const diff = quote.total - leaderTotal;

  return (
    <Panel className={`overflow-hidden ${selected ? 'border-brand-500' : ''}`}>
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <p className="text-[14.5px] font-bold text-ink-900">{supplierName(quote.supplierId)}</p>
          <p className="measure mt-0.5 text-[11px] text-ink-400">{quote.id}</p>
        </div>
        <span className="measure shrink-0 text-[11px] font-semibold text-ink-400">
          {Math.round(score * 100)}/100
        </span>
      </div>

      <div className="flex items-baseline gap-3 px-4 pt-2">
        <p className="measure text-[22px] font-bold leading-none text-ink-900">{currency(quote.total)}</p>
        {diff !== 0 &&
        <span
          className={`measure inline-flex items-center gap-1 text-[12px] font-bold ${
          diff > 0 ? 'text-danger-600' : 'text-positive-600'}`
          }>
          
            <TrendingDownIcon className={`h-3.5 w-3.5 ${diff > 0 ? 'rotate-180' : ''}`} />
            {diff > 0 ? '+' : ''}
            {currency(diff)}
          </span>
        }
      </div>

      <ul className="mt-3 space-y-1 px-4">
        {risks.map((r) =>
        <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink-600">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-300" aria-hidden />
            {r}
          </li>
        )}
      </ul>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink-100 px-4 py-2.5">
        <div>
          <dt className="spec-label">Lead time</dt>
          <dd className="measure mt-0.5 flex items-center gap-1 text-[13px] font-bold text-ink-900">
            <TruckIcon className="h-3.5 w-3.5 text-ink-300" />
            {quote.leadTimeDays}d
          </dd>
        </div>
        <div>
          <dt className="spec-label">On site</dt>
          <dd className="measure mt-0.5 text-[13px] font-bold text-ink-900">{quote.deliveryDate}</dd>
        </div>
        <div>
          <dt className="spec-label">On-time</dt>
          <dd className="measure mt-0.5 text-[13px] font-bold text-ink-900">{supplier?.onTimeRate ?? '—'}%</dd>
        </div>
      </dl>

      <div className="flex gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">
        <Button size="sm" variant={selected ? 'primary' : 'secondary'} className="flex-1" onClick={onSelect}>
          {selected ? 'Selected' : 'Select instead'}
        </Button>
        <Button size="sm" variant="ghost" className="text-danger-600" onClick={onReject} icon={<XIcon className="h-3.5 w-3.5" />}>
          Reject
        </Button>
      </div>
    </Panel>);

}