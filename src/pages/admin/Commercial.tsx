import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { Panel, SpecLabel, Measured, TickRule, WorkHeading } from '../../components/smpro/Primitives';
import { PanelSection, UsageMeter } from '../../components/admin/Records';
import { ListToolbar } from '../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAdmin } from '../../contexts/AdminContext';
import { FEATURES, PLAN_BY_ID } from '../../data/platform';

/** Plans. The licensing tiers themselves, and what each one grants. */
export function Plans() {
  const navigate = useNavigate();
  const { plans, suppliers } = useAdmin();

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Commercial</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          Subscription plans
        </h1>
        <p className="mt-1.5 max-w-[660px] text-[13.5px] leading-relaxed text-ink-500">
          Supplier licensing is priced on how many builder companies a yard trades with. Every other limit
          exists to keep the platform honest about capacity, not to gate the workflow.
        </p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {plans.map((p) => {
          const tenants = suppliers.filter((s) => s.planId === p.id);
          return (
            <Panel key={p.id} className="flex flex-col overflow-hidden">
              <div className="border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
                <SpecLabel>{p.support} support</SpecLabel>
                <p className="mt-0.5 text-[15px] font-semibold text-ink-900">{p.name}</p>
              </div>
              <div className="px-4 py-4">
                <p className="measure text-[24px] font-bold leading-none text-ink-900">
                  ${p.price.toLocaleString()}
                  <span className="ml-1 text-[11px] font-medium text-ink-400">/ MONTH</span>
                </p>
                <dl className="mt-4 space-y-2">
                  {[
                  ['Builder companies', p.limits.builderCompanies],
                  ['Branches', p.limits.branches],
                  ['Users', p.limits.users],
                  ['Storage', `${p.limits.storage} GB`],
                  ['AI sheets / month', p.limits.aiSheets.toLocaleString()]].
                  map(([k, v]) =>
                  <div key={String(k)} className="flex items-baseline justify-between gap-3">
                      <dt className="spec-label">{k}</dt>
                      <dd className="measure text-[12.5px] font-semibold text-ink-900">{v}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <TickRule />
              <div className="flex-1 px-4 py-3">
                <SpecLabel>Grants</SpecLabel>
                <ul className="mt-1.5 space-y-1">
                  {FEATURES.map((f) => {
                    const on = p.features.includes(f.id);
                    return (
                      <li key={f.id} className="flex items-center gap-2 text-[12px]">
                        {on ?
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-positive-600" strokeWidth={3} /> :

                        <MinusIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                        }
                        <span className={on ? 'text-ink-700' : 'text-ink-300'}>{f.label}</span>
                      </li>);

                  })}
                </ul>
              </div>
              <TickRule />
              <button
                onClick={() => navigate('/admin/subscriptions')}
                className="px-4 py-3 text-left text-[12px] font-semibold text-brand-600">
                
                {tenants.length} tenant{tenants.length === 1 ? '' : 's'} on this plan
              </button>
            </Panel>);

        })}
      </div>
    </div>);

}

/** Subscriptions. Usage against every licence, with the renewals that matter. */
export function Subscriptions() {
  const navigate = useNavigate();
  const { suppliers } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = suppliers.filter((o) => {
    if (filter === 'Near limit') {
      const plan = o.planId ? PLAN_BY_ID[o.planId] : undefined;
      if (!plan) return false;
      return o.usage.builderCompanies / plan.limits.builderCompanies >= 0.7;
    }
    if (filter !== 'All' && PLAN_BY_ID[o.planId ?? 'starter'].name !== filter) return false;
    return o.name.toLowerCase().includes(query.toLowerCase());
  });

  const mrr = suppliers.reduce((s, o) => s + (o.subscription?.mrr ?? 0), 0);

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Commercial</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          Active subscriptions
        </h1>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
          {[
          { label: 'Monthly recurring', value: `$${(mrr / 1000).toFixed(1)}k` },
          { label: 'Paying tenants', value: String(suppliers.filter((s) => (s.subscription?.mrr ?? 0) > 0).length) },
          { label: 'On trial', value: String(suppliers.filter((s) => s.status === 'Trial').length) },
          { label: 'Pending activation', value: String(suppliers.filter((s) => s.status === 'Pending').length) },
          { label: 'Suspended', value: String(suppliers.filter((s) => s.status === 'Suspended').length), tone: 'danger' as const }].
          map((m) =>
          <div key={m.label} className="min-w-[160px] flex-1 px-4 py-3.5">
              <Measured label={m.label} value={m.value} tone={m.tone ?? 'default'} />
            </div>
          )}
        </div>
      </Panel>

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search tenants"
        filters={['All', 'Near limit', 'Starter', 'Growth', 'Professional', 'Enterprise']}
        active={filter}
        onFilter={setFilter} />
      

      <div className="space-y-4">
        {rows.map((o) => {
          /* A supplier awaiting activation may not carry a plan yet. */
          const plan = o.planId ? PLAN_BY_ID[o.planId] : undefined;
          if (!plan) return null;
          return (
            <PanelSection
              key={o.id}
              label={`${plan.name} · $${plan.price.toLocaleString()}/mo`}
              title={o.name}
              reference={
              o.subscription ? `Renews ${o.subscription.renews}` : 'No subscription record'
              }
              action={
              <div className="flex items-center gap-2">
                  <Badge
                  tone={
                  o.status === 'Active' ?
                  'positive' :
                  o.status === 'Trial' ?
                  'info' :
                  o.status === 'Suspended' ?
                  'danger' :
                  'neutral'
                  }>
                  
                    {o.status}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/org/${o.id}`)}>
                    Manage
                  </Button>
                </div>
              }>
              
              <div className="grid gap-x-8 gap-y-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                <UsageMeter label="Builder companies" used={o.usage.builderCompanies} limit={plan.limits.builderCompanies} />
                <UsageMeter label="Branches" used={o.branches.length} limit={plan.limits.branches} />
                <UsageMeter label="Users" used={o.usage.users} limit={plan.limits.users} />
                <UsageMeter label="AI sheets" used={o.usage.aiSheets} limit={plan.limits.aiSheets} />
                <UsageMeter label="Storage" used={o.usage.storage} limit={plan.limits.storage} unit="GB" />
                <div className="min-w-0">
                  <SpecLabel>ERP</SpecLabel>
                  <p className="mt-1 text-[12.5px] font-medium text-ink-800">{o.erp}</p>
                  <p className="measure mt-1 text-[10.5px] text-ink-400">
                    {Object.keys(o.overrides).length ?
                    `${Object.keys(o.overrides).length} ENTITLEMENT OVERRIDES` :
                    'Follows the plan'}
                  </p>
                </div>
              </div>
            </PanelSection>);

        })}
      </div>
    </div>);

}

/** Entitlements. The feature × organization matrix, with overrides called out. */
export function Entitlements() {
  const navigate = useNavigate();
  const { organizations, entitled, flags } = useAdmin();
  const [kind, setKind] = useState<'Suppliers' | 'Builders'>('Suppliers');

  const rows = organizations.filter((o) => kind === 'Suppliers' ? o.kind === 'supplier' : o.kind === 'builder');

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Commercial</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          Feature entitlements
        </h1>
        <p className="mt-1.5 max-w-[680px] text-[13.5px] leading-relaxed text-ink-500">
          Resolution order is plan grant, then organization override. An override is a deliberate departure
          from what the tenant bought, so it is always visible and always recorded.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['Suppliers', 'Builders'] as const).map((k) =>
        <button
          key={k}
          onClick={() => setKind(k)}
          aria-pressed={kind === k}
          className={`rounded-[3px] border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-smooth ${
          kind === k ?
          'border-brand-500 bg-brand-50 text-brand-700' :
          'border-ink-200 bg-white text-ink-500 hover:border-ink-300'}`
          }>
          
            {k}
          </button>
        )}
        <span className="measure ml-auto text-[11px] text-ink-400">
          {rows.reduce((s, o) => s + Object.keys(o.overrides).length, 0)} ACTIVE OVERRIDES
        </span>
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <caption className="sr-only">Feature entitlements by organization</caption>
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/70">
                <th scope="col" className="spec-label sticky left-0 z-10 bg-ink-50 px-4 py-2.5">
                  Organization
                </th>
                {FEATURES.map((f) =>
                <th key={f.id} scope="col" className="spec-label px-2 py-2.5 text-center">
                    <span className="block max-w-[74px] leading-tight">{f.label}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((o) =>
              <tr key={o.id} className="align-middle">
                  {/* Stays legible above the horizontally scrolled feature columns. */}
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 shadow-[1px_0_0_0_#E6E8EC]">
                    <button
                    onClick={() => navigate(`/admin/org/${o.id}`)}
                    className="text-left text-[12.5px] font-semibold text-ink-900 hover:text-brand-600">
                    
                      {o.name}
                      <span className="measure mt-0.5 block text-[10.5px] font-normal text-ink-400">
                        {o.planId ? PLAN_BY_ID[o.planId].name : 'Via supplier licence'}
                      </span>
                    </button>
                  </td>
                  {FEATURES.map((f) => {
                  const on = entitled(o, f.id);
                  const override = f.id in o.overrides;
                  return (
                    <td key={f.id} className="px-2 py-3 text-center">
                        <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-[2px] ${
                        on ? 'bg-positive-50 text-positive-600' : 'bg-ink-50 text-ink-300'} ${
                        override ? 'ring-1 ring-caution-500' : ''}`}
                        title={
                        override ?
                        `Override: ${on ? 'enabled' : 'disabled'} for this organization` :
                        on ?
                        'Granted by plan' :
                        'Not granted'
                        }>
                        
                          {on ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : <MinusIcon className="h-3.5 w-3.5" />}
                        </span>
                      </td>);

                })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TickRule />
        <p className="px-4 py-3 text-[11.5px] leading-relaxed text-ink-400">
          An amber ring marks an override. Builders inherit AI Takeoff through the supplier they trade with —
          withdrawing it from a builder does not affect that supplier&apos;s other customers.
        </p>
      </Panel>

      <div className="mt-5">
        <WorkHeading label="Separate control" title="Rollout flags" />
        <Panel className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {flags.map((f) =>
            <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink-800">{f.label}</span>
                <Badge tone="neutral">{f.scope}</Badge>
                <Badge tone={f.enabled ? 'positive' : 'neutral'}>{f.enabled ? 'On' : 'Off'}</Badge>
              </li>
            )}
          </ul>
          <TickRule />
          <button
            onClick={() => navigate('/admin/flags')}
            className="block w-full px-4 py-2.5 text-left text-[12px] font-semibold text-brand-600">
            
            Manage feature flags
          </button>
        </Panel>
      </div>
    </div>);

}