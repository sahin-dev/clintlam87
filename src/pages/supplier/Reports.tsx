import React, { useState } from 'react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Measured, Panel, SpecLabel, TickRule, TitleBlock } from '../../components/smpro/Primitives';
import { Cell, Denied, LedgerStrip, RecordTable, Row, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierCustomers, supplierProjects } from '../../data/supplierOrg';
import { products } from '../../data/supplierCatalog';
import { currency, qty } from '../../utils/format';

/**
 * Reporting reads as an operating review: a small number of figures that a yard
 * owner actually manages against, each with the record set behind it.
 */
export function SupplierReports() {
  const s = useSupplier();
  const [tab, setTab] = useState('sales');

  if (!s.can('reports.view')) return <Denied module="Reports" />;

  const orderValue = s.orders.reduce((sum, o) => sum + o.total, 0);
  const quoted = s.quotes.length;
  const accepted = s.quotes.filter((q) => q.status === 'Accepted').length;
  const conversion = quoted ? Math.round(accepted / quoted * 100) : 0;
  const delivered = s.deliveries.filter((d) => d.status === 'Delivered');
  const onTime = delivered.filter((d) => d.status === 'Delivered' && !d.delayReason).length;
  const outstanding = s.invoices.reduce((sum, i) => sum + (i.total - i.paid), 0);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales, fulfilment, estimating and financial performance" />

      <LedgerStrip
        items={[
        { label: 'Order value', value: currency(orderValue), tone: 'brand' },
        { label: 'Quote conversion', value: `${conversion}%`, note: `${accepted} of ${quoted} quotes` },
        {
          label: 'On-time delivery',
          value: delivered.length ? `${Math.round(onTime / delivered.length * 100)}%` : '—',
          note: `${delivered.length} completed loads`
        },
        { label: 'Outstanding', value: currency(outstanding), tone: outstanding ? 'danger' : 'default' }]
        } />
      

      <Panel className="mb-5 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'sales', label: 'Sales' },
          { value: 'operations', label: 'Operations' },
          { value: 'estimating', label: 'Estimating' },
          { value: 'financial', label: 'Financial' }]
          } />
        

        {tab === 'sales' && <SalesReport />}
        {tab === 'operations' && <OperationsReport />}
        {tab === 'estimating' && <EstimatingReport />}
        {tab === 'financial' && <FinancialReport />}
      </Panel>

      <ScopeNote>
        Every figure here is drawn from your own yard&apos;s records. Builder-side data and other
        suppliers&apos; activity are never included.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */

function SalesReport() {
  const s = useSupplier();

  const byCustomer = supplierCustomers.
  map((c) => {
    const orders = s.orders.filter((o) => o.customerId === c.id);
    const quotes = s.quotes.filter((q) => q.customerId === c.id);
    return {
      customer: c,
      orders: orders.length,
      value: orders.reduce((sum, o) => sum + o.total, 0),
      quotes: quotes.length,
      won: quotes.filter((q) => q.status === 'Accepted').length
    };
  }).
  filter((r) => r.orders > 0 || r.quotes > 0).
  sort((a, b) => b.value - a.value);

  const max = Math.max(...byCustomer.map((r) => r.value), 1);

  const byProduct = products.
  map((p) => {
    const units = s.orders.reduce(
      (sum, o) => sum + (o.lines.find((l) => l.productId === p.id)?.ordered ?? 0),
      0
    );
    return { product: p, units, value: units * p.price };
  }).
  filter((r) => r.units > 0).
  sort((a, b) => b.value - a.value);

  return (
    <div>
      <TitleBlock label="Sales by builder" reference={`${byCustomer.length} active relationships`} />
      <ul className="divide-y divide-ink-100">
        {byCustomer.map((r) =>
        <li key={r.customer.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-[13.5px] font-semibold text-ink-900">{r.customer.name}</p>
              <p className="measure text-[14px] font-semibold text-ink-900">{currency(r.value)}</p>
            </div>
            <div className="mt-2 h-[6px] w-full bg-ink-100">
              <div className="h-full bg-brand-500" style={{ width: `${r.value / max * 100}%` }} />
            </div>
            <p className="measure mt-1.5 text-[10.5px] text-ink-400">
              {`${r.orders} order${r.orders === 1 ? '' : 's'} · ${r.won} of ${r.quotes} quotes won · ${r.customer.terms}`}
            </p>
          </li>
        )}
      </ul>

      <TitleBlock label="Sales by product" reference={`${byProduct.length} SKUs sold`} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/70">
              <th scope="col" className="spec-label px-4 py-2.5">Product</th>
              <th scope="col" className="spec-label px-4 py-2.5 text-right">Units</th>
              <th scope="col" className="spec-label px-4 py-2.5 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {byProduct.map((r) =>
            <tr key={r.product.id}>
                <td className="px-4 py-3 text-[12.5px] font-medium text-ink-800">{r.product.name}</td>
                <td className="measure px-4 py-3 text-right text-[12.5px] text-ink-700">
                  {qty(r.units)} {r.product.unit}
                </td>
                <td className="measure px-4 py-3 text-right text-[12.5px] font-semibold text-ink-900">
                  {currency(r.value)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}

/* ------------------------------------------------------------------ */

function OperationsReport() {
  const s = useSupplier();
  const delivered = s.deliveries.filter((d) => d.status === 'Delivered');
  const delayed = s.deliveries.filter((d) => d.status === 'Delayed' || d.delayReason);
  const partial = s.deliveries.filter((d) => d.partialOf);
  const shortLines = s.orders.reduce(
    (sum, o) => sum + o.lines.filter((l) => (l.shortfall ?? 0) > 0).length,
    0
  );

  return (
    <div>
      <div className="grid divide-y divide-ink-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5">
          <Measured label="Loads delivered" value={String(delivered.length)} />
        </div>
        <div className="px-4 py-3.5">
          <Measured
            label="Delayed"
            value={String(delayed.length)}
            tone={delayed.length ? 'danger' : 'default'} />
          
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Partial loads" value={String(partial.length)} note="Split fulfilment" />
        </div>
        <div className="px-4 py-3.5">
          <Measured
            label="Short lines"
            value={String(shortLines)}
            tone={shortLines ? 'danger' : 'default'}
            note="Needed a buy-in" />
          
        </div>
      </div>

      <TitleBlock label="Fulfilment by order" reference={`${s.orders.length} orders`} />
      <ul className="divide-y divide-ink-100">
        {s.orders.map((o) => {
          const ordered = o.lines.reduce((sum, l) => sum + l.ordered, 0);
          const done = o.lines.reduce((sum, l) => sum + l.fulfilled, 0);
          const pct = ordered ? Math.round(done / ordered * 100) : 0;
          return (
            <li key={o.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="text-[13px] font-semibold text-ink-900">
                  {`${o.id} · ${customerName(o.customerId)}`}
                </p>
                <p className="measure text-[13px] font-semibold text-ink-900">{`${pct}%`}</p>
              </div>
              <div className="mt-2 h-[6px] w-full bg-ink-100">
                <div
                  className={`h-full ${pct === 100 ? 'bg-positive-500' : 'bg-brand-500'}`}
                  style={{ width: `${pct}%` }} />
                
              </div>
              <p className="measure mt-1.5 text-[10.5px] text-ink-400">
                {`${qty(done)} of ${qty(ordered)} units · ${o.status}`}
              </p>
            </li>);

        })}
      </ul>

      <TitleBlock label="Delay reasons" reference={`${delayed.length} events`} />
      {delayed.length === 0 ?
      <p className="px-4 py-5 text-[12.5px] text-ink-500">No delays recorded in this period.</p> :

      <ul className="divide-y divide-ink-100">
          {delayed.map((d) =>
        <li key={d.id} className="px-4 py-3">
              <p className="text-[12.5px] font-semibold text-ink-900">
                {d.id} · {customerName(d.customerId)}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                {d.delayReason ?? 'Reason not recorded'}
              </p>
            </li>
        )}
        </ul>
      }
    </div>);

}

/* ------------------------------------------------------------------ */

function EstimatingReport() {
  const s = useSupplier();

  const lines = s.rfqs.flatMap((r) => r.lines);
  const adjusted = lines.filter((l) => l.decision === 'adjusted');
  const queried = lines.filter((l) => l.decision === 'clarify');
  const meanConfidence = lines.length ?
  Math.round(lines.reduce((sum, l) => sum + l.confidence, 0) / lines.length) :
  0;

  return (
    <div>
      <div className="grid divide-y divide-ink-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5">
          <Measured label="Inbound takeoffs" value={String(s.rfqs.length)} />
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Lines reviewed" value={String(lines.length)} />
        </div>
        <div className="px-4 py-3.5">
          <Measured
            label="Adjusted by us"
            value={`${lines.length ? Math.round(adjusted.length / lines.length * 100) : 0}%`}
            tone="brand"
            note={`${adjusted.length} lines`} />
          
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Mean AI confidence" value={`${meanConfidence}%`} />
        </div>
      </div>

      <TitleBlock label="By estimator" reference={`${s.rfqs.length} requests`} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/70">
              <th scope="col" className="spec-label px-4 py-2.5">Estimator</th>
              <th scope="col" className="spec-label px-4 py-2.5 text-right">Assigned</th>
              <th scope="col" className="spec-label px-4 py-2.5 text-right">Quoted</th>
              <th scope="col" className="spec-label px-4 py-2.5 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {s.staff.
            filter((st) => st.roles.includes('estimator')).
            map((st) => {
              const mine = s.rfqs.filter((r) => r.estimatorId === st.id);
              return (
                <tr key={st.id}>
                    <td className="px-4 py-3 text-[12.5px] font-medium text-ink-800">{st.name}</td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] text-ink-700">{mine.length}</td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] text-ink-700">
                      {mine.filter((r) => r.status === 'Quoted' || r.status === 'Completed').length}
                    </td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] font-semibold text-ink-900">
                      {mine.filter((r) => r.status !== 'Quoted' && r.status !== 'Completed').length}
                    </td>
                  </tr>);

            })}
          </tbody>
        </table>
      </div>

      <TitleBlock label="Where we disagreed with the AI" reference={`${adjusted.length + queried.length} lines`} />
      {adjusted.length + queried.length === 0 ?
      <p className="px-4 py-5 text-[12.5px] text-ink-500">
          Nothing adjusted or queried yet on the inbound takeoffs.
        </p> :

      <ul className="divide-y divide-ink-100">
          {[...adjusted, ...queried].map((l) =>
        <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-ink-900">{l.material}</p>
                <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                  {`${l.sheet} · page ${l.page} · ${l.confidence}% confidence`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {l.decision === 'adjusted' ?
            <span className="measure text-[12px] font-semibold text-ink-900">
                    {`${qty(l.builderQty)} → ${qty(l.supplierQty ?? l.builderQty)} ${l.unit}`}
                  </span> :

            <Badge tone="caution" dot={false}>
                    Queried
                  </Badge>
            }
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}

/* ------------------------------------------------------------------ */

function FinancialReport() {
  const s = useSupplier();

  const invoiced = s.invoices.reduce((sum, i) => sum + i.total, 0);
  const collected = s.invoices.reduce((sum, i) => sum + i.paid, 0);
  const overdue = s.invoices.
  filter((i) => i.status === 'Overdue' || i.status === 'Failed').
  reduce((sum, i) => sum + (i.total - i.paid), 0);

  const byProject = supplierProjects.
  map((p) => {
    const invs = s.invoices.filter((i) => i.projectId === p.id);
    return {
      project: p,
      invoiced: invs.reduce((sum, i) => sum + i.total, 0),
      outstanding: invs.reduce((sum, i) => sum + (i.total - i.paid), 0)
    };
  }).
  filter((r) => r.invoiced > 0);

  return (
    <div>
      <div className="grid divide-y divide-ink-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5">
          <Measured label="Invoiced" value={currency(invoiced)} />
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Collected" value={currency(collected)} tone="positive" />
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Outstanding" value={currency(invoiced - collected)} tone="brand" />
        </div>
        <div className="px-4 py-3.5">
          <Measured label="Overdue" value={currency(overdue)} tone={overdue ? 'danger' : 'default'} />
        </div>
      </div>

      <TitleBlock label="By project" reference={`${byProject.length} projects invoiced`} />
      <ul className="divide-y divide-ink-100">
        {byProject.map((r) =>
        <li key={r.project.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900">{r.project.name}</p>
              <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                {customerName(r.project.customerId)} · {r.project.number}
              </p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <SpecLabel>Invoiced</SpecLabel>
                <p className="measure mt-0.5 text-[12.5px] font-semibold text-ink-900">
                  {currency(r.invoiced)}
                </p>
              </div>
              <div>
                <SpecLabel>Outstanding</SpecLabel>
                <p
                className={`measure mt-0.5 text-[12.5px] font-semibold ${
                r.outstanding ? 'text-brand-600' : 'text-positive-700'}`
                }>
                
                  {r.outstanding ? currency(r.outstanding) : 'Settled'}
                </p>
              </div>
            </div>
          </li>
        )}
      </ul>

      <TitleBlock label="Payments received" reference={`${s.payments.length} records`} />
      <RecordTable
        caption="Payments"
        columns={[
        { key: 'p', label: 'Payment' },
        { key: 'c', label: 'Builder', hideBelow: 'sm' },
        { key: 'm', label: 'Method', hideBelow: 'md' },
        { key: 'a', label: 'Amount', align: 'right' }]
        }>
        
        {s.payments.map((p) =>
        <Row key={p.id}>
            <Cell strong>{p.id}</Cell>
            <Cell hideBelow="sm">{customerName(p.customerId)}</Cell>
            <Cell muted hideBelow="md">
              {p.method}
            </Cell>
            <Cell align="right" mono strong>
              {currency(p.amount)}
            </Cell>
          </Row>
        )}
      </RecordTable>
      <TickRule />
    </div>);

}