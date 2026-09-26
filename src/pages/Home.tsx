import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanSearchIcon } from 'lucide-react';
import { Card, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/shell/PageHeader';
import { ProjectCard } from '../components/project/ProjectCard';
import { PipelineTrail, TrailStage } from '../components/common/PipelineTrail';
import { ActivityList } from '../components/common/ActivityList';
import { AttentionCard, Urgency } from '../components/smpro/AttentionCard';
import { AiStamp } from '../components/smpro/Confidence';
import { Measured, Panel, SpecLabel, TitleBlock, WorkHeading } from '../components/smpro/Primitives';
import { useApp } from '../contexts/AppContext';
import { ROLES } from '../utils/rbac';
import { currency, greeting } from '../utils/format';
import { activity } from '../data/engagement';
import { projectName } from '../data/projects';
import { supplierName } from '../data/procurement';
import { memberName } from '../data/organization';
import { IMAGES } from '../data/images';

const AI_IMAGE = IMAGES.aiAnalysis;

interface AttentionItem {
  id: string;
  urgency: Urgency;
  kind: string;
  title: string;
  project: string;
  facts: {label: string;value: string;tone?: 'default' | 'brand' | 'danger' | 'positive';}[];
  meta: string;
  cta: string;
  to: string;
}

export function Home() {
  const navigate = useNavigate();
  const app = useApp();
  const { user, activeRole, can, projects, approvals, deliveries, takeoffs, requests, invoices, quotes } = app;

  const visibleApprovals = approvals.filter((a) => a.status === 'pending' && can(a.requiredPermission));
  const activeProjects = projects.filter((p) => p.status !== 'Completed');
  const openRequests = requests.filter((r) => r.status !== 'Ordered');
  const pendingQuotes = quotes.filter((q) => q.status === 'Pending' || q.status === 'Received');
  const upcoming = deliveries.filter((d) => ['Scheduled', 'Out for Delivery', 'Delayed'].includes(d.status));
  const outstanding = invoices.
  filter((i) => i.status !== 'Paid').
  reduce((sum, i) => sum + (i.amount - i.paid), 0);

  /* Each entry carries the construction evidence behind it, so the decision can
     be made from the queue rather than after three clicks of digging. */
  const attention: AttentionItem[] = [];

  visibleApprovals.slice(0, 2).forEach((a) =>
  attention.push({
    id: a.id,
    urgency: 'action',
    kind: `${a.type} approval`,
    title: a.title,
    project: projectName(a.projectId),
    facts: [
    { label: 'Value', value: a.amount ? currency(a.amount) : '—', tone: 'brand' },
    { label: 'Raised by', value: memberName(a.requesterId) },
    { label: 'Raised', value: a.createdAt }],

    meta: 'Blocks the purchase order until decided',
    cta: 'Review',
    to: '/approvals'
  })
  );

  if (can('takeoff.review')) {
    takeoffs.
    filter((t) => t.status === 'Review Required' || t.status === 'In Review').
    slice(0, 2).
    forEach((t) => {
      const lowCount = t.items.filter((i) => i.confidence < 75).length;
      const mean = Math.round(t.items.reduce((s, i) => s + i.confidence, 0) / Math.max(1, t.items.length));
      attention.push({
        id: t.id,
        urgency: 'ai',
        kind: 'AI takeoff ready',
        title: `${t.items.length} material lines detected on ${t.planSetLabel}`,
        project: projectName(t.projectId),
        facts: [
        { label: 'Mean confidence', value: `${mean}%`, tone: mean >= 90 ? 'positive' : 'default' },
        { label: 'Low confidence', value: String(lowCount), tone: lowCount ? 'danger' : 'positive' },
        { label: 'Run', value: t.runRef }],

        meta: 'Nothing reaches purchasing until a person approves',
        cta: 'Open workspace',
        to: `/takeoff/${t.id}`
      });
    });
  }

  if (can('request.manage')) {
    openRequests.
    filter((r) => r.status === 'Under Review' || r.status === 'Quote Received').
    slice(0, 1).
    forEach((r) =>
    attention.push({
      id: r.id,
      urgency: 'action',
      kind: r.status === 'Quote Received' ? 'Quotes awaiting decision' : 'Material requirement',
      title:
      r.status === 'Quote Received' ?
      `Supplier quotes received for ${r.lines.length} material lines` :
      `${r.lines.length} material lines need pricing`,
      project: projectName(r.projectId),
      facts: [
      { label: 'Required by', value: r.requiredBy },
      { label: 'Lines', value: String(r.lines.length) },
      { label: 'Raised by', value: r.requestedBy }],

      meta: `Request ${r.id}`,
      cta: r.status === 'Quote Received' ? 'Compare quotes' : 'Review',
      to:
      r.status === 'Quote Received' ?
      `/procurement/requests/${r.id}/compare` :
      `/procurement/requests/${r.id}`
    })
    );
  }

  if (can('delivery.verify') || can('delivery.view')) {
    upcoming.slice(0, 2).forEach((d) =>
    attention.push({
      id: d.id,
      urgency: d.status === 'Delayed' ? 'critical' : 'operational',
      kind: d.status === 'Delayed' ? 'Delivery delayed' : 'Delivery inbound',
      title: `${supplierName(d.supplierId)} load arriving on site`,
      project: projectName(d.projectId),
      facts: [
      { label: 'ETA', value: d.eta, tone: d.status === 'Delayed' ? 'danger' : 'default' },
      { label: 'Truck', value: d.truck === 'Unassigned' ? 'TBD' : d.truck },
      { label: 'Order', value: d.orderId }],

      meta: can('delivery.verify') ? 'You are the receiving contact' : 'Tracking only',
      cta: can('delivery.verify') ? 'Receive load' : 'Track',
      to: `/deliveries/${d.id}`
    })
    );
  }

  if (can('invoice.manage')) {
    invoices.
    filter((i) => i.status === 'Overdue' || i.status === 'Pending').
    slice(0, 1).
    forEach((i) =>
    attention.push({
      id: i.id,
      urgency: i.status === 'Overdue' ? 'critical' : 'action',
      kind: `Invoice ${i.status.toLowerCase()}`,
      title: `${supplierName(i.supplierId)} invoice matched to ${i.orderId}`,
      project: projectName(i.projectId),
      facts: [
      { label: 'Amount', value: currency(i.amount), tone: 'brand' },
      { label: 'Due', value: i.dueDate, tone: i.status === 'Overdue' ? 'danger' : 'default' },
      { label: 'Invoice', value: i.id }],

      meta: 'Three-way match against PO and POD',
      cta: 'Open invoice',
      to: `/accounting/invoices/${i.id}`
    })
    );
  }

  /* Operations ledger — scoped to what this role is accountable for. */
  const ledger: {label: string;value: string;note?: string;tone?: 'default' | 'brand' | 'danger';}[] = [
  { label: 'Active projects', value: String(activeProjects.length), note: `${projects.length} on record` }];

  if (can('proposal.approve'))
  ledger.push({
    label: 'Awaiting your approval',
    value: String(visibleApprovals.length),
    note: 'Blocking procurement',
    tone: visibleApprovals.length ? 'brand' : 'default'
  });
  if (can('request.create') || can('request.manage'))
  ledger.push({ label: 'Open requirements', value: String(openRequests.length), note: 'Not yet ordered' });
  if (can('quote.manage'))
  ledger.push({ label: 'Quotes to decide', value: String(pendingQuotes.length), note: 'Supplier pricing' });
  if (can('delivery.view'))
  ledger.push({ label: 'Loads inbound', value: String(upcoming.length), note: 'Next 7 days' });
  if (can('invoice.view') || can('payment.view'))
  ledger.push({
    label: 'Payable to suppliers',
    value: currency(outstanding, { compact: true }),
    note: 'Outstanding balance',
    tone: 'brand'
  });

  const trail: TrailStage[] = [
  { label: 'Plan Set V3 uploaded', detail: 'Aug 19 · John Smith', state: 'done' },
  { label: 'AI takeoff TK-1024', detail: '7 lines · 2 human corrections', state: 'done' },
  { label: 'Takeoff approved', detail: 'Pending purchasing sign-off', state: 'active' },
  { label: 'Material request MR-1024', detail: '3 quotes received', state: 'done' },
  { label: 'Proposal PO-1024', detail: '$42,850 awaiting owner approval', state: 'active' },
  { label: 'Delivery & POD', detail: 'Scheduled Aug 24', state: 'todo' },
  { label: 'Invoice & payment', detail: 'Not yet received', state: 'todo' }];


  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle={`Here's what's happening across ${app.organization.name} today · ${ROLES[activeRole].label}`} />
      

      {!app.onboarded && <FirstRun onDismiss={app.completeOnboarding} role={ROLES[activeRole].label} />}

      {/* Operations ledger — a measured strip, not a row of stat cards. */}
      <Panel className="mb-6 overflow-hidden">
        <div className="flex divide-x divide-ink-100 overflow-x-auto no-scrollbar">
          {ledger.map((m) =>
          <div key={m.label} className="min-w-[168px] flex-1 px-4 py-3.5">
              <Measured
              label={m.label}
              value={m.value}
              note={m.note}
              size="md"
              tone={m.tone === 'brand' ? 'brand' : m.tone === 'danger' ? 'danger' : 'default'} />
            
            </div>
          )}
        </div>
      </Panel>

      {(can('plans.upload') || can('takeoff.review')) &&
      <AiTakeoffBand onStart={() => navigate('/takeoff/new')} />
      }

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_368px]">
        <div className="min-w-0 space-y-7">
          <section aria-labelledby="attention-heading">
            <WorkHeading
              label="Work queue"
              title="What needs your attention"
              count={`${attention.length} open`}
              action={
              <span className="text-[11.5px] text-ink-400">
                  Scoped to {ROLES[activeRole].label}
                </span>
              } />
            
            {attention.length === 0 ?
            <Panel className="px-6 py-10 text-center">
                <p className="text-[14.5px] font-bold text-ink-900">Nothing is blocked on you</p>
                <p className="mt-1 text-[13px] text-ink-400">
                  Every takeoff, quote, load and invoice in your scope has moved on.
                </p>
              </Panel> :

            <div className="space-y-3">
                {attention.map((item) =>
              <AttentionCard
                key={item.id}
                urgency={item.urgency}
                kind={item.kind}
                title={item.title}
                project={item.project}
                facts={item.facts}
                meta={item.meta}
                cta={item.cta}
                onAction={() => navigate(item.to)} />

              )}
              </div>
            }
          </section>

          <section aria-label="Active projects">
            <WorkHeading
              label="Portfolio"
              title="Active projects"
              action={
              <button
                onClick={() => navigate('/projects')}
                className="text-[12.5px] font-semibold text-brand-600 transition-colors duration-150 ease-smooth hover:text-brand-700">
                
                  All projects
                </button>
              } />
            
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {activeProjects.map((p) =>
              <ProjectCard key={p.id} project={p} />
              )}
            </div>
          </section>

          <section>
            <SectionHeader title="Recent activity" action="Full audit log" onAction={() => navigate('/activity')} />
            <Card className="divide-y divide-ink-100">
              <ActivityList events={activity.slice(0, 6)} showProject />
            </Card>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel className="overflow-hidden">
            <TitleBlock
              label="Traceability"
              title="Oakwood Residence"
              reference="PLAN → PAYMENT"
              action={
              <button
                onClick={() => navigate('/projects/pr-1024')}
                className="text-[11.5px] font-bold text-brand-600">
                
                  Open
                </button>
              } />
            
            <div className="p-4">
              <PipelineTrail stages={trail} />
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <TitleBlock label="Procurement pipeline" reference="ALL PROJECTS" />
            <div className="divide-y divide-ink-100">
              {[
              ['Requirements awaiting pricing', String(openRequests.filter((r) => r.status === 'Pricing' || r.status === 'Under Review').length)],
              ['Quotes to compare', String(pendingQuotes.filter((q) => q.status === 'Received').length)],
              ['Orders in production', String(app.orders.filter((o) => o.status === 'In Production' || o.status === 'Dispatched').length)],
              ['Loads scheduled this week', String(upcoming.length)]].
              map(([label, value]) =>
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-[12.5px] text-ink-600">{label}</span>
                  <span className="measure text-[14px] font-bold text-ink-900">{value}</span>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>);

}

/**
 * The single entry point into the AI takeoff. It sits full width directly
 * under the ledger because uploading a plan set is the action that starts
 * every other workflow in the product — and because a small button in a side
 * rail did not say what it actually does. The three stages are stated inline
 * so the outcome of pressing the button is obvious before pressing it.
 */
function AiTakeoffBand({ onStart }: {onStart: () => void;}) {
  const steps = [
  { n: '1', label: 'Upload drawings', detail: 'PDF, DWG or scanned sheets' },
  { n: '2', label: 'AI reads the sheets', detail: 'Materials, quantities, confidence' },
  { n: '3', label: 'You review & approve', detail: 'Then send for pricing' }];


  return (
    <section
      aria-labelledby="takeoff-band-heading"
      className="mb-6 overflow-hidden border border-ink-900 bg-ink-900">
      
      {/* Drawing banner across the full width, with the run stamp and the
           model/output captions reading along its edges. */}
      <div className="relative h-[148px]">
        <img
          src={AI_IMAGE}
          alt="AI detecting framing materials on a construction drawing"
          className="h-full w-full object-cover opacity-55" />
        
        <div className="absolute inset-0 bg-ink-900/40" />
        <div className="absolute left-4 top-4">
          <AiStamp label="AI takeoff" />
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <span className="measure text-[10px] text-white/60">SM VISION 2.4</span>
          <span className="measure text-[10px] text-white/60">SHEET → QUANTITY</span>
        </div>
      </div>

      <div className="p-5">
        <h2
          id="takeoff-band-heading"
          className="display-tight text-[21px] font-bold leading-snug text-white">
          
          Upload drawings to start an AI takeoff
        </h2>
        <p className="mt-1.5 max-w-[720px] text-[13px] leading-relaxed text-white/60">
          SM PRO reads your plan set and returns measured material quantities — each traceable to its
          sheet, revision and page.
        </p>

        <ol className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3 sm:gap-6">
          {steps.map((s) =>
          <li key={s.n} className="flex min-w-0 items-start gap-2.5">
              <span className="measure mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] bg-white/10 text-[10px] font-bold text-white/70">
                {s.n}
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold leading-snug text-white">{s.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-white/45">{s.detail}</span>
              </span>
            </li>
          )}
        </ol>

        <Button
          size="lg"
          block
          className="mt-5"
          onClick={onStart}
          icon={<ScanSearchIcon className="h-4 w-4" />}>
          
          Upload drawings
        </Button>
      </div>
    </section>);

}

function FirstRun({ onDismiss, role }: {onDismiss: () => void;role: string;}) {
  return (
    <Panel className="mb-6 border-brand-200 bg-brand-50 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <SpecLabel className="text-brand-700">First time here</SpecLabel>
          <p className="mt-1.5 text-[14.5px] font-bold text-ink-900">You&apos;re signed in as {role}</p>
          <p className="mt-1 max-w-[680px] text-[13px] leading-relaxed text-ink-600">
            Navigation, approvals and actions follow your role — switch roles from the bottom of the sidebar to
            see another lens.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    </Panel>);

}

export function ActivityLogPage() {
  return (
    <div>
      <PageHeader
        back
        title="Organization activity"
        subtitle="Who did what, when — with before and after values where they changed" />
      
      <div>
        <Card className="divide-y divide-ink-100">
          <ActivityList events={activity} showProject />
        </Card>
        <p className="mt-3 text-[11.5px] text-ink-400">
          Audit entries are retained for the life of the project and cannot be edited or deleted.
        </p>
      </div>
    </div>);

}