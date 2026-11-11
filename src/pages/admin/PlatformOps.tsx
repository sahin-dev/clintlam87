import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlugIcon, RotateCcwIcon } from 'lucide-react';
import { Panel, SpecLabel, Measured, TickRule, WorkHeading } from '../../components/smpro/Primitives';
import { PanelSection, StateDot } from '../../components/admin/Records';
import { Cell, RecordHeader, RecordTable, Row } from '../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { InlineAlert, EmptyState } from '../../components/ui/Feedback';
import { useAdmin } from '../../contexts/AdminContext';
import { orgName } from '../../data/platform';
import { SERVICES } from '../../data/platformOps';
import { Incident } from '../../types/admin';

const SYNC_TONE = (s: string) =>
s === 'Connected' ?
'positive' :
s === 'Syncing' ?
'info' :
s === 'Failed' ?
'danger' :
s === 'Conflict' ?
'caution' :
s === 'Retrying' ?
'caution' :
'neutral';

/**
 * Integrations. The adapter layer is deliberately shown as a layer: SM PRO runs
 * without any of it, and every external system sits behind its own adapter.
 */
export function Integrations() {
  const navigate = useNavigate();
  const { integrations, syncErrors, retrySync, reconcileSync } = useAdmin();
  const open = syncErrors.filter((e) => e.status !== 'Resolved');

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Operations</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Integrations</h1>
        <p className="mt-1.5 max-w-[660px] text-[13.5px] leading-relaxed text-ink-500">
          Every external system sits behind an adapter. SM PRO holds its own catalogue, stock, orders and
          invoices, so a failing adapter degrades a tenant&apos;s sync — it never stops them trading.
        </p>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          {['SM PRO', 'Integration layer', 'Adapter', 'External system'].map((l, i) =>
          <React.Fragment key={l}>
              {i > 0 && <span className="text-ink-300">→</span>}
              <span
              className={`measure rounded-[2px] px-2.5 py-1 text-[11px] font-semibold ${
              i === 0 ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-600'}`
              }>
              
                {l.toUpperCase()}
              </span>
            </React.Fragment>
          )}
          <span className="ml-auto text-[12px] text-ink-400">
            {integrations.filter((i) => i.status === 'Connected').length} of {integrations.length} connections
            healthy
          </span>
        </div>
      </Panel>

      {open.length > 0 &&
      <div className="mb-5">
          <WorkHeading label="Attention" title="Sync errors" count={`${open.length} open`} />
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-ink-100">
              {open.map((e) =>
            <li key={e.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
                  <div className="min-w-[260px] flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="danger">{e.entity}</Badge>
                      <span className="measure text-[11px] text-ink-400">
                        {e.id} · {e.adapter} · {orgName(e.orgId)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">{e.message}</p>
                    <p className="measure mt-1 text-[10.5px] text-ink-400">
                      {e.at} · {e.retries} RETRIES · IDEMPOTENT WRITES, NO DUPLICATES
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 self-center">
                    <Button size="sm" variant="secondary" icon={<RotateCcwIcon className="h-3.5 w-3.5" />} onClick={() => retrySync(e.id)}>
                      Retry
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => reconcileSync(e.id)}>
                      Reconcile
                    </Button>
                  </div>
                </li>
            )}
            </ul>
          </Panel>
        </div>
      }

      <WorkHeading label="Connections" title="Adapters by organization" count={`${integrations.length}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        {integrations.map((i) =>
        <PanelSection
          key={i.id}
          label={i.adapter}
          title={orgName(i.orgId)}
          reference={`Last sync ${i.lastSync}`}
          action={<Badge tone={SYNC_TONE(i.status)}>{i.status}</Badge>}>
          
            {i.entities.length === 0 ?
          <div className="px-4 py-5">
                <p className="text-[13px] text-ink-500">
                  Not connected. This tenant runs entirely on SM PRO records.
                </p>
                <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              icon={<PlugIcon className="h-3.5 w-3.5" />}
              onClick={() => navigate(`/admin/org/${i.orgId}`)}>
              
                  Open organization
                </Button>
              </div> :

          <ul className="divide-y divide-ink-100">
                {i.entities.map((e) =>
            <li key={e.name} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink-800">{e.name}</span>
                    <span className="measure text-[11px] text-ink-400">{e.records.toLocaleString()}</span>
                    <Badge tone={SYNC_TONE(e.status)}>{e.status}</Badge>
                  </li>
            )}
              </ul>
          }
          </PanelSection>
        )}
      </div>
    </div>);

}

export function JobQueue() {
  const { queue, retryJob, cancelJob } = useAdmin();
  const [filter, setFilter] = useState('All');
  const rows = queue.filter((q) => filter === 'All' || q.status === filter);

  const counts = (['Queued', 'Processing', 'Retrying', 'Failed', 'Completed'] as const).map((s) => ({
    s,
    n: queue.filter((q) => q.status === s).length
  }));

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Operations</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Jobs &amp; queue</h1>
        <p className="mt-1.5 max-w-[660px] text-[13.5px] leading-relaxed text-ink-500">
          Long-running work never blocks a tenant&apos;s interface — it runs here and reports back. This is
          where the platform team sees whether it is actually progressing.
        </p>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="flex divide-x divide-ink-100">
          {counts.map((c) =>
          <div key={c.s} className="flex-1 px-4 py-3.5">
              <Measured
              label={c.s}
              value={String(c.n)}
              tone={c.s === 'Failed' && c.n ? 'danger' : c.s === 'Processing' ? 'brand' : 'default'} />
            
            </div>
          )}
        </div>
      </Panel>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {['All', 'Queued', 'Processing', 'Retrying', 'Failed', 'Completed', 'Cancelled'].map((f) =>
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

      <RecordTable
        columns={[
        { key: 'type', label: 'Job' },
        { key: 'org', label: 'Organization', hideBelow: 'sm' },
        { key: 'detail', label: 'Detail', hideBelow: 'md' },
        { key: 'started', label: 'Started', align: 'right', hideBelow: 'lg' },
        { key: 'dur', label: 'Duration', align: 'right', hideBelow: 'lg' },
        { key: 'retries', label: 'Retries', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' },
        { key: 'act', label: '', align: 'right' }]
        }
        caption="Background job queue">
        
        {rows.map((q) =>
        <Row key={q.id} spine={q.status === 'Failed' ? 'danger' : undefined}>
            <Cell strong>
              {q.type}
              <span className="measure ml-2 font-normal text-ink-400">{q.id}</span>
            </Cell>
            <Cell hideBelow="sm" muted>
              {orgName(q.orgId)}
            </Cell>
            <Cell hideBelow="md" muted>
              {q.detail}
            </Cell>
            <Cell align="right" mono hideBelow="lg">
              {q.started}
            </Cell>
            <Cell align="right" mono hideBelow="lg">
              {q.duration}
            </Cell>
            <Cell align="right" mono>
              {q.retries}
            </Cell>
            <Cell align="right">
              <Badge
              tone={
              q.status === 'Completed' ?
              'positive' :
              q.status === 'Failed' ?
              'danger' :
              q.status === 'Retrying' ?
              'caution' :
              q.status === 'Processing' ?
              'violet' :
              'neutral'
              }>
              
                {q.status}
              </Badge>
            </Cell>
            <Cell align="right">
              {q.status === 'Failed' ?
            <button onClick={() => retryJob(q.id)} className="text-[12px] font-semibold text-brand-600">
                  Retry
                </button> :
            ['Queued', 'Processing', 'Retrying'].includes(q.status) ?
            <button onClick={() => cancelJob(q.id)} className="text-[12px] font-semibold text-ink-500">
                  Cancel
                </button> :
            null}
            </Cell>
          </Row>
        )}
      </RecordTable>
    </div>);

}

export function SystemHealth() {
  const navigate = useNavigate();
  const { incidents } = useAdmin();
  const live = incidents.filter((i) => i.status !== 'Resolved');
  const resolved = incidents.filter((i) => i.status === 'Resolved');

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Operations</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">System health</h1>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) =>
        <Panel key={s.id} className="overflow-hidden">
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <StateDot state={s.state} />
                <span className="text-[13px] font-semibold text-ink-900">{s.name}</span>
              </div>
              <p className="measure mt-2 text-[18px] font-bold leading-none text-ink-900">
                {s.responseMs ? `${s.responseMs}ms` : '—'}
              </p>
              <p className="measure mt-1.5 text-[10.5px] text-ink-400">
                {s.errorRate}% errors · checked {s.checked}
              </p>
              <p className="mt-2 text-[12px] leading-snug text-ink-500">{s.note}</p>
            </div>
          </Panel>
        )}
      </div>

      <WorkHeading label="Incidents" title="Open incidents" count={`${live.length}`} />
      {live.length === 0 ?
      <EmptyState title="No open incidents" body="Every service is operating within its thresholds." /> :

      <div className="space-y-3">
          {live.map((i) =>
        <IncidentRow key={i.id} incident={i} onOpen={() => navigate(`/admin/incidents/${i.id}`)} />
        )}
        </div>
      }

      <div className="mt-6">
        <WorkHeading label="History" title="Resolved" count={`${resolved.length}`} />
        <div className="space-y-3">
          {resolved.map((i) =>
          <IncidentRow key={i.id} incident={i} onOpen={() => navigate(`/admin/incidents/${i.id}`)} />
          )}
        </div>
      </div>
    </div>);

}

function IncidentRow({ incident, onOpen }: {incident: Incident;onOpen: () => void;}) {
  return (
    <Panel className="overflow-hidden">
      <button onClick={onOpen} className="block w-full text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/30">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2 px-4 py-3.5">
          <div className="min-w-[240px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone={
                incident.severity === 'Critical' ?
                'danger' :
                incident.severity === 'High' ?
                'caution' :
                incident.severity === 'Medium' ?
                'info' :
                'neutral'
                }>
                
                {incident.severity}
              </Badge>
              <Badge tone={incident.status === 'Resolved' ? 'positive' : 'neutral'}>{incident.status}</Badge>
              <span className="measure text-[11px] text-ink-400">{incident.id}</span>
            </div>
            <p className="mt-1.5 text-[14px] font-semibold text-ink-900">{incident.title}</p>
            <p className="measure mt-0.5 text-[11px] text-ink-400">
              {incident.service} · started {incident.started} ·{' '}
              {incident.affectedOrgs.length} ORGANIZATIONS
            </p>
          </div>
        </div>
      </button>
    </Panel>);

}

export function IncidentDetail() {
  const { id = '' } = useParams();
  const { incidents, setIncidentStatus } = useAdmin();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Incident['status']>('Monitoring');
  const [note, setNote] = useState('');

  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return (
      <div className="pt-7">
        <EmptyState title="Incident not found" body="It may have been merged into another incident." />
      </div>);

  }

  return (
    <div className="pt-7">
      <div className="detail-column">
        <RecordHeader
          backTo="/admin/health"
          eyebrow={`Incident · ${incident.id}`}
          title={incident.title}
          reference={`${incident.service} · started ${incident.started}`}
          status={
          <>
              <Badge tone={incident.severity === 'Critical' ? 'danger' : 'caution'}>{incident.severity}</Badge>
              <Badge tone={incident.status === 'Resolved' ? 'positive' : 'neutral'}>{incident.status}</Badge>
            </>
          }
          actions={
          incident.status !== 'Resolved' ?
          <Button size="sm" onClick={() => setOpen(true)}>
                Update status
              </Button> :
          undefined
          }
          facts={[
          { label: 'Service', value: incident.service },
          { label: 'Started', value: incident.started },
          { label: 'Organizations affected', value: String(incident.affectedOrgs.length) }]
          } />
        

        <div className="space-y-5">
          <PanelSection label="Impact" title="What is happening">
            <p className="px-4 py-4 text-[13.5px] leading-relaxed text-ink-700">{incident.description}</p>
            {incident.affectedOrgs.length > 0 &&
            <>
                <TickRule />
                <div className="flex flex-wrap gap-1.5 px-4 py-3">
                  {incident.affectedOrgs.map((o) =>
                <span
                  key={o}
                  className="rounded-[2px] border border-ink-200 bg-ink-50 px-2 py-1 text-[11.5px] font-medium text-ink-600">
                  
                      {orgName(o)}
                    </span>
                )}
                </div>
              </>
            }
          </PanelSection>

          <PanelSection label="Timeline" title="What has been done">
            <ol className="divide-y divide-ink-100">
              {incident.timeline.map((t, i) =>
              <li key={i} className="flex gap-3 px-4 py-3">
                  <span className="measure w-[76px] shrink-0 text-[11px] text-ink-400">{t.at}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-ink-700">{t.label}</span>
                    <span className="measure mt-0.5 block text-[10.5px] text-ink-400">{t.by}</span>
                  </span>
                </li>
              )}
            </ol>
          </PanelSection>

          {incident.resolution &&
          <PanelSection label="Resolution" title="Post-incident note">
              <p className="px-4 py-4 text-[13px] leading-relaxed text-ink-700">{incident.resolution}</p>
            </PanelSection>
          }
        </div>
      </div>

      {open &&
      <Modal open onClose={() => setOpen(false)} title={`Update ${incident.id}`}>
          <div className="space-y-4">
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Incident['status'])}>
              {(['Investigating', 'Identified', 'Monitoring', 'Resolved'] as const).map((s) =>
            <option key={s}>{s}</option>
            )}
            </Select>
            <Input
            label="Timeline note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Provider confirmed capacity restored" />
          
            {status === 'Resolved' &&
          <InlineAlert
            tone="info"
            title="This closes the incident"
            body="Affected tenants stop seeing the degraded-service banner. The note becomes the post-incident record." />

          }
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              setIncidentStatus(incident.id, status, note || `Status set to ${status}`);
              setOpen(false);
            }}>
            
              Update
            </Button>
          </div>
        </Modal>
      }
    </div>);

}