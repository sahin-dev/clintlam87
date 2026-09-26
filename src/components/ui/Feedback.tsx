import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  LockIcon,
  RefreshCwIcon,
  XIcon } from
'lucide-react';
import { Button } from './Button';
import { useApp } from '../../contexts/AppContext';

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction






}: {icon?: React.ReactNode;title: string;body: string;action?: string;onAction?: () => void;}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-ink-400">
        {icon ?? <InfoIcon className="h-5 w-5" />}
      </div>
      <h3 className="display-tight mt-4 text-[15px] font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-ink-400">{body}</p>
      {action &&
      <Button size="sm" className="mt-4" onClick={onAction}>
          {action}
        </Button>
      }
    </div>);

}

export function ErrorState({
  title,
  body,
  action = 'Try again',
  onAction,
  variant = 'error'






}: {title: string;body: string;action?: string;onAction?: () => void;variant?: 'error' | 'permission';}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card">
      <div
        className={twMerge(
          'mx-auto flex h-12 w-12 items-center justify-center rounded-xl',
          variant === 'error' ? 'bg-danger-50 text-danger-600' : 'bg-ink-50 text-ink-500'
        )}>
        
        {variant === 'error' ? <AlertTriangleIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
      </div>
      <h3 className="display-tight mt-4 text-[15px] font-bold text-ink-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[300px] text-[13px] leading-relaxed text-ink-500">{body}</p>
      {onAction &&
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={onAction}
        icon={<RefreshCwIcon className="h-3.5 w-3.5" />}>
        
          {action}
        </Button>
      }
    </div>);

}

export function InlineAlert({
  tone = 'info',
  title,
  body,
  action,
  onAction,
  className







}: {tone?: 'info' | 'warning' | 'danger' | 'success';title: string;body?: string;action?: string;onAction?: () => void;className?: string;}) {
  const map = {
    info: 'bg-info-50 text-info-700 border-info-100',
    warning: 'bg-caution-50 text-caution-700 border-caution-100',
    danger: 'bg-danger-50 text-danger-700 border-danger-100',
    success: 'bg-positive-50 text-positive-700 border-positive-100'
  } as const;
  return (
    <div className={twMerge('rounded-[4px] border px-3.5 py-3', map[tone], className)}>
      <div className="flex gap-2.5">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">{title}</p>
          {body && <p className="mt-0.5 text-[12.5px] leading-relaxed opacity-90">{body}</p>}
          {action &&
          <button
            onClick={onAction}
            className="mt-2 text-[12.5px] font-bold underline underline-offset-2">
            
              {action}
            </button>
          }
        </div>
      </div>
    </div>);

}

export function Skeleton({ className }: {className?: string;}) {
  return <div className={twMerge('animate-pulse rounded-lg bg-ink-100', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <Skeleton className="mt-4 h-1.5 w-full" />
    </div>);

}

export function SkeletonRows({ rows = 4 }: {rows?: number;}) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/4" />
          </div>
        </div>
      )}
    </div>);

}

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) =>
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl bg-ink-900 px-3.5 py-3 text-white shadow-raised">
          
            {t.tone === 'success' ?
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-positive-500" /> :
          t.tone === 'error' ?
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" /> :

          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          }
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[12px] leading-snug text-white/70">{t.body}</p>}
            </div>
            <button aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-white/50">
              <XIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

}