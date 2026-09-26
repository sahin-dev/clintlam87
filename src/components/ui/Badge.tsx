import React from 'react';
import { twMerge } from 'tailwind-merge';

export type Tone = 'neutral' | 'brand' | 'positive' | 'info' | 'caution' | 'danger' | 'violet';

const tones: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-700',
  positive: 'bg-positive-50 text-positive-700',
  info: 'bg-info-50 text-info-700',
  caution: 'bg-caution-50 text-caution-700',
  danger: 'bg-danger-50 text-danger-700',
  violet: 'bg-violet-50 text-violet-600'
};

const STATUS_TONES: Record<string, Tone> = {
  // projects
  'In Progress': 'info',
  'At Risk': 'danger',
  Planning: 'neutral',
  Completed: 'positive',
  // takeoff
  Processing: 'violet',
  'Review Required': 'caution',
  'In Review': 'caution',
  Approved: 'positive',
  Failed: 'danger',
  // requests
  Draft: 'neutral',
  Submitted: 'info',
  'Under Review': 'caution',
  Pricing: 'violet',
  'Quote Received': 'info',
  Ordered: 'positive',
  // quotes
  Pending: 'neutral',
  Received: 'info',
  Selected: 'positive',
  Rejected: 'danger',
  Expired: 'danger',
  // orders
  'Pending Approval': 'caution',
  Confirmed: 'info',
  'In Production': 'violet',
  Dispatched: 'info',
  Delivered: 'positive',
  Closed: 'neutral',
  // deliveries
  Scheduled: 'info',
  'Out for Delivery': 'brand',
  Delayed: 'danger',
  Cancelled: 'neutral',
  // finance
  'Partially Paid': 'caution',
  Paid: 'positive',
  Overdue: 'danger',
  Partial: 'caution',
  Refunded: 'neutral',
  // priority
  High: 'danger',
  Urgent: 'danger',
  Medium: 'caution',
  Normal: 'neutral',
  Low: 'neutral',
  Open: 'caution',
  Assigned: 'info',
  Resolved: 'positive',
  Preferred: 'brand',
  Active: 'positive',
  Prospect: 'neutral'
};

export function Badge({
  children,
  tone = 'neutral',
  dot,
  className





}: {children: React.ReactNode;tone?: Tone;dot?: boolean;className?: string;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[11px] font-semibold tracking-[-0.01em]',
        tones[tone],
        className
      )}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-[1px] bg-current" />}
      {children}
    </span>);

}

export function StatusBadge({
  status,
  dot = true,
  className




}: {status: string;dot?: boolean;className?: string;}) {
  return (
    <Badge tone={STATUS_TONES[status] ?? 'neutral'} dot={dot} className={className}>
      {status}
    </Badge>);

}

export function ConfidenceChip({ value }: {value: number;}) {
  const tone: Tone = value >= 90 ? 'positive' : value >= 75 ? 'caution' : 'danger';
  return (
    <Badge tone={tone} dot={false} className="measure">
      {value}% confidence
    </Badge>);

}