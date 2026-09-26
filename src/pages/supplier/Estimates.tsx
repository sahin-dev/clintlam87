import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileTextIcon, TagIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, InlineAlert } from '../../components/ui/Feedback';
import { Panel, SpecLabel, TitleBlock, WorkHeading, Measured, TickRule } from '../../components/smpro/Primitives';
import { Cell, Denied, RecordHeader, RecordTable, Row, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjectName } from '../../data/supplierOrg';
import { available, productById, products } from '../../data/supplierCatalog';
import { pricingRules } from '../../data/supplierCatalog';
import { EstimateLine } from '../../types/supplier';
import { currency, qty } from '../../utils/format';

export function Estimates() {
  const navigate = useNavigate();
  const s = useSupplier();
  if (!s.can('estimate.manage')) return <Denied module="Estimates" />;

  return (
    <div>
      <PageHeader
        title="Estimates"
        subtitle="Builder quantities mapped to yard products, with waste, cost and margin held on our side" />
      

      {s.estimates.length === 0 ?
      <EmptyState
        icon={<FileTextIcon className="h-5 w-5" />}
        title="No estimates yet"
        body="Estimates are created from a reviewed takeoff." /> :


      <RecordTable
        caption="Estimates in progress"
        columns={[
        { key: 'id', label: 'Estimate' },
        { key: 'builder', label: 'Builder / project' },
        { key: 'lines', label: 'Lines', align: 'right' },
        { key: 'value', label: 'Sell value', align: 'right' },
        { key: 'margin', label: 'Margin', align: 'right', hideBelow: 'sm' },
        { key: 'estimator', label: 'Estimator', hideBelow: 'lg' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {s.estimates.map((e) => {
          const sell = e.lines.reduce((sum, l) => sum + l.sellQty * l.unitPrice, 0);
          const cost = e.lines.reduce((sum, l) => sum + l.sellQty * l.unitCost, 0);
          const margin = sell ? Math.round((sell - cost) / sell * 100) : 0;
          return (
            <Row key={e.id} onClick={() => navigate(`/supplier/estimates/${e.id}`)}>
                <Cell strong mono>
                  {e.id}
                  <span className="mt-0.5 block text-[10.5px] font-medium text-ink-400">from {e.rfqId}</span>
                </Cell>
                <Cell>
                  {customerName(e.customerId)}
                  <span className="mt-0.5 block text-[11.5px] text-ink-400">{supplierProjectName(e.projectId)}</span>
                </Cell>
                <Cell align="right" mono>
                  {e.lines.length}
                </Cell>
                <Cell align="right" mono strong>
                  {sell ? currency(sell) : '—'}
                </Cell>
                <Cell align="right" mono hideBelow="sm">
                  {sell ? `${margin}%` : '—'}
                </Cell>
                <Cell hideBelow="lg" muted>
                  {e.estimator}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={e.status === 'Ready for Quote' ? 'Approved' : e.status} dot={false} />
                </Cell>
              </Row>);

        })}
        </RecordTable>
      }

      <ScopeNote>
        Cost and margin are internal. A builder only ever sees the sell price on the quote.
      </ScopeNote>
    </div>);

}

/**
 * The estimate builder. One row per reviewed takeoff line: the quantity we
 * agreed, waste, the SKU it maps to, availability, cost, margin and sell price.
 */
export function EstimateBuilder() {
  const { estimateId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const s = useSupplier();

  const existing = s.estimates.find((e) => e.id === estimateId);
  const rfqId = existing?.rfqId ?? params.get('rfq') ?? '';
  const rfq = s.rfqs.find((r) => r.id === rfqId);

  /* Seed lines from the reviewed takeoff when the estimate is still empty. */
  const seeded: EstimateLine[] = useMemo(() => {
    if (existing && existing.lines.length) return existing.lines;
    if (!rfq) return [];
    return rfq.lines.
    filter((l) => l.decision === 'accepted' || l.decision === 'adjusted').
    map((l, i) => {
      const product = productById(l.productId) ?? products[i % products.length];
      const contract = pricingRules.find(
        (r) => r.customerId === rfq.customerId && r.productId === product.id
      );
      const takeoffQty = l.supplierQty ?? l.builderQty;
      const waste = 5;
      return {
        id: `el-new-${l.id}`,
        takeoffLineId: l.id,
        material: l.material,
        productId: product.id,
        takeoffQty,
        wastePercent: waste,
        sellQty: Math.ceil(takeoffQty * (1 + waste / 100)),
        unit: l.unit,
        unitCost: product.cost,
        marginPercent: Math.round(((contract?.contract ?? product.price) - product.cost) / (contract?.contract ?? product.price) * 100),
        unitPrice: contract?.contract ?? product.price
      };
    });
  }, [existing, rfq]);

  const [lines, setLines] = useState<EstimateLine[]>(seeded);

  if (!s.can('estimate.manage')) return <Denied module="Estimates" />;
  if (!rfq) return <Denied module="This estimate" />;

  const setLine = (id: string, patch: Partial<EstimateLine>) =>
  setLines((prev) =>
  prev.map((l) => {
    if (l.id !== id) return l;
    const next = { ...l, ...patch };
    next.sellQty = Math.ceil(next.takeoffQty * (1 + next.wastePercent / 100));
    next.unitPrice = Number((next.unitCost / (1 - next.marginPercent / 100)).toFixed(2));
    return next;
  })
  );

  const sell = lines.reduce((sum, l) => sum + l.sellQty * l.unitPrice, 0);
  const cost = lines.reduce((sum, l) => sum + l.sellQty * l.unitCost, 0);
  const margin = sell ? Math.round((sell - cost) / sell * 100) : 0;
  const shortLines = lines.filter((l) => {
    const p = productById(l.productId);
    return p ? available(p) < l.sellQty : false;
  });

  return (
    <div>
      <RecordHeader
        backTo={`/supplier/takeoffs/${rfq.id}`}
        eyebrow={`Estimate · ${customerName(rfq.customerId)}`}
        title={supplierProjectName(rfq.projectId)}
        reference={`${existing?.id ?? 'NEW ESTIMATE'} · FROM ${rfq.id} · ${rfq.takeoffRef} ${rfq.revision}`}
        status={<StatusBadge status={existing?.status === 'Ready for Quote' ? 'Approved' : 'Draft'} dot={false} />}
        actions={
        s.can('quote.create') ?
        <Button
          size="sm"
          icon={<TagIcon className="h-4 w-4" />}
          onClick={() => {
            s.setRfqStatus(rfq.id, 'Quoted');
            s.toast({
              tone: 'success',
              title: 'Estimate ready to quote',
              body: `${lines.length} lines at ${currency(sell)}.`
            });
            navigate('/supplier/quotes');
          }}>
          
              Create quote
            </Button> :
        undefined
        }
        facts={[
        { label: 'Lines', value: String(lines.length) },
        { label: 'Sell value', value: currency(sell) },
        { label: 'Cost', value: currency(cost) },
        { label: 'Margin', value: `${margin}%` },
        { label: 'Estimator', value: s.user.name }]
        } />
      

      <div className="space-y-5">
        {shortLines.length > 0 &&
        <InlineAlert
          tone="warning"
          title={`${shortLines.length} line${shortLines.length > 1 ? 's' : ''} exceed available yard stock`}
          body="You can still quote them — the shortfall becomes a buy-in when the order lands. Lead time will affect the delivery date you promise." />

        }

        <section>
          <WorkHeading
            label="Product mapping"
            title="Takeoff line → yard product"
            count={`${lines.length} lines`} />
          
          <RecordTable
            caption="Estimate lines"
            columns={[
            { key: 'material', label: 'Takeoff line' },
            { key: 'product', label: 'Yard product' },
            { key: 'qty', label: 'Qty', align: 'right' },
            { key: 'waste', label: 'Waste', align: 'right', hideBelow: 'sm' },
            { key: 'sell', label: 'Sell qty', align: 'right' },
            { key: 'avail', label: 'Available', align: 'right', hideBelow: 'md' },
            { key: 'cost', label: 'Cost', align: 'right', hideBelow: 'lg' },
            { key: 'margin', label: 'Margin', align: 'right', hideBelow: 'lg' },
            { key: 'price', label: 'Unit price', align: 'right' },
            { key: 'total', label: 'Line total', align: 'right' }]
            }>
            
            {lines.map((l) => {
              const p = productById(l.productId);
              const avail = p ? available(p) : 0;
              const short = avail < l.sellQty;
              return (
                <Row key={l.id} spine={short ? 'caution' : undefined}>
                  <Cell strong>{l.material}</Cell>
                  <Cell>
                    <select
                      value={l.productId}
                      onChange={(e) => {
                        const next = productById(e.target.value);
                        setLine(l.id, {
                          productId: e.target.value,
                          unitCost: next?.cost ?? l.unitCost
                        });
                      }}
                      aria-label={`Product for ${l.material}`}
                      className="w-full max-w-[220px] rounded-[2px] border border-ink-200 bg-white px-2 py-1 text-[11.5px] font-semibold text-ink-800">
                      
                      {products.map((op) =>
                      <option key={op.id} value={op.id}>
                          {op.sku}
                        </option>
                      )}
                    </select>
                    <span className="mt-0.5 block truncate text-[10.5px] text-ink-400">{p?.name}</span>
                  </Cell>
                  <Cell align="right" mono>
                    {qty(l.takeoffQty)}
                    <span className="ml-1 text-[10px] font-medium text-ink-400">{l.unit}</span>
                  </Cell>
                  <Cell align="right" hideBelow="sm">
                    <input
                      type="number"
                      value={l.wastePercent}
                      onChange={(e) => setLine(l.id, { wastePercent: Number(e.target.value) })}
                      aria-label={`Waste for ${l.material}`}
                      className="measure w-14 rounded-[2px] border border-ink-200 px-1.5 py-1 text-right text-[11.5px] font-bold text-ink-900" />
                    
                    <span className="ml-1 text-[10px] text-ink-400">%</span>
                  </Cell>
                  <Cell align="right" mono strong>
                    {qty(l.sellQty)}
                  </Cell>
                  <Cell align="right" mono hideBelow="md" className={short ? 'text-danger-600' : 'text-ink-500'}>
                    {qty(avail)}
                  </Cell>
                  <Cell align="right" mono muted hideBelow="lg">
                    ${l.unitCost.toFixed(2)}
                  </Cell>
                  <Cell align="right" hideBelow="lg">
                    <input
                      type="number"
                      value={l.marginPercent}
                      onChange={(e) => setLine(l.id, { marginPercent: Number(e.target.value) })}
                      aria-label={`Margin for ${l.material}`}
                      className="measure w-14 rounded-[2px] border border-ink-200 px-1.5 py-1 text-right text-[11.5px] font-bold text-ink-900" />
                    
                  </Cell>
                  <Cell align="right" mono strong>
                    ${l.unitPrice.toFixed(2)}
                  </Cell>
                  <Cell align="right" mono strong>
                    {currency(l.sellQty * l.unitPrice)}
                  </Cell>
                </Row>);

            })}
          </RecordTable>
        </section>

        <Panel className="overflow-hidden">
          <TitleBlock label="Estimate summary" title="Before discount, delivery and tax" reference="INTERNAL" />
          <TickRule />
          <div className="grid grid-cols-2 gap-4 px-4 py-3.5 sm:grid-cols-4">
            <Measured label="Sell value" value={currency(sell)} size="md" tone="brand" />
            <Measured label="Cost" value={currency(cost)} size="md" />
            <Measured label="Gross margin" value={`${margin}%`} size="md" tone={margin >= 20 ? 'positive' : 'danger'} />
            <Measured label="Lines short on stock" value={String(shortLines.length)} size="md" />
          </div>
        </Panel>

        <ScopeNote>
          Cost, margin and buy-in exposure stay inside this yard. The quote the builder receives shows only
          quantities and sell prices.
        </ScopeNote>
      </div>
    </div>);

}