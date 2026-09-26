import React, { useMemo, useState } from 'react';
import { PackageIcon, TagIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Sheet';
import { Input } from '../../components/ui/Field';
import { Panel, SpecLabel, SpecRow, TickRule, TitleBlock } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordTable,
  Row,
  ScopeNote } from
'../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { available, pricingRules, products, productById } from '../../data/supplierCatalog';
import { supplierCustomers, customerName } from '../../data/supplierOrg';
import { currency, qty } from '../../utils/format';
import { Product } from '../../types/supplier';

const CATEGORIES = ['All categories', ...Array.from(new Set(products.map((p) => p.category)))];

/** The yard's own catalog. Builder takeoff lines are mapped onto these SKUs. */
export function SupplierProducts() {
  const { can } = useSupplier();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  if (!can('products.view')) return <Denied module="Products" />;

  const rows = useMemo(() => {
    const byCategory =
    category === CATEGORIES[0] ? products : products.filter((p) => p.category === category);
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((p) => [p.name, p.sku, p.brand].join(' ').toLowerCase().includes(q));
  }, [query, category]);

  const marginOf = (p: Product) => (p.price - p.cost) / p.price * 100;

  return (
    <div>
      <PageHeader title="Products" subtitle="SKUs, units, cost, sell price and stock status" />

      <LedgerStrip
        items={[
        { label: 'Active SKUs', value: String(products.filter((p) => p.status !== 'Discontinued').length) },
        { label: 'Categories', value: String(CATEGORIES.length - 1) },
        {
          label: 'Mean margin',
          value: `${(products.reduce((s, p) => s + marginOf(p), 0) / products.length).toFixed(1)}%`,
          tone: 'brand'
        },
        { label: 'Backordered', value: String(products.filter((p) => p.status === 'Backordered').length) }]
        } />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search the catalog by name, SKU or brand"
        filters={CATEGORIES}
        active={category}
        onFilter={setCategory} />
      

      {rows.length === 0 ?
      <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <PackageIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">No products match</h2>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-ink-500">
            Try a different SKU, brand or category.
          </p>
        </Panel> :

      <RecordTable
        caption="Product catalog"
        columns={[
        { key: 'product', label: 'Product' },
        { key: 'unit', label: 'Unit', hideBelow: 'sm' },
        { key: 'cost', label: 'Cost', align: 'right', hideBelow: 'md' },
        { key: 'price', label: 'Sell', align: 'right' },
        { key: 'margin', label: 'Margin', align: 'right', hideBelow: 'lg' },
        { key: 'available', label: 'Available', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {rows.map((p) =>
        <Row key={p.id} onClick={() => setOpenProduct(p)}>
              <Cell strong>
                {p.name}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {p.sku} · {p.brand}
                </span>
              </Cell>
              <Cell muted hideBelow="sm">
                {p.unit}
              </Cell>
              <Cell align="right" mono muted hideBelow="md">
                {`${p.cost.toFixed(2)}`}
              </Cell>
              <Cell align="right" mono strong>
                {`${p.price.toFixed(2)}`}
              </Cell>
              <Cell align="right" mono hideBelow="lg">
                {`${marginOf(p).toFixed(1)}%`}
              </Cell>
              <Cell align="right" mono>
                {qty(available(p))}
              </Cell>
              <Cell align="right">
                <StatusBadge status={p.status === 'Low Stock' ? 'Review Required' : p.status} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }

      <ScopeNote>
        Cost and margin are internal. Builders only ever see the sell price that applies to their own
        contract.
      </ScopeNote>

      <Drawer
        open={!!openProduct}
        onClose={() => setOpenProduct(null)}
        title={openProduct?.name ?? 'Product'}
        description={openProduct ? `${openProduct.sku} · ${openProduct.brand}` : undefined}>
        
        {openProduct &&
        <div className="space-y-5">
            <Panel className="overflow-hidden">
              <TitleBlock label="Commercial" reference={openProduct.unit} />
              <dl className="divide-y divide-ink-100 px-4 py-1">
                <SpecRow label="Cost" value={`$${openProduct.cost.toFixed(2)}`} mono />
                <SpecRow label="Sell price" value={`$${openProduct.price.toFixed(2)}`} mono />
                <SpecRow label="Margin" value={`${marginOf(openProduct).toFixed(1)}%`} mono />
                <SpecRow label="Category" value={openProduct.category} />
              </dl>
            </Panel>

            <Panel className="overflow-hidden">
              <TitleBlock label="Stock" reference={openProduct.status} />
              <dl className="divide-y divide-ink-100 px-4 py-1">
                <SpecRow label="On hand" value={`${qty(openProduct.onHand)} ${openProduct.unit}`} mono />
                <SpecRow label="Reserved" value={`${qty(openProduct.reserved)} ${openProduct.unit}`} mono />
                <SpecRow
                label="Available"
                value={`${qty(available(openProduct))} ${openProduct.unit}`}
                mono />
              
                <SpecRow label="Incoming" value={`${qty(openProduct.incoming)} ${openProduct.unit}`} mono />
                <SpecRow label="Reorder level" value={qty(openProduct.reorderLevel)} mono />
              </dl>
            </Panel>

            <Panel className="overflow-hidden">
              <TitleBlock label="Contract pricing on this SKU" />
              {pricingRules.filter((r) => r.productId === openProduct.id).length === 0 ?
            <p className="px-4 py-5 text-[12.5px] text-ink-500">
                  No customer-specific pricing. Every builder is quoted the standard sell price.
                </p> :

            <ul className="divide-y divide-ink-100">
                  {pricingRules.
              filter((r) => r.productId === openProduct.id).
              map((r) =>
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <span className="min-w-0 truncate text-[12.5px] font-medium text-ink-700">
                          {customerName(r.customerId)}
                        </span>
                        <span className="measure shrink-0 text-[12.5px] font-semibold text-ink-900">
                          ${r.contract.toFixed(2)}
                        </span>
                      </li>
              )}
                </ul>
            }
            </Panel>
          </div>
        }
      </Drawer>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export function SupplierPricing() {
  const { can, toast } = useSupplier();
  const [rules, setRules] = useState(pricingRules);
  const [customerId, setCustomerId] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<(typeof pricingRules)[number] | null>(null);
  const [nextPrice, setNextPrice] = useState('');
  const [reason, setReason] = useState('');

  if (!can('pricing.view')) return <Denied module="Pricing" />;

  const active = supplierCustomers.filter((c) => c.status === 'Active');
  const rows = useMemo(() => {
    const byCustomer = customerId === 'all' ? rules : rules.filter((r) => r.customerId === customerId);
    const q = query.trim().toLowerCase();
    if (!q) return byCustomer;
    return byCustomer.filter((r) =>
    [productById(r.productId)?.name ?? '', customerName(r.customerId)].join(' ').toLowerCase().includes(q)
    );
  }, [rules, customerId, query]);

  const meanDiscount =
  rows.length === 0 ?
  0 :
  rows.reduce((s, r) => s + (r.standard - r.contract) / r.standard * 100, 0) / rows.length;

  return (
    <div>
      <PageHeader
        title="Pricing"
        subtitle="Customer contract pricing, volume breaks and effective dates" />
      

      <LedgerStrip
        items={[
        { label: 'Contract rules', value: String(rules.length) },
        { label: 'Builders on contract', value: String(new Set(rules.map((r) => r.customerId)).size) },
        { label: 'Mean discount', value: `${meanDiscount.toFixed(1)}%`, tone: 'brand' },
        { label: 'Standard-price SKUs', value: String(products.length - new Set(rules.map((r) => r.productId)).size) }]
        } />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search pricing by product or builder"
        filters={['All builders', ...active.map((c) => c.name)]}
        active={customerId === 'all' ? 'All builders' : customerName(customerId)}
        onFilter={(name) =>
        setCustomerId(name === 'All builders' ? 'all' : active.find((c) => c.name === name)?.id ?? 'all')
        } />
      

      <RecordTable
        caption="Customer contract pricing"
        columns={[
        { key: 'product', label: 'Product' },
        { key: 'customer', label: 'Builder' },
        { key: 'standard', label: 'Standard', align: 'right', hideBelow: 'md' },
        { key: 'contract', label: 'Contract', align: 'right' },
        { key: 'delta', label: 'Discount', align: 'right' },
        { key: 'break', label: 'Volume break', hideBelow: 'lg' },
        { key: 'action', label: '', align: 'right' }]
        }>
        
        {rows.map((r) => {
          const product = productById(r.productId);
          const discount = (r.standard - r.contract) / r.standard * 100;
          return (
            <Row key={r.id} spine="brand">
              <Cell strong>
                {product?.name ?? 'Product'}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {product?.sku} · per {product?.unit}
                </span>
              </Cell>
              <Cell>
                {customerName(r.customerId)}
                <span className="mt-0.5 block text-[11px] text-ink-400">{r.effective}</span>
              </Cell>
              <Cell align="right" mono muted hideBelow="md">
                ${r.standard.toFixed(2)}
              </Cell>
              <Cell align="right" mono strong>
                {`${r.contract.toFixed(2)}`}
              </Cell>
              <Cell align="right">
                <Badge tone={discount >= 8 ? 'positive' : 'neutral'} dot={false} className="measure">
                  {`−${discount.toFixed(1)}%`}
                </Badge>
              </Cell>
              <Cell muted hideBelow="lg">
                {r.volumeBreak}
              </Cell>
              <Cell align="right">
                {can('pricing.manage') &&
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(r);
                    setNextPrice(r.contract.toFixed(2));
                    setReason('');
                  }}
                  icon={<TagIcon className="h-3.5 w-3.5" />}>
                  
                    Change
                  </Button>
                }
              </Cell>
            </Row>);

        })}
      </RecordTable>

      <ScopeNote>
        Contract pricing is scoped to one builder relationship. No other builder — and no other
        supplier — can see these rates.
      </ScopeNote>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Change contract price"
        description={editing ? `${productById(editing.productId)?.name} · ${customerName(editing.customerId)}` : undefined}
        footer={
        <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            disabled={!Number(nextPrice) || !reason.trim()}
            onClick={() => {
              if (!editing) return;
              const before = editing.contract;
              setRules((prev) =>
              prev.map((r) => r.id === editing.id ? { ...r, contract: Number(nextPrice) } : r)
              );
              setEditing(null);
              toast({
                tone: 'success',
                title: 'Contract price updated',
                body: `$${before.toFixed(2)} → $${Number(nextPrice).toFixed(2)}. Recorded in the audit log with your reason.`
              });
            }}>
            
              Save change
            </Button>
          </div>
        }>
        
        {editing &&
        <div className="space-y-4">
            <Panel className="overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-ink-100">
                <div className="px-4 py-3">
                  <SpecLabel>Standard</SpecLabel>
                  <p className="measure mt-1 text-[18px] font-bold text-ink-400">
                    ${editing.standard.toFixed(2)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <SpecLabel>Current contract</SpecLabel>
                  <p className="measure mt-1 text-[18px] font-bold text-ink-900">
                    ${editing.contract.toFixed(2)}
                  </p>
                </div>
              </div>
              <TickRule />
              <div className="px-4 py-2.5">
                <p className="text-[11.5px] leading-relaxed text-ink-500">
                  Effective {editing.effective} · volume break {editing.volumeBreak}
                </p>
              </div>
            </Panel>

            <Input
            label="New contract price"
            type="number"
            step="0.01"
            value={nextPrice}
            onChange={(e) => setNextPrice(e.target.value)}
            hint={`per ${productById(editing.productId)?.unit ?? 'unit'}`} />
          
            <Input
            label="Reason for the change"
            hint="Recorded in the audit log"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. mill cost dropped — passing part of it through" />
          
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Quotes already sent keep the price they were sent at. This rate applies to new quotes
              from now on.
            </p>
          </div>
        }
      </Drawer>
    </div>);

}