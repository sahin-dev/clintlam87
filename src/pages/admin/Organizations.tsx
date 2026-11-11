import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  HeadsetIcon,
  PlusIcon,
  ShieldAlertIcon,
  Trash2Icon } from
'lucide-react';
import { Panel, SpecLabel, Measured, TickRule } from '../../components/smpro/Primitives';
import { PanelSection, UsageMeter, ImpactList } from '../../components/admin/Records';
import {
  Cell,
  Column,
  ListToolbar,
  RecordHeader,
  RecordTable,
  Row,
  ScopeNote } from
'../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { InlineAlert, EmptyState } from '../../components/ui/Feedback';
import { useAdmin, NewSupplierDraft } from '../../contexts/AdminContext';
import { FEATURES, PLANS, PLAN_BY_ID, orgName } from '../../data/platform';
import { FeatureId, OrgStatus, PlanId } from '../../types/admin';

const STATUS_TONE = (s: OrgStatus) =>
s === 'Active' ?
'positive' :
s === 'Trial' ?
'info' :
s === 'Pending' ?
'neutral' :
s === 'Restricted' ?
'caution' :
'danger';

const SUPPLIER_COLUMNS: Column[] = [
{ key: 'name', label: 'Supplier' },
{ key: 'status', label: 'Status' },
{ key: 'plan', label: 'Plan', hideBelow: 'sm' },
{ key: 'builders', label: 'Builders', align: 'right' },
{ key: 'branches', label: 'Branches', align: 'right', hideBelow: 'md' },
{ key: 'users', label: 'Users', align: 'right', hideBelow: 'md' },
{ key: 'ai', label: 'AI sheets', align: 'right', hideBelow: 'lg' },
{ key: 'active', label: 'Last active', align: 'right', hideBelow: 'lg' }];


export function SupplierDirectory() {
  const navigate = useNavigate();
  const { suppliers } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = suppliers.filter((o) => {
    if (filter !== 'All' && o.status !== filter) return false;
    return o.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="pt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <SpecLabel>Tenants</SpecLabel>
          <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
            Supplier organizations
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Each yard is a separate tenant with its own catalogue, pricing, staff and builders.
          </p>
        </div>
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => navigate('/admin/suppliers/new')}>
          Create supplier
        </Button>
      </div>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search supplier organizations"
        filters={['All', 'Active', 'Trial', 'Pending', 'Restricted', 'Suspended']}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState title="No organizations match" body="Adjust the filter or search term." /> :

      <RecordTable columns={SUPPLIER_COLUMNS} caption="Supplier organizations">
          {rows.map((o) => {
          const plan = o.planId ? PLAN_BY_ID[o.planId] : undefined;
          const over = plan ? o.usage.builderCompanies / plan.limits.builderCompanies >= 0.9 : false;
          return (
            <Row
              key={o.id}
              onClick={() => navigate(`/admin/org/${o.id}`)}
              spine={o.status === 'Suspended' ? 'danger' : o.status === 'Trial' ? 'info' : undefined}>
              
                <Cell strong>{o.name}</Cell>
                <Cell>
                  <Badge tone={STATUS_TONE(o.status)}>{o.status}</Badge>
                </Cell>
                <Cell hideBelow="sm" muted>
                  {plan?.name ?? '—'}
                </Cell>
                <Cell align="right" mono className={over ? 'text-caution-700' : undefined}>
                  {o.usage.builderCompanies}
                  <span className="text-ink-400">/{plan?.limits.builderCompanies ?? '—'}</span>
                </Cell>
                <Cell align="right" mono hideBelow="md">
                  {o.branches.length}
                </Cell>
                <Cell align="right" mono hideBelow="md">
                  {o.usage.users}
                </Cell>
                <Cell align="right" mono hideBelow="lg">
                  {o.usage.aiSheets.toLocaleString()}
                </Cell>
                <Cell align="right" muted hideBelow="lg">
                  {o.lastActive}
                </Cell>
              </Row>);

        })}
        </RecordTable>
      }
    </div>);

}

const BUILDER_COLUMNS: Column[] = [
{ key: 'name', label: 'Builder' },
{ key: 'status', label: 'Status' },
{ key: 'suppliers', label: 'Trading with', hideBelow: 'sm' },
{ key: 'projects', label: 'Projects', align: 'right' },
{ key: 'users', label: 'Users', align: 'right', hideBelow: 'md' },
{ key: 'active', label: 'Last active', align: 'right', hideBelow: 'lg' }];


export function BuilderDirectory() {
  const navigate = useNavigate();
  const { builders } = useAdmin();
  const [query, setQuery] = useState('');

  const rows = builders.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Tenants</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          Builder organizations
        </h1>
        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-500">
          Builders are licensed through the supplier relationship, so they carry no subscription of their
          own. This directory is platform-level visibility, not a builder workspace.
        </p>
      </div>

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search builder organizations" />

      {rows.length === 0 &&
      <EmptyState title="No builders match" body="No builder organization matches that search term." />
      }

      <RecordTable columns={BUILDER_COLUMNS} caption="Builder organizations">
        {rows.map((o) =>
        <Row
          key={o.id}
          onClick={() => navigate(`/admin/org/${o.id}`)}
          spine={o.status === 'Restricted' ? 'caution' : undefined}>
          
            <Cell strong>{o.name}</Cell>
            <Cell>
              <Badge tone={STATUS_TONE(o.status)}>{o.status}</Badge>
            </Cell>
            <Cell hideBelow="sm" muted>
              {o.partners.map(orgName).join(', ') || 'No suppliers connected'}
            </Cell>
            <Cell align="right" mono>
              {o.projects}
            </Cell>
            <Cell align="right" mono hideBelow="md">
              {o.usage.users}
            </Cell>
            <Cell align="right" muted hideBelow="lg">
              {o.lastActive}
            </Cell>
          </Row>
        )}
      </RecordTable>

      <ScopeNote>
        Builder records show relationships and platform activity only. A supplier&apos;s pricing, quotes and
        margins against a builder stay inside that supplier&apos;s tenant.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Organization workspace                                              */
/* ------------------------------------------------------------------ */

type Tab =
'Overview' |
'Branches' |
'Users' |
'Relationships' |
'Subscription' |
'Features' |
'Integrations' |
'Activity';

export function OrganizationDetail() {
  /* Must match the route's param name (/admin/org/:orgId) — reading the wrong
     key here silently resolved every organization to "not found". */
  const { orgId = '' } = useParams();
  const navigate = useNavigate();
  const {
    org,
    integrations,
    audit,
    setOrgStatus,
    setOrgPlan,
    setEntitlement,
    entitled,
    startSession,
    cases
  } = useAdmin();
  const [tab, setTab] = useState<Tab>('Overview');
  const [statusOpen, setStatusOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  const record = org(orgId);
  if (!record) {
    return (
      <div className="pt-7">
        <EmptyState
          title="Organization not found"
          body={`No organization on the platform matches ${orgId || 'that reference'}. It may have been renamed or removed.`}
          action="Back to suppliers"
          onAction={() => navigate('/admin/suppliers')} />
        
      </div>);

  }

  const plan = record.planId ? PLAN_BY_ID[record.planId] : undefined;
  const orgIntegrations = integrations.filter((i) => i.orgId === record.id);
  const orgAudit = audit.filter((a) => a.orgId === record.id);
  const orgCases = cases.filter((c) => c.orgId === record.id);

  const tabs: Tab[] = [
  'Overview',
  'Branches',
  'Users',
  'Relationships',
  ...((record.kind === 'supplier' ? ['Subscription'] : []) as Tab[]),
  'Features',
  'Integrations',
  'Activity'];


  return (
    <div className="pt-7">
      <RecordHeader
        backTo={record.kind === 'supplier' ? '/admin/suppliers' : '/admin/builders'}
        eyebrow={`${record.kind === 'supplier' ? 'Supplier' : 'Builder'} organization · ${record.id}`}
        title={record.name}
        reference={`${record.region} · created ${record.created} · last active ${record.lastActive}`}
        status={<Badge tone={STATUS_TONE(record.status)}>{record.status}</Badge>}
        actions={
        <>
            <Button variant="secondary" size="sm" icon={<HeadsetIcon className="h-4 w-4" />} onClick={() => setSessionOpen(true)}>
              Support access
            </Button>
            <Button
            variant={record.status === 'Active' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setStatusOpen(true)}>
            
              {record.status === 'Active' ? 'Change status' : 'Reactivate'}
            </Button>
          </>
        }
        facts={[
        { label: 'Plan', value: plan?.name ?? 'Via supplier relationship' },
        { label: 'Administrator', value: record.admin.name },
        { label: 'Branches', value: String(record.branches.length) },
        { label: 'Users', value: String(record.usage.users) },
        { label: 'Projects', value: String(record.projects) },
        { label: 'ERP', value: record.erp ?? 'None' }]
        } />
      

      {record.statusReason &&
      <div className="mb-5">
          <InlineAlert
          tone="danger"
          title={`${record.status} — ${record.statusReason.reason}`}
          body={`${record.statusReason.note} Set by ${record.statusReason.by}, ${record.statusReason.at}.`} />
        
        </div>
      }

      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-ink-200">
        {tabs.map((t) =>
        <button
          key={t}
          onClick={() => setTab(t)}
          aria-pressed={tab === t}
          className={`shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ease-smooth ${
          tab === t ? 'border-brand-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'}`
          }>
          
            {t}
          </button>
        )}
      </div>

      {tab === 'Overview' &&
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <Panel className="overflow-hidden">
              <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
                {[
              { label: 'Active users', value: String(record.usage.users) },
              { label: 'Branches', value: String(record.branches.filter((b) => b.status === 'Active').length) },
              { label: 'Projects', value: String(record.projects) },
              { label: 'AI sheets', value: record.usage.aiSheets.toLocaleString() },
              { label: 'Storage', value: `${record.usage.storage}`, unit: 'GB' }].
              map((m) =>
              <div key={m.label} className="min-w-[140px] flex-1 px-4 py-3.5">
                    <Measured label={m.label} value={m.value} unit={'unit' in m ? m.unit as string : undefined} />
                  </div>
              )}
              </div>
            </Panel>

            {plan &&
          <PanelSection label="Licence" title={`${plan.name} · ${plan.support} support`}>
                <div className="grid gap-x-8 gap-y-4 px-4 py-4 sm:grid-cols-2">
                  <UsageMeter label="Builder companies" used={record.usage.builderCompanies} limit={plan.limits.builderCompanies} />
                  <UsageMeter label="Branches" used={record.branches.length} limit={plan.limits.branches} />
                  <UsageMeter label="Users" used={record.usage.users} limit={plan.limits.users} />
                  <UsageMeter label="AI sheets this month" used={record.usage.aiSheets} limit={plan.limits.aiSheets} />
                  <UsageMeter label="Storage" used={record.usage.storage} limit={plan.limits.storage} unit="GB" />
                </div>
              </PanelSection>
          }

            <PanelSection label="Support" title="Open cases" reference={`${orgCases.length} total`}>
              {orgCases.length === 0 ?
            <p className="px-4 py-4 text-[13px] text-ink-500">No cases raised for this organization.</p> :

            <ul className="divide-y divide-ink-100">
                  {orgCases.map((c) =>
              <li key={c.id}>
                      <button
                  onClick={() => navigate(`/admin/support/${c.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
                  
                        <span className="measure w-[70px] shrink-0 text-[11px] text-ink-400">{c.id}</span>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-800">
                          {c.subject}
                        </span>
                        <Badge tone={c.status === 'Escalated' ? 'danger' : c.status === 'Resolved' ? 'positive' : 'caution'}>
                          {c.status}
                        </Badge>
                      </button>
                    </li>
              )}
                </ul>
            }
            </PanelSection>
          </div>

          <div className="min-w-0 space-y-5">
            <PanelSection label="Organization" title="Details">
              <dl className="divide-y divide-ink-100 px-4">
                {[
              ['Legal name', record.name],
              ['Address', record.address],
              ['Primary contact', record.contact],
              ['Contact email', record.contactEmail],
              ['Administrator', `${record.admin.name} · ${record.admin.email}`],
              ['Region', record.region],
              ['Created', record.created]].
              map(([k, v]) =>
              <div key={k} className="py-2.5">
                    <dt className="spec-label">{k}</dt>
                    <dd className="mt-0.5 text-[12.5px] font-medium text-ink-800">{v}</dd>
                  </div>
              )}
              </dl>
            </PanelSection>
            <ScopeNote>
              Platform administration can see that this tenant trades, and with whom. It does not read their
              pricing, margins or quote contents.
            </ScopeNote>
          </div>
        </div>
      }

      {tab === 'Branches' &&
      <RecordTable
        columns={[
        { key: 'name', label: 'Branch' },
        { key: 'loc', label: 'Location', hideBelow: 'sm' },
        { key: 'users', label: 'Users', align: 'right' },
        { key: 'orders', label: 'Orders 30d', align: 'right', hideBelow: 'md' },
        { key: 'del', label: 'Deliveries 30d', align: 'right', hideBelow: 'md' },
        { key: 'status', label: 'Status', align: 'right' }]
        }
        caption="Branches">
        
          {record.branches.map((b) =>
        <Row key={b.id}>
              <Cell strong>{b.name}</Cell>
              <Cell hideBelow="sm" muted>
                {b.location}
              </Cell>
              <Cell align="right" mono>
                {b.users}
              </Cell>
              <Cell align="right" mono hideBelow="md">
                {b.orders30d}
              </Cell>
              <Cell align="right" mono hideBelow="md">
                {b.deliveries30d}
              </Cell>
              <Cell align="right">
                <Badge tone={b.status === 'Active' ? 'positive' : b.status === 'Suspended' ? 'danger' : 'neutral'}>
                  {b.status}
                </Badge>
              </Cell>
            </Row>
        )}
        </RecordTable>
      }

      {tab === 'Users' && <OrgUsers orgId={record.id} />}

      {tab === 'Relationships' &&
      <PanelSection
        label={record.kind === 'supplier' ? 'Builders they trade with' : 'Suppliers they buy from'}
        title={`${record.partners.length} controlled relationships`}>
        
          {record.partners.length === 0 ?
        <p className="px-4 py-4 text-[13px] text-ink-500">No trading relationships established yet.</p> :

        <ul className="divide-y divide-ink-100">
              {record.partners.map((p) =>
          <li key={p}>
                  <button
              onClick={() => navigate(`/admin/org/${p}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
              
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-900">
                      {orgName(p)}
                    </span>
                    <span className="measure text-[11px] text-ink-400">{p}</span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-300" />
                  </button>
                </li>
          )}
            </ul>
        }
          <ImpactList
          items={[
          'A relationship is what lets these two organizations exchange RFQs, quotes, orders and invoices.',
          'Neither side can read the other’s internal records — only the documents deliberately sent across.']
          } />
        
        </PanelSection>
      }

      {tab === 'Subscription' && plan &&
      <SubscriptionPanel orgId={record.id} onChange={setOrgPlan} />
      }

      {tab === 'Features' &&
      <EntitlementPanel
        orgId={record.id}
        onSet={setEntitlement}
        resolve={(f) => entitled(record, f)}
        planFeatures={plan?.features ?? []}
        overrides={record.overrides} />

      }

      {tab === 'Integrations' &&
      <div className="space-y-5">
          {orgIntegrations.length === 0 ?
        <EmptyState title="No adapters connected" body="This tenant runs entirely on SM PRO." /> :

        orgIntegrations.map((i) =>
        <PanelSection
          key={i.id}
          label={i.adapter}
          title={`${i.status} · last sync ${i.lastSync}`}
          reference={i.errors ? `${i.errors} ERRORS` : 'NO ERRORS'}
          action={
          <button
            onClick={() => navigate('/admin/integrations')}
            className="text-[12px] font-semibold text-brand-600">
            
                    Open
                  </button>
          }>
          
                <ul className="divide-y divide-ink-100">
                  {i.entities.map((e) =>
            <li key={e.name} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink-800">{e.name}</span>
                      <span className="measure text-[11px] text-ink-400">{e.records.toLocaleString()}</span>
                      <Badge
                tone={e.status === 'Connected' ? 'positive' : e.status === 'Failed' ? 'danger' : 'caution'}>
                
                        {e.status}
                      </Badge>
                    </li>
            )}
                </ul>
              </PanelSection>
        )
        }
        </div>
      }

      {tab === 'Activity' &&
      <PanelSection label="Audit" title="Platform actions against this organization">
          {orgAudit.length === 0 ?
        <p className="px-4 py-4 text-[13px] text-ink-500">Nothing recorded for this organization yet.</p> :

        <ol className="divide-y divide-ink-100">
              {orgAudit.map((a) =>
          <li key={a.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="measure text-[11px] text-ink-400">{a.at}</span>
                    <span className="text-[13px] font-semibold text-ink-900">{a.action}</span>
                    <span className="measure text-[11px] text-ink-400">{a.actor}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-600">{a.object}</p>
                  {(a.before || a.after) &&
            <p className="measure mt-1 text-[11.5px] text-ink-500">
                      {a.before ?? '—'} → <span className="font-semibold text-ink-800">{a.after ?? '—'}</span>
                    </p>
            }
                  {a.reason && <p className="mt-1 text-[12px] italic text-ink-400">{a.reason}</p>}
                </li>
          )}
            </ol>
        }
        </PanelSection>
      }

      {statusOpen &&
      <StatusModal
        current={record.status}
        name={record.name}
        onClose={() => setStatusOpen(false)}
        onApply={(status, reason, note) => {
          setOrgStatus(record.id, status, reason, note);
          setStatusOpen(false);
        }} />

      }

      {sessionOpen &&
      <SessionModal
        name={record.name}
        onClose={() => setSessionOpen(false)}
        onStart={(reason) => {
          startSession(record.id, reason);
          setSessionOpen(false);
          navigate('/admin/support');
        }} />

      }
    </div>);

}

function OrgUsers({ orgId }: {orgId: string;}) {
  const { users, setUserStatus } = useAdmin();
  const rows = users.filter((u) => u.orgId === orgId);

  if (rows.length === 0) {
    return (
      <>
        <EmptyState
          title="No users yet"
          body="Nobody has accepted an invitation into this organization. The administrator invites their own team." />
        
        <ScopeNote>
          Platform administration controls account state only. Which roles a person holds inside their
          organization is set by that organization&apos;s own administrator.
        </ScopeNote>
      </>);

  }

  return (
    <>
      <RecordTable
        columns={[
        { key: 'name', label: 'User' },
        { key: 'branch', label: 'Branch', hideBelow: 'sm' },
        { key: 'roles', label: 'Roles', hideBelow: 'md' },
        { key: 'status', label: 'Status' },
        { key: 'act', label: '', align: 'right' }]
        }
        caption="Organization users">
        
        {rows.map((u) =>
        <Row key={u.id}>
            <Cell strong>
              {u.name}
              <span className="ml-2 font-normal text-ink-400">{u.email}</span>
            </Cell>
            <Cell hideBelow="sm" muted>
              {u.branch}
            </Cell>
            <Cell hideBelow="md" muted>
              {u.roles.join(', ')}
            </Cell>
            <Cell>
              <Badge
              tone={
              u.status === 'Active' ?
              'positive' :
              u.status === 'Invited' ?
              'info' :
              u.status === 'Locked' ?
              'caution' :
              'danger'
              }>
              
                {u.status}
              </Badge>
            </Cell>
            <Cell align="right">
              <button
              onClick={() => setUserStatus(u.id, u.status === 'Active' ? 'Disabled' : 'Active')}
              className="text-[12px] font-semibold text-brand-600">
              
                {u.status === 'Active' ? 'Disable' : 'Enable'}
              </button>
            </Cell>
          </Row>
        )}
      </RecordTable>
      <ScopeNote>
        Platform administration controls account state only. Which roles a person holds inside their
        organization is set by that organization&apos;s own administrator.
      </ScopeNote>
    </>);

}

function SubscriptionPanel({
  orgId,
  onChange



}: {orgId: string;onChange: (id: string, plan: PlanId, note: string) => void;}) {
  const { org } = useAdmin();
  const record = org(orgId)!;
  const plan = PLAN_BY_ID[record.planId!];
  const [target, setTarget] = useState<PlanId>(record.planId!);
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(false);
  const next = PLAN_BY_ID[target];
  const direction = next.price > plan.price ? 'Upgrade' : next.price < plan.price ? 'Downgrade' : 'No change';

  const breaches = (
  [
  ['Builder companies', record.usage.builderCompanies, next.limits.builderCompanies],
  ['Branches', record.branches.length, next.limits.branches],
  ['Users', record.usage.users, next.limits.users],
  ['Storage (GB)', record.usage.storage, next.limits.storage],
  ['AI sheets', record.usage.aiSheets, next.limits.aiSheets]] as
  [string, number, number][]).
  filter(([, used, limit]) => used > limit);

  const lost = plan.features.filter((f) => !next.features.includes(f));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <PanelSection label="Current licence" title={`${plan.name} · $${plan.price.toLocaleString()} / month`}>
        <div className="grid gap-x-8 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <UsageMeter label="Builder companies" used={record.usage.builderCompanies} limit={plan.limits.builderCompanies} />
          <UsageMeter label="Branches" used={record.branches.length} limit={plan.limits.branches} />
          <UsageMeter label="Users" used={record.usage.users} limit={plan.limits.users} />
          <UsageMeter label="Storage" used={record.usage.storage} limit={plan.limits.storage} unit="GB" />
          <UsageMeter label="AI sheets" used={record.usage.aiSheets} limit={plan.limits.aiSheets} />
        </div>
        <TickRule />
        <dl className="grid gap-x-8 gap-y-3 px-4 py-3 sm:grid-cols-3">
          {[
          ['Started', record.subscription?.started ?? '—'],
          ['Renews', record.subscription?.renews ?? '—'],
          ['Support', plan.support]].
          map(([k, v]) =>
          <div key={k}>
              <dt className="spec-label">{k}</dt>
              <dd className="mt-0.5 text-[12.5px] font-semibold text-ink-900">{v}</dd>
            </div>
          )}
        </dl>
      </PanelSection>

      <PanelSection label="Change licence" title="Move to another plan">
        <div className="space-y-4 px-4 py-4">
          <Select label="Plan" value={target} onChange={(e) => setTarget(e.target.value as PlanId)}>
            {PLANS.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name} — ${p.price.toLocaleString()}/mo · {p.limits.builderCompanies} builders
              </option>
            )}
          </Select>
          <Input label="Reason" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Renewal negotiation" />

          {direction !== 'No change' &&
          <div className="rounded-[3px] border border-ink-200 bg-ink-50 px-3.5 py-3">
              <SpecLabel>{direction}</SpecLabel>
              <p className="measure mt-1 text-[13px] font-semibold text-ink-900">
                ${plan.price.toLocaleString()} → ${next.price.toLocaleString()} / month
              </p>
              {breaches.length > 0 &&
            <ul className="mt-2 space-y-1">
                  {breaches.map(([label, used, limit]) =>
              <li key={label} className="flex items-start gap-1.5 text-[12px] leading-snug text-danger-700">
                      <AlertTriangleIcon className="mt-[2px] h-3.5 w-3.5 shrink-0" />
                      {label}: currently {used.toLocaleString()}, new limit {limit.toLocaleString()}
                    </li>
              )}
                </ul>
            }
              {lost.length > 0 &&
            <p className="mt-2 text-[12px] leading-snug text-caution-700">
                  Loses: {lost.map((f) => FEATURES.find((x) => x.id === f)?.label).join(', ')}
                </p>
            }
            </div>
          }

          <Button
            block
            disabled={direction === 'No change'}
            onClick={() => setConfirm(true)}>
            
            Review change
          </Button>
        </div>
      </PanelSection>

      {confirm &&
      <Modal open onClose={() => setConfirm(false)} title={`${direction} ${record.name}`}>
          <p className="text-[13px] leading-relaxed text-ink-600">
            {plan.name} → {next.name}. This takes effect immediately and is written to the audit log.
          </p>
          {(breaches.length > 0 || lost.length > 0) &&
        <div className="mt-3">
              <InlineAlert
            tone="warning"
            title="This tenant is over the new limits"
            body="Existing records are kept. New work that would exceed a limit is refused until usage falls back inside it." />
          
            </div>
        }
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              onChange(orgId, target, note || 'No reason given');
              setConfirm(false);
            }}>
            
              Apply change
            </Button>
          </div>
        </Modal>
      }
    </div>);

}

function EntitlementPanel({
  orgId,
  onSet,
  resolve,
  planFeatures,
  overrides






}: {orgId: string;onSet: (id: string, f: FeatureId, enabled: boolean | null, reason: string) => void;resolve: (f: FeatureId) => boolean;planFeatures: FeatureId[];overrides: Partial<Record<FeatureId, boolean>>;}) {
  const [pending, setPending] = useState<{feature: FeatureId;enabled: boolean;} | null>(null);
  const [reason, setReason] = useState('');
  const def = pending ? FEATURES.find((f) => f.id === pending.feature)! : null;

  return (
    <>
      <PanelSection
        label="Entitlements"
        title="What this organization can use"
        reference="Plan grant + override">
        
        <ul className="divide-y divide-ink-100">
          {FEATURES.map((f) => {
            const inPlan = planFeatures.includes(f.id);
            const override = f.id in overrides;
            const on = resolve(f.id);
            return (
              <li key={f.id} className="flex flex-wrap items-start gap-x-5 gap-y-2 px-4 py-3.5">
                <div className="min-w-[220px] flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-ink-900">{f.label}</p>
                    {override &&
                    <span className="measure rounded-[2px] bg-caution-50 px-1.5 py-0.5 text-[10px] font-semibold text-caution-700">
                        OVERRIDE
                      </span>
                    }
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{f.description}</p>
                </div>
                <div className="w-[110px] shrink-0">
                  <SpecLabel>In plan</SpecLabel>
                  <p className="mt-0.5 text-[12.5px] font-medium text-ink-700">{inPlan ? 'Granted' : 'Not granted'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={on ? 'positive' : 'neutral'}>{on ? 'Enabled' : 'Disabled'}</Badge>
                  <button
                    onClick={() => {
                      setPending({ feature: f.id, enabled: !on });
                      setReason('');
                    }}
                    className="rounded-[3px] border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink-700 transition-colors duration-150 ease-smooth hover:border-brand-500 hover:text-brand-600">
                    
                    {on ? 'Disable' : 'Enable'}
                  </button>
                  {override &&
                  <button
                    onClick={() => onSet(orgId, f.id, null, 'Override cleared — following the plan again')}
                    aria-label={`Clear override on ${f.label}`}
                    className="text-ink-300 transition-colors duration-150 ease-smooth hover:text-danger-600">
                    
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  }
                </div>
              </li>);

          })}
        </ul>
      </PanelSection>

      {pending && def &&
      <Modal
        open
        onClose={() => setPending(null)}
        title={`${pending.enabled ? 'Enable' : 'Disable'} ${def.label}`}>
        
          <p className="text-[13px] leading-relaxed text-ink-600">
            This overrides the plan for this organization only.
          </p>
          {!pending.enabled && def.disruptive &&
        <div className="mt-3">
              <InlineAlert
            tone="danger"
            title="This stops work already in flight"
            body="Anything currently running under this feature will be cancelled, and users lose the module immediately." />
          
            </div>
        }
          <div className="mt-4">
            <Input
            label="Reason (recorded in the audit log)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Usage investigation" />
          
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            variant={pending.enabled ? 'primary' : 'danger'}
            onClick={() => {
              onSet(orgId, pending.feature, pending.enabled, reason || 'No reason given');
              setPending(null);
            }}>
            
              {pending.enabled ? 'Enable feature' : 'Disable feature'}
            </Button>
          </div>
        </Modal>
      }
    </>);

}

function StatusModal({
  current,
  name,
  onClose,
  onApply





}: {current: OrgStatus;name: string;onClose: () => void;onApply: (status: OrgStatus, reason: string, note: string) => void;}) {
  const [status, setStatus] = useState<OrgStatus>(current === 'Active' ? 'Suspended' : 'Active');
  const [reason, setReason] = useState('Non-payment');
  const [note, setNote] = useState('');
  const destructive = ['Suspended', 'Cancelled', 'Restricted'].includes(status);

  return (
    <Modal open onClose={onClose} title={`Change status — ${name}`}>
      <div className="space-y-4">
        <Select label="New status" value={status} onChange={(e) => setStatus(e.target.value as OrgStatus)}>
          {(['Active', 'Trial', 'Restricted', 'Suspended', 'Cancelled'] as OrgStatus[]).map((s) =>
          <option key={s} value={s}>
              {s}
            </option>
          )}
        </Select>
        {destructive &&
        <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Non-payment</option>
            <option>Usage investigation</option>
            <option>Security concern</option>
            <option>Contract ended</option>
            <option>Tenant request</option>
          </Select>
        }
        <Input
          label="Internal note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened, and what would reverse it" />
        

        {destructive &&
        <InlineAlert
          tone="danger"
          title={`${name} loses access immediately`}
          body="Users cannot sign in, running AI work is cancelled, and integrations stop syncing. Data is retained and everything returns on reactivation." />

        }
        {status === 'Active' && current !== 'Active' &&
        <InlineAlert
          tone="success"
          title="Access is restored across every module"
          body="Users can sign in again and integrations resume on their next scheduled window." />

        }
      </div>
      <div className="mt-5 flex gap-2.5">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          variant={destructive ? 'danger' : 'primary'}
          onClick={() => onApply(status, destructive ? reason : 'Reactivated', note || '—')}>
          
          {destructive ? `Confirm ${status.toLowerCase()}` : 'Reactivate'}
        </Button>
      </div>
    </Modal>);

}

function SessionModal({
  name,
  onClose,
  onStart




}: {name: string;onClose: () => void;onStart: (reason: string) => void;}) {
  const [reason, setReason] = useState('Customer support');
  return (
    <Modal open onClose={onClose} title={`Controlled support access — ${name}`}>
      <div className="flex items-start gap-3 rounded-[3px] border border-caution-500/40 bg-caution-50 px-3.5 py-3">
        <ShieldAlertIcon className="mt-[2px] h-4 w-4 shrink-0 text-caution-700" />
        <p className="text-[12.5px] leading-relaxed text-caution-700">
          This is not an impersonation. A banner stays visible for the whole session, every action is
          attributed to you, and the session start and end are written to the audit log and the tenant&apos;s
          own security events.
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
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={() => onStart(reason)}>
          Start session
        </Button>
      </div>
    </Modal>);

}

/* ------------------------------------------------------------------ */
/* Create supplier                                                     */
/* ------------------------------------------------------------------ */

const WIZARD = ['Company', 'Administrator', 'Branches', 'Subscription', 'Entitlements', 'Review'] as const;
type WizardStep = (typeof WIZARD)[number];

export function CreateSupplier() {
  const navigate = useNavigate();
  const { createSupplier } = useAdmin();
  const [step, setStep] = useState<WizardStep>('Company');
  const [draft, setDraft] = useState<NewSupplierDraft>({
    name: 'Red Cedar Building Supply',
    region: 'Texas',
    address: '1200 Commerce St, Waco, TX 76701',
    contact: 'Janice Kowalski',
    contactEmail: 'janice@redcedarbs.com',
    adminName: 'Janice Kowalski',
    adminEmail: 'janice@redcedarbs.com',
    branches: [{ name: 'Waco Main Yard', location: 'Waco, TX' }],
    planId: 'growth',
    overrides: {}
  });

  const index = WIZARD.indexOf(step);
  const plan = PLAN_BY_ID[draft.planId];
  const set = <K extends keyof NewSupplierDraft,>(key: K, value: NewSupplierDraft[K]) =>
  setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="pt-7">
      <div className="detail-column">
        <div className="mb-5">
          <SpecLabel>New tenant</SpecLabel>
          <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
            Create a supplier organization
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            The organization starts as Pending. It becomes active once the administrator accepts their
            invitation and completes setup.
          </p>
        </div>

        <ol className="mb-5 flex gap-1.5">
          {WIZARD.map((w, i) =>
          <li
            key={w}
            className={`h-[3px] flex-1 rounded-[1px] ${i <= index ? 'bg-brand-500' : 'bg-ink-200'}`}
            aria-current={w === step ? 'step' : undefined} />

          )}
        </ol>

        <Panel className="overflow-hidden">
          <div className="border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
            <SpecLabel>
              Step {index + 1} of {WIZARD.length} · {step}
            </SpecLabel>
          </div>

          <div className="space-y-4 px-4 py-5">
            {step === 'Company' &&
            <>
                <Input label="Legal business name" value={draft.name} onChange={(e) => set('name', e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Region" value={draft.region} onChange={(e) => set('region', e.target.value)} />
                  <Input label="Primary contact" value={draft.contact} onChange={(e) => set('contact', e.target.value)} />
                </div>
                <Input label="Head office address" value={draft.address} onChange={(e) => set('address', e.target.value)} />
                <Input
                label="Contact email"
                value={draft.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)} />
              
              </>
            }

            {step === 'Administrator' &&
            <>
                <InlineAlert
                tone="info"
                title="The first administrator owns the organization"
                body="They configure yards, invite staff and assign the eight yard roles. Platform administration does not manage roles inside a tenant." />
              
                <Input label="Name" value={draft.adminName} onChange={(e) => set('adminName', e.target.value)} />
                <Input label="Work email" value={draft.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} />
              </>
            }

            {step === 'Branches' &&
            <>
                <ul className="space-y-2">
                  {draft.branches.map((b, i) =>
                <li key={i} className="flex items-center gap-2.5 rounded-[3px] border border-ink-200 px-3.5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-ink-900">{b.name}</p>
                        <p className="text-[12px] text-ink-400">{b.location}</p>
                      </div>
                      {i === 0 ?
                  <span className="measure rounded-[2px] border border-brand-500 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          MAIN
                        </span> :

                  <button
                    aria-label={`Remove ${b.name}`}
                    onClick={() => set('branches', draft.branches.filter((_, x) => x !== i))}
                    className="text-ink-300 hover:text-danger-600">
                    
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                  }
                    </li>
                )}
                </ul>
                <Button
                variant="secondary"
                size="sm"
                icon={<PlusIcon className="h-4 w-4" />}
                onClick={() =>
                set('branches', [
                ...draft.branches,
                { name: `Branch ${draft.branches.length + 1}`, location: draft.region }]
                )
                }>
                
                  Add branch
                </Button>
                {draft.branches.length > plan.limits.branches &&
              <InlineAlert
                tone="warning"
                title="More branches than the selected plan allows"
                body={`${plan.name} permits ${plan.limits.branches}. Choose a larger plan on the next step or remove a branch.`} />

              }
              </>
            }

            {step === 'Subscription' &&
            <div className="space-y-2.5">
                {PLANS.map((p) =>
              <button
                key={p.id}
                onClick={() => set('planId', p.id)}
                aria-pressed={draft.planId === p.id}
                className={`flex w-full items-start gap-3 rounded-[3px] border px-4 py-3.5 text-left transition-colors duration-150 ease-smooth ${
                draft.planId === p.id ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300'}`
                }>
                
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="text-[14px] font-semibold text-ink-900">{p.name}</span>
                        <span className="measure text-[12px] text-ink-500">
                          ${p.price.toLocaleString()}/mo
                        </span>
                      </span>
                      <span className="measure mt-1 block text-[11.5px] text-ink-500">
                        {p.limits.builderCompanies} BUILDERS · {p.limits.branches} BRANCHES ·{' '}
                        {p.limits.users} USERS · {p.limits.aiSheets.toLocaleString()} SHEETS/MO
                      </span>
                      <span className="mt-1 block text-[12px] text-ink-400">
                        {p.support} support · {p.features.length} features
                      </span>
                    </span>
                    {draft.planId === p.id && <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />}
                  </button>
              )}
              </div>
            }

            {step === 'Entitlements' &&
            <>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  {plan.name} grants {plan.features.length} features. Add or withhold any of them for this
                  organization specifically.
                </p>
                <ul className="divide-y divide-ink-100 rounded-[3px] border border-ink-200">
                  {FEATURES.map((f) => {
                  const inPlan = plan.features.includes(f.id);
                  const on = f.id in draft.overrides ? Boolean(draft.overrides[f.id]) : inPlan;
                  return (
                    <li key={f.id} className="flex items-center gap-3 px-3.5 py-2.5">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-semibold text-ink-900">{f.label}</span>
                          <span className="measure mt-0.5 block text-[10.5px] text-ink-400">
                            {inPlan ? 'In plan' : 'Not in plan'}
                          </span>
                        </span>
                        <button
                        onClick={() => {
                          const next = { ...draft.overrides };
                          if (!on === inPlan) delete next[f.id];else
                          next[f.id] = !on;
                          set('overrides', next);
                        }}
                        aria-pressed={on}
                        className={`rounded-[3px] border px-2.5 py-1 text-[12px] font-semibold transition-colors duration-150 ease-smooth ${
                        on ? 'border-positive-500 bg-positive-50 text-positive-700' : 'border-ink-200 text-ink-500'}`
                        }>
                        
                          {on ? 'Enabled' : 'Disabled'}
                        </button>
                      </li>);

                })}
                </ul>
              </>
            }

            {step === 'Review' &&
            <dl className="divide-y divide-ink-100">
                {[
              ['Organization', `${draft.name} · ${draft.region}`],
              ['Address', draft.address],
              ['Administrator', `${draft.adminName} · ${draft.adminEmail}`],
              ['Branches', draft.branches.map((b) => b.name).join(', ')],
              ['Plan', `${plan.name} — $${plan.price.toLocaleString()}/mo`],
              ['Builder companies', String(plan.limits.builderCompanies)],
              [
              'Entitlement overrides',
              Object.keys(draft.overrides).length ?
              Object.entries(draft.overrides).
              map(([k, v]) => `${FEATURES.find((f) => f.id === k)?.label}: ${v ? 'on' : 'off'}`).
              join(', ') :
              'None — follows the plan'],

              ['Initial status', 'Pending — awaiting administrator activation']].
              map(([k, v]) =>
              <div key={k} className="flex flex-wrap items-baseline justify-between gap-4 py-2.5">
                    <dt className="spec-label">{k}</dt>
                    <dd className="min-w-0 text-right text-[12.5px] font-medium text-ink-800">{v}</dd>
                  </div>
              )}
              </dl>
            }
          </div>

          <TickRule />
          <div className="flex items-center gap-3 px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => index === 0 ? navigate('/admin/suppliers') : setStep(WIZARD[index - 1])}>
              
              Back
            </Button>
            <Button
              className="flex-1"
              icon={<ArrowRightIcon className="h-4 w-4" />}
              onClick={() => {
                if (index === WIZARD.length - 1) {
                  const id = createSupplier(draft);
                  navigate(`/admin/org/${id}`);
                } else setStep(WIZARD[index + 1]);
              }}>
              
              {index === WIZARD.length - 1 ? 'Create organization' : 'Continue'}
            </Button>
          </div>
        </Panel>
      </div>
    </div>);

}

/* ------------------------------------------------------------------ */

export function PlatformUsers() {
  const navigate = useNavigate();
  const { users, setUserStatus } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = users.filter((u) => {
    if (filter !== 'All' && u.status !== filter) return false;
    const q = query.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || orgName(u.orgId).toLowerCase().includes(q);
  });

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Tenants</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">Users &amp; access</h1>
        <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-500">
          Platform-level account state across every organization. Role assignment inside an organization stays
          with that organization&apos;s administrator.
        </p>
      </div>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by name, email or organization"
        filters={['All', 'Active', 'Invited', 'Locked', 'Disabled']}
        active={filter}
        onFilter={setFilter} />
      

      <RecordTable
        columns={[
        { key: 'name', label: 'User' },
        { key: 'org', label: 'Organization', hideBelow: 'sm' },
        { key: 'branch', label: 'Branch', hideBelow: 'lg' },
        { key: 'roles', label: 'Roles', hideBelow: 'md' },
        { key: 'status', label: 'Status' },
        { key: 'act', label: '', align: 'right' }]
        }
        caption="Platform users">
        
        {rows.map((u) =>
        <Row key={u.id}>
            <Cell strong>
              {u.name}
              <span className="ml-2 font-normal text-ink-400">{u.email}</span>
            </Cell>
            <Cell hideBelow="sm">
              <button
              onClick={() => navigate(`/admin/org/${u.orgId}`)}
              className="font-medium text-brand-600 hover:underline">
              
                {orgName(u.orgId)}
              </button>
            </Cell>
            <Cell hideBelow="lg" muted>
              {u.branch}
            </Cell>
            <Cell hideBelow="md" muted>
              {u.roles.join(', ')}
            </Cell>
            <Cell>
              <Badge
              tone={
              u.status === 'Active' ?
              'positive' :
              u.status === 'Invited' ?
              'info' :
              u.status === 'Locked' ?
              'caution' :
              'danger'
              }>
              
                {u.status}
              </Badge>
            </Cell>
            <Cell align="right">
              <button
              onClick={() => setUserStatus(u.id, u.status === 'Active' ? 'Disabled' : 'Active')}
              className="text-[12px] font-semibold text-brand-600">
              
                {u.status === 'Active' ? 'Disable' : 'Enable'}
              </button>
            </Cell>
          </Row>
        )}
      </RecordTable>
    </div>);

}