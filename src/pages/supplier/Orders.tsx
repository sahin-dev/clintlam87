import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, ClipboardCheckIcon, PackageIcon, ReceiptIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Panel, SpecLabel, SpecRow, TickRule, TitleBlock, WorkHeading } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordHeader,
  RecordTable,
  Row } from
'../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjectName } from '../../data/supplierOrg';
import { available, productById, vendorPurchaseOrders } from '../../data/supplierCatalog';
import { currency, qty } from '../../utils/format';
import { SalesOrderStatus } from '../../types/supplier';

const OPEN: SalesOrderStatus[] = [
'New',
'Confirmed',
'Processing',
'Partially Fulfilled',
'Ready for Delivery',
'Out for Delivery'];


/** Next operational step for an order, so every row states what to do. */
const NEXT_STATUS: Partial<Record<SalesOrderStatus, {to: SalesOrderStatus;label: string;}>> = {
  New: { to: 'Confirmed', label: 'Confirm order' },
  Confirmed: { to: 'Processing', label: 'Start picking' },
  Processing: { to: 'Ready for Delivery', label: 'Mark ready' },
  'Partially Fulfilled': { to: 'Ready for Delivery', label: 'Release next load' },
  'Ready for Delivery': { to: 'Out for Delivery', label: 'Send to dispatch' },
  Delivered: { to: 'Completed', label: 'Close order' }
};

export function SupplierOrders() {
  const navigate = useNavigate();
  const { orders, can } = useSupplier();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');

  if (!can('order.view')) return <Denied module="Sales orders" />;

  const filtered = useMemo(() => {
    const byTab = orders.filter((o) =>
    tab === 'open' ?
    OPEN.includes(o.status) :
    tab === 'delivered' ?
    o.status === 'Delivered' :
    tab === 'closed' ?
    o.status === 'Completed' || o.status === 'Cancelled' :
    true
    );
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((o) =>
    [o.id, o.quoteId, customerName(o.customerId), supplierProjectName(o.projectId)].
    join(' ').
    toLowerCase().
    includes(q)
    );
  }, [orders, tab, query]);

  const openValue = orders.filter((o) => OPEN.includes(o.status)).reduce((s, o) => s + o.total, 0);
  const shortLines = orders.reduce(
    (s, o) => s + o.lines.filter((l) => (l.shortfall ?? 0) > 0).length,
    0
  );

  return (
    <div>
      <PageHeader
        title="Sales orders"
        subtitle="Accepted quotes moving through picking, buy-ins and dispatch" />
      

      <LedgerStrip
        items={[
        { label: 'Open orders', value: String(orders.filter((o) => OPEN.includes(o.status)).length) },
        { label: 'Open value', value: currency(openValue), tone: 'brand' },
        {
          label: 'Awaiting picking',
          value: String(orders.filter((o) => o.status === 'Confirmed' || o.status === 'New').length)
        },
        {
          label: 'Short lines',
          value: String(shortLines),
          note: 'Covered by vendor buy-ins',
          tone: shortLines ? 'danger' : 'default'
        }]
        } />
      

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'open', label: 'Open', count: orders.filter((o) => OPEN.includes(o.status)).length },
          { value: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'Delivered').length },
          {
            value: 'closed',
            label: 'Closed',
            count: orders.filter((o) => o.status === 'Completed' || o.status === 'Cancelled').length
          },
          { value: 'all', label: 'All', count: orders.length }]
          } />
        
      </Panel>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by order, quote, builder or project" />
      

      {filtered.length === 0 ?
      <EmptyOrders query={query} /> :

      <RecordTable
        caption="Sales orders"
        columns={[
        { key: 'order', label: 'Order' },
        { key: 'builder', label: 'Builder / project' },
        { key: 'fulfilled', label: 'Fulfilled', align: 'right' },
        { key: 'requested', label: 'Requested', hideBelow: 'md' },
        { key: 'total', label: 'Value', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {filtered.map((o) => {
          const ordered = o.lines.reduce((s, l) => s + l.ordered, 0);
          const done = o.lines.reduce((s, l) => s + l.fulfilled, 0);
          const pct = ordered ? Math.round(done / ordered * 100) : 0;
          const short = o.lines.some((l) => (l.shortfall ?? 0) > 0);
          return (
            <Row
              key={o.id}
              onClick={() => navigate(`/supplier/orders/${o.id}`)}
              spine={short ? 'danger' : pct === 100 ? 'positive' : 'brand'}>
              
                <Cell strong>
                  {o.id}
                  <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                    from {o.quoteId} · placed {o.placed}
                  </span>
                </Cell>
                <Cell>
                  {customerName(o.customerId)}
                  <span className="mt-0.5 block text-[11.5px] text-ink-400">
                    {supplierProjectName(o.projectId)}
                  </span>
                </Cell>
                <Cell align="right" mono strong>
                  {`${pct}%`}
                  {short &&
                <span className="spec-label mt-0.5 block text-danger-600">Short qty</span>
                }
                </Cell>
                <Cell mono muted hideBelow="md">
                  {o.requestedDate}
                </Cell>
                <Cell align="right" mono strong>
                  {currency(o.total)}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={o.status} />
                </Cell>
              </Row>);

        })}
        </RecordTable>
      }
    </div>);

}

function EmptyOrders({ query }: {query: string;}) {
  const navigate = useNavigate();
  return (
    <Panel className="flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
        <PackageIcon className="h-5 w-5" />
      </span>
      <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">
        {query ? 'No orders match that search' : 'No sales orders here yet'}
      </h2>
      <p className="mt-2 max-w-[400px] text-[13px] leading-relaxed text-ink-500">
        {query ?
        'Try an order number, quote number, builder or project name.' :
        'A sales order is created the moment a builder accepts one of your quotes.'}
      </p>
      {!query &&
      <Button variant="secondary" className="mt-5" onClick={() => navigate('/supplier/quotes')}>
          Review open quotes
        </Button>
      }
    </Panel>);

}

/* ------------------------------------------------------------------ */
/* Order detail                                                        */
/* ------------------------------------------------------------------ */

export function SupplierOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const order = s.orders.find((o) => o.id === orderId);

  if (!s.can('order.view')) return <Denied module="Sales orders" />;
  if (!order) return <Denied module="This order" />;

  const ordered = order.lines.reduce((s2, l) => s2 + l.ordered, 0);
  const done = order.lines.reduce((s2, l) => s2 + l.fulfilled, 0);
  const pct = ordered ? Math.round(done / ordered * 100) : 0;
  const next = NEXT_STATUS[order.status];
  const loads = s.deliveries.filter((d) => d.orderId === order.id);
  const buyIns = vendorPurchaseOrders.filter((v) => v.forOrderId === order.id);
  const invoice = s.invoices.find((i) => i.orderId === order.id);

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/orders"
        eyebrow="Sales order"
        title={order.id}
        reference={`${customerName(order.customerId)} · ${supplierProjectName(order.projectId)}`}
        status={<StatusBadge status={order.status} />}
        actions={
        next &&
        s.can('order.manage') &&
        <Button
          size="sm"
          onClick={() => {
            /* Confirming is the one transition the builder must receive as a
               document — the rest are internal yard progress. */
            if (next.to === 'Confirmed') s.confirmOrder(order.id);else
            s.setOrderStatus(order.id, next.to);
            s.toast({
              tone: 'success',
              title: `${order.id} → ${next.to}`,
              body:
              next.to === 'Confirmed' ?
              'The builder’s purchase order now shows the yard has accepted it.' :
              'Recorded against this order.'
            });
          }}
          icon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
          
              {next.label}
            </Button>

        }
        facts={[
        { label: 'From quote', value: order.quoteId },
        { label: 'Placed', value: order.placed },
        { label: 'Requested on site', value: order.requestedDate },
        { label: 'Terms', value: order.terms },
        { label: 'Order value', value: currency(order.total) }]
        } />
      

      {/* Fulfilment */}
      <Panel className="mb-5 overflow-hidden">
        <TitleBlock
          label="Fulfilment"
          title={`${pct}% of ordered quantity picked`}
          reference={`${qty(done)} / ${qty(ordered)} units`} />
        
        <div className="h-[6px] w-full bg-ink-100">
          <div
            className={`h-full ${pct === 100 ? 'bg-positive-500' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }} />
          
        </div>
        <ul className="divide-y divide-ink-100">
          {order.lines.map((l) => {
            const product = productById(l.productId);
            const remaining = l.ordered - l.fulfilled;
            const short = l.shortfall ?? 0;
            const stock = product ? available(product) : 0;
            return (
              <li key={l.productId} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink-900">{l.description}</p>
                    <p className="measure mt-1 text-[11px] text-ink-400">
                      {product?.sku ?? '—'} · {currency(l.unitPrice * l.ordered)} at $
                      {l.unitPrice.toFixed(2)}/{l.unit}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-6">
                    <div className="text-right">
                      <SpecLabel>Ordered</SpecLabel>
                      <p className="measure mt-0.5 text-[13px] font-semibold text-ink-900">
                        {qty(l.ordered)} {l.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <SpecLabel>Fulfilled</SpecLabel>
                      <p className="measure mt-0.5 text-[13px] font-semibold text-positive-700">
                        {qty(l.fulfilled)} {l.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <SpecLabel>Remaining</SpecLabel>
                      <p
                        className={`measure mt-0.5 text-[13px] font-semibold ${
                        remaining ? 'text-ink-900' : 'text-ink-300'}`
                        }>
                        
                        {qty(remaining)} {l.unit}
                      </p>
                    </div>
                  </div>
                </div>

                {short > 0 &&
                <p className="mt-2.5 border-l-2 border-danger-400 pl-2.5 text-[12px] leading-relaxed text-ink-600">
                    <span className="font-semibold text-danger-700">
                      {qty(short)} {l.unit} short at the yard
                    </span>{' '}
                    — {qty(stock)} {l.unit} available now. Covered by a vendor buy-in below.
                  </p>
                }
              </li>);

          })}
        </ul>
      </Panel>

      {/* Buy-ins covering shortfalls */}
      {buyIns.length > 0 &&
      <Panel className="mb-5 overflow-hidden">
          <TitleBlock label="Buy-ins for this order" reference={`${buyIns.length} vendor POs`} />
          <ul className="divide-y divide-ink-100">
            {buyIns.map((v) =>
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">
                    {v.id} · {v.vendor}
                  </p>
                  <p className="measure mt-0.5 text-[11px] text-ink-400">
                    {qty(v.qty)} {v.unit} · {productById(v.productId)?.name ?? 'Product'} · ETA {v.eta}
                  </p>
                </div>
                <StatusBadge status={v.status === 'In Transit' ? 'Dispatched' : v.status} />
              </li>
          )}
          </ul>
        </Panel>
      }

      {/* Loads */}
      <WorkHeading
        label="Deliver"
        title="Loads against this order"
        count={`${loads.length}`}
        action={
        s.can('delivery.view') &&
        <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/deliveries')}>
              Dispatch board
            </Button>

        } />
      
      {loads.length === 0 ?
      <Panel className="mb-5 px-4 py-8 text-center">
          <p className="text-[13px] text-ink-500">
            No loads scheduled yet. Dispatch creates a load once the order is ready for delivery.
          </p>
        </Panel> :

      <Panel className="mb-5 overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {loads.map((d) =>
          <li key={d.id}>
                <button
              onClick={() => navigate(`/supplier/deliveries/${d.id}`)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
              
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {d.id} · {d.date} {d.window}
                    </p>
                    <p className="measure mt-0.5 text-[11px] text-ink-400">
                      {d.truck ?? 'No truck'} · {d.items.length} line
                      {d.items.length > 1 ? 's' : ''}
                      {d.partialOf && ` · load ${d.partialOf.deliveryNo} of ${d.partialOf.ofTotal}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {d.pod && <span className="spec-label text-positive-700">POD signed</span>}
                    <StatusBadge status={d.status} />
                  </div>
                </button>
              </li>
          )}
          </ul>
        </Panel>
      }

      {/* Commercial + billing */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <TitleBlock label="Delivery instructions" />
          <dl className="divide-y divide-ink-100 px-4 py-1">
            <SpecRow label="Address" value={order.deliveryAddress} />
            <SpecRow label="Site contact" value={order.siteContact} />
            <SpecRow label="Requested date" value={order.requestedDate} mono />
          </dl>
        </Panel>

        <Panel className="overflow-hidden">
          <TitleBlock label="Billing" reference={invoice ? invoice.id : 'Not invoiced'} />
          {invoice ?
          <>
              <dl className="divide-y divide-ink-100 px-4 py-1">
                <SpecRow label="Invoice" value={invoice.id} />
                <SpecRow label="Issued" value={invoice.issued} mono />
                <SpecRow label="Due" value={invoice.due} mono />
                <SpecRow label="Total" value={currency(invoice.total)} mono />
                <SpecRow label="Status" value={<StatusBadge status={invoice.status} />} />
              </dl>
              <TickRule />
              <div className="px-4 py-3">
                <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/supplier/invoices/${invoice.id}`)}
                icon={<ReceiptIcon className="h-3.5 w-3.5" />}>
                
                  Open invoice
                </Button>
              </div>
            </> :

          <div className="px-4 py-6">
              <p className="text-[13px] leading-relaxed text-ink-500">
                Nothing billed yet. An invoice can be raised once a load is delivered and its POD is
                signed.
              </p>
              {s.can('invoice.manage') &&
            <Button
              size="sm"
              variant="secondary"
              className="mt-3.5"
              disabled={!loads.some((l) => l.pod)}
              onClick={() => navigate('/supplier/invoices')}
              icon={<ClipboardCheckIcon className="h-3.5 w-3.5" />}>
              
                  {loads.some((l) => l.pod) ? 'Raise invoice' : 'Waiting on a signed POD'}
                </Button>
            }
            </div>
          }
        </Panel>
      </div>
    </div>);

}