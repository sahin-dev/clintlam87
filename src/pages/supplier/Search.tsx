import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { EmptyState } from '../../components/ui/Feedback';
import { Panel, SpecLabel } from '../../components/smpro/Primitives';
import { ListToolbar, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierCustomers, supplierProjects, supplierProjectName } from '../../data/supplierOrg';
import { products } from '../../data/supplierCatalog';
import { SupplierPermission } from '../../types/supplier';

interface Hit {
  id: string;
  label: string;
  detail: string;
  to: string;
}

interface Group {
  kind: string;
  permission: SupplierPermission;
  hits: Hit[];
}

/**
 * Results for the yard's global search. Every group is gated by the same
 * permission as the module it belongs to, so search can never become a way
 * around role scoping.
 */
export function SupplierSearch() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { can, rfqs, quotes, orders, invoices, cases, deliveries } = useSupplier();
  const [query, setQuery] = useState(params.get('q') ?? '');

  const q = query.trim().toLowerCase();

  const groups = useMemo<Group[]>(() => {
    if (!q) return [];
    const match = (...parts: (string | undefined)[]) =>
    parts.filter(Boolean).join(' ').toLowerCase().includes(q);

    return ([
    {
      kind: 'Builders',
      permission: 'customers.view',
      hits: supplierCustomers.
      filter((c) => match(c.id, c.name, c.contacts[0]?.name, c.city)).
      map((c) => ({
        id: c.id,
        label: c.name,
        detail: `${c.contacts[0]?.name ?? 'No contact'} · ${c.city} · ${c.status}`,
        to: `/supplier/customers/${c.id}`
      }))
    },
    {
      kind: 'Projects',
      permission: 'projects.view',
      hits: supplierProjects.
      filter((p) => match(p.id, p.name, customerName(p.customerId))).
      map((p) => ({
        id: p.id,
        label: p.name,
        detail: `${customerName(p.customerId)} · ${p.status}`,
        to: `/supplier/projects/${p.id}`
      }))
    },
    {
      kind: 'RFQs',
      permission: 'rfq.view',
      hits: rfqs.
      filter((r) => match(r.id, supplierProjectName(r.projectId), customerName(r.customerId))).
      map((r) => ({
        id: r.id,
        label: `${r.id} · ${supplierProjectName(r.projectId)}`,
        detail: `${customerName(r.customerId)} · ${r.status}`,
        to: `/supplier/rfqs/${r.id}`
      }))
    },
    {
      kind: 'Quotes',
      permission: 'quote.view',
      hits: quotes.
      filter((x) => match(x.id, x.rfqId, supplierProjectName(x.projectId))).
      map((x) => ({
        id: x.id,
        label: `${x.id} · version ${x.version}`,
        detail: `${supplierProjectName(x.projectId)} · ${x.status}`,
        to: `/supplier/quotes/${x.id}`
      }))
    },
    {
      kind: 'Sales orders',
      permission: 'order.view',
      hits: orders.
      filter((o) => match(o.id, o.quoteId, supplierProjectName(o.projectId), customerName(o.customerId))).
      map((o) => ({
        id: o.id,
        label: o.id,
        detail: `${customerName(o.customerId)} · ${o.status}`,
        to: `/supplier/orders/${o.id}`
      }))
    },
    {
      kind: 'Loads',
      permission: 'delivery.view',
      hits: deliveries.
      filter((d) => match(d.id, d.orderId, d.address, d.siteContact)).
      map((d) => ({
        id: d.id,
        label: `${d.id} · ${d.orderId}`,
        detail: `${d.address} · ${d.status}`,
        to: `/supplier/deliveries/${d.id}`
      }))
    },
    {
      kind: 'Invoices',
      permission: 'invoice.view',
      hits: invoices.
      filter((i) => match(i.id, i.orderId, customerName(i.customerId))).
      map((i) => ({
        id: i.id,
        label: `${i.id} · ${i.orderId}`,
        detail: `${customerName(i.customerId)} · ${i.status}`,
        to: `/supplier/invoices/${i.id}`
      }))
    },
    {
      kind: 'Products',
      permission: 'products.view',
      hits: products.
      filter((p) => match(p.id, p.sku, p.name, p.brand)).
      map((p) => ({
        id: p.id,
        label: p.name,
        detail: `${p.sku} · ${p.category}`,
        to: '/supplier/products'
      }))
    },
    {
      kind: 'Service cases',
      permission: 'service.manage',
      hits: cases.
      filter((c) => match(c.id, c.subject, customerName(c.customerId))).
      map((c) => ({
        id: c.id,
        label: `${c.id} · ${c.subject}`,
        detail: `${customerName(c.customerId)} · ${c.status}`,
        to: `/supplier/service/${c.id}`
      }))
    }] as Group[]).

    filter((g) => can(g.permission) && g.hits.length > 0).
    map((g) => ({ ...g, hits: g.hits.slice(0, 6) }));
  }, [q, can, rfqs, quotes, orders, invoices, cases, deliveries]);

  const total = groups.reduce((sum, g) => sum + g.hits.length, 0);

  return (
    <div className="detail-column">
      <div className="mb-5">
        <SpecLabel>Search</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          {q ? `${total} result${total === 1 ? '' : 's'} for “${query.trim()}”` : 'Search the yard'}
        </h1>
        <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-500">
          Builders, projects, RFQs, quotes, orders, loads, invoices, products and service cases — limited
          to what your role can open.
        </p>
      </div>

      <ListToolbar
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setParams(value.trim() ? { q: value.trim() } : {}, { replace: true });
        }}
        placeholder="Search builders, projects, quotes, orders, SKUs…" />
      

      {!q ?
      <EmptyState
        icon={<SearchIcon className="h-5 w-5" />}
        title="Type to search"
        body="Enter a reference, builder, project or SKU to find the record." /> :

      total === 0 ?
      <EmptyState
        icon={<SearchIcon className="h-5 w-5" />}
        title="Nothing matched"
        body={`No record your role can open matches “${query.trim()}”.`} /> :


      <div className="space-y-5">
          {groups.map((g) =>
        <Panel key={g.kind} className="overflow-hidden">
              <div className="flex items-baseline justify-between gap-4 border-b border-ink-200 bg-ink-50/70 px-4 py-2.5">
                <SpecLabel>{g.kind}</SpecLabel>
                <span className="measure text-[10.5px] text-ink-400">{g.hits.length} SHOWN</span>
              </div>
              <ul className="divide-y divide-ink-100">
                {g.hits.map((hit) =>
            <li key={hit.id}>
                    <button
                onClick={() => navigate(hit.to)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
                
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-ink-900">
                          {hit.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-ink-500">{hit.detail}</span>
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-300" />
                    </button>
                  </li>
            )}
              </ul>
            </Panel>
        )}
        </div>
      }

      <ScopeNote>
        Search only reaches this yard&apos;s own records. Another supplier&apos;s customers, pricing and
        orders are not in this index.
      </ScopeNote>
    </div>);

}