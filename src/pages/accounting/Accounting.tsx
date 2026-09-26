import React, { useState } from 'react';
import { ReceiptIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, Metric } from '../../components/ui/Card';
import { SegmentedControl } from '../../components/ui/Field';
import { EmptyState, ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { InvoiceRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { currency } from '../../utils/format';

type Filter = 'all' | 'pending' | 'overdue' | 'paid';

export function Accounting() {
  const { invoices, can } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  if (!can('invoice.view')) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState
          variant="permission"
          title="Financial records are restricted"
          body="Invoices and payments are visible to owners, purchasing and accounting roles." />
        
      </div>);

  }

  const outstanding = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + (i.amount - i.paid), 0);
  const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + (i.amount - i.paid), 0);
  const unmatched = invoices.filter((i) => !i.matched).length;

  const list = invoices.filter((i) => {
    if (filter === 'pending') return i.status === 'Pending' || i.status === 'Approved' || i.status === 'Partially Paid';
    if (filter === 'overdue') return i.status === 'Overdue';
    if (filter === 'paid') return i.status === 'Paid';
    return true;
  });

  return (
    <div>
      <PageHeader back={false} title="Invoices" subtitle="Supplier invoices, matching and approval" />

      <div className="space-y-4">
        <Card className="grid grid-cols-2 gap-6 p-5 lg:grid-cols-4">
          <Metric label="Outstanding" value={currency(outstanding, { compact: true })} sub="Payable to suppliers" tone="alert" />
          <Metric label="Overdue" value={currency(overdue, { compact: true })} sub="Past due date" />
          <Metric label="Invoices" value={String(invoices.length)} sub="This quarter" />
          <Metric label="Unmatched" value={String(unmatched)} sub="Need PO matching" />
        </Card>

        {unmatched > 0 &&
        <InlineAlert
          tone="warning"
          title={`${unmatched} invoice could not be matched to a purchase order`}
          body="Three-way matching failed — the invoice references a PO that was never approved in SM PRO." />

        }
      </div>

      <div className="my-5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Open' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'paid', label: 'Paid' }]
          } />
        
      </div>

      <div>
        {list.length === 0 ?
        <EmptyState icon={<ReceiptIcon className="h-5 w-5" />} title="No invoices here" body="Supplier invoices arrive automatically once a delivery is complete." /> :

        <Card className="divide-y divide-ink-100">
            {list.map((i) =>
          <InvoiceRow key={i.id} invoice={i} showProject />
          )}
          </Card>
        }
      </div>
    </div>);

}