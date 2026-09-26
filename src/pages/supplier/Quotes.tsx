import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SendIcon, ShoppingCartIcon, TagIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, InlineAlert } from '../../components/ui/Feedback';
import { Panel, SpecLabel, SpecRow, TitleBlock, WorkHeading, TickRule } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordHeader,
  RecordTable,
  Row,
  ScopeNote } from
'../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjectName } from '../../data/supplierOrg';
import { productById } from '../../data/supplierCatalog';
import { quoteSubtotal, quoteTotal } from '../../data/supplierSales';
import { currency, qty } from '../../utils/format';

const FILTERS = ['All', 'Draft', 'Sent', 'Accepted', 'Revision Requested', 'Expired'];

export function Quotes() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  if (!s.can('quote.view')) return <Denied module="Quotes" />;

  const rows = s.quotes.filter((q) => {
    const matchesFilter = filter === 'All' || q.status === filter;
    const term = query.trim().toLowerCase();
    return (
      matchesFilter && (
      !term ||
      q.id.toLowerCase().includes(term) ||
      customerName(q.customerId).toLowerCase().includes(term) ||
      supplierProjectName(q.projectId).toLowerCase().includes(term)));

  });

  const out = s.quotes.filter((q) => q.status === 'Sent' || q.status === 'Viewed');
  const won = s.quotes.filter((q) => q.status === 'Accepted');

  return (
    <div>
      <PageHeader
        title="Quotes"
        subtitle="Every revision is kept — a builder can always see which version they accepted and why it changed" />
      

      <LedgerStrip
        items={[
        { label: 'Out for decision', value: String(out.length), tone: 'brand' },
        { label: 'Value out', value: currency(out.reduce((sum, q) => sum + quoteTotal(q), 0), { compact: true }) },
        { label: 'Accepted', value: String(won.length), tone: 'positive' },
        {
          label: 'Revision requested',
          value: String(s.quotes.filter((q) => q.status === 'Revision Requested').length),
          tone: 'danger'
        }]
        } />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by quote, builder or project…"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState
        icon={<TagIcon className="h-5 w-5" />}
        title="No quotes match"
        body="Quotes are created from a completed estimate." /> :


      <RecordTable
        caption="Quotes issued"
        columns={[
        { key: 'id', label: 'Quote' },
        { key: 'builder', label: 'Builder / project' },
        { key: 'version', label: 'Ver.', align: 'right' },
        { key: 'total', label: 'Total', align: 'right' },
        { key: 'valid', label: 'Valid until', hideBelow: 'sm' },
        { key: 'seen', label: 'Builder activity', hideBelow: 'lg' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {rows.map((q) =>
        <Row
          key={q.id}
          onClick={() => navigate(`/supplier/quotes/${q.id}`)}
          spine={
          q.status === 'Revision Requested' ?
          'danger' :
          q.status === 'Accepted' ?
          'positive' :
          q.status === 'Expired' ?
          undefined :
          'brand'
          }>
          
              <Cell strong mono>
                {q.id}
              </Cell>
              <Cell>
                {customerName(q.customerId)}
                <span className="mt-0.5 block text-[11.5px] text-ink-400">{supplierProjectName(q.projectId)}</span>
              </Cell>
              <Cell align="right" mono>
                {`v${q.version}`}
              </Cell>
              <Cell align="right" mono strong>
                {currency(quoteTotal(q))}
              </Cell>
              <Cell hideBelow="sm" mono muted>
                {q.validUntil}
              </Cell>
              <Cell hideBelow="lg" muted>
                {q.viewedAt ? `Viewed ${q.viewedAt}` : q.sentAt ? `Sent ${q.sentAt}` : 'Not sent'}
              </Cell>
              <Cell align="right">
                <StatusBadge status={q.status} dot={false} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }
    </div>);

}

export function QuoteDetail() {
  const { quoteId = '' } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const quote = s.quotes.find((q) => q.id === quoteId);

  if (!s.can('quote.view')) return <Denied module="Quotes" />;
  if (!quote) return <Denied module="This quote" />;

  const subtotal = quoteSubtotal(quote);
  const total = quoteTotal(quote);
  const order = s.orders.find((o) => o.quoteId === quote.id);

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/quotes"
        eyebrow={`Quote · ${customerName(quote.customerId)}`}
        title={supplierProjectName(quote.projectId)}
        reference={`${quote.id} · VERSION ${quote.version} · FROM ${quote.rfqId}`}
        status={<StatusBadge status={quote.status} />}
        actions={
        <>
            {s.can('quote.create') && quote.status === 'Revision Requested' &&
          <Button
            size="sm"
            onClick={() => navigate(`/supplier/estimates/${quote.estimateId}`)}
            icon={<TagIcon className="h-4 w-4" />}>
            
                Build revision v{quote.version + 1}
              </Button>
          }
            {s.can('quote.create') && quote.status === 'Draft' &&
          <Button
            size="sm"
            icon={<SendIcon className="h-4 w-4" />}
            onClick={() => {
              s.sendQuote(quote.id);
              s.toast({
                tone: 'success',
                title: 'Quote sent',
                body: `${quote.id} is now on the builder’s request, priced and ready to compare.`
              });
            }}>
            
                Send to builder
              </Button>
          }
            {order && s.can('order.view') &&
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/supplier/orders/${order.id}`)}
            icon={<ShoppingCartIcon className="h-4 w-4" />}>
            
                Open {order.id}
              </Button>
          }
          </>
        }
        facts={[
        { label: 'Total', value: currency(total) },
        { label: 'Valid until', value: quote.validUntil },
        { label: 'Prepared by', value: quote.createdBy },
        { label: 'Sent', value: quote.sentAt ?? 'Not sent' },
        { label: 'Builder viewed', value: quote.viewedAt ?? '—' }]
        } />
      

      <div className="space-y-6">
        {quote.revisionRequest &&
        <InlineAlert
          tone="warning"
          title="The builder asked for a revision"
          body={`${quote.revisionRequest.note} — ${quote.revisionRequest.by}, ${quote.revisionRequest.at}`} />

        }

        {quote.status === 'Expired' &&
        <InlineAlert
          tone="danger"
          title="This quote has expired"
          body={`Pricing was held to ${quote.validUntil}. Re-issue it as a new version if the builder still wants the package.`} />

        }

        <section>
          <WorkHeading label="Priced scope" title="What the builder receives" count={`${quote.lines.length} lines`} />
          <RecordTable
            caption="Quote lines"
            columns={[
            { key: 'product', label: 'Product' },
            { key: 'sku', label: 'SKU', hideBelow: 'md' },
            { key: 'qty', label: 'Qty', align: 'right' },
            { key: 'price', label: 'Unit price', align: 'right' },
            { key: 'total', label: 'Line total', align: 'right' }]
            }>
            
            {quote.lines.map((l) =>
            <Row key={l.productId}>
                <Cell strong>{l.description}</Cell>
                <Cell hideBelow="md" mono muted>
                  {productById(l.productId)?.sku}
                </Cell>
                <Cell align="right" mono>
                  {qty(l.qty)}
                  <span className="ml-1 text-[10px] font-medium text-ink-400">{l.unit}</span>
                </Cell>
                <Cell align="right" mono>
                  ${l.unitPrice.toFixed(2)}
                </Cell>
                <Cell align="right" mono strong>
                  {currency(l.qty * l.unitPrice)}
                </Cell>
              </Row>
            )}
          </RecordTable>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel className="overflow-hidden">
            <TitleBlock label="Totals" reference={`TAX ${quote.taxRate}%`} />
            <dl className="px-4 py-1">
              <SpecRow label="Subtotal" value={currency(subtotal)} mono />
              <SpecRow label="Discount" value={quote.discount ? `− ${currency(quote.discount)}` : '—'} mono />
              <SpecRow label="Delivery" value={currency(quote.deliveryFee)} mono />
              <SpecRow label="Tax" value={currency(Math.round((subtotal - quote.discount + quote.deliveryFee) * (quote.taxRate / 100)))} mono />
            </dl>
            <div className="flex items-baseline justify-between gap-4 border-t border-ink-200 bg-ink-50/70 px-4 py-3">
              <SpecLabel>Quote total</SpecLabel>
              <span className="measure text-[20px] font-bold text-ink-900">{currency(total)}</span>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <TitleBlock label="Terms" title="What we committed to" />
            <p className="px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-600">{quote.terms}</p>
          </Panel>
        </div>

        <section>
          <WorkHeading
            label="Version history"
            title="Nothing is overwritten"
            count={`${quote.revisions.length} versions`} />
          
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-ink-100">
              {[...quote.revisions].reverse().map((r) =>
              <li
                key={r.version}
                className={`flex flex-wrap items-start gap-x-5 gap-y-1.5 px-4 py-3 ${
                r.status === 'Current' ? 'bg-brand-50/40' : ''}`
                }>
                
                  <span className="measure w-14 shrink-0 text-[12.5px] font-semibold text-ink-900">
                    {`v${r.version}`}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-ink-700">{r.reason}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">
                      {r.changedBy} · {r.at}
                    </span>
                  </span>
                  <span className="measure shrink-0 text-[12.5px] font-bold text-ink-900">
                    {currency(r.total)}
                  </span>
                  <StatusBadge status={r.status === 'Current' ? 'Selected' : 'Closed'} dot={false} />
                </li>
              )}
            </ul>
          </Panel>
        </section>

        <Panel className="overflow-hidden">
          <TitleBlock label="Source" title="Where these quantities came from" />
          <TickRule />
          <dl className="px-4 py-1">
            <SpecRow label="Request" value={quote.rfqId} mono />
            <SpecRow label="Estimate" value={quote.estimateId} mono />
            <SpecRow label="Builder takeoff" value={s.rfqs.find((r) => r.id === quote.rfqId)?.takeoffRef ?? '—'} mono />
            <SpecRow label="Plan revision" value={s.rfqs.find((r) => r.id === quote.rfqId)?.revision ?? '—'} mono />
          </dl>
        </Panel>

        <ScopeNote>
          {customerName(quote.customerId)} sees this quote only. No other builder — and no other supplier —
          can see these prices.
        </ScopeNote>
      </div>
    </div>);

}