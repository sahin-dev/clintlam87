import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquareIcon, PackageIcon, PhoneIcon, StarIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, DataRow, Metric, SectionHeader } from '../components/ui/Card';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchField } from '../components/ui/Field';
import { EmptyState, ErrorState, InlineAlert } from '../components/ui/Feedback';
import { DeliveryRow, OrderRow, QuoteRow } from '../components/common/Rows';
import { useApp } from '../contexts/AppContext';
import { suppliers } from '../data/procurement';

export function Suppliers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const list = suppliers.filter((s) =>
  query.trim() ? `${s.name} ${s.category} ${s.city}`.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <div>
      <PageHeader back={false} title="Suppliers" subtitle={`${suppliers.length} active relationships`} />
      <div className="mb-5 max-w-[420px]">
        <SearchField value={query} onChange={setQuery} placeholder="Search supplier, material or city" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {list.length === 0 ?
        <div className="md:col-span-2 2xl:col-span-3">
            <EmptyState icon={<PackageIcon className="h-5 w-5" />} title="No suppliers found" body="Try another material category or city." />
          </div> :

        list.map((s) =>
        <Card key={s.id} className="flex h-full flex-col overflow-hidden">
              <button
            onClick={() => navigate(`/suppliers/${s.id}`)}
            className="flex h-full w-full flex-col text-left">
            
                <img src={s.image} alt={`${s.name} yard`} className="h-40 w-full shrink-0 object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-ink-900">{s.name}</p>
                      <p className="mt-0.5 truncate text-[12px] text-ink-400">
                        {s.category} · {s.city}
                      </p>
                    </div>
                    <StatusBadge status={s.relationship} dot={false} />
                  </div>
                  <div className="mt-auto flex items-center gap-4 border-t border-ink-100 pt-3.5 text-[12px]">
                    <span className="flex items-center gap-1 font-semibold text-ink-800">
                      <StarIcon className="h-3.5 w-3.5 text-brand-500" />
                      {s.rating}
                    </span>
                    <span className="tabular text-ink-500">{s.onTimeRate}% on time</span>
                    <span className="tabular ml-auto text-ink-500">{s.openOrders} open orders</span>
                  </div>
                </div>
              </button>
            </Card>
        )
        }
      </div>
    </div>);

}

export function SupplierDetail() {
  const { supplierId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!supplier) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Supplier not found" body="This supplier may no longer work with your organization." action="Back" onAction={() => navigate('/suppliers')} />
      </div>);

  }

  const quotes = app.quotes.filter((q) => q.supplierId === supplier.id);
  const orders = app.orders.filter((o) => o.supplierId === supplier.id);
  const deliveries = app.deliveries.filter((d) => d.supplierId === supplier.id);

  return (
    <div className="detail-column">
      <PageHeader back backLabel="Suppliers" title={supplier.name} subtitle={`${supplier.category} · ${supplier.city}`} action={<StatusBadge status={supplier.relationship} dot={false} />} />

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <img src={supplier.image} alt={`${supplier.name} yard`} className="h-52 w-full object-cover" />
          <div className="grid grid-cols-3 gap-6 p-5">
            <Metric label="Rating" value={String(supplier.rating)} sub="Last 12 months" />
            <Metric label="On time" value={`${supplier.onTimeRate}%`} sub="Delivery record" />
            <Metric label="Open orders" value={String(supplier.openOrders)} />
          </div>
          <dl className="divide-y divide-ink-100 border-t border-ink-100 px-4">
            <DataRow label="Primary contact" value={supplier.contact} />
            <DataRow label="Phone" value={supplier.phone} />
            <DataRow label="Payment terms" value={supplier.terms} />
          </dl>
        </Card>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" onClick={() => navigate('/messages')} icon={<MessageSquareIcon className="h-4 w-4" />}>
            Message
          </Button>
          <a
            href={`tel:${supplier.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-[13px] font-semibold text-ink-800 transition-colors duration-150 ease-smooth hover:bg-ink-50">
            
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
        </div>

        <InlineAlert
          tone="info"
          title="Confidential by default"
          body={`${supplier.name} can only see their own quotes and orders — never another supplier's pricing, terms or your comparison.`} />
        

        {app.can('quote.view') && quotes.length > 0 &&
        <section>
            <SectionHeader title="Quotes" />
            <Card className="divide-y divide-ink-100">
              {quotes.map((q) =>
            <QuoteRow key={q.id} quote={q} onClick={() => navigate(`/procurement/requests/${q.requestId}/compare`)} />
            )}
            </Card>
          </section>
        }

        {orders.length > 0 &&
        <section>
            <SectionHeader title="Orders" />
            <Card className="divide-y divide-ink-100">
              {orders.map((o) =>
            <OrderRow key={o.id} order={o} showProject />
            )}
            </Card>
          </section>
        }

        {deliveries.length > 0 &&
        <section>
            <SectionHeader title="Deliveries" />
            <Card className="divide-y divide-ink-100">
              {deliveries.map((d) =>
            <DeliveryRow key={d.id} delivery={d} showProject />
            )}
            </Card>
          </section>
        }

        <div className="flex flex-wrap gap-1.5">
          {['Lumber', 'Sheathing', 'Hardware', 'Trusses'].map((tag) =>
          <Badge key={tag} tone="neutral" dot={false}>
              {tag}
            </Badge>
          )}
        </div>
      </div>
    </div>);

}