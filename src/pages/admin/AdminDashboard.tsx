import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, SpecLabel, Measured, TickRule, WorkHeading } from '../../components/smpro/Primitives';
import { AttentionRow, PanelSection, StateDot } from '../../components/admin/Records';
import { Badge } from '../../components/ui/Badge';
import { useAdmin } from '../../contexts/AdminContext';
import { PLATFORM_ACTIVITY, SERVICES } from '../../data/platformOps';
import { orgName } from '../../data/platform';

/**
 * The control centre. Not a revenue wall — it answers "what is happening
 * across SM PRO, and what needs the platform team today?"
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const {
    suppliers,
    builders,
    organizations,
    aiJobs,
    incidents,
    cases,
    syncErrors,
    admin
  } = useAdmin();

  const activeUsers = organizations.reduce((s, o) => s + o.usage.users, 0);
  const activeBranches = organizations.reduce(
    (s, o) => s + o.branches.filter((b) => b.status === 'Active').length,
    0
  );
  const projects = organizations.reduce((s, o) => s + o.projects, 0);
  const aiSheets = organizations.reduce((s, o) => s + o.usage.aiSheets, 0);
  const storage = organizations.reduce((s, o) => s + o.usage.storage, 0);
  const running = aiJobs.filter((j) => ['Processing', 'Queued', 'Retrying'].includes(j.status)).length;

  const failedJobs = aiJobs.filter((j) => j.status === 'Failed');
  const openSync = syncErrors.filter((e) => e.status !== 'Resolved');
  const suspended = organizations.filter((o) => ['Suspended', 'Restricted'].includes(o.status));
  const escalated = cases.filter((c) => c.status === 'Escalated');
  const liveIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const degraded = SERVICES.filter((s) => s.state !== 'Operational');

  return (
    <div className="pt-7">
      <div className="mb-6">
        <SpecLabel>Platform control centre</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[26px] font-bold leading-tight text-ink-900">
          Good morning, {admin.name.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500">
          {suppliers.length} supplier organizations and {builders.length} builder organizations across the
          platform. {degraded.length ? `${degraded.length} services are degraded.` : 'All services nominal.'}
        </p>
      </div>

      {/* Platform ledger — volumes, not vanity. */}
      <Panel className="mb-5 overflow-hidden">
        <div className="no-scrollbar flex divide-x divide-ink-100 overflow-x-auto">
          {[
          { label: 'Supplier orgs', value: String(suppliers.length), note: `${suppliers.filter((s) => s.status === 'Active').length} active` },
          { label: 'Builder orgs', value: String(builders.length), note: `${builders.filter((b) => b.status === 'Active').length} active` },
          { label: 'Active users', value: activeUsers.toLocaleString() },
          { label: 'Active branches', value: String(activeBranches) },
          { label: 'Projects', value: String(projects) },
          { label: 'AI runs live', value: String(running), tone: 'brand' as const },
          { label: 'Sheets this month', value: aiSheets.toLocaleString() },
          { label: 'Storage', value: `${(storage / 1000).toFixed(1)}`, unit: 'TB' }].
          map((m) =>
          <div key={m.label} className="min-w-[150px] flex-1 px-4 py-3.5">
              <Measured
              label={m.label}
              value={m.value}
              unit={'unit' in m ? m.unit as string : undefined}
              note={'note' in m ? m.note as string : undefined}
              tone={'tone' in m ? m.tone : 'default'} />
            
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <PanelSection
            label="Needs the platform team"
            title="Attention required"
            reference={`${failedJobs.length + openSync.length + suspended.length + escalated.length + liveIncidents.length} ITEMS`}>
            
            <ul>
              {liveIncidents.map((i) =>
              <AttentionRow
                key={i.id}
                severity={i.severity}
                title={i.title}
                org={`${i.service} · ${i.affectedOrgs.length} organizations affected`}
                facts={[
                { label: 'Incident', value: i.id },
                { label: 'Status', value: i.status },
                { label: 'Started', value: i.started }]
                }
                action="Open incident"
                onAction={() => navigate(`/admin/incidents/${i.id}`)} />

              )}
              {failedJobs.map((j) =>
              <AttentionRow
                key={j.id}
                severity="High"
                title={`AI run failed — ${j.project}`}
                org={orgName(j.orgId)}
                facts={[
                { label: 'Takeoff', value: j.takeoffRef },
                { label: 'Progress', value: `${j.sheetsDone}/${j.sheets} sheets` },
                { label: 'Started', value: j.started }]
                }
                action="Inspect run"
                onAction={() => navigate('/admin/ai/jobs')} />

              )}
              {openSync.length > 0 &&
              <AttentionRow
                severity="High"
                title={`${openSync.length} ERP sync errors awaiting action`}
                org={orgName(openSync[0].orgId)}
                facts={[
                { label: 'Adapter', value: openSync[0].adapter },
                { label: 'Entities', value: openSync.map((e) => e.entity).join(', ') },
                { label: 'Retries', value: String(openSync.reduce((s, e) => s + e.retries, 0)) }]
                }
                action="Open integrations"
                onAction={() => navigate('/admin/integrations')} />

              }
              {escalated.map((c) =>
              <AttentionRow
                key={c.id}
                severity={c.priority}
                title={c.subject}
                org={orgName(c.orgId)}
                facts={[
                { label: 'Case', value: c.id },
                { label: 'Owner', value: c.assignee },
                { label: 'Opened', value: c.created }]
                }
                action="Open case"
                onAction={() => navigate(`/admin/support/${c.id}`)} />

              )}
              {suspended.map((o) =>
              <AttentionRow
                key={o.id}
                severity={o.status === 'Suspended' ? 'High' : 'Medium'}
                title={`${o.name} is ${o.status.toLowerCase()}`}
                org={`${o.kind === 'supplier' ? 'Supplier' : 'Builder'} · ${o.region}`}
                facts={[
                { label: 'Reason', value: o.statusReason?.reason ?? '—' },
                { label: 'Since', value: o.statusReason?.at ?? o.lastActive },
                { label: 'Users', value: String(o.usage.users) }]
                }
                action="Review organization"
                onAction={() => navigate(`/admin/org/${o.id}`)} />

              )}
            </ul>
          </PanelSection>

          <div className="mt-5">
            <WorkHeading label="Live" title="AI processing" count={`${running} running`} />
            <PanelSection label="Run monitor" reference="AUTO-REFRESHING">
              <ul className="divide-y divide-ink-100">
                {aiJobs.
                filter((j) => ['Processing', 'Queued', 'Retrying'].includes(j.status)).
                map((j) =>
                <li key={j.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
                      <div className="min-w-[200px] flex-1">
                        <p className="text-[13px] font-semibold text-ink-900">{j.project}</p>
                        <p className="measure mt-0.5 text-[11px] text-ink-400">
                          {j.takeoffRef} · {orgName(j.orgId)}
                        </p>
                      </div>
                      <div className="w-[160px]">
                        <div className="h-1.5 w-full overflow-hidden rounded-[1px] bg-ink-100">
                          <div
                        className="h-full bg-brand-500"
                        style={{ width: `${Math.round(j.sheetsDone / j.sheets * 100)}%` }} />
                      
                        </div>
                        <p className="measure mt-1 text-[10.5px] text-ink-400">
                          {j.sheetsDone}/{j.sheets} SHEETS
                        </p>
                      </div>
                      <Badge tone={j.status === 'Retrying' ? 'caution' : j.status === 'Queued' ? 'neutral' : 'violet'}>
                        {j.status}
                      </Badge>
                    </li>
                )}
              </ul>
            </PanelSection>
          </div>
        </div>

        {/* Context rail */}
        <div className="min-w-0 space-y-5">
          <PanelSection label="Service state" title="Platform health" action={
          <button onClick={() => navigate('/admin/health')} className="text-[12px] font-semibold text-brand-600">
              Detail
            </button>
          }>
            <ul className="divide-y divide-ink-100">
              {SERVICES.map((s) =>
              <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <StateDot state={s.state} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-800">{s.name}</span>
                  <span className="measure text-[11px] text-ink-400">
                    {s.responseMs ? `${s.responseMs}ms` : '—'}
                  </span>
                </li>
              )}
            </ul>
          </PanelSection>

          <PanelSection label="Across every tenant" title="Platform activity">
            <ol className="divide-y divide-ink-100">
              {PLATFORM_ACTIVITY.map((a) =>
              <li key={a.at + a.label} className="flex gap-3 px-4 py-2.5">
                  <span className="measure w-[68px] shrink-0 text-[11px] text-ink-400">{a.at}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-ink-700">{a.label}</span>
                    {a.org &&
                  <span className="measure mt-0.5 block text-[10.5px] text-ink-400">
                        {orgName(a.org).toUpperCase()}
                      </span>
                  }
                  </span>
                </li>
              )}
            </ol>
            <TickRule />
            <button
              onClick={() => navigate('/admin/audit')}
              className="block w-full px-4 py-2.5 text-left text-[12px] font-semibold text-brand-600">
              
              Open the full audit log
            </button>
          </PanelSection>
        </div>
      </div>
    </div>);

}