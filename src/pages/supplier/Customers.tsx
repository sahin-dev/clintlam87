import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BuildingIcon, CheckIcon, MailIcon, PhoneIcon, XIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Card';
import { InlineAlert, EmptyState } from '../../components/ui/Feedback';
import { Panel, SpecLabel, SpecRow, TitleBlock, WorkHeading, Measured } from '../../components/smpro/Primitives';
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
import { supplierCustomers, supplierProjects, branchName, supplierProjectName } from '../../data/supplierOrg';
import { pricingRules } from '../../data/supplierCatalog';
import { productById } from '../../data/supplierCatalog';
import { quoteTotal } from '../../data/supplierSales';
import { currency } from '../../utils/format';

const FILTERS = ['All', 'Active', 'Pending', 'Inactive'];

export function Customers() {
  const navigate = useNavigate();
  const { can } = useSupplier();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  if (!can('customers.view')) return <Denied module="Customers" />;

  const rows = supplierCustomers.filter((c) => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const q = query.trim().toLowerCase();
    return matchesFilter && (!q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
  });

  const pending = supplierCustomers.filter((c) => c.status === 'Pending');
  const receivable = supplierCustomers.reduce((s, c) => s + c.outstanding, 0);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Every customer is a builder organization connected to this yard by an explicit relationship" />
      

      <LedgerStrip
        items={[
        { label: 'Connected builders', value: String(supplierCustomers.filter((c) => c.status === 'Active').length) },
        { label: 'Requests pending', value: String(pending.length), tone: pending.length ? 'brand' : 'default' },
        { label: 'Open orders', value: String(supplierCustomers.reduce((s, c) => s + c.openOrders, 0)) },
        { label: 'Receivable', value: currency(receivable, { compact: true }), tone: 'brand' }]
        } />
      

      {pending.length > 0 && can('customers.manage') &&
      <div className="mb-5 space-y-3">
          {pending.map((c) =>
        <Panel key={c.id} className="overflow-hidden">
              <TitleBlock label="Connection request" title={c.name} reference={c.city.toUpperCase()} />
              <div className="px-4 py-3.5">
                <p className="text-[13px] leading-relaxed text-ink-600">{c.requestNote}</p>
                <p className="mt-2 text-[12px] text-ink-400">
                  Requested by {c.contacts[0].name} · {c.contacts[0].email}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Button size="sm" icon={<CheckIcon className="h-3.5 w-3.5" />}>
                    Accept relationship
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/supplier/customers/${c.id}`)}>
                    Review details
                  </Button>
                  <Button size="sm" variant="ghost" icon={<XIcon className="h-3.5 w-3.5" />}>
                    Decline
                  </Button>
                </div>
              </div>
            </Panel>
        )}
        </div>
      }

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search builders by name or city…"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState
        icon={<BuildingIcon className="h-5 w-5" />}
        title="No builders match"
        body="Try a different filter, or invite a builder organization to connect with this yard." /> :


      <RecordTable
        caption="Connected builder organizations"
        columns={[
        { key: 'name', label: 'Builder organization' },
        { key: 'yard', label: 'Yard', hideBelow: 'lg' },
        { key: 'projects', label: 'Projects', align: 'right' },
        { key: 'quotes', label: 'Quotes', align: 'right', hideBelow: 'sm' },
        { key: 'orders', label: 'Orders', align: 'right', hideBelow: 'sm' },
        { key: 'balance', label: 'Outstanding', align: 'right' },
        { key: 'activity', label: 'Last activity', hideBelow: 'md' },
        { key: 'status', label: 'Relationship', align: 'right' }]
        }>
        
          {rows.map((c) =>
        <Row
          key={c.id}
          onClick={() => navigate(`/supplier/customers/${c.id}`)}
          spine={c.status === 'Active' ? 'positive' : c.status === 'Pending' ? 'caution' : undefined}>
          
              <Cell strong>
                {c.name}
                <span className="mt-0.5 block text-[11.5px] font-medium text-ink-400">{c.city}</span>
              </Cell>
              <Cell hideBelow="lg" muted>
                {branchName(c.branchId)}
              </Cell>
              <Cell align="right" mono>
                {c.activeProjects}
              </Cell>
              <Cell align="right" mono hideBelow="sm">
                {c.openQuotes}
              </Cell>
              <Cell align="right" mono hideBelow="sm">
                {c.openOrders}
              </Cell>
              <Cell align="right" mono strong>
                {c.outstanding ? currency(c.outstanding) : '—'}
              </Cell>
              <Cell hideBelow="md" muted>
                {c.lastActivity}
              </Cell>
              <Cell align="right">
                <StatusBadge status={c.status} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }

      <ScopeNote>
        Relationship, pricing and order data belongs to this yard and the named builder only. No builder can
        see another builder&apos;s pricing, and no other supplier can see this relationship.
      </ScopeNote>
    </div>);

}

export function CustomerDetail() {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const customer = supplierCustomers.find((c) => c.id === customerId);

  if (!s.can('customers.view')) return <Denied module="Customers" />;
  if (!customer) return <Denied module="This customer" />;

  const projects = supplierProjects.filter((p) => p.customerId === customer.id);
  const quotes = s.quotes.filter((q) => q.customerId === customer.id);
  const orders = s.orders.filter((o) => o.customerId === customer.id);
  const invoices = s.invoices.filter((i) => i.customerId === customer.id);
  const rules = pricingRules.filter((r) => r.customerId === customer.id);
  const creditPct = customer.creditLimit ? Math.round(customer.creditUsed / customer.creditLimit * 100) : 0;

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/customers"
        eyebrow="Builder organization"
        title={customer.name}
        reference={`${customer.city.toUpperCase()} · CUSTOMER SINCE ${customer.since.toUpperCase()}`}
        status={<StatusBadge status={customer.status} />}
        actions={
        <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/messages')}>
            Message builder
          </Button>
        }
        facts={[
        { label: 'Yard', value: branchName(customer.branchId) },
        { label: 'Terms', value: customer.terms },
        { label: 'Pricing', value: customer.pricingTier },
        { label: 'Active projects', value: String(customer.activeProjects) },
        { label: 'Outstanding', value: customer.outstanding ? currency(customer.outstanding) : '—' }]
        } />
      

      <div className="space-y-6">
        {customer.status === 'Pending' &&
        <InlineAlert
          tone="warning"
          title="Relationship not established yet"
          body="This builder has requested to connect. Nothing is shared in either direction until the relationship is accepted." />

        }

        <Panel className="overflow-hidden">
          <TitleBlock label="Credit" title="Exposure against limit" reference={`${creditPct}% USED`} />
          <div className="px-4 py-3.5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Measured label="Credit used" value={currency(customer.creditUsed)} size="md" />
              <Measured label="Credit limit" value={currency(customer.creditLimit)} size="sm" tone="muted" />
            </div>
            <Progress className="mt-3" value={creditPct} tone={creditPct > 80 ? 'brand' : 'ink'} />
          </div>
        </Panel>

        <section>
          <WorkHeading label="Contacts" title="Who we deal with" count={`${customer.contacts.length}`} />
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-ink-100">
              {customer.contacts.map((c) =>
              <li key={c.email} className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3">
                  <span className="min-w-[180px]">
                    <span className="block text-[13px] font-bold text-ink-900">{c.name}</span>
                    <span className="block text-[11.5px] text-ink-400">{c.title}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-600">
                    <MailIcon className="h-3.5 w-3.5 text-ink-400" />
                    {c.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-600">
                    <PhoneIcon className="h-3.5 w-3.5 text-ink-400" />
                    {c.phone}
                  </span>
                </li>
              )}
            </ul>
          </Panel>
        </section>

        <section>
          <WorkHeading label="Shared work" title="Projects this yard can see" count={`${projects.length}`} />
          {projects.length === 0 ?
          <Panel className="px-4 py-8 text-center text-[13px] text-ink-400">
              No projects have been shared with this yard yet.
            </Panel> :

          <Panel className="overflow-hidden">
              <ul className="divide-y divide-ink-100">
                {projects.map((p) =>
              <li key={p.id}>
                    <button
                  onClick={() => navigate(`/supplier/projects/${p.id}`)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
                  
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-ink-900">{p.name}</span>
                        <span className="measure block text-[11px] text-ink-400">
                          {p.number} · {p.city}
                        </span>
                      </span>
                      <StatusBadge status={p.status === 'Completed' ? 'Completed' : 'Active'} />
                      <span className="measure hidden w-24 text-right text-[12.5px] font-bold text-ink-900 sm:block">
                        {currency(p.value, { compact: true })}
                      </span>
                    </button>
                  </li>
              )}
              </ul>
            </Panel>
          }
        </section>

        {s.can('pricing.view') &&
        <section>
            <WorkHeading
            label="Commercial"
            title="Contract pricing for this builder"
            count={`${rules.length} rules`} />
          
            <RecordTable
            caption="Customer-specific pricing"
            columns={[
            { key: 'sku', label: 'Product' },
            { key: 'standard', label: 'Standard', align: 'right' },
            { key: 'contract', label: 'Contract', align: 'right' },
            { key: 'break', label: 'Volume break', hideBelow: 'sm' },
            { key: 'effective', label: 'Effective', hideBelow: 'md' }]
            }>
            
              {rules.map((r) => {
              const p = productById(r.productId);
              return (
                <Row key={r.id}>
                    <Cell strong>
                      {p?.name}
                      <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">{p?.sku}</span>
                    </Cell>
                    <Cell align="right" mono muted>
                      ${r.standard.toFixed(2)}
                    </Cell>
                    <Cell align="right" mono strong>
                      ${r.contract.toFixed(2)}
                    </Cell>
                    <Cell hideBelow="sm" muted>
                      {r.volumeBreak}
                    </Cell>
                    <Cell hideBelow="md" muted>
                      {r.effective}
                    </Cell>
                  </Row>);

            })}
            </RecordTable>
            <ScopeNote>
              These prices are specific to {customer.name}. They are never exposed to another builder or to any
              other supplier organization.
            </ScopeNote>
          </section>
        }

        <section className="grid gap-5 lg:grid-cols-2">
          <Panel className="overflow-hidden">
            <TitleBlock label="Quotes" reference={`${quotes.length} ON RECORD`} />
            <ul className="divide-y divide-ink-100">
              {quotes.length === 0 &&
              <li className="px-4 py-6 text-center text-[12.5px] text-ink-400">No quotes yet</li>
              }
              {quotes.map((q) =>
              <li key={q.id}>
                  <button
                  onClick={() => navigate(`/supplier/quotes/${q.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50/40">
                  
                    <span className="measure text-[12px] font-bold text-ink-900">{q.id}</span>
                    <span className="truncate text-[12px] text-ink-500">{supplierProjectName(q.projectId)}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-2">
                      <span className="measure text-[12.5px] font-bold text-ink-900">
                        {currency(quoteTotal(q))}
                      </span>
                      <StatusBadge status={q.status} dot={false} />
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </Panel>

          <Panel className="overflow-hidden">
            <TitleBlock label="Orders & billing" reference={`${orders.length} ORDERS`} />
            <dl className="px-4 py-1">
              <SpecRow label="Open orders" value={String(orders.filter((o) => o.status !== 'Completed').length)} mono />
              <SpecRow label="Invoices unpaid" value={String(invoices.filter((i) => i.status !== 'Paid').length)} mono />
              <SpecRow
                label="Overdue"
                value={String(invoices.filter((i) => i.status === 'Overdue').length)}
                mono />
              
              <SpecRow label="Outstanding" value={currency(customer.outstanding)} mono />
            </dl>
            <div className="border-t border-ink-100 px-4 py-3">
              <SpecLabel>Last activity</SpecLabel>
              <p className="mt-1 text-[12.5px] text-ink-600">{customer.lastActivity}</p>
            </div>
          </Panel>
        </section>
      </div>
    </div>);

}