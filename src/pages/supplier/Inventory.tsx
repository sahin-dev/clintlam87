import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, DatabaseIcon, PlusIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Drawer } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { Panel, SpecLabel, TickRule, TitleBlock } from '../../components/smpro/Primitives';
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
import { available, products, productById, vendorPurchaseOrders } from '../../data/supplierCatalog';
import { currency, qty } from '../../utils/format';

/**
 * Yard stock position. Reads as a stock ledger — on hand, committed to orders,
 * genuinely available, and what is inbound to cover the gap.
 */
export function SupplierInventory() {
  const { can } = useSupplier();
  if (!can('inventory.view')) return <Denied module="Inventory" />;
  return <SupplierInventoryView />;
}

function SupplierInventoryView() {
  const navigate = useNavigate();
  const { can, orders } = useSupplier();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');


  const rows = useMemo(() => {
    const byTab = products.filter((p) => {
      const avail = available(p);
      if (tab === 'low') return avail <= p.reorderLevel;
      if (tab === 'committed') return p.reserved > 0;
      if (tab === 'incoming') return p.incoming > 0;
      if (tab === 'short') return avail === 0;
      return true;
    });
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((p) => [p.name, p.sku, p.category, p.brand].join(' ').toLowerCase().includes(q));
  }, [tab, query]);

  const stockValue = products.reduce((s, p) => s + p.onHand * p.cost, 0);
  const lowCount = products.filter((p) => available(p) <= p.reorderLevel).length;
  const incomingValue = products.reduce((s, p) => s + p.incoming * p.cost, 0);
  const committedLines = orders.reduce(
    (s, o) => s + o.lines.filter((l) => l.fulfilled < l.ordered).length,
    0
  );

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="On hand, committed to sales orders, available to sell and inbound"
        action={
        can('purchasing.manage') &&
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate('/supplier/purchasing')}
          icon={<DatabaseIcon className="h-3.5 w-3.5" />}>
          
              Buy-ins
            </Button>

        } />
      

      <LedgerStrip
        items={[
        { label: 'Stock at cost', value: currency(stockValue) },
        { label: 'Inbound at cost', value: currency(incomingValue), tone: 'brand' },
        {
          label: 'At or below reorder',
          value: String(lowCount),
          tone: lowCount ? 'danger' : 'default'
        },
        { label: 'Open order lines', value: String(committedLines), note: 'Holding reserved stock' }]
        } />
      

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'all', label: 'All stock', count: products.length },
          { value: 'low', label: 'Low', count: lowCount },
          { value: 'short', label: 'Out', count: products.filter((p) => available(p) === 0).length },
          { value: 'committed', label: 'Reserved', count: products.filter((p) => p.reserved > 0).length },
          { value: 'incoming', label: 'Incoming', count: products.filter((p) => p.incoming > 0).length }]
          } />
        
      </Panel>

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search stock by product, SKU or category" />

      <RecordTable
        caption="Yard stock position"
        columns={[
        { key: 'product', label: 'Product' },
        { key: 'onhand', label: 'On hand', align: 'right' },
        { key: 'reserved', label: 'Reserved', align: 'right', hideBelow: 'sm' },
        { key: 'available', label: 'Available', align: 'right' },
        { key: 'incoming', label: 'Incoming', align: 'right', hideBelow: 'md' },
        { key: 'reorder', label: 'Reorder at', align: 'right', hideBelow: 'lg' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
        {rows.map((p) => {
          const avail = available(p);
          const low = avail <= p.reorderLevel;
          return (
            <Row key={p.id} spine={avail === 0 ? 'danger' : low ? 'caution' : undefined}>
              <Cell strong>
                {p.name}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {p.sku} · {p.category}
                </span>
              </Cell>
              <Cell align="right" mono>
                {qty(p.onHand)}
              </Cell>
              <Cell align="right" mono muted hideBelow="sm">
                {qty(p.reserved)}
              </Cell>
              <Cell align="right" mono strong className={low ? 'text-danger-600' : undefined}>
                {qty(avail)} {p.unit}
              </Cell>
              <Cell align="right" mono muted hideBelow="md">
                {p.incoming ? qty(p.incoming) : '—'}
              </Cell>
              <Cell align="right" mono muted hideBelow="lg">
                {qty(p.reorderLevel)}
              </Cell>
              <Cell align="right">
                <StatusBadge status={p.status === 'Low Stock' ? 'Review Required' : p.status} />
              </Cell>
            </Row>);

        })}
      </RecordTable>

      <ScopeNote>
        Reserved quantity is held against confirmed sales orders. Builders never see your stock
        position — only whether their quantity is available on the promised date.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Buy-ins                                                             */
/* ------------------------------------------------------------------ */

export function SupplierPurchasing() {
  const { can, toast, orders } = useSupplier();
  const [pos, setPos] = useState(vendorPurchaseOrders);
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0].id);
  const [amount, setAmount] = useState('400');
  const [vendor, setVendor] = useState('Cascade Mill');
  const [eta, setEta] = useState('Sep 10');
  const [forOrder, setForOrder] = useState('');

  if (!can('purchasing.manage')) return <Denied module="Buy-ins" />;

  /* Every shortfall on an open order needs covering — surface them first. */
  const shortfalls = orders.flatMap((o) =>
  o.lines.
  filter((l) => (l.shortfall ?? 0) > 0).
  map((l) => ({ order: o, line: l, covered: pos.some((p) => p.forOrderId === o.id && p.productId === l.productId) }))
  );

  const onOrder = pos.filter((p) => p.status === 'Ordered' || p.status === 'In Transit');
  const inboundValue = onOrder.reduce((s, p) => s + p.qty * p.cost, 0);

  return (
    <div>
      <PageHeader
        title="Buy-ins"
        subtitle="Vendor purchase orders raised to cover what the yard cannot fill"
        action={
        <Button size="sm" onClick={() => setOpen(true)} icon={<PlusIcon className="h-3.5 w-3.5" />}>
            Raise buy-in
          </Button>
        } />
      

      <LedgerStrip
        items={[
        { label: 'On order', value: String(onOrder.length) },
        { label: 'Inbound at cost', value: currency(inboundValue), tone: 'brand' },
        {
          label: 'Uncovered shortfalls',
          value: String(shortfalls.filter((s) => !s.covered).length),
          tone: shortfalls.some((s) => !s.covered) ? 'danger' : 'default'
        },
        { label: 'Received this month', value: String(pos.filter((p) => p.status === 'Received').length) }]
        } />
      

      {shortfalls.length > 0 &&
      <Panel className="mb-5 overflow-hidden">
          <TitleBlock label="Shortfalls on open orders" reference={`${shortfalls.length} lines`} />
          <ul className="divide-y divide-ink-100">
            {shortfalls.map(({ order, line, covered }) =>
          <li
            key={`${order.id}-${line.productId}`}
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
            covered ? '' : 'bg-danger-50/40'}`
            }>
            
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">{line.description}</p>
                  <p className="measure mt-0.5 text-[11px] text-ink-400">
                    {order.id} · short {qty(line.shortfall ?? 0)} {line.unit}
                  </p>
                </div>
                {covered ?
            <Badge tone="positive" dot={false}>
                    Covered by a buy-in
                  </Badge> :

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setProductId(line.productId);
                setAmount(String(line.shortfall ?? 0));
                setForOrder(order.id);
                setOpen(true);
              }}>
              
                    Cover it
                  </Button>
            }
              </li>
          )}
          </ul>
        </Panel>
      }

      <RecordTable
        caption="Vendor purchase orders"
        columns={[
        { key: 'po', label: 'Vendor PO' },
        { key: 'product', label: 'Product' },
        { key: 'qty', label: 'Quantity', align: 'right' },
        { key: 'cost', label: 'Cost', align: 'right', hideBelow: 'md' },
        { key: 'for', label: 'Covers', hideBelow: 'lg' },
        { key: 'eta', label: 'ETA', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
        {pos.map((p) =>
        <Row
          key={p.id}
          spine={p.status === 'Received' ? 'positive' : p.status === 'In Transit' ? 'info' : 'brand'}>
          
            <Cell strong>
              {p.id}
              <span className="mt-0.5 block text-[11.5px] font-medium text-ink-400">{p.vendor}</span>
            </Cell>
            <Cell>{productById(p.productId)?.name ?? 'Product'}</Cell>
            <Cell align="right" mono strong>
              {qty(p.qty)} {p.unit}
            </Cell>
            <Cell align="right" mono muted hideBelow="md">
              {currency(p.qty * p.cost)}
            </Cell>
            <Cell muted hideBelow="lg">
              {p.forOrderId ?? 'Yard stock'}
            </Cell>
            <Cell align="right" mono>
              {p.eta}
            </Cell>
            <Cell align="right">
              <StatusBadge status={p.status === 'In Transit' ? 'Dispatched' : p.status} />
            </Cell>
          </Row>
        )}
      </RecordTable>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Raise a vendor buy-in"
        description="Covers a shortfall so the builder's promised date can still be met"
        footer={
        <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            disabled={!Number(amount)}
            onClick={() => {
              const product = productById(productId)!;
              const id = `VPO-${4472 + pos.length}`;
              setPos((prev) => [
              {
                id,
                vendor,
                productId,
                qty: Number(amount),
                unit: product.unit,
                cost: product.cost,
                eta,
                status: 'Requested',
                forOrderId: forOrder || undefined
              },
              ...prev]
              );
              setOpen(false);
              toast({
                tone: 'success',
                title: `${id} requested`,
                body: forOrder ?
                `${qty(Number(amount))} ${product.unit} on order to cover ${forOrder}.` :
                `${qty(Number(amount))} ${product.unit} on order for yard stock.`
              });
            }}>
            
              Raise buy-in
            </Button>
          </div>
        }>
        
        <div className="space-y-4">
          <Select label="Product" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name}
              </option>
            )}
          </Select>
          <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          <Input
            label="Quantity"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={`Unit: ${productById(productId)?.unit ?? ''}`} />
          
          <Input label="Expected at the yard" value={eta} onChange={(e) => setEta(e.target.value)} />
          <Select
            label="Covers which order?"
            hint="Optional"
            value={forOrder}
            onChange={(e) => setForOrder(e.target.value)}>
            
            <option value="">Yard stock (no specific order)</option>
            {orders.map((o) =>
            <option key={o.id} value={o.id}>
                {o.id}
              </option>
            )}
          </Select>

          <Panel className="overflow-hidden">
            <div className="flex items-start gap-2.5 px-3.5 py-3">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-caution-600" />
              <p className="text-[12px] leading-relaxed text-ink-600">
                Raising a buy-in does not change the builder&apos;s promised date. If the ETA lands after
                that date, tell them on the order so they can re-sequence the crew.
              </p>
            </div>
            <TickRule />
            <div className="px-3.5 py-2.5">
              <SpecLabel>Estimated cost</SpecLabel>
              <p className="measure mt-1 text-[18px] font-bold text-ink-900">
                {currency(Number(amount || 0) * (productById(productId)?.cost ?? 0))}
              </p>
            </div>
          </Panel>
        </div>
      </Drawer>
    </div>);

}