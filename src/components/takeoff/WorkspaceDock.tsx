import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  ArrowRightLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GitCompareIcon,
  ShieldCheckIcon,
  TriangleAlertIcon } from
'lucide-react';
import {
  IssueSeverity,
  Reconciliation,
  RevisionDelta,
  TakeoffIssue,
  TakeoffRun,
  VerificationGate } from
'../../types/takeoff';
import { ApprovalGateBanner, GateList } from '../smpro/Verification';
import { SpecLabel } from '../smpro/Primitives';
import { Button } from '../ui/Button';
import { qty } from '../../utils/format';

type DockTab = 'issues' | 'reconciliation' | 'verification' | 'revisions';

const SEVERITY: Record<IssueSeverity, {label: string;spine: string;chip: string;}> = {
  critical: { label: 'Critical', spine: 'text-danger-600', chip: 'bg-danger-600 text-white' },
  high: { label: 'High', spine: 'text-caution-600', chip: 'bg-caution-500 text-ink-900' },
  medium: { label: 'Medium', spine: 'text-info-500', chip: 'bg-info-100 text-info-700' },
  low: { label: 'Low', spine: 'text-ink-300', chip: 'bg-ink-100 text-ink-600' }
};

/**
 * The workspace dock: the four review activities that gate an approval, kept
 * docked under the drawing rather than scattered across separate pages. A
 * reviewer works the issue list without losing the sheet they are on.
 */
export function WorkspaceDock({
  run,
  approved,
  canReview,
  onResolveIssue,
  onResolveReconciliation,
  onFocusSheet,
  collapsed,
  onToggle









}: {run: TakeoffRun;approved: boolean;canReview: boolean;onResolveIssue: (issueId: string, choice: string, note: string) => void;onResolveReconciliation: (id: string, note: string) => void;onFocusSheet: (sheetCode: string) => void;collapsed: boolean;onToggle: () => void;}) {
  const [tab, setTab] = useState<DockTab>('issues');

  const openIssues = run.issues.filter((i) => i.status === 'open');
  const mismatches = run.reconciliations.filter((r) => r.status === 'mismatch');
  const blockingGates = run.gates.filter(
    (g) => g.required && (g.state === 'fail' || g.state === 'pending')
  );

  const tabs: {key: DockTab;label: string;count: number;tone: 'danger' | 'neutral';}[] = [
  { key: 'issues', label: 'AI issues', count: openIssues.length, tone: 'danger' },
  { key: 'reconciliation', label: 'Cross-sheet', count: mismatches.length, tone: 'danger' },
  { key: 'verification', label: 'Verification', count: blockingGates.length, tone: 'danger' },
  { key: 'revisions', label: `${run.previousRevision} → ${run.revision}`, count: 0, tone: 'neutral' }];


  return (
    <section
      className={twMerge(
        'flex min-h-0 flex-col border-t border-ink-200 bg-white',
        collapsed ? 'h-[42px]' : 'h-[300px]'
      )}
      aria-label="Takeoff review dock">
      
      <div className="flex shrink-0 items-stretch border-b border-ink-100 bg-ink-50/70">
        {tabs.map((t) =>
        <button
          key={t.key}
          onClick={() => {
            setTab(t.key);
            if (collapsed) onToggle();
          }}
          aria-pressed={tab === t.key && !collapsed}
          className={twMerge(
            'flex items-center gap-1.5 border-r border-ink-100 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] transition-colors duration-150 ease-smooth',
            tab === t.key && !collapsed ?
            'bg-white text-ink-900 shadow-[inset_0_-2px_0_0_#F96317]' :
            'text-ink-400 hover:text-ink-700'
          )}>
          
            {t.label}
            {t.count > 0 &&
          <span
            className={twMerge(
              'measure rounded-[2px] px-1 py-[1px] text-[9.5px]',
              t.tone === 'danger' ? 'bg-danger-600 text-white' : 'bg-ink-200 text-ink-700'
            )}>
            
                {t.count}
              </span>
          }
          </button>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand review dock' : 'Collapse review dock'}
          className="ml-auto px-3 text-ink-400 transition-colors duration-150 ease-smooth hover:text-ink-800">
          
          {collapsed ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed &&
      <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === 'issues' &&
        <IssueQueue
          issues={run.issues}
          canReview={canReview && !approved}
          onResolve={onResolveIssue}
          onFocusSheet={onFocusSheet} />

        }
          {tab === 'reconciliation' &&
        <ReconciliationTable
          records={run.reconciliations}
          canReview={canReview && !approved}
          onResolve={onResolveReconciliation}
          onFocusSheet={onFocusSheet} />

        }
          {tab === 'verification' && <VerificationPane gates={run.gates} approved={approved} />}
          {tab === 'revisions' && <RevisionPane run={run} onFocusSheet={onFocusSheet} />}
        </div>
      }
    </section>);

}

function IssueQueue({
  issues,
  canReview,
  onResolve,
  onFocusSheet





}: {issues: TakeoffIssue[];canReview: boolean;onResolve: (id: string, choice: string, note: string) => void;onFocusSheet: (sheetCode: string) => void;}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const list = issues.filter((i) => showResolved ? true : i.status === 'open');
  const counts = (['critical', 'high', 'medium', 'low'] as IssueSeverity[]).map((s) => ({
    s,
    n: issues.filter((i) => i.severity === s && i.status === 'open').length
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-3.5 py-2">
        {counts.map(({ s, n }) =>
        <span key={s} className="flex items-center gap-1.5">
            <span className={twMerge('spec-label rounded-[2px] px-1 py-[1px]', SEVERITY[s].chip)}>
              {SEVERITY[s].label}
            </span>
            <span className="measure text-[12px] font-bold text-ink-900">{n}</span>
          </span>
        )}
        <button
          onClick={() => setShowResolved((v) => !v)}
          className="ml-auto text-[11px] font-bold uppercase tracking-[0.05em] text-ink-400 transition-colors duration-150 ease-smooth hover:text-ink-700">
          
          {showResolved ? 'Hide resolved' : 'Show resolved'}
        </button>
      </div>

      {list.length === 0 ?
      <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">
          No open issues. Every detection agreed with its sources.
        </p> :

      <ul>
          {list.map((issue) => {
          const open = openId === issue.id;
          const sev = SEVERITY[issue.severity];
          return (
            <li key={issue.id} className={twMerge('spine border-b border-ink-100', sev.spine)}>
                <button
                onClick={() => setOpenId(open ? null : issue.id)}
                className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
                
                  <span className={twMerge('spec-label mt-[3px] shrink-0 rounded-[2px] px-1 py-[1px]', sev.chip)}>
                    {sev.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-ink-900">
                      {issue.title}
                    </span>
                    <span className="measure mt-0.5 block text-[10.5px] text-ink-400">
                      {issue.sheetCodes.join(' · ')}
                      {issue.status === 'resolved' && ' · resolved'}
                    </span>
                  </span>
                  {issue.status === 'resolved' ?
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive-600" strokeWidth={3} /> :

                <TriangleAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-current" />
                }
                </button>

                {open &&
              <div className="border-t border-ink-100 bg-ink-50/60 px-3.5 py-3">
                    <p className="text-[12.5px] leading-relaxed text-ink-700">{issue.detail}</p>

                    {issue.disagreement &&
                <DisagreementPanel
                  d={issue.disagreement}
                  canReview={canReview && issue.status === 'open'}
                  onChoose={(choice, note) => onResolve(issue.id, choice, note)} />

                }

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {issue.sheetCodes.map((code) =>
                  <button
                    key={code}
                    onClick={() => onFocusSheet(code)}
                    className="measure rounded-[3px] border border-ink-200 bg-white px-2 py-1 text-[10.5px] font-bold text-ink-600 transition-colors duration-150 ease-smooth hover:border-brand-300 hover:text-brand-600">
                    
                          Open {code}
                        </button>
                  )}
                      {issue.status === 'open' && canReview && !issue.disagreement &&
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={() =>
                    onResolve(issue.id, 'Reviewed and accepted', 'Checked against the source sheet.')
                    }
                    icon={<CheckIcon className="h-3.5 w-3.5" />}>
                    
                          Accept &amp; resolve
                        </Button>
                  }
                    </div>

                    {issue.resolution &&
                <div className="mt-3 border-t border-ink-200 pt-2.5">
                        <SpecLabel>Resolution</SpecLabel>
                        <p className="mt-1 text-[12px] font-semibold text-ink-800">
                          {issue.resolution.choice}
                        </p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500">
                          {issue.resolution.note}
                        </p>
                        <p className="measure mt-1 text-[10.5px] text-ink-400">
                          {issue.resolution.by} · {issue.resolution.at}
                        </p>
                      </div>
                }
                  </div>
              }
              </li>);

        })}
        </ul>
      }
    </div>);

}

/** Two engines, two numbers, one decision — recorded with its reason. */
function DisagreementPanel({
  d,
  canReview,
  onChoose




}: {d: NonNullable<TakeoffIssue['disagreement']>;canReview: boolean;onChoose: (choice: string, note: string) => void;}) {
  const [manual, setManual] = useState('');
  const diff = Math.abs(d.engineValue - d.aiValue);

  return (
    <div className="mt-3 border border-ink-200 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2">
        <ArrowRightLeftIcon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        <SpecLabel>{d.measure}</SpecLabel>
        <span className="measure ml-auto text-[10.5px] font-bold text-danger-600">
          {diff} {d.unit} apart
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-ink-100">
        <div className="px-3 py-2.5">
          <SpecLabel>Vision model</SpecLabel>
          <p className="measure mt-1 text-[19px] font-bold leading-none text-ink-900">
            {d.aiValue}
            <span className="ml-1 text-[10px] font-medium text-ink-400">{d.unit}</span>
          </p>
        </div>
        <div className="px-3 py-2.5">
          <SpecLabel>{d.engineName}</SpecLabel>
          <p className="measure mt-1 text-[19px] font-bold leading-none text-ink-900">
            {d.engineValue}
            <span className="ml-1 text-[10px] font-medium text-ink-400">{d.unit}</span>
          </p>
        </div>
      </div>
      {canReview &&
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 bg-ink-50/70 px-3 py-2.5">
          <Button
          size="sm"
          variant="secondary"
          onClick={() => onChoose(`Accepted vision model — ${d.aiValue} ${d.unit}`, 'Vision measurement matched the dimension string.')}>
          
            Accept {d.aiValue}
          </Button>
          <Button
          size="sm"
          variant="secondary"
          onClick={() => onChoose(`Accepted ${d.engineName} — ${d.engineValue} ${d.unit}`, 'Geometry trace followed the wall centreline correctly.')}>
          
            Accept {d.engineValue}
          </Button>
          <div className="flex items-center gap-1.5">
            <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="Own value"
            aria-label="Enter your own measurement"
            className="measure w-[92px] rounded-[3px] border border-ink-200 bg-white px-2 py-1.5 text-[12px] text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none" />
          
            <Button
            size="sm"
            disabled={!manual || Number.isNaN(Number(manual))}
            onClick={() => onChoose(`Measured by hand — ${manual} ${d.unit}`, 'Scaled from the drawing during review.')}>
            
              Use
            </Button>
          </div>
        </div>
      }
    </div>);

}

function ReconciliationTable({
  records,
  canReview,
  onResolve,
  onFocusSheet





}: {records: Reconciliation[];canReview: boolean;onResolve: (id: string, note: string) => void;onFocusSheet: (sheetCode: string) => void;}) {
  return (
    <div>
      <p className="border-b border-ink-100 px-3.5 py-2 text-[11.5px] leading-relaxed text-ink-500">
        Counts that must agree across the set. A mismatch means the drawings contradict each other,
        not that the model is unsure.
      </p>
      <ul className="divide-y divide-ink-100">
        {records.map((r) => {
          const bad = r.status === 'mismatch';
          return (
            <li key={r.id} className={twMerge('spine px-3.5 py-3', bad ? 'text-danger-600' : 'text-positive-500')}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[13px] font-bold text-ink-900">{r.subject}</p>
                <span
                  className={twMerge(
                    'spec-label rounded-[2px] px-1.5 py-[2px]',
                    bad ? 'bg-danger-600 text-white' : r.status === 'resolved' ? 'bg-ink-200 text-ink-700' : 'bg-positive-50 text-positive-700'
                  )}>
                  
                  {bad ? 'Mismatch' : r.status === 'resolved' ? 'Resolved' : 'Matched'}
                </span>

                <div className="ml-auto flex items-center gap-3">
                  <SideCount
                    code={r.left.sheetCode}
                    label={r.left.label}
                    count={r.left.count}
                    onFocus={() => onFocusSheet(r.left.sheetCode.split(' ')[0])} />
                  
                  <ArrowRightLeftIcon
                    className={twMerge('h-3.5 w-3.5 shrink-0', bad ? 'text-danger-500' : 'text-ink-300')}
                    aria-hidden />
                  
                  <SideCount
                    code={r.right.sheetCode}
                    label={r.right.label}
                    count={r.right.count}
                    onFocus={() => onFocusSheet(r.right.sheetCode.split(' ')[0])} />
                  
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{r.note}</p>
              {bad && canReview &&
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => onResolve(r.id, 'Reconciled during review against both source sheets.')}
                icon={<CheckIcon className="h-3.5 w-3.5" />}>
                
                  Mark reconciled
                </Button>
              }
            </li>);

        })}
      </ul>
    </div>);

}

function SideCount({
  code,
  label,
  count,
  onFocus





}: {code: string;label: string;count: number;onFocus: () => void;}) {
  return (
    <button onClick={onFocus} className="min-w-0 text-right transition-opacity duration-150 ease-smooth hover:opacity-70">
      <p className="measure text-[10px] font-bold text-ink-400">{code}</p>
      <p className="measure text-[16px] font-bold leading-none text-ink-900">{count}</p>
      <p className="truncate text-[10.5px] text-ink-400">{label}</p>
    </button>);

}

function VerificationPane({ gates, approved }: {gates: VerificationGate[];approved: boolean;}) {
  return (
    <div>
      <div className="p-3.5 pb-0">
        <ApprovalGateBanner gates={gates} approved={approved} />
      </div>
      <div className="mt-3 flex items-center gap-2 border-b border-ink-100 px-3.5 pb-2">
        <ShieldCheckIcon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        <SpecLabel>Verification gates</SpecLabel>
      </div>
      <GateList gates={gates} />
    </div>);

}

function RevisionPane({ run, onFocusSheet }: {run: TakeoffRun;onFocusSheet: (code: string) => void;}) {
  const changed = run.revisionDeltas.filter((d) => d.change !== 'unchanged');
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-ink-100 px-3.5 py-2">
        <GitCompareIcon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        <SpecLabel>
          {run.previousRevision} → {run.revision}
        </SpecLabel>
        <span className="measure ml-auto text-[10.5px] text-ink-400">
          {changed.length} of {run.revisionDeltas.length} lines changed
        </span>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/70">
            <th className="spec-label px-3.5 py-1.5">Material</th>
            <th className="spec-label px-2 py-1.5 text-right">{run.previousRevision}</th>
            <th className="spec-label px-2 py-1.5 text-right">{run.revision}</th>
            <th className="spec-label px-2 py-1.5 text-right">Δ</th>
            <th className="spec-label px-3.5 py-1.5">What drove the change</th>
          </tr>
        </thead>
        <tbody>
          {run.revisionDeltas.map((d) =>
          <RevisionRow key={d.lineId} d={d} onFocusSheet={onFocusSheet} />
          )}
        </tbody>
      </table>
      <p className="px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-400">
        Earlier revisions are never overwritten — {run.previousRevision} keeps its own approved
        takeoff and its own quantities.
      </p>
    </div>);

}

function RevisionRow({ d, onFocusSheet }: {d: RevisionDelta;onFocusSheet: (code: string) => void;}) {
  const delta = d.currentQuantity - d.previousQuantity;
  const tone =
  d.change === 'added' || d.change === 'increased' ?
  'text-danger-600' :
  d.change === 'removed' || d.change === 'decreased' ?
  'text-positive-700' :
  'text-ink-400';

  return (
    <tr className="border-b border-ink-100 last:border-0">
      <td className="px-3.5 py-2">
        <p className="text-[12.5px] font-semibold text-ink-900">{d.item}</p>
        <button
          onClick={() => onFocusSheet(d.sheetCode)}
          className="measure mt-0.5 text-[10px] font-bold text-ink-400 transition-colors duration-150 ease-smooth hover:text-brand-600">
          
          {d.sheetCode}
        </button>
      </td>
      <td className="measure px-2 py-2 text-right text-[12.5px] text-ink-500">
        {d.previousQuantity === 0 ? '—' : qty(d.previousQuantity)}
      </td>
      <td className="measure px-2 py-2 text-right text-[12.5px] font-bold text-ink-900">
        {qty(d.currentQuantity)}
      </td>
      <td className={twMerge('measure px-2 py-2 text-right text-[12.5px] font-bold', tone)}>
        {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${qty(delta)}`}
      </td>
      <td className="px-3.5 py-2 text-[11.5px] leading-relaxed text-ink-500">{d.driver}</td>
    </tr>);

}