import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldIcon,
  XIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Drawer } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { Panel, SpecLabel, SpecRow, TickRule, TitleBlock, WorkHeading } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordTable,
  Row,
  ScopeNote } from
'../../components/supplier/Records';
import { SUPPLIER_MODULES } from '../../components/supplier/navigation';
import { useSupplier } from '../../contexts/SupplierContext';
import { branchName, supplierStaff } from '../../data/supplierOrg';
import { supplierAudit, syncEvents } from '../../data/supplierOps';
import { SUPPLIER_ROLES, SUPPLIER_ROLE_ORDER } from '../../utils/supplierRbac';
import { SupplierRoleId, SupplierStaff } from '../../types/supplier';

/* ------------------------------------------------------------------ */
/* Team & roles                                                        */
/* ------------------------------------------------------------------ */

export function SupplierTeam() {
  const s = useSupplier();
  const [staff, setStaff] = useState<SupplierStaff[]>(supplierStaff);
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState(s.branches[0].id);
  const [roles, setRoles] = useState<SupplierRoleId[]>(['sales']);

  if (!s.can('team.manage')) return <Denied module="Team & roles" />;

  const rows = staff.filter((st) =>
  [st.name, st.email, ...st.roles.map((r) => SUPPLIER_ROLES[r].label)].
  join(' ').
  toLowerCase().
  includes(query.trim().toLowerCase())
  );

  const toggleRole = (r: SupplierRoleId) =>
  setRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  return (
    <div>
      <PageHeader
        title="Team & roles"
        subtitle="Staff, role assignment, yard scope and invitations"
        action={
        <Button size="sm" onClick={() => setInviting(true)} icon={<PlusIcon className="h-3.5 w-3.5" />}>
            Invite someone
          </Button>
        } />
      

      <LedgerStrip
        items={[
        { label: 'Active staff', value: String(staff.filter((st) => st.status === 'Active').length) },
        { label: 'Invited', value: String(staff.filter((st) => st.status === 'Invited').length), tone: 'brand' },
        { label: 'Yards', value: String(s.branches.length) },
        {
          label: 'Multi-role users',
          value: String(staff.filter((st) => st.roles.length > 1).length),
          note: 'One person, several jobs'
        }]
        } />
      

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search staff by name, email or role" />

      <RecordTable
        caption="Yard staff"
        columns={[
        { key: 'person', label: 'Person' },
        { key: 'roles', label: 'Roles' },
        { key: 'branch', label: 'Yard', hideBelow: 'md' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
        {rows.map((st) =>
        <Row key={st.id} spine={st.status === 'Invited' ? 'caution' : undefined}>
            <Cell strong>
              {st.name}
              <span className="mt-0.5 block text-[11.5px] font-medium text-ink-400">{st.email}</span>
            </Cell>
            <Cell>
              <span className="flex flex-wrap gap-1.5">
                {st.roles.map((r) =>
              <span
                key={r}
                className="rounded-[2px] border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-600">
                
                    {SUPPLIER_ROLES[r].short}
                  </span>
              )}
              </span>
            </Cell>
            <Cell muted hideBelow="md">
              {branchName(st.branchId)}
            </Cell>
            <Cell align="right">
              <StatusBadge status={st.status === 'Invited' ? 'Pending' : st.status} />
            </Cell>
          </Row>
        )}
      </RecordTable>

      {/* Permission matrix */}
      <WorkHeading
        className="mt-6"
        label="RBAC"
        title="What each role can reach"
        count={`${SUPPLIER_ROLE_ORDER.length} roles`} />
      
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/70">
                <th scope="col" className="spec-label px-4 py-2.5">
                  Module
                </th>
                {SUPPLIER_ROLE_ORDER.map((r) =>
                <th key={r} scope="col" className="spec-label px-2 py-2.5 text-center">
                    {SUPPLIER_ROLES[r].short}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {SUPPLIER_MODULES.filter((m) => m.permission).map((m) =>
              <tr key={m.id}>
                  <td className="px-4 py-2.5 text-[12.5px] font-medium text-ink-800">{m.label}</td>
                  {SUPPLIER_ROLE_ORDER.map((r) => {
                  const allowed = SUPPLIER_ROLES[r].permissions.includes(m.permission!);
                  return (
                    <td key={r} className="px-2 py-2.5 text-center">
                        {allowed ?
                      <CheckIcon className="mx-auto h-4 w-4 text-positive-600" strokeWidth={3} /> :

                      <XIcon className="mx-auto h-3.5 w-3.5 text-ink-200" strokeWidth={3} />
                      }
                      </td>);

                })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <ScopeNote>
        A user can hold several roles at once — the yard shell shows the union of their permissions,
        with a role switch for focus rather than a separate application per job.
      </ScopeNote>

      <Drawer
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite someone to the yard"
        description="They pick their own password when they accept"
        footer={
        <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            disabled={!name.trim() || !email.includes('@') || roles.length === 0}
            onClick={() => {
              const id = `ss-${staff.length + 1}`;
              setStaff((prev) => [
              ...prev,
              { id, name, email, roles, branchId: branch, status: 'Invited' }]
              );
              s.toast({
                tone: 'success',
                title: `Invitation sent to ${name}`,
                body: `${roles.map((r) => SUPPLIER_ROLES[r].short).join(', ')} at ${branchName(branch)}.`
              });
              setInviting(false);
              setName('');
              setEmail('');
              setRoles(['sales']);
            }}>
            
              Send invitation
            </Button>
          </div>
        }>
        
        <div className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@abclumber.com" />
          
          <Select label="Yard" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {s.branches.map((b) =>
            <option key={b.id} value={b.id}>
                {b.name} · {b.city}
              </option>
            )}
          </Select>

          <div>
            <SpecLabel>Roles</SpecLabel>
            <p className="mt-1 text-[11.5px] text-ink-400">
              Pick every job they do. Permissions are the union of their roles.
            </p>
            <ul className="mt-2 space-y-1.5">
              {SUPPLIER_ROLE_ORDER.map((r) => {
                const on = roles.includes(r);
                return (
                  <li key={r}>
                    <button
                      onClick={() => toggleRole(r)}
                      aria-pressed={on}
                      className={`flex w-full items-start gap-3 rounded-[3px] border px-3 py-2.5 text-left transition-colors duration-150 ease-smooth ${
                      on ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 bg-white hover:border-ink-300'}`
                      }>
                      
                      <span
                        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border ${
                        on ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300 bg-white'}`
                        }>
                        
                        {on && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-ink-900">
                          {SUPPLIER_ROLES[r].label}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">
                          {SUPPLIER_ROLES[r].focus}
                        </span>
                      </span>
                    </button>
                  </li>);

              })}
            </ul>
          </div>
        </div>
      </Drawer>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Integrations                                                        */
/* ------------------------------------------------------------------ */

export function SupplierIntegrations() {
  const s = useSupplier();
  const [events, setEvents] = useState(syncEvents);

  if (!s.can('integrations.manage')) return <Denied module="Integrations" />;

  const failing = events.filter((e) => e.status === 'Failed' || e.status === 'Retrying' || e.status === 'Conflict');

  return (
    <div>
      <PageHeader title="Integrations" subtitle="ECI Spruce adapter, sync health and conflict handling" />

      {/* Adapter architecture — SM PRO is not dependent on the ERP */}
      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="Connection" title="ECI Spruce" reference="Connected · adapter v2.4" />
        <div className="grid divide-y divide-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
          { label: 'SM PRO', note: 'Yard platform of record for takeoffs and quotes' },
          { label: 'Integration layer', note: 'Queues, retries and conflict resolution' },
          { label: 'Spruce ERP', note: 'Products, inventory, invoices and payments' }].
          map((n, i) =>
          <div key={n.label} className="px-4 py-3.5">
              <SpecLabel>Layer {i + 1}</SpecLabel>
              <p className="mt-1 text-[14px] font-semibold text-ink-900">{n.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-400">{n.note}</p>
            </div>
          )}
        </div>
        <TickRule />
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-[12px] leading-relaxed text-ink-500">
            The yard keeps working if Spruce is unavailable — records queue in the adapter and sync when
            it returns.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
            s.toast({ tone: 'info', title: 'Sync queued', body: 'A full reconcile has been queued.' })
            }
            icon={<RefreshCwIcon className="h-3.5 w-3.5" />}>
            
            Sync now
          </Button>
        </div>
      </Panel>

      <LedgerStrip
        items={[
        { label: 'Entities mapped', value: '6', note: 'Products, stock, customers, orders, invoices, payments' },
        { label: 'Last full sync', value: '12 min ago', tone: 'positive' },
        {
          label: 'Needs attention',
          value: String(failing.length),
          tone: failing.length ? 'danger' : 'default'
        },
        { label: 'Records today', value: '3,698' }]
        } />
      

      <WorkHeading label="Sync log" title="Recent sync activity" count={`${events.length}`} />
      <Panel className="overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {events.map((e) =>
          <li
            key={e.id}
            className={`px-4 py-3.5 ${
            e.status === 'Conflict' || e.status === 'Failed' ? 'bg-danger-50/30' : ''}`
            }>
            
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">
                    {e.entity} · {e.direction.toLowerCase()}
                  </p>
                  <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                    {e.records} record{e.records === 1 ? '' : 's'} · {e.at}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge
                  tone={
                  e.status === 'Synced' ?
                  'positive' :
                  e.status === 'Syncing' ?
                  'info' :
                  e.status === 'Retrying' ?
                  'caution' :
                  'danger'
                  }
                  dot>
                  
                    {e.status}
                  </Badge>
                  {e.status === 'Conflict' &&
                <div className="flex gap-1.5">
                      <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEvents((prev) =>
                      prev.map((x) => x.id === e.id ? { ...x, status: 'Synced', detail: undefined } : x)
                      );
                      s.toast({ tone: 'success', title: 'SM PRO record kept', body: `${e.entity} pushed to Spruce.` });
                    }}>
                    
                        Keep SM PRO
                      </Button>
                      <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEvents((prev) =>
                      prev.map((x) => x.id === e.id ? { ...x, status: 'Synced', detail: undefined } : x)
                      );
                      s.toast({ tone: 'info', title: 'Spruce record kept', body: `${e.entity} pulled into SM PRO.` });
                    }}>
                    
                        Keep Spruce
                      </Button>
                    </div>
                }
                  {e.status === 'Retrying' &&
                <ClockIcon className="h-4 w-4 text-caution-600" />
                }
                </div>
              </div>
              {e.detail &&
            <p className="mt-2 flex items-start gap-2 border-l-2 border-danger-400 pl-2.5 text-[12px] leading-relaxed text-ink-600">
                  <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-600" />
                  {e.detail}
                </p>
            }
            </li>
          )}
        </ul>
      </Panel>

      <ScopeNote>
        Only the entities listed above cross the boundary. Builder takeoffs, PODs and messages stay in
        SM PRO.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export function SupplierAuditLog() {
  const s = useSupplier();
  const [query, setQuery] = useState('');

  if (!s.can('audit.view')) return <Denied module="Audit log" />;

  const rows = supplierAudit.filter((a) =>
  [a.actor, a.action, a.record, a.customer ?? '', a.branch].
  join(' ').
  toLowerCase().
  includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Audit log"
        subtitle="Who changed what, when, and what the value was before and after" />
      

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search the audit log by person, record or builder" />

      {rows.length === 0 ?
      <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <ScrollTextIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">Nothing matches</h2>
          <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-ink-500">
            Try a person, a record number or a builder name.
          </p>
        </Panel> :

      <Panel className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {rows.map((a) =>
          <li key={a.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {a.actor} · {a.action}
                    </p>
                    <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                      {a.record} · {a.branch}
                      {a.customer && ` · ${a.customer}`}
                    </p>
                  </div>
                  <span className="measure shrink-0 text-[10.5px] text-ink-400">{a.at}</span>
                </div>

                {(a.before || a.after) &&
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <span className="measure rounded-[2px] border border-ink-200 bg-ink-50 px-2 py-1 text-[11px] text-ink-500 line-through">
                      {a.before}
                    </span>
                    <span className="text-ink-300">→</span>
                    <span className="measure rounded-[2px] border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                      {a.after}
                    </span>
                  </div>
            }
              </li>
          )}
          </ul>
        </Panel>
      }

      <ScopeNote>
        Audit entries are immutable. Price changes, quantity adjustments, role grants and load
        reassignments are all recorded here.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const GROUPS = [
{ value: 'organization', label: 'Organization' },
{ value: 'commerce', label: 'Commerce' },
{ value: 'operations', label: 'Operations' },
{ value: 'security', label: 'Security' }];


export function SupplierSettings() {
  const s = useSupplier();
  const navigate = useNavigate();
  const [group, setGroup] = useState('organization');
  const [alerts, setAlerts] = useState({ rfq: true, delivery: true, payment: true, service: false });

  return (
    <div className="detail-column">
      <PageHeader title="Settings" subtitle="Organization, commerce, operations and security" />

      <Panel className="mb-5 overflow-hidden">
        <Tabs value={group} onChange={setGroup} tabs={GROUPS} />

        {group === 'organization' &&
        <div>
            <dl className="divide-y divide-ink-100 px-4 py-1">
              <SpecRow label="Company" value={s.org.name} />
              <SpecRow label="Type" value={s.org.type} />
              <SpecRow label="Address" value={s.org.address} />
              <SpecRow label="Phone" value={s.org.phone} mono />
              <SpecRow label="Website" value={s.org.website} />
              <SpecRow label="Business hours" value={s.org.hours} />
            </dl>
            <TitleBlock label="Yards" reference={`${s.branches.length} locations`} />
            <ul className="divide-y divide-ink-100">
              {s.branches.map((b) =>
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">{b.name}</p>
                    <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                      {b.city} · {b.yard}
                    </p>
                  </div>
                  {b.id === s.branchId &&
              <Badge tone="brand" dot={false}>
                      Current scope
                    </Badge>
              }
                </li>
            )}
            </ul>
          </div>
        }

        {group === 'commerce' &&
        <div>
            <dl className="divide-y divide-ink-100 px-4 py-1">
              <SpecRow label="Default terms" value="Net 30" />
              <SpecRow label="Tax rate" value="8.25%" mono />
              <SpecRow label="Default delivery fee" value="$380 per load" mono />
              <SpecRow label="Quote validity" value="14 days" />
              <SpecRow label="Quote approval threshold" value="Manager approval above $50,000" />
            </dl>
            <TickRule />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/products')}>
                Manage products
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/pricing')}>
                Contract pricing
              </Button>
            </div>
          </div>
        }

        {group === 'operations' &&
        <div>
            <dl className="divide-y divide-ink-100 px-4 py-1">
              <SpecRow label="Delivery windows" value="2-hour windows, 07:00 – 17:00" />
              <SpecRow label="Trucks" value="4 active · flatbed, boom, Moffett" />
              <SpecRow label="Drivers" value="4 on the roster" />
              <SpecRow label="POD requirements" value="Signature required · photos recommended" />
              <SpecRow label="Partial deliveries" value="Allowed with builder notification" />
            </dl>
            <TickRule />
            <div className="px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/deliveries')}>
                Open the dispatch board
              </Button>
            </div>
          </div>
        }

        {group === 'security' &&
        <div>
            <dl className="divide-y divide-ink-100 px-4 py-1">
              <SpecRow
              label="Two-factor"
              value={
              <span className="inline-flex items-center gap-1.5">
                    <ShieldIcon className="h-3.5 w-3.5 text-positive-600" />
                    Required for all staff
                  </span>
              } />
            
              <SpecRow label="Session length" value="12 hours" />
              <SpecRow label="Password policy" value="12 characters minimum" />
              <SpecRow label="Data residency" value="US · Austin region" />
            </dl>
            <TickRule />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/audit')}>
                View audit log
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/supplier/team')}>
                Manage roles
              </Button>
            </div>
          </div>
        }
      </Panel>

      {/* Notification preferences */}
      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="Notifications" title="What reaches you" />
        <ul className="divide-y divide-ink-100">
          {[
          { key: 'rfq' as const, label: 'New RFQs and takeoff reviews', note: 'Sales and estimating' },
          { key: 'delivery' as const, label: 'Load changes and delays', note: 'Dispatch and drivers' },
          { key: 'payment' as const, label: 'Payments and failures', note: 'Accounting' },
          { key: 'service' as const, label: 'Every service case', note: 'Customer service' }].
          map((row) =>
          <li key={row.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-800">{row.label}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-400">{row.note}</p>
              </div>
              <button
              role="switch"
              aria-checked={alerts[row.key]}
              aria-label={row.label}
              onClick={() => setAlerts((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-smooth ${
              alerts[row.key] ? 'bg-brand-500' : 'bg-ink-200'}`
              }>
              
                <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-150 ease-smooth ${
                alerts[row.key] ? 'left-[22px]' : 'left-0.5'}`
                } />
              
              </button>
            </li>
          )}
        </ul>
      </Panel>

      <Panel className="overflow-hidden">
        <TitleBlock label="Session" title={s.user.name} reference={s.user.email} />
        <dl className="divide-y divide-ink-100 px-4 py-1">
          <SpecRow label="Roles held" value={s.userRoles.map((r) => SUPPLIER_ROLES[r].short).join(', ')} />
          <SpecRow label="Acting as" value={SUPPLIER_ROLES[s.activeRole].label} />
          <SpecRow label="Yard scope" value={branchName(s.branchId)} />
        </dl>
        <TickRule />
        <div className="flex flex-wrap gap-2 px-4 py-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              s.signOut();
              navigate('/supplier/auth');
            }}>
            
            Sign out
          </Button>
        </div>
      </Panel>
    </div>);

}
