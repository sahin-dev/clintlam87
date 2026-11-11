import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchXIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchField, SegmentedControl } from '../components/ui/Field';
import { EmptyState, SkeletonRows } from '../components/ui/Feedback';
import { useApp } from '../contexts/AppContext';
import { currency } from '../utils/format';
import { supplierName, suppliers } from '../data/procurement';
import { team } from '../data/organization';
import { projectName } from '../data/projects';

type Scope = 'all' | 'projects' | 'materials' | 'procurement' | 'finance' | 'people';

interface Hit {
  id: string;
  type: string;
  title: string;
  meta: string;
  to: string;
  scope: Scope;
}

export function Search() {
  const navigate = useNavigate();
  const app = useApp();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [loading, setLoading] = useState(false);

  const hits = useMemo<Hit[]>(() => {
    const out: Hit[] = [];
    app.projects.forEach((p) =>
    out.push({ id: p.id, type: 'Project', title: p.name, meta: `${p.number} · ${p.address}`, to: `/projects/${p.id}`, scope: 'projects' })
    );
    app.planSets.forEach((p) =>
    out.push({ id: p.id, type: 'Plan set', title: `${p.name} · V${p.version}`, meta: `${projectName(p.projectId)} · ${p.uploadedAt}`, to: `/documents/${p.id}`, scope: 'projects' })
    );
    app.takeoffs.forEach((t) =>
    out.push({ id: t.id, type: 'AI takeoff', title: `${t.id} · ${t.items.length} lines`, meta: `${projectName(t.projectId)} · ${t.status}`, to: `/takeoff/${t.id}`, scope: 'materials' })
    );
    app.takeoffs.forEach((t) =>
    t.items.forEach((i) =>
    out.push({ id: `${t.id}-${i.id}`, type: 'Material', title: i.item, meta: `${t.id} · sheet ${i.sheet} · ${i.correctedQuantity ?? i.aiQuantity} ${i.unit}`, to: `/takeoff/${t.id}`, scope: 'materials' })
    )
    );
    app.requests.forEach((r) =>
    out.push({ id: r.id, type: 'Material request', title: `${r.id} · ${r.status}`, meta: `${projectName(r.projectId)} · needed ${r.requiredBy}`, to: `/procurement/requests/${r.id}`, scope: 'procurement' })
    );
    app.quotes.forEach((q) =>
    out.push({ id: q.id, type: 'Quote', title: `${q.id} · ${supplierName(q.supplierId)}`, meta: `${currency(q.total)} · ${q.status}`, to: `/procurement/requests/${q.requestId}/compare`, scope: 'procurement' })
    );
    app.orders.forEach((o) =>
    out.push({ id: o.id, type: 'Purchase order', title: `${o.id} · ${supplierName(o.supplierId)}`, meta: `${currency(o.total)} · ${o.status}`, to: `/orders/${o.id}`, scope: 'procurement' })
    );
    if (app.can('invoice.view'))
    app.invoices.forEach((i) =>
    out.push({ id: i.id, type: 'Invoice', title: `${i.id} · ${currency(i.amount)}`, meta: `${supplierName(i.supplierId)} · ${i.status}`, to: `/accounting/invoices/${i.id}`, scope: 'finance' })
    );
    suppliers.forEach((s) =>
    out.push({ id: s.id, type: 'Supplier', title: s.name, meta: `${s.category} · ${s.city}`, to: `/suppliers/${s.id}`, scope: 'people' })
    );
    team.forEach((m) =>
    out.push({ id: m.id, type: 'Team member', title: m.name, meta: m.email, to: '/team', scope: 'people' })
    );
    return out;
  }, [app]);

  const results = hits.
  filter((h) => scope === 'all' ? true : h.scope === scope).
  filter((h) => query.trim() ? `${h.title} ${h.meta} ${h.type}`.toLowerCase().includes(query.toLowerCase()) : false);

  return (
    <div>
      <PageHeader back={false} title="Search" subtitle="Projects, plans, materials, orders and people" />
      <div className="mb-5 space-y-3">
        <SearchField
          value={query}
          onChange={(v) => {
            setQuery(v);
            setLoading(true);
            window.setTimeout(() => setLoading(false), 320);
          }}
          placeholder="Search everything in ABC Construction" />
        
        <SegmentedControl
          value={scope}
          onChange={setScope}
          options={[
          { value: 'all', label: 'All' },
          { value: 'projects', label: 'Projects & plans' },
          { value: 'materials', label: 'Materials' },
          { value: 'procurement', label: 'Procurement' },
          { value: 'finance', label: 'Finance' },
          { value: 'people', label: 'People' }]
          } />
        
      </div>

      <div>
        {!query.trim() ?
        <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Try searching for</p>
            <div className="flex flex-wrap gap-2">
              {['Oakwood', '2×4', 'MR-1024', 'ABC Lumber', 'PO-1018', 'plywood'].map((s) =>
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink-600">
              
                  {s}
                </button>
            )}
            </div>
          </div> :
        loading ?
        <SkeletonRows rows={5} /> :
        results.length === 0 ?
        <EmptyState
          icon={<SearchXIcon className="h-5 w-5" />}
          title={`No results for "${query}"`}
          body="Check the spelling, try a project number, or widen the filter."
          action="Clear search"
          onAction={() => setQuery('')} /> :


        <>
            <p className="mb-2 text-[12px] text-ink-400">{results.length} results</p>
            <Card className="divide-y divide-ink-100">
              {results.slice(0, 40).map((h) =>
            <button
              key={`${h.type}-${h.id}`}
              onClick={() => navigate(h.to)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
              
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink-900">{h.title}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-400">{h.meta}</p>
                  </div>
                  <Badge tone="neutral" dot={false}>
                    {h.type}
                  </Badge>
                </button>
            )}
            </Card>
          </>
        }
      </div>
    </div>);

}