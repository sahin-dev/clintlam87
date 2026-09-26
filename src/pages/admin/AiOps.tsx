import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react';
import { Panel, SpecLabel, Measured, TickRule, WorkHeading } from '../../components/smpro/Primitives';
import { PanelSection, UsageMeter } from '../../components/admin/Records';
import { Cell, ListToolbar, RecordTable, Row } from '../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select, Checkbox } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { useAdmin } from '../../contexts/AdminContext';
import { orgName, PLAN_BY_ID } from '../../data/platform';
import { AiConfig } from '../../types/admin';

const JOB_TONE = (s: string) =>
s === 'Completed' ?
'positive' :
s === 'Failed' ?
'danger' :
s === 'Retrying' ?
'caution' :
s === 'Cancelled' ?
'neutral' :
s === 'Queued' ?
'neutral' :
'violet';

export function AiOverview() {
  const navigate = useNavigate();
  const { aiJobs, aiIssues, organizations, aiConfig } = useAdmin();

  const completed = aiJobs.filter((j) => j.status === 'Completed').length;
  const failed = aiJobs.filter((j) => j.status === 'Failed').length;
  const running = aiJobs.filter((j) => ['Processing', 'Retrying', 'Queued'].includes(j.status)).length;
  const sheets = organizations.reduce((s, o) => s + o.usage.aiSheets, 0);
  const successRate = Math.round(completed / Math.max(1, completed + failed) * 100);
  const openIssues = aiIssues.filter((i) => i.status !== 'Resolved');

  const byOrg = organizations.
  filter((o) => o.usage.aiSheets > 0).
  sort((a, b) => b.usage.aiSheets - a.usage.aiSheets);

  return (
    <div className="pt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <SpecLabel>AI management</SpecLabel>
          <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
            Model runs across the platform
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Running {aiConfig.model}. Confidence below {aiConfig.confidenceThreshold}% is marked
            review-required inside the tenant — it never reads as verified.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin/ai/config')}>
            Configuration
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/ai/jobs')}>
            Run monitor
          </Button>
        </div>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
          {[
          { label: 'Runs today', value: String(aiJobs.length) },
          { label: 'Completed', value: String(completed), tone: 'positive' as const },
          { label: 'Failed', value: String(failed), tone: failed ? 'danger' as const : 'default' as const },
          { label: 'In flight', value: String(running), tone: 'brand' as const },
          { label: 'Success rate', value: `${successRate}`, unit: '%' },
          { label: 'Sheets this month', value: sheets.toLocaleString() },
          { label: 'Open issues', value: String(openIssues.length), tone: openIssues.length ? 'danger' as const : 'default' as const }].
          map((m) =>
          <div key={m.label} className="min-w-[150px] flex-1 px-4 py-3.5">
              <Measured label={m.label} value={m.value} unit={'unit' in m ? m.unit : undefined} tone={m.tone ?? 'default'} />
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PanelSection label="Consumption" title="AI usage by organization">
          <ul className="divide-y divide-ink-100">
            {byOrg.map((o) => {
              const limit = o.planId ? PLAN_BY_ID[o.planId].limits.aiSheets : 0;
              return (
                <li key={o.id} className="px-4 py-3.5">
                  <button
                    onClick={() => navigate(`/admin/org/${o.id}`)}
                    className="block w-full text-left">
                    
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] font-semibold text-ink-900">{o.name}</span>
                      <span className="measure text-[11px] text-ink-400">
                        {o.kind === 'supplier' ? 'SUPPLIER' : 'BUILDER · VIA SUPPLIER LICENCE'}
                      </span>
                    </div>
                    <div className="mt-2">
                      {limit ?
                      <UsageMeter label="Sheets this month" used={o.usage.aiSheets} limit={limit} /> :

                      <p className="measure text-[12px] text-ink-500">
                          {o.usage.aiSheets.toLocaleString()} SHEETS · DRAWN FROM THEIR SUPPLIER&apos;S ALLOWANCE
                        </p>
                      }
                    </div>
                  </button>
                </li>);

            })}
          </ul>
        </PanelSection>

        <div className="space-y-5">
          <PanelSection
            label="Attention"
            title="Open AI issues"
            action={
            <button onClick={() => navigate('/admin/ai/issues')} className="text-[12px] font-semibold text-brand-600">
                All issues
              </button>
            }>
            
            <ul className="divide-y divide-ink-100">
              {openIssues.map((i) =>
              <li key={i.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={i.severity === 'Critical' ? 'danger' : i.severity === 'High' ? 'caution' : 'info'}>
                      {i.severity}
                    </Badge>
                    <span className="measure truncate text-[11px] text-ink-400">{i.kind}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-ink-700">{i.detail}</p>
                  <p className="measure mt-1 text-[10.5px] text-ink-400">
                    {orgName(i.orgId).toUpperCase()} · {i.takeoffRef}
                  </p>
                </li>
              )}
            </ul>
          </PanelSection>

          <PanelSection label="Accuracy" title="Verification outcomes">
            <dl className="divide-y divide-ink-100 px-4">
              {[
              ['Quantities accepted unchanged', '78%'],
              ['Corrected during human review', '19%'],
              ['Rejected outright', '3%'],
              ['Mean attribute confidence', '91.4%'],
              ['Runs needing reconciliation', '31%']].
              map(([k, v]) =>
              <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[12.5px] text-ink-600">{k}</dt>
                  <dd className="measure text-[13px] font-semibold text-ink-900">{v}</dd>
                </div>
              )}
            </dl>
            <TickRule />
            <p className="px-4 py-3 text-[12px] leading-relaxed text-ink-400">
              A high confidence score never marks a quantity verified. Only a human approval inside the tenant
              does that.
            </p>
          </PanelSection>
        </div>
      </div>
    </div>);

}

export function AiJobs() {
  const { aiJobs, retryJob, cancelJob } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = aiJobs.filter((j) => {
    if (filter !== 'All' && j.status !== filter) return false;
    const q = query.toLowerCase();
    return (
      j.project.toLowerCase().includes(q) ||
      j.takeoffRef.toLowerCase().includes(q) ||
      orgName(j.orgId).toLowerCase().includes(q));

  });

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>AI management</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Run monitor</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500">
          Every model run on the platform, with the sheet progress and failure reason behind it.
        </p>
      </div>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by project, takeoff or organization"
        filters={['All', 'Processing', 'Queued', 'Retrying', 'Failed', 'Completed', 'Cancelled']}
        active={filter}
        onFilter={setFilter} />
      

      <div className="space-y-3">
        {rows.map((j) =>
        <Panel key={j.id} className="overflow-hidden">
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={JOB_TONE(j.status)}>{j.status}</Badge>
                  <span className="measure text-[11px] text-ink-400">{j.id}</span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-ink-900">{j.project}</p>
                <p className="measure mt-0.5 text-[11px] text-ink-400">
                  {j.takeoffRef} · {j.planSet} · {orgName(j.orgId).toUpperCase()}
                </p>
              </div>
              <div className="w-[180px]">
                <div className="h-1.5 w-full overflow-hidden rounded-[1px] bg-ink-100">
                  <div
                  className={`h-full ${j.status === 'Failed' ? 'bg-danger-500' : 'bg-brand-500'}`}
                  style={{ width: `${Math.round(j.sheetsDone / j.sheets * 100)}%` }} />
                
                </div>
                <p className="measure mt-1 text-[10.5px] text-ink-400">
                  {j.sheetsDone}/{j.sheets} SHEETS · {j.duration}
                </p>
              </div>
              <dl className="flex gap-x-6">
                <div>
                  <dt className="spec-label">Started</dt>
                  <dd className="measure mt-0.5 text-[12px] font-semibold text-ink-800">{j.started}</dd>
                </div>
                <div>
                  <dt className="spec-label">Model</dt>
                  <dd className="measure mt-0.5 text-[12px] font-semibold text-ink-800">{j.model}</dd>
                </div>
              </dl>
              {['Failed', 'Retrying', 'Processing', 'Queued'].includes(j.status) &&
            <div className="ml-auto flex shrink-0 gap-2 self-center">
                  {j.status === 'Failed' &&
              <Button size="sm" variant="secondary" icon={<RotateCcwIcon className="h-3.5 w-3.5" />} onClick={() => retryJob(j.id)}>
                      Retry
                    </Button>
              }
                  <Button size="sm" variant="ghost" icon={<XCircleIcon className="h-3.5 w-3.5" />} onClick={() => cancelJob(j.id)}>
                    Cancel
                  </Button>
                </div>
            }
            </div>
            {j.failure &&
          <>
                <TickRule />
                <p className="flex items-start gap-2 px-4 py-2.5 text-[12.5px] leading-relaxed text-danger-700">
                  <AlertTriangleIcon className="mt-[2px] h-3.5 w-3.5 shrink-0" />
                  {j.failure}
                </p>
              </>
          }
          </Panel>
        )}
      </div>
    </div>);

}

export function AiIssues() {
  const { aiIssues, resolveIssue } = useAdmin();
  const [filter, setFilter] = useState('All');
  const [pending, setPending] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const rows = aiIssues.filter((i) => filter === 'All' || i.severity === filter);
  const counts = (['Critical', 'High', 'Medium', 'Low'] as const).map((s) => ({
    s,
    n: aiIssues.filter((i) => i.severity === s && i.status !== 'Resolved').length
  }));

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>AI management</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">AI issues</h1>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="flex divide-x divide-ink-100">
          {counts.map((c) =>
          <div key={c.s} className="flex-1 px-4 py-3.5">
              <Measured
              label={c.s}
              value={String(c.n)}
              tone={c.s === 'Critical' ? 'danger' : c.s === 'High' ? 'brand' : 'default'} />
            
            </div>
          )}
        </div>
      </Panel>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) =>
        <button
          key={f}
          onClick={() => setFilter(f)}
          aria-pressed={filter === f}
          className={`rounded-[3px] border px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-smooth ${
          filter === f ?
          'border-brand-500 bg-brand-50 text-brand-700' :
          'border-ink-200 bg-white text-ink-500 hover:border-ink-300'}`
          }>
          
            {f}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {rows.map((i) =>
        <Panel key={i.id} className="overflow-hidden">
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
              <div className="min-w-[260px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={i.severity === 'Critical' ? 'danger' : i.severity === 'High' ? 'caution' : 'info'}>
                    {i.severity}
                  </Badge>
                  <Badge tone={i.status === 'Resolved' ? 'positive' : 'neutral'}>{i.status}</Badge>
                  <span className="measure text-[11px] text-ink-400">{i.kind}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{i.detail}</p>
                <p className="measure mt-1.5 text-[10.5px] text-ink-400">
                  {orgName(i.orgId).toUpperCase()} · {i.project.toUpperCase()} · {i.takeoffRef} · {i.created}
                </p>
                {i.resolution &&
              <p className="mt-2 rounded-[2px] bg-positive-50 px-3 py-2 text-[12px] leading-snug text-positive-700">
                    {i.resolution}
                  </p>
              }
              </div>
              {i.status !== 'Resolved' &&
            <Button
              size="sm"
              variant="secondary"
              className="self-center"
              onClick={() => {
                setPending(i.id);
                setResolution('');
              }}>
              
                  Resolve
                </Button>
            }
            </div>
          </Panel>
        )}
      </div>

      {pending &&
      <Modal open onClose={() => setPending(null)} title="Resolve AI issue">
          <Input
          label="Resolution (recorded in the audit log)"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Tenant re-uploaded the sheet at 300 DPI" />
        
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              resolveIssue(pending, resolution || 'Resolved without further detail');
              setPending(null);
            }}>
            
              Resolve
            </Button>
          </div>
        </Modal>
      }
    </div>);

}

export function AiConfiguration() {
  const { aiConfig, updateAiConfig } = useAdmin();
  const [draft, setDraft] = useState<AiConfig>(aiConfig);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);

  const changes = (Object.keys(draft) as (keyof AiConfig)[]).filter((k) => draft[k] !== aiConfig[k]);

  return (
    <div className="pt-7">
      <div className="detail-column">
        <div className="mb-5">
          <SpecLabel>AI management</SpecLabel>
          <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
            AI configuration
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">
            These settings apply to every tenant. Changing them alters how quantities are produced and how
            review-required is decided, so each change is confirmed and recorded.
          </p>
        </div>

        <PanelSection label="Model" title="Detection and validation">
          <div className="space-y-4 px-4 py-4">
            <Select
              label="Active model"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}>
              
              <option>smpro-vision-4.2 · framing</option>
              <option>smpro-vision-4.1 · framing (previous)</option>
              <option>smpro-vision-5.0-beta · framing</option>
            </Select>

            <div>
              <div className="flex items-baseline justify-between">
                <SpecLabel>Confidence threshold</SpecLabel>
                <span className="measure text-[13px] font-semibold text-ink-900">
                  {draft.confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={draft.confidenceThreshold}
                onChange={(e) => setDraft({ ...draft, confidenceThreshold: Number(e.target.value) })}
                aria-label="Confidence threshold"
                className="mt-2 w-full accent-brand-500" />
              
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">
                Attributes below this are flagged review-required to the tenant. Raising it produces more
                review work but fewer quantities accepted on trust.
              </p>
            </div>

            <Input
              label="Maximum sheets per run"
              value={String(draft.maxSheetsPerRun)}
              onChange={(e) => setDraft({ ...draft, maxSheetsPerRun: Number(e.target.value) || 0 })}
              hint="Larger sets are split automatically" />
            
            <Input
              label="Monthly platform ceiling (sheets)"
              value={String(draft.monthlyCeiling)}
              onChange={(e) => setDraft({ ...draft, monthlyCeiling: Number(e.target.value) || 0 })} />
            

            <div className="space-y-2.5 border-t border-ink-100 pt-4">
              <Checkbox
                checked={draft.crossSheetValidation}
                onChange={(v) => setDraft({ ...draft, crossSheetValidation: v })}>
                
                Cross-sheet validation — reconcile plans against schedules
              </Checkbox>
              <Checkbox checked={draft.ruleValidation} onChange={(v) => setDraft({ ...draft, ruleValidation: v })}>
                Construction rule validation — check quantities against framing rules
              </Checkbox>
              <Checkbox
                checked={draft.autoRetryFailures}
                onChange={(v) => setDraft({ ...draft, autoRetryFailures: v })}>
                
                Auto-retry failed runs up to three times without charging the tenant
              </Checkbox>
            </div>
          </div>

          <TickRule />
          <div className="flex flex-wrap items-center gap-3 px-4 py-4">
            <span className="measure text-[11px] text-ink-400">
              {changes.length ? `${changes.length} PENDING CHANGES` : 'NO CHANGES'}
            </span>
            <div className="ml-auto flex gap-2.5">
              <Button variant="secondary" disabled={!changes.length} onClick={() => setDraft(aiConfig)}>
                Discard
              </Button>
              <Button disabled={!changes.length} onClick={() => setConfirm(true)}>
                Review changes
              </Button>
            </div>
          </div>
        </PanelSection>
      </div>

      {confirm &&
      <Modal open onClose={() => setConfirm(false)} title="Apply AI configuration">
          <InlineAlert
          tone="warning"
          title="This affects every organization on the platform"
          body="Runs already in flight keep the settings they started with. New runs use the new configuration." />
        
          <ul className="mt-4 space-y-2">
            {changes.map((k) =>
          <li key={k} className="rounded-[2px] bg-ink-50 px-3 py-2">
                <p className="spec-label">{String(k)}</p>
                <p className="measure mt-0.5 text-[12.5px] text-ink-700">
                  {String(aiConfig[k])} →{' '}
                  <span className="font-semibold text-ink-900">{String(draft[k])}</span>
                </p>
              </li>
          )}
          </ul>
          <div className="mt-4">
            <Input
            label="Reason (recorded in the audit log)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reducing false review flags on stud spacing" />
          
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              updateAiConfig(draft, reason || 'No reason given');
              setConfirm(false);
            }}>
            
              Apply platform-wide
            </Button>
          </div>
        </Modal>
      }
    </div>);

}