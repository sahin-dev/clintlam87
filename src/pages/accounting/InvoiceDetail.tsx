import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, CreditCardIcon, LinkIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, DataRow, SectionHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/Sheet';
import { ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/Field';
import { PipelineTrail, TrailStage } from '../../components/common/PipelineTrail';
import { useApp } from '../../contexts/AppContext';
import { currency } from '../../utils/format';
import { supplierName } from '../../data/procurement';
import { projectName } from '../../data/projects';

export function InvoiceDetail() {
  const { invoiceId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const invoice = app.invoices.find((i) => i.id === invoiceId);
  const [payOpen, setPayOpen] = useState(false);

  if (!invoice) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Invoice not found" body="It may have been voided by the supplier." action="Back" onAction={() => navigate('/accounting')} />
      </div>);

  }

  const order = app.orders.find((o) => o.id === invoice.orderId);
  const delivery = app.deliveries.find((d) => d.orderId === invoice.orderId && d.pod);
  const relatedPayments = app.payments.filter((p) => p.invoiceId === invoice.id);
  const canManage = app.can('invoice.manage');

  const stages: TrailStage[] = [
  { label: 'Invoice received', detail: invoice.receivedAt, state: 'done' },
  {
    label: 'Matched to purchase order',
    detail: invoice.matched ? `${invoice.orderId} · amounts agree` : 'No matching approved PO found',
    state: invoice.matched ? 'done' : 'blocked'
  },
  {
    label: 'Delivery verified',
    detail: delivery ? `POD ${delivery.id} · ${delivery.pod?.receivedBy}` : 'No POD on file',
    state: delivery ? 'done' : 'todo'
  },
  {
    label: 'Approved for payment',
    detail: invoice.status === 'Pending' ? 'Awaiting accounting approval' : 'Approved',
    state: invoice.status === 'Pending' ? 'active' : 'done'
  },
  {
    label: 'Paid',
    detail:
    invoice.status === 'Paid' ?
    'Settled in full' :
    invoice.paid > 0 ?
    `${currency(invoice.paid)} of ${currency(invoice.amount)} paid` :
    'Not yet paid',
    state: invoice.status === 'Paid' ? 'done' : invoice.paid > 0 ? 'active' : 'todo'
  }];


  return (
    <div className="detail-column">
      <PageHeader
        back
        backLabel="Invoices"
        title={invoice.id}
        subtitle={`${supplierName(invoice.supplierId)} · ${projectName(invoice.projectId)}`}
        action={<StatusBadge status={invoice.status} />} />
      

      <div className="space-y-6">
        {!invoice.matched &&
        <InlineAlert
          tone="danger"
          title="Three-way match failed"
          body="This invoice references PO-0981, which does not exist as an approved order. Confirm with the supplier before approving payment." />

        }
        {invoice.status === 'Overdue' &&
        <InlineAlert tone="warning" title="Past due" body={`This invoice was due ${invoice.dueDate}. A previous card payment failed.`} />
        }

        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Invoice amount</p>
          <p className="tabular display-tight mt-1 text-[28px] font-extrabold text-ink-900">
            {currency(invoice.amount)}
          </p>
          {invoice.paid > 0 && invoice.paid < invoice.amount &&
          <p className="mt-1 text-[12.5px] font-semibold text-caution-700">
              {currency(invoice.paid)} paid · {currency(invoice.amount - invoice.paid)} remaining
            </p>
          }
          <dl className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
            <DataRow label="Received" value={invoice.receivedAt} />
            <DataRow label="Due" value={invoice.dueDate} />
            <DataRow label="Purchase order" value={invoice.orderId} />
            <DataRow label="Order value" value={order ? currency(order.total) : 'Not found'} />
            <DataRow label="Proof of delivery" value={delivery ? delivery.id : 'None'} />
          </dl>
        </Card>

        <section>
          <SectionHeader title="Matching trace" hint="PO → POD → invoice" />
          <Card className="p-4">
            <PipelineTrail stages={stages} />
          </Card>
        </section>

        {relatedPayments.length > 0 &&
        <section>
            <SectionHeader title="Payments" />
            <Card className="divide-y divide-ink-100">
              {relatedPayments.map((p) =>
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink-900">{p.id}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-400">
                      {p.date} · {p.method} · {p.reference}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular text-[13.5px] font-bold text-ink-900">{currency(p.amount)}</p>
                    <StatusBadge status={p.status} className="mt-1" />
                  </div>
                </div>
            )}
            </Card>
            <p className="mt-2 px-1 text-[11.5px] text-ink-400">
              Payment credentials are never shown — only the last four digits of the funding method.
            </p>
          </section>
        }

        {canManage ?
        <div className="space-y-2.5">
            {invoice.status === 'Pending' &&
          <Button
            block
            size="lg"
            onClick={() => {
              app.setInvoiceStatus(invoice.id, 'Approved');
              app.resolveApproval('AP-504', 'approved');
              app.toast({ tone: 'success', title: 'Invoice approved', body: 'Ready to schedule payment.' });
            }}
            icon={<CheckIcon className="h-4 w-4" />}>
            
                Approve for payment
              </Button>
          }
            {invoice.status !== 'Paid' &&
          <Button
            block
            size="lg"
            variant={invoice.status === 'Pending' ? 'secondary' : 'primary'}
            onClick={() => setPayOpen(true)}
            icon={<CreditCardIcon className="h-4 w-4" />}>
            
                {invoice.paid > 0 ? 'Pay remaining balance' : 'Initiate payment'}
              </Button>
          }
            <Button block variant="ghost" icon={<LinkIcon className="h-4 w-4" />} onClick={() => navigate(`/orders/${invoice.orderId}`)}>
              Open matched purchase order
            </Button>
          </div> :

        <InlineAlert
          tone="info"
          title="Read-only for your role"
          body="Accounting approves invoices and releases payments. You can see status and matching." />

        }
      </div>

      <PaySheet open={payOpen} onClose={() => setPayOpen(false)} invoiceId={invoice.id} />
    </div>);

}

function PaySheet({ open, onClose, invoiceId }: {open: boolean;onClose: () => void;invoiceId: string;}) {
  const app = useApp();
  const invoice = app.invoices.find((i) => i.id === invoiceId)!;
  const remaining = invoice.amount - invoice.paid;
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState('ACH transfer');
  const [phase, setPhase] = useState<'form' | 'processing' | 'failed'>('form');

  const submit = () => {
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0 || value > remaining) {
      setPhase('failed');
      return;
    }
    setPhase('processing');
    window.setTimeout(() => {
      app.payInvoice(invoice.id, value, method);
      app.toast({
        tone: 'success',
        title: 'Payment initiated',
        body: 'The yard sees it as received and will reconcile it against the invoice.'
      });
      setPhase('form');
      onClose();
    }, 1200);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Initiate payment"
      description={`${invoice.id} · ${currency(remaining)} remaining`}
      footer={
      <Button block size="lg" loading={phase === 'processing'} onClick={submit}>
          Pay {currency(Number(amount) || 0)}
        </Button>
      }>
      
      <div className="space-y-3">
        <Input label="Amount" value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value)} />
        <Select label="Funding method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="ACH transfer">ACH transfer · ····4192</option>
          <option value="Corporate card">Corporate card · ····7781</option>
          <option value="Check">Check</option>
        </Select>
        {phase === 'failed' &&
        <InlineAlert
          tone="danger"
          title="Payment could not be created"
          body={`Enter an amount between $1 and ${currency(remaining)}.`} />

        }
        <p className="text-[11.5px] leading-relaxed text-ink-400">
          SM PRO never stores full bank or card credentials. Payments are released through your connected
          finance provider and reconciled against the purchase order.
        </p>
      </div>
    </BottomSheet>);

}