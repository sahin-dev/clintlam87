import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, SpecLabel, Measured, WorkHeading } from '../../components/smpro/Primitives';
import { PanelSection, UsageMeter } from '../../components/admin/Records';
import { Column, RecordTable, Row, Cell } from '../../components/supplier/Records';
import { Badge } from '../../components/ui/Badge';
import { useAdmin } from '../../contexts/AdminContext';
import { PLAN_BY_ID } from '../../data/platform';

type Scope = 'All organizations' | 'Suppliers' | 'Builders';
type Region = 'All regions' | string;

const COLUMNS: Column[] = [
{ key: 'org', label: 'Organization' },
{ key: 'type', label: 'Type', hideBelow: 'sm' },
{ key: 'region', label: 'Region', hideBelow: 'lg' },
{ key: 'projects', label: 'Projects', align: 'right' },
{ key: 'users', label: 'Users', align: 'right', hideBelow: 'sm' },
{ key: 'sheets', label: 'AI sheets', align: 'right' },
{ key: 'storage', label: 'Storage', align: 'right', hideBelow: 'md' },
{ key: 'status', label: 'Status', align: 'right' }];


/**
 * Platform overview. Every metric here is a doorway: pick a figure, filter it,
 * then open the organization behind it.
 */
export function PlatformOverview() {
  const navigate = useNavigate();
  const { organizations } = useAdmin();
  const [scope, setScope] = useState<Scope>('All organizations');
  const [region, setRegion] = useState<Region>('All regions');

  const regions = ['All regions', ...Array.from(new Set(organizations.map((o) => o.region)))];

  const rows = organizations.filter((o) => {
    if (scope === 'Suppliers' && o.kind !== 'supplier') return false;
    if (scope === 'Builders' && o.kind !== 'builder') return false;
    if (region !== 'All regions' && o.region !== region) return false;
    return true;
  });

  const total = (fn: (o: (typeof rows)[number]) => number) => rows.reduce((s, o) => s + fn(o), 0);

  const aiCeiling = organizations.
  filter((o) => o.planId).
  reduce((s, o) => s + PLAN_BY_ID[o.planId!].limits.aiSheets, 0);
  const licensedBuilders = organizations.
  filter((o) => o.kind === 'supplier' && o.planId).
  reduce((s, o) => s + PLAN_BY_ID[o.planId!].limits.builderCompanies, 0);
  const usedBuilders = organizations.
  filter((o) => o.kind === 'supplier').
  reduce((s, o) => s + o.usage.builderCompanies, 0);

  return (
    <div className="pt-7">
      <div className="mb-5">
        <SpecLabel>Platform overview</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
          Volumes across every tenant
        </h1>
        <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-500">
          Aggregate figures only. Opening an organization shows what that tenant is doing; it never exposes
          one tenant&apos;s commercial data to another.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(['All organizations', 'Suppliers', 'Builders'] as Scope[]).map((s) =>
        <button
          key={s}
          onClick={() => setScope(s)}
          aria-pressed={scope === s}
          className={`rounded-[3px] border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-smooth ${
          scope === s ?
          'border-brand-500 bg-brand-50 text-brand-700' :
          'border-ink-200 bg-white text-ink-500 hover:border-ink-300 hover:text-ink-800'}`
          }>
          
            {s}
          </button>
        )}
        <span className="ml-2 h-5 w-px bg-ink-200" aria-hidden />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Region"
          className="h-9 rounded-[3px] border border-ink-200 bg-white px-2.5 text-[12px] font-medium text-ink-700 focus:border-brand-500 focus:outline-none">
          
          {regions.map((r) =>
          <option key={r}>{r}</option>
          )}
        </select>
        <span className="measure ml-auto text-[11px] text-ink-400">
          {rows.length} ORGANIZATIONS IN SCOPE
        </span>
      </div>

      <Panel className="mb-5 overflow-hidden">
        <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
          {[
          { label: 'Organizations', value: String(rows.length) },
          { label: 'Branches', value: String(total((o) => o.branches.length)) },
          { label: 'Users', value: total((o) => o.usage.users).toLocaleString() },
          { label: 'Projects', value: total((o) => o.projects).toLocaleString() },
          { label: 'AI sheets', value: total((o) => o.usage.aiSheets).toLocaleString() },
          { label: 'Storage', value: `${total((o) => o.usage.storage).toLocaleString()}`, unit: 'GB' }].
          map((m) =>
          <div key={m.label} className="min-w-[160px] flex-1 px-4 py-3.5">
              <Measured label={m.label} value={m.value} unit={'unit' in m ? m.unit as string : undefined} />
            </div>
          )}
        </div>
      </Panel>

      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <PanelSection label="Licensing headroom" title="Builder companies">
          <div className="px-4 py-4">
            <UsageMeter label="Licensed across all suppliers" used={usedBuilders} limit={licensedBuilders} />
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">
              Supplier licensing is priced on how many builder companies a yard trades with — this is the
              figure that drives renewals.
            </p>
          </div>
        </PanelSection>
        <PanelSection label="AI allowance" title="Sheets this month">
          <div className="px-4 py-4">
            <UsageMeter
              label="Consumed against granted allowance"
              used={organizations.reduce((s, o) => s + o.usage.aiSheets, 0)}
              limit={aiCeiling} />
            
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">
              Failed runs held in the queue are not charged against a tenant&apos;s allowance.
            </p>
          </div>
        </PanelSection>
        <PanelSection label="Drill in" title="From figure to record">
          <ul className="divide-y divide-ink-100">
            {[
            { label: 'AI runs and failures', to: '/admin/ai/jobs' },
            { label: 'Subscriptions against usage', to: '/admin/subscriptions' },
            { label: 'Integration sync state', to: '/admin/integrations' },
            { label: 'Background job queue', to: '/admin/queue' }].
            map((l) =>
            <li key={l.to}>
                <button
                onClick={() => navigate(l.to)}
                className="w-full px-4 py-2.5 text-left text-[12.5px] font-medium text-ink-700 transition-colors duration-150 ease-smooth hover:bg-brand-50/40 hover:text-brand-700">
                
                  {l.label}
                </button>
              </li>
            )}
          </ul>
        </PanelSection>
      </div>

      <WorkHeading label="Detail" title="Organizations in scope" count={`${rows.length}`} />
      <RecordTable columns={COLUMNS} caption="Platform organizations">
        {rows.map((o) =>
        <Row key={o.id} onClick={() => navigate(`/admin/org/${o.id}`)}>
            <Cell strong>{o.name}</Cell>
            <Cell hideBelow="sm" muted>
              {o.kind === 'supplier' ? 'Supplier' : 'Builder'}
            </Cell>
            <Cell hideBelow="lg" muted>
              {o.region}
            </Cell>
            <Cell align="right" mono>
              {o.projects}
            </Cell>
            <Cell align="right" mono hideBelow="sm">
              {o.usage.users}
            </Cell>
            <Cell align="right" mono>
              {o.usage.aiSheets.toLocaleString()}
            </Cell>
            <Cell align="right" mono hideBelow="md">
              {o.usage.storage} GB
            </Cell>
            <Cell align="right">
              <Badge
              tone={
              o.status === 'Active' ?
              'positive' :
              o.status === 'Trial' ?
              'info' :
              o.status === 'Pending' ?
              'neutral' :
              o.status === 'Restricted' ?
              'caution' :
              'danger'
              }>
              
                {o.status}
              </Badge>
            </Cell>
          </Row>
        )}
      </RecordTable>
    </div>);

}