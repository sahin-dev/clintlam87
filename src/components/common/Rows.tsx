import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { StatusBadge } from '../ui/Badge';
import { Progress } from '../ui/Card';
import {
  Delivery,
  Invoice,
  MaterialRequest,
  Payment,
  PlanSet,
  PurchaseOrder,
  Quote,
  Takeoff,
  Task,
  Issue } from
'../../types';
import { currency, qty } from '../../utils/format';
import { projectName } from '../../data/projects';
import { supplierName } from '../../data/procurement';

export function Row({
  onClick,
  children,
  className




}: {onClick?: () => void;children: React.ReactNode;className?: string;}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={twMerge(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth disabled:cursor-default',
        onClick && 'hover:bg-ink-50 active:bg-ink-100',
        className
      )}>
      
      <div className="min-w-0 flex-1">{children}</div>
      {onClick && <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-300" />}
    </button>);

}

function Title({ children }: {children: React.ReactNode;}) {
  return <p className="truncate text-[14px] font-bold text-ink-900">{children}</p>;
}
function Meta({ children }: {children: React.ReactNode;}) {
  return <p className="mt-0.5 truncate text-[12px] text-ink-400">{children}</p>;
}

export function PlanRow({ plan, onOpen }: {plan: PlanSet;onOpen?: () => void;}) {
  return (
    <Row onClick={onOpen}>
      <div className="flex items-center gap-2">
        <Title>
          Version {plan.version} — {plan.name}
        </Title>
        {plan.isCurrent ?
        <StatusBadge status="Current" dot={false} className="bg-brand-50 text-brand-700" /> :

        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-500">
            Previous
          </span>
        }
      </div>
      <Meta>
        {plan.uploadedAt} · {plan.uploadedBy} · {plan.sheets} sheets · {plan.sizeMb} MB
      </Meta>
      <p className="mt-1 truncate text-[12px] text-ink-500">{plan.note}</p>
    </Row>);

}

export function TakeoffRow({ takeoff }: {takeoff: Takeoff;}) {
  const navigate = useNavigate();
  const low = takeoff.items.filter((i) => i.confidence < 75).length;
  return (
    <Row onClick={() => navigate(`/takeoff/${takeoff.id}`)}>
      <div className="flex items-center gap-2">
        <Title>{takeoff.id}</Title>
        <StatusBadge status={takeoff.status} />
      </div>
      <Meta>
        {takeoff.planSetLabel} · {takeoff.items.length} lines
        {low > 0 && ` · ${low} below 75% confidence`}
      </Meta>
      <Meta>
        {takeoff.status === 'Approved' ?
        `Approved by ${takeoff.approvedBy} · ${takeoff.approvedAt}` :
        `Generated ${takeoff.createdAt} · ${takeoff.model}`}
      </Meta>
    </Row>);

}

export function RequestRow({ request, showProject }: {request: MaterialRequest;showProject?: boolean;}) {
  const navigate = useNavigate();
  return (
    <Row onClick={() => navigate(`/procurement/requests/${request.id}`)}>
      <div className="flex items-center gap-2">
        <Title>{request.id}</Title>
        <StatusBadge status={request.status} />
        {request.priority !== 'Normal' && <StatusBadge status={request.priority} dot={false} />}
      </div>
      <Meta>
        {showProject && `${projectName(request.projectId)} · `}
        {request.lines.length} lines · needed {request.requiredBy}
      </Meta>
      <Meta>Raised by {request.requestedBy} · {request.requestedAt}</Meta>
    </Row>);

}

export function QuoteRow({ quote, onClick }: {quote: Quote;onClick?: () => void;}) {
  return (
    <Row onClick={onClick}>
      <div className="flex items-center gap-2">
        <Title>{supplierName(quote.supplierId)}</Title>
        <StatusBadge status={quote.status} />
      </div>
      <Meta>
        {quote.id} · {quote.status === 'Pending' ? 'Awaiting supplier response' : `${currency(quote.total)} · delivery ${quote.deliveryDate}`}
      </Meta>
      {quote.status !== 'Pending' && <Meta>{quote.availability} · valid until {quote.validUntil}</Meta>}
    </Row>);

}

export function OrderRow({ order, showProject }: {order: PurchaseOrder;showProject?: boolean;}) {
  const navigate = useNavigate();
  return (
    <Row onClick={() => navigate(`/orders/${order.id}`)}>
      <div className="flex items-center gap-2">
        <Title>{order.id}</Title>
        <StatusBadge status={order.status} />
      </div>
      <Meta>
        {showProject && `${projectName(order.projectId)} · `}
        {supplierName(order.supplierId)}
      </Meta>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="tabular text-[13px] font-bold text-ink-900">{currency(order.total)}</span>
        <span className="text-[11.5px] text-ink-400">Delivery {order.deliveryDate}</span>
      </div>
    </Row>);

}

export function DeliveryRow({ delivery, showProject }: {delivery: Delivery;showProject?: boolean;}) {
  const navigate = useNavigate();
  return (
    <Row onClick={() => navigate(`/deliveries/${delivery.id}`)}>
      <div className="flex items-center gap-2">
        <Title>{delivery.id}</Title>
        <StatusBadge status={delivery.status} />
      </div>
      <Meta>
        {showProject && `${projectName(delivery.projectId)} · `}
        {supplierName(delivery.supplierId)} · order {delivery.orderId}
      </Meta>
      <Meta>
        {delivery.date} · {delivery.eta} · {delivery.truck === 'Unassigned' ? 'Truck TBD' : `${delivery.truck} · ${delivery.driver}`}
      </Meta>
    </Row>);

}

export function InvoiceRow({ invoice, showProject }: {invoice: Invoice;showProject?: boolean;}) {
  const navigate = useNavigate();
  const pct = invoice.amount ? invoice.paid / invoice.amount * 100 : 0;
  return (
    <Row onClick={() => navigate(`/accounting/invoices/${invoice.id}`)}>
      <div className="flex items-center gap-2">
        <Title>{invoice.id}</Title>
        <StatusBadge status={invoice.status} />
      </div>
      <Meta>
        {showProject && `${projectName(invoice.projectId)} · `}
        {supplierName(invoice.supplierId)} · {invoice.orderId}
      </Meta>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="tabular text-[13px] font-bold text-ink-900">{currency(invoice.amount)}</span>
        <span className="text-[11.5px] text-ink-400">Due {invoice.dueDate}</span>
      </div>
      {invoice.paid > 0 && invoice.paid < invoice.amount &&
      <Progress value={pct} tone="positive" className="mt-2" />
      }
    </Row>);

}

export function PaymentRow({ payment }: {payment: Payment;}) {
  return (
    <Row>
      <div className="flex items-center gap-2">
        <Title>{payment.id}</Title>
        <StatusBadge status={payment.status} />
      </div>
      <Meta>
        {supplierName(payment.supplierId)} · {payment.invoiceId} · {payment.method}
      </Meta>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="tabular text-[13px] font-bold text-ink-900">{currency(payment.amount)}</span>
        <span className="text-[11.5px] text-ink-400">
          {payment.date} · {payment.reference}
        </span>
      </div>
    </Row>);

}

export function TaskRow({ task }: {task: Task;}) {
  return (
    <Row>
      <div className="flex items-center gap-2">
        <Title>{task.title}</Title>
      </div>
      <Meta>
        {task.assignee} · due {task.dueDate} · {task.id}
      </Meta>
      <div className="mt-1.5 flex gap-1.5">
        <StatusBadge status={task.status} />
        <StatusBadge status={task.priority} dot={false} />
      </div>
    </Row>);

}

export function IssueRow({ issue }: {issue: Issue;}) {
  return (
    <Row>
      <div className="flex items-center gap-2">
        <Title>{issue.title}</Title>
      </div>
      <Meta>
        {issue.id} · {issue.category} · {issue.reportedBy} · {issue.at}
        {issue.photos > 0 && ` · ${issue.photos} photos`}
      </Meta>
      <div className="mt-1.5 flex gap-1.5">
        <StatusBadge status={issue.status} />
        <StatusBadge status={issue.priority} dot={false} />
      </div>
    </Row>);

}

export function MaterialLineRow({
  item,
  quantity,
  unit,
  right





}: {item: string;quantity: number;unit: string;right?: React.ReactNode;}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-semibold text-ink-900">{item}</p>
        <p className="tabular mt-0.5 text-[12px] text-ink-400">
          {qty(quantity)} {unit}
        </p>
      </div>
      {right}
    </div>);

}