import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HeadsetIcon, ShieldAlertIcon, ShieldIcon } from 'lucide-react';
import { Panel, SpecLabel, Measured, TickRule, WorkHeading } from '../../components/smpro/Primitives';
import { PanelSection } from '../../components/admin/Records';
import { Cell, ListToolbar, RecordHeader, RecordTable, Row, ScopeNote } from '../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { InlineAlert, EmptyState } from '../../components/ui/Feedback';
import { useAdmin } from '../../contexts/AdminContext';
import { orgName, PLAN_BY_ID } from '../../data/platform';
import { ISOLATION, SECURITY_EVENTS } from '../../data/platformOps';
import { SupportCase } from '../../types/admin';

/* ------------------------------------------------------------------ */
/* Support                                                             */
/* ------------------------------------------------------------------ */

const CASE_TONE = (s: SupportCase['status']) =>
s === 'Resolved' || s === 'Closed' ?
'positive' :
s === 'Escalated' ?
'danger' :
s === 'Waiting' ?
'neutral' :
'caution';

export function Support() {
  const navigate = useNavigate();
  const { cases, session } = useAdmin();
  const [filter, setFilter] = useState('Open');
  const [query, setQuery] = useState('');

  const rows = cases.filter((c) => {
    if (filter === 'Open' && ['Resolved', 'Closed'].includes(c.status)) return false;
    if (filter === 'Escalated' && c.status !== 'Escalated') return false;
    if (filter === 'Resolved' && !['Resolved', 'Closed'].includes(c.status)) return false;
    const q = query.toLowerCase();
    return c.subject.toLowerCase().includes(q) || orgName(c.orgId).toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Support</h1>
        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-500">
          Cases raised by tenants, each carrying the evidence chain back to the incident, job or entitlement
          behind it.
        </p>
      </div>

      {session &&
      <div className="mb-5">
          <InlineAlert
          tone="warning"
          title={`Support session open on ${orgName(session.orgId)}`}
          body={`Reason: ${session.reason}. Exit it from the banner when you are finished — the session end is recorded.`} />
        
        </div>
      }

      <Panel className="mb-5 overflow-hidden">
        <div className="flex divide-x divide-ink-100">
          {[
          { label: 'Open', value: String(cases.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length) },
          { label: 'Escalated', value: String(cases.filter((c) => c.status === 'Escalated').length), tone: 'danger' as const },
          { label: 'Waiting on tenant', value: String(cases.filter((c) => c.status === 'Waiting').length) },
          { label: 'Resolved', value: String(cases.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length), tone: 'positive' as const }].
          map((m) =>
          <div key={m.label} className="flex-1 px-4 py-3.5">
              <Measured label={m.label} value={m.value} tone={m.tone ?? 'default'} />
            </div>
          )}
        </div>
      </Panel>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search cases"
        filters={['Open', 'Escalated', 'Resolved', 'All']}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState title="No cases here" body="Nothing matches this filter." /> :

      <RecordTable
        columns={[
        { key: 'id', label: 'Case', width: '90px' },
        { key: 'subject', label: 'Subject' },
        { key: 'org', label: 'Organization', hideBelow: 'sm' },
        { key: 'owner', label: 'Owner', hideBelow: 'lg' },
        { key: 'pri', label: 'Priority', align: 'right', hideBelow: 'md' },
        { key: 'status', label: 'Status', align: 'right' }]
        }
        caption="Support cases">
        
          {rows.map((c) =>
        <Row
          key={c.id}
          onClick={() => navigate(`/admin/support/${c.id}`)}
          spine={c.status === 'Escalated' ? 'danger' : undefined}>
          
              <Cell mono muted>
                {c.id}
              </Cell>
              <Cell strong>{c.subject}</Cell>
              <Cell hideBelow="sm" muted>
                {orgName(c.orgId)}
              </Cell>
              <Cell hideBelow="lg" muted>
                {c.assignee}
              </Cell>
              <Cell align="right" hideBelow="md">
                <Badge tone={c.priority === 'Critical' || c.priority === 'High' ? 'danger' : 'neutral'}>
                  {c.priority}
                </Badge>
              </Cell>
              <Cell align="right">
                <Badge tone={CASE_TONE(c.status)}>{c.status}</Badge>
              </Cell>
            </Row>
        )}
        </RecordTable>
      }
    </div>);

}

export function SupportCaseDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { cases, setCaseStatus, startSession, session } = useAdmin();
  const [statusOpen, setStatusOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [status, setStatus] = useState<SupportCase['status']>('Investigating');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('Customer support');

  const record = cases.find((c) => c.id === id);
  if (!record) {
    return (
      <div className="pt-7">
        <EmptyState title="Case not found" body="It may have been merged or closed." />
      </div>);

  }

  return (
    <div className="pt-7">
      <div className="detail-column">
        <RecordHeader
          backTo="/admin/support"
          eyebrow={`Support case · ${record.id}`}
          title={record.subject}
          reference={`${orgName(record.orgId).toUpperCase()} · OPENED ${record.created.toUpperCase()}`}
          status={
          <>
              <Badge tone={record.priority === 'Critical' || record.priority === 'High' ? 'danger' : 'neutral'}>
                {record.priority}
              </Badge>
              <Badge tone={CASE_TONE(record.status)}>{record.status}</Badge>
            </>
          }
          actions={
          <>
              <Button
              size="sm"
              variant="secondary"
              icon={<HeadsetIcon className="h-4 w-4" />}
              disabled={Boolean(session)}
              onClick={() => setSessionOpen(true)}>
              
                Support access
              </Button>
              <Button size="sm" onClick={() => setStatusOpen(true)}>
                Update case
              </Button>
            </>
          }
          facts={[
          { label: 'Organization', value: orgName(record.orgId) },
          { label: 'Reported by', value: record.reporter },
          { label: 'Owner', value: record.assignee }]
          } />
        

        <div className="space-y-5">
          <PanelSection label="Report" title="What the tenant described">
            <p className="px-4 py-4 text-[13.5px] leading-relaxed text-ink-700">{record.detail}</p>
          </PanelSection>

          {record.related && record.related.length > 0 &&
          <PanelSection label="Evidence chain" title="Related records">
              <ul className="divide-y divide-ink-100">
                {record.related.map((r) =>
              <li key={r.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="spec-label">{r.label}</span>
                    <span className="measure text-[12px] font-semibold text-ink-800">{r.value}</span>
                  </li>
              )}
              </ul>
              <TickRule />
              <div className="flex flex-wrap gap-2 px-4 py-3">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/org/${record.orgId}`)}>
                  Open organization
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/admin/audit')}>
                  Audit trail
                </Button>
              </div>
            </PanelSection>
          }

          <PanelSection label="History" title="Case timeline">
            <ol className="divide-y divide-ink-100">
              {record.timeline.map((t, i) =>
              <li key={i} className="flex gap-3 px-4 py-3">
                  <span className="measure w-[110px] shrink-0 text-[11px] text-ink-400">{t.at}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-ink-700">{t.label}</span>
                    <span className="measure mt-0.5 block text-[10.5px] text-ink-400">{t.by.toUpperCase()}</span>
                  </span>
                </li>
              )}
            </ol>
          </PanelSection>
        </div>
      </div>

      {statusOpen &&
      <Modal open onClose={() => setStatusOpen(false)} title={`Update ${record.id}`}>
          <div className="space-y-4">
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as SupportCase['status'])}>
              {(['Assigned', 'Investigating', 'Waiting', 'Escalated', 'Resolved', 'Closed'] as const).map((s) =>
            <option key={s}>{s}</option>
            )}
            </Select>
            <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed" />
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              setCaseStatus(record.id, status, note || `Status set to ${status}`);
              setStatusOpen(false);
            }}>
            
              Update
            </Button>
          </div>
        </Modal>
      }

      {sessionOpen &&
      <Modal open onClose={() => setSessionOpen(false)} title={`Controlled support access — ${orgName(record.orgId)}`}>
          <div className="flex items-start gap-3 rounded-[3px] border border-caution-500/40 bg-caution-50 px-3.5 py-3">
            <ShieldAlertIcon className="mt-[2px] h-4 w-4 shrink-0 text-caution-700" />
            <p className="text-[12.5px] leading-relaxed text-caution-700">
              A persistent banner stays visible for the whole session, every action is attributed to you, and
              both the start and the end are written to the audit log and the tenant&apos;s security events.
              This is never invisible impersonation.
            </p>
          </div>
          <div className="mt-4">
            <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Customer support</option>
              <option>Incident investigation</option>
              <option>Integration troubleshooting</option>
              <option>Billing enquiry</option>
            </Select>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setSessionOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              startSession(record.orgId, reason, record.id);
              setSessionOpen(false);
            }}>
            
              Start session
            </Button>
          </div>
        </Modal>
      }
    </div>);

}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export function Security() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Events' | 'Tenant isolation'>('Events');

  const critical = SECURITY_EVENTS.filter((e) => e.severity === 'Critical').length;
  const blocked = SECURITY_EVENTS.filter((e) => e.outcome === 'Blocked').length;
  const violations = ISOLATION.reduce((s, i) => s + i.violations, 0);

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Security</h1>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="flex divide-x divide-ink-100">
          {[
          { label: 'Critical events', value: String(critical), tone: critical ? 'danger' as const : 'default' as const },
          { label: 'Blocked requests', value: String(blocked) },
          { label: 'Isolation violations', value: String(violations), tone: violations ? 'danger' as const : 'positive' as const },
          { label: 'Tenants tested', value: `${ISOLATION.filter((i) => i.lastTest !== 'Pending first test').length}/${ISOLATION.length}` }].
          map((m) =>
          <div key={m.label} className="flex-1 px-4 py-3.5">
              <Measured label={m.label} value={m.value} tone={m.tone ?? 'default'} />
            </div>
          )}
        </div>
      </Panel>

      <div className="mb-5 flex gap-1 border-b border-ink-200">
        {(['Events', 'Tenant isolation'] as const).map((t) =>
        <button
          key={t}
          onClick={() => setTab(t)}
          aria-pressed={tab === t}
          className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ease-smooth ${
          tab === t ? 'border-brand-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'}`
          }>
          
            {t}
          </button>
        )}
      </div>

      {tab === 'Events' ?
      <div className="space-y-3">
          {SECURITY_EVENTS.map((e) =>
        <Panel
          key={e.id}
          className={`overflow-hidden ${e.severity === 'Critical' ? 'shadow-[inset_3px_0_0_0_#DC2626]' : ''}`}>
          
              <div className="flex flex-wrap items-start gap-x-6 gap-y-2 px-4 py-3.5">
                <div className="min-w-[260px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={e.severity === 'Critical' ? 'danger' : e.severity === 'High' ? 'caution' : 'neutral'}>
                      {e.severity}
                    </Badge>
                    <span className="text-[13px] font-semibold text-ink-900">{e.kind}</span>
                    <Badge tone={e.outcome === 'Blocked' ? 'positive' : 'neutral'}>{e.outcome}</Badge>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">{e.detail}</p>
                  <p className="measure mt-1 text-[10.5px] text-ink-400">
                    {orgName(e.orgId).toUpperCase()} · {e.actor.toUpperCase()} · {e.at.toUpperCase()}
                  </p>
                </div>
                <button
              onClick={() => navigate(`/admin/org/${e.orgId}`)}
              className="shrink-0 self-center text-[12px] font-semibold text-brand-600">
              
                  Organization
                </button>
              </div>
            </Panel>
        )}
        </div> :

      <>
          <PanelSection label="Multi-tenancy" title="Every organization is a sealed boundary">
            <p className="px-4 py-4 text-[13px] leading-relaxed text-ink-600">
              Tenant scope is enforced before a query reaches data, not filtered afterwards. A request that
              names another organization&apos;s record is rejected outright and recorded as a security event.
            </p>
          </PanelSection>

          <div className="mt-4">
            <RecordTable
            columns={[
            { key: 'org', label: 'Organization' },
            { key: 'status', label: 'Isolation' },
            { key: 'test', label: 'Last test', hideBelow: 'sm' },
            { key: 'blocked', label: 'Blocked requests', align: 'right' },
            { key: 'viol', label: 'Violations', align: 'right' }]
            }
            caption="Tenant isolation">
            
              {ISOLATION.map((i) =>
            <Row key={i.orgId} spine={i.violations ? 'danger' : undefined}>
                  <Cell strong>{orgName(i.orgId)}</Cell>
                  <Cell>
                    <Badge tone={i.status === 'Isolated' ? 'positive' : i.status === 'Violation' ? 'danger' : 'neutral'}>
                      {i.status}
                    </Badge>
                  </Cell>
                  <Cell hideBelow="sm" muted>
                    {i.lastTest}
                  </Cell>
                  <Cell align="right" mono>
                    {i.blockedRequests}
                  </Cell>
                  <Cell align="right" mono>
                    {i.violations}
                  </Cell>
                </Row>
            )}
            </RecordTable>
          </div>

          <ScopeNote>
            A blocked request is the boundary working. A violation would mean data crossed it — there are none
            recorded, and the one blocked attempt never reached data.
          </ScopeNote>
        </>
      }
    </div>);

}

/* ------------------------------------------------------------------ */
/* Audit                                                               */
/* ------------------------------------------------------------------ */

export function AuditLog() {
  const { audit, organizations } = useAdmin();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('All modules');
  const [org, setOrg] = useState('All organizations');

  const modules = ['All modules', ...Array.from(new Set(audit.map((a) => a.module)))];

  const rows = audit.filter((a) => {
    if (module !== 'All modules' && a.module !== module) return false;
    if (org !== 'All organizations' && a.orgId !== org) return false;
    const q = query.toLowerCase();
    return (
      a.action.toLowerCase().includes(q) ||
      a.object.toLowerCase().includes(q) ||
      a.actor.toLowerCase().includes(q));

  });

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Audit log</h1>
        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-500">
          Durable record of every governing action, with the value before and after. Entries cannot be edited
          or removed from here.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="min-w-[220px] flex-1">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search action, object or actor" />
        </div>
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          aria-label="Module"
          className="h-12 rounded-[3px] border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 focus:border-brand-500 focus:outline-none">
          
          {modules.map((m) =>
          <option key={m}>{m}</option>
          )}
        </select>
        <select
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          aria-label="Organization"
          className="h-12 rounded-[3px] border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 focus:border-brand-500 focus:outline-none">
          
          <option>All organizations</option>
          {organizations.map((o) =>
          <option key={o.id} value={o.id}>
              {o.name}
            </option>
          )}
        </select>
      </div>

      <Panel className="overflow-hidden">
        <ol className="divide-y divide-ink-100">
          {rows.map((a) =>
          <li
            key={a.id}
            className={`px-4 py-3.5 ${
            a.severity === 'Critical' ? 'shadow-[inset_3px_0_0_0_#DC2626]' : ''}`
            }>
            
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="measure text-[11px] text-ink-400">{a.at}</span>
                <span className="text-[13.5px] font-semibold text-ink-900">{a.action}</span>
                <Badge tone={a.severity === 'Critical' ? 'danger' : a.severity === 'High' ? 'caution' : 'neutral'}>
                  {a.severity}
                </Badge>
                <span className="measure ml-auto text-[11px] text-ink-400">
                  {a.module.toUpperCase()}
                  {a.orgId ? ` · ${orgName(a.orgId).toUpperCase()}` : ''}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-700">{a.object}</p>
              {(a.before || a.after) &&
            <p className="measure mt-1 text-[12px] text-ink-500">
                  {a.before ?? '—'} → <span className="font-semibold text-ink-900">{a.after ?? '—'}</span>
                </p>
            }
              <p className="mt-1 text-[11.5px] text-ink-400">
                {a.actor}
                {a.reason ? ` · ${a.reason}` : ''}
              </p>
            </li>
          )}
        </ol>
      </Panel>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Reports, flags, settings, notifications, search                     */
/* ------------------------------------------------------------------ */

export function Reports() {
  const { organizations, suppliers, aiJobs, cases, incidents } = useAdmin();
  const mrr = suppliers.reduce((s, o) => s + (o.subscription?.mrr ?? 0), 0);

  const groups: {label: string;title: string;rows: [string, string][];}[] = [
  {
    label: 'Organizations',
    title: 'Tenant base',
    rows: [
    ['Supplier organizations', String(suppliers.length)],
    ['Builder organizations', String(organizations.length - suppliers.length)],
    ['Active', String(organizations.filter((o) => o.status === 'Active').length)],
    ['On trial', String(organizations.filter((o) => o.status === 'Trial').length)],
    ['Suspended or restricted', String(organizations.filter((o) => ['Suspended', 'Restricted'].includes(o.status)).length)],
    ['New this quarter', '2']]

  },
  {
    label: 'Subscriptions',
    title: 'Revenue and plan mix',
    rows: [
    ['Monthly recurring revenue', `$${mrr.toLocaleString()}`],
    ...(['starter', 'growth', 'professional', 'enterprise'] as const).map(
      (p) => [`${PLAN_BY_ID[p].name} tenants`, String(suppliers.filter((s) => s.planId === p).length)] as [string, string]
    ),
    ['Upgrades this year', '3'],
    ['Cancellations this year', '1']]

  },
  {
    label: 'Usage',
    title: 'What the platform processed',
    rows: [
    ['Users', organizations.reduce((s, o) => s + o.usage.users, 0).toLocaleString()],
    ['Projects', organizations.reduce((s, o) => s + o.projects, 0).toLocaleString()],
    ['AI sheets this month', organizations.reduce((s, o) => s + o.usage.aiSheets, 0).toLocaleString()],
    ['Storage', `${organizations.reduce((s, o) => s + o.usage.storage, 0).toLocaleString()} GB`],
    ['API requests (24h)', '1.42 M']]

  },
  {
    label: 'Operations',
    title: 'Reliability',
    rows: [
    ['AI runs today', String(aiJobs.length)],
    ['AI failures today', String(aiJobs.filter((j) => j.status === 'Failed').length)],
    ['Uptime (30d)', '99.94%'],
    ['Open incidents', String(incidents.filter((i) => i.status !== 'Resolved').length)],
    ['Integration failures (24h)', '3'],
    ['Open support cases', String(cases.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length)]]

  }];


  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Platform reports</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((g) =>
        <PanelSection key={g.label} label={g.label} title={g.title}>
            <dl className="divide-y divide-ink-100 px-4">
              {g.rows.map(([k, v]) =>
            <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[12.5px] text-ink-600">{k}</dt>
                  <dd className="measure text-[13.5px] font-semibold text-ink-900">{v}</dd>
                </div>
            )}
            </dl>
          </PanelSection>
        )}
      </div>
    </div>);

}

export function FeatureFlags() {
  const { flags, toggleFlag, organizations } = useAdmin();

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Feature flags</h1>
        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-500">
          Rollout control, separate from licensing. An entitlement decides whether a tenant has bought a
          capability; a flag decides whether the platform has switched it on yet.
        </p>
      </div>

      <div className="space-y-3">
        {flags.map((f) =>
        <Panel key={f.id} className="overflow-hidden">
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
              <div className="min-w-[260px] flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-semibold text-ink-900">{f.label}</p>
                  <Badge tone="neutral">{f.scope}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{f.description}</p>
                {f.targets.length > 0 &&
              <p className="measure mt-1.5 text-[10.5px] text-ink-400">
                    TARGETS:{' '}
                    {f.targets.
                map((t) => organizations.find((o) => o.id === t)?.name ?? PLAN_BY_ID[t]?.name ?? t).
                join(', ').
                toUpperCase()}
                  </p>
              }
              </div>
              <div className="flex shrink-0 items-center gap-2.5 self-center">
                <Badge tone={f.enabled ? 'positive' : 'neutral'}>{f.enabled ? 'On' : 'Off'}</Badge>
                <Button size="sm" variant="secondary" onClick={() => toggleFlag(f.id)}>
                  Turn {f.enabled ? 'off' : 'on'}
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>);

}

export function AdminSettings() {
  const navigate = useNavigate();
  const { aiConfig } = useAdmin();

  const sections: {label: string;title: string;rows: [string, string][];to?: string;}[] = [
  {
    label: 'General',
    title: 'Platform',
    rows: [
    ['Platform name', 'SM PRO'],
    ['Default region', 'us-central'],
    ['Support email', 'support@smpro.build'],
    ['Status page', 'status.smpro.build']]

  },
  {
    label: 'Organization defaults',
    title: 'What new tenants start with',
    rows: [
    ['Initial status', 'Pending until the administrator activates'],
    ['Default plan', 'Growth'],
    ['Trial length', '30 days'],
    ['Default payment terms offered', 'Net 30']]

  },
  {
    label: 'AI',
    title: 'Current configuration',
    to: '/admin/ai/config',
    rows: [
    ['Model', aiConfig.model],
    ['Confidence threshold', `${aiConfig.confidenceThreshold}%`],
    ['Max sheets per run', String(aiConfig.maxSheetsPerRun)],
    ['Auto-retry failures', aiConfig.autoRetryFailures ? 'On' : 'Off']]

  },
  {
    label: 'Integrations',
    title: 'Adapter policy',
    to: '/admin/integrations',
    rows: [
    ['Adapter timeout', '30 seconds'],
    ['Retry policy', '3 attempts with backoff'],
    ['Conflict handling', 'Hold for reconciliation — never overwrite'],
    ['Write semantics', 'Idempotent']]

  },
  {
    label: 'Security',
    title: 'Access policy',
    to: '/admin/security',
    rows: [
    ['Platform admin second factor', 'Hardware key required'],
    ['Tenant session length', '12 hours'],
    ['Failed-login lockout', '5 attempts'],
    ['Support sessions', 'Banner required, always audited']]

  },
  {
    label: 'Audit',
    title: 'Record keeping',
    to: '/admin/audit',
    rows: [
    ['Retention', '7 years'],
    ['Deletion from the UI', 'Not permitted'],
    ['Before / after values', 'Captured on every change'],
    ['Export', 'On request, signed']]

  }];


  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Governance</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Platform settings</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((s) =>
        <PanelSection
          key={s.label}
          label={s.label}
          title={s.title}
          action={
          s.to ?
          <button onClick={() => navigate(s.to!)} className="text-[12px] font-semibold text-brand-600">
                  Manage
                </button> :
          undefined
          }>
          
            <dl className="divide-y divide-ink-100 px-4">
              {s.rows.map(([k, v]) =>
            <div key={k} className="flex flex-wrap items-baseline justify-between gap-4 py-2.5">
                  <dt className="spec-label">{k}</dt>
                  <dd className="text-[12.5px] font-medium text-ink-800">{v}</dd>
                </div>
            )}
            </dl>
          </PanelSection>
        )}
      </div>
    </div>);

}

export function AdminNotifications() {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, unreadCount } = useAdmin();

  return (
    <div className="pt-7">
      <div className="detail-column">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SpecLabel>Platform</SpecLabel>
            <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
              Notifications
            </h1>
          </div>
          {unreadCount > 0 &&
          <Button size="sm" variant="secondary" onClick={markAllRead}>
              Mark all read
            </Button>
          }
        </div>

        <Panel className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {notifications.map((n) =>
            <li key={n.id} className={n.read ? 'bg-white' : 'bg-brand-50/30'}>
                <button
                onClick={() => {
                  markRead(n.id);
                  navigate(
                    n.to === 'Security' ?
                    '/admin/security' :
                    n.to === 'Integrations' ?
                    '/admin/integrations' :
                    n.to === 'Support' ?
                    '/admin/support' :
                    n.to === 'Operations' ?
                    '/admin/health' :
                    n.to === 'Commercial' ?
                    '/admin/subscriptions' :
                    n.to === 'AI' ?
                    '/admin/ai/jobs' :
                    '/admin/suppliers'
                  );
                }}
                className="w-full px-4 py-3.5 text-left">
                
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                    tone={
                    n.priority === 'Critical' ?
                    'danger' :
                    n.priority === 'High' ?
                    'caution' :
                    n.priority === 'Medium' ?
                    'info' :
                    'neutral'
                    }>
                    
                      {n.priority}
                    </Badge>
                    <span className="text-[13.5px] font-semibold text-ink-900">{n.title}</span>
                    <span className="measure ml-auto text-[11px] text-ink-400">{n.at}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">{n.body}</p>
                </button>
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>);

}

export function AdminSearch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get('q') ?? '').toLowerCase();
  const { organizations, users, aiJobs, cases } = useAdmin();

  const orgs = q ? organizations.filter((o) => o.name.toLowerCase().includes(q)) : [];
  const people = q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : [];
  const jobs = q ?
  aiJobs.filter((j) => j.project.toLowerCase().includes(q) || j.takeoffRef.toLowerCase().includes(q)) :
  [];
  const support = q ? cases.filter((c) => c.subject.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) : [];
  const total = orgs.length + people.length + jobs.length + support.length;

  return (
    <div className="pt-7">
      <div className="detail-column">
        <div className="mb-5">
          <SpecLabel>Platform search</SpecLabel>
          <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
            {q ? `${total} results for “${params.get('q')}”` : 'Search the platform'}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Organizations, users, AI runs and support cases across every tenant.
          </p>
        </div>

        {!q &&
        <EmptyState
          title="Nothing searched yet"
          body="Use the search field in the header to look across every tenant." />

        }

        {q && total === 0 && <EmptyState title="No matches" body="Try an organization name, email, takeoff reference or case id." />}

        <div className="space-y-5">
          {orgs.length > 0 &&
          <PanelSection label="Organizations" title={`${orgs.length} found`}>
              <ul className="divide-y divide-ink-100">
                {orgs.map((o) =>
              <li key={o.id}>
                    <button
                  onClick={() => navigate(`/admin/org/${o.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                  
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-900">{o.name}</span>
                      <Badge tone={o.status === 'Active' ? 'positive' : 'neutral'}>{o.status}</Badge>
                    </button>
                  </li>
              )}
              </ul>
            </PanelSection>
          }
          {people.length > 0 &&
          <PanelSection label="Users" title={`${people.length} found`}>
              <ul className="divide-y divide-ink-100">
                {people.map((u) =>
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-800">
                      {u.name} · {u.email}
                    </span>
                    <span className="measure text-[11px] text-ink-400">{orgName(u.orgId).toUpperCase()}</span>
                  </li>
              )}
              </ul>
            </PanelSection>
          }
          {jobs.length > 0 &&
          <PanelSection label="AI runs" title={`${jobs.length} found`}>
              <ul className="divide-y divide-ink-100">
                {jobs.map((j) =>
              <li key={j.id}>
                    <button
                  onClick={() => navigate('/admin/ai/jobs')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                  
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-800">
                        {j.project} · {j.takeoffRef}
                      </span>
                      <Badge tone={j.status === 'Failed' ? 'danger' : 'neutral'}>{j.status}</Badge>
                    </button>
                  </li>
              )}
              </ul>
            </PanelSection>
          }
          {support.length > 0 &&
          <PanelSection label="Support cases" title={`${support.length} found`}>
              <ul className="divide-y divide-ink-100">
                {support.map((c) =>
              <li key={c.id}>
                    <button
                  onClick={() => navigate(`/admin/support/${c.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                  
                      <span className="measure w-[70px] shrink-0 text-[11px] text-ink-400">{c.id}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-800">{c.subject}</span>
                      <Badge tone={CASE_TONE(c.status)}>{c.status}</Badge>
                    </button>
                  </li>
              )}
              </ul>
            </PanelSection>
          }
        </div>
      </div>
    </div>);

}