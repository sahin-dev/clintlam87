import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquareIcon, TruckIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, DataRow, SectionHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { PipelineTrail, TrailStage } from '../../components/common/PipelineTrail';
import { DeliveryRow, InvoiceRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { currency, qty } from '../../utils/format';
import { supplierName } from '../../data/procurement';
import { projectName } from '../../data/projects';

export function OrderDetail() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const order = app.orders.find((o) => o.id === orderId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Order not found" body="This purchase order may have been cancelled." action="Back to orders" onAction={() => navigate('/orders')} />
      </div>);

  }

  const deliveries = app.deliveries.filter((d) => d.orderId === order.id);
  const invoices = app.invoices.filter((i) => i.orderId === order.id);
  const pending = order.status === 'Pending Approval';

  const stages: TrailStage[] = [
  { label: 'Proposal created', detail: `${order.createdBy} · ${order.createdAt}`, state: 'done' },
  {
    label: 'Internal approval',
    detail: order.approvedBy ? `Approved by ${order.approvedBy}` : 'Awaiting owner approval',
    state: order.approvedBy ? 'done' : 'active'
  },
  {
    label: 'Supplier confirmation',
    detail: ['Confirmed', 'In Production', 'Dispatched', 'Delivered', 'Closed'].includes(order.status) ?
    'Confirmed by supplier' :
    'Not yet sent',
    state: ['Confirmed', 'In Production', 'Dispatched', 'Delivered', 'Closed'].includes(order.status) ? 'done' : 'todo'
  },
  {
    label: 'Delivery',
    detail: deliveries.length ? `${deliveries[0].id} · ${deliveries[0].status}` : `Committed ${order.deliveryDate}`,
    state: deliveries.some((d) => d.pod) ? 'done' : deliveries.length ? 'active' : 'todo'
  },
  {
    label: 'Invoice & payment',
    detail: invoices.length ? `${invoices[0].id} · ${invoices[0].status}` : 'Not received',
    state: invoices.some((i) => i.status === 'Paid') ? 'done' : invoices.length ? 'active' : 'todo'
  }];


  return (
    <div className="detail-column">
      <PageHeader
        back
        backLabel="Purchase orders"
        title={order.id}
        subtitle={`${projectName(order.projectId)} · ${supplierName(order.supplierId)}`}
        action={<StatusBadge status={order.status} />} />
      

      <div className="space-y-6">
        {pending && app.can('proposal.approve') &&
        <InlineAlert
          tone="warning"
          title="This proposal needs your approval"
          body={`${currency(order.total)} to ${supplierName(order.supplierId)}, delivery committed ${order.deliveryDate}.`} />

        }

        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Order value</p>
          <p className="tabular display-tight mt-1 text-[28px] font-extrabold text-ink-900">
            {currency(order.total)}
          </p>
          <dl className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
            <DataRow label="Source quote" value={order.quoteId} />
            <DataRow label="Raised by" value={`${order.createdBy} · ${order.createdAt}`} />
            <DataRow label="Approved by" value={order.approvedBy ?? 'Pending'} />
            <DataRow label="Delivery date" value={order.deliveryDate} />
            <DataRow label="Payment terms" value="Net 30 from delivery" />
          </dl>
        </Card>

        <section>
          <SectionHeader title="Lines" hint={`${order.lines.length} items`} />
          <Card className="divide-y divide-ink-100">
            {order.lines.map((line) =>
            <div key={line.item} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink-900">{line.item}</p>
                  <p className="tabular mt-0.5 text-[12px] text-ink-400">
                    {qty(line.qty)} {line.unit} × ${line.unitPrice.toFixed(2)}
                  </p>
                </div>
                <span className="tabular shrink-0 text-[13.5px] font-bold text-ink-900">
                  {currency(line.qty * line.unitPrice)}
                </span>
              </div>
            )}
          </Card>
        </section>

        <section>
          <SectionHeader title="Order trace" />
          <Card className="p-4">
            <PipelineTrail stages={stages} />
          </Card>
        </section>

        {deliveries.length > 0 &&
        <section>
            <SectionHeader title="Deliveries" />
            <Card className="divide-y divide-ink-100">
              {deliveries.map((d) =>
            <DeliveryRow key={d.id} delivery={d} />
            )}
            </Card>
          </section>
        }

        {invoices.length > 0 && app.can('invoice.view') &&
        <section>
            <SectionHeader title="Invoices" />
            <Card className="divide-y divide-ink-100">
              {invoices.map((i) =>
            <InvoiceRow key={i.id} invoice={i} />
            )}
            </Card>
          </section>
        }

        {pending && app.can('proposal.approve') &&
        <div className="flex gap-2.5">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setRevisionOpen(true)}>
              Request changes
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setConfirmOpen(true)}>
              Approve order
            </Button>
          </div>
        }

        {!pending &&
        <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/messages')} icon={<MessageSquareIcon className="h-4 w-4" />}>
              Message supplier
            </Button>
            {deliveries[0] &&
          <Button className="flex-1" onClick={() => navigate(`/deliveries/${deliveries[0].id}`)} icon={<TruckIcon className="h-4 w-4" />}>
                Track delivery
              </Button>
          }
          </div>
        }
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Approve ${order.id}?`}
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              app.approveOrder(order.id);
              app.resolveApproval('AP-501', 'approved');
              setConfirmOpen(false);
              app.toast({
                tone: 'success',
                title: 'Order approved',
                body: 'The purchase order was released to the yard for fulfilment.'
              });
            }}>
            
              Approve
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-ink-600">
          Approving commits {currency(order.total)} against {projectName(order.projectId)} and releases the
          purchase order to {supplierName(order.supplierId)}. Your approval is recorded in the audit log.
        </p>
      </Modal>

      <Modal
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Send back for revision"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setRevisionOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              app.resolveApproval('AP-501', 'changes_requested');
              setRevisionOpen(false);
              app.toast({ tone: 'info', title: 'Returned to purchasing', body: 'Dana Kim was notified.' });
            }}>
            
              Request changes
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-ink-600">
          The proposal goes back to the purchasing manager with your note. Nothing is sent to the supplier.
        </p>
      </Modal>
    </div>);

}