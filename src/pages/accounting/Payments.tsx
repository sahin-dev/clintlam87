import { useState } from 'react';
import { CreditCardIcon, RotateCcwIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, Metric, SectionHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/Field';
import { EmptyState, ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { PaymentRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { currency } from '../../utils/format';

type Filter = 'all' | 'processing' | 'paid' | 'failed';

export function Payments() {
  const { payments, invoices, can, toast, payInvoice } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  if (!can('payment.view')) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState
          variant="permission"
          title="Payments are restricted"
          body="Only owners, purchasing and accounting roles can see payment records." />
        
      </div>);

  }

  const outstanding = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + (i.amount - i.paid), 0);
  const settled = payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const failed = payments.filter((p) => p.status === 'Failed');

  const list = payments.filter((p) => {
    if (filter === 'processing') return p.status === 'Processing' || p.status === 'Pending';
    if (filter === 'paid') return p.status === 'Paid';
    if (filter === 'failed') return p.status === 'Failed';
    return true;
  });

  return (
    <div>
      <PageHeader back={false} title="Payments" subtitle="Balances, history and reconciliation" />

      <div className="space-y-4">
        <Card className="grid grid-cols-2 gap-6 p-5">
          <Metric label="Outstanding balance" value={currency(outstanding, { compact: true })} sub="Across all suppliers" tone="alert" />
          <Metric label="Settled" value={currency(settled, { compact: true })} sub="Last 90 days" />
        </Card>

        {failed.length > 0 &&
        <InlineAlert
          tone="danger"
          title="A payment failed"
          body={`${failed[0].id} for ${currency(failed[0].amount)} was declined by the card issuer. Retry with ACH or another method.`}
          action={can('payment.manage') ? 'Retry with ACH' : undefined}
          onAction={() => {
            /* A real retry: re-sends the payment, which the yard receives. */
            payInvoice(failed[0].invoiceId, failed[0].amount, 'ACH transfer');
            toast({
              tone: 'success',
              title: 'Retry sent',
              body: 'Re-sent by ACH. The supplier will reconcile it against the invoice.'
            });
          }} />

        }
      </div>

      <div className="my-5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'processing', label: 'Processing' },
          { value: 'paid', label: 'Paid' },
          { value: 'failed', label: 'Failed' }]
          } />
        
      </div>

      <div className="space-y-5">
        {list.length === 0 ?
        <EmptyState icon={<CreditCardIcon className="h-5 w-5" />} title="No payments yet" body="Approved invoices can be paid from the invoice detail screen." /> :

        <Card className="divide-y divide-ink-100">
            {list.map((p) =>
          <PaymentRow key={p.id} payment={p} />
          )}
          </Card>
        }

        <SectionHeader title="Reconciliation" hint="ERP sync status" />
        <Card className="p-4">
          {synced ?
          <InlineAlert
            tone="success"
            title="Everything posted"
            body="All payments are now reconciled against your accounting system." /> :


          <>
              <InlineAlert
              tone="warning"
              title="ERP sync incomplete"
              body="2 payments could not be posted to your accounting system — the supplier vendor ID is missing in the ERP." />
            
              <Button
              variant="secondary"
              block
              className="mt-3"
              loading={syncing}
              icon={<RotateCcwIcon className="h-4 w-4" />}
              onClick={() => {
                setSyncing(true);
                window.setTimeout(() => {
                  setSyncing(false);
                  setSynced(true);
                  toast({
                    tone: 'success',
                    title: '2 payments posted',
                    body: 'The vendor ID resolved on retry and both entries reconciled.'
                  });
                }, 900);
              }}>
              
                Retry sync
              </Button>
            </>
          }
        </Card>
      </div>
    </div>);

}