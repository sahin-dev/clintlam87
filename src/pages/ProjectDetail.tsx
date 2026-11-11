import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  FileTextIcon,
  MapPinIcon,
  PlusIcon,
  ReceiptIcon,
  ScanSearchIcon,
  TriangleAlertIcon,
  TruckIcon,
  UploadIcon } from
'lucide-react';
import { Card, Progress, SectionHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState, ErrorState, InlineAlert } from '../components/ui/Feedback';
import { ActivityList } from '../components/common/ActivityList';
import { PipelineTrail, TrailStage } from '../components/common/PipelineTrail';
import {
  DeliveryRow,
  InvoiceRow,
  IssueRow,
  OrderRow,
  PlanRow,
  RequestRow,
  TakeoffRow,
  TaskRow } from
'../components/common/Rows';
import { UploadPlanSheet } from '../components/project/UploadPlanSheet';
import { Measured, Panel, SpecLabel, SpecRow, TitleBlock } from '../components/smpro/Primitives';
import { useApp } from '../contexts/AppContext';
import { useUrlTab } from '../hooks/useUrlTab';
import { currency } from '../utils/format';
import { memberName } from '../data/organization';
import { supplierName } from '../data/procurement';
import { activity } from '../data/engagement';
import { issues, tasks } from '../data/operations';

const TABS = [
{ value: 'overview', label: 'Overview' },
{ value: 'plans', label: 'Plans' },
{ value: 'takeoff', label: 'AI Takeoff' },
{ value: 'materials', label: 'Materials' },
{ value: 'orders', label: 'Orders' },
{ value: 'deliveries', label: 'Deliveries' },
{ value: 'finance', label: 'Invoices' },
{ value: 'field', label: 'Field' },
{ value: 'activity', label: 'Activity' }];


export function ProjectDetail() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const [tab, setTab] = useUrlTab(TABS.map((t) => t.value), 'overview');
  const [uploadOpen, setUploadOpen] = useState(false);

  const project = app.projects.find((p) => p.id === projectId);
  if (!project) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState
          title="Project not found"
          body="This project may have been archived, or it belongs to a branch outside your scope."
          action="Back to projects"
          onAction={() => navigate('/projects')} />
        
      </div>);

  }

  const plans = app.planSets.filter((p) => p.projectId === project.id);
  const projectTakeoffs = app.takeoffs.filter((t) => t.projectId === project.id);
  const projectRequests = app.requests.filter((r) => r.projectId === project.id);
  const projectOrders = app.orders.filter((o) => o.projectId === project.id);
  const projectDeliveries = app.deliveries.filter((d) => d.projectId === project.id);
  const projectInvoices = app.invoices.filter((i) => i.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const events = activity.filter((e) => e.projectId === project.id);

  const trail: TrailStage[] = [
  { label: 'Plan set', detail: plans.length ? `V${plans[0].version} current` : 'No plans yet', state: plans.length ? 'done' : 'todo' },
  {
    label: 'AI takeoff',
    detail: projectTakeoffs.length ? `${projectTakeoffs[0].id} · ${projectTakeoffs[0].status}` : 'Not started',
    state: projectTakeoffs.length ? projectTakeoffs[0].status === 'Approved' ? 'done' : 'active' : 'todo'
  },
  {
    label: 'Material request',
    detail: projectRequests.length ? `${projectRequests[0].id} · ${projectRequests[0].status}` : 'None raised',
    state: projectRequests.length ? 'done' : 'todo'
  },
  {
    label: 'Purchase order',
    detail: projectOrders.length ? `${projectOrders[0].id} · ${projectOrders[0].status}` : 'Not created',
    state: projectOrders.length ? projectOrders[0].status === 'Pending Approval' ? 'active' : 'done' : 'todo'
  },
  {
    label: 'Delivery & POD',
    detail: projectDeliveries.length ? `${projectDeliveries[0].id} · ${projectDeliveries[0].status}` : 'Not scheduled',
    state: projectDeliveries.some((d) => d.status === 'Delayed') ?
    'blocked' :
    projectDeliveries.some((d) => d.pod) ?
    'done' :
    projectDeliveries.length ?
    'active' :
    'todo'
  },
  {
    label: 'Invoice & payment',
    detail: projectInvoices.length ? `${projectInvoices[0].id} · ${projectInvoices[0].status}` : 'None received',
    state: projectInvoices.some((i) => i.status === 'Paid') ? 'done' : projectInvoices.length ? 'active' : 'todo'
  }];


  return (
    <div>
      {/* Project workspace header — site photograph, drawing-style number block
           and the four figures that describe the job's health. */}
      <div className="mt-6 border border-ink-100 bg-white">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-40 shrink-0 overflow-hidden bg-ink-900 md:h-auto md:w-[280px]">
            <img src={project.image} alt={`${project.name} site`} className="h-full w-full object-cover" />
            <button
              onClick={() => navigate('/projects')}
              aria-label="Back to projects"
              className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-[3px] bg-white/90 text-ink-800 transition-colors duration-150 ease-smooth hover:bg-white">
              
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SpecLabel>{project.number}</SpecLabel>
                  <span className="h-px w-5 bg-ink-200" aria-hidden />
                  <StatusBadge status={project.status} />
                </div>
                <h1 className="display-tight mt-1.5 text-[24px] font-extrabold leading-tight text-ink-900">
                  {project.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-[12.5px] text-ink-400">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {project.address}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <SpecLabel>Project manager</SpecLabel>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-ink-800">
                    {memberName(project.managerId)}
                  </p>
                </div>
                <Avatar name={memberName(project.managerId)} size="sm" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-ink-100 px-5 py-3.5 sm:grid-cols-4">
              <Measured label="Project value" value={currency(project.value, { compact: true })} size="sm" />
              <Measured
                label="Material spend"
                value={currency(project.spend, { compact: true })}
                note={`${Math.round(project.spend / project.value * 100)}% of value`}
                size="sm" />
              
              <Measured
                label="Procurement"
                value={`${project.procurement}%`}
                size="sm"
                tone={project.procurement > 70 ? 'positive' : 'default'} />
              
              <Measured
                label="Pending actions"
                value={String(project.pendingActions)}
                size="sm"
                tone={project.pendingActions ? 'brand' : 'muted'} />
              
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 mt-4 border border-ink-100 bg-white">
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="border-b-0" />
      </div>

      <div className="space-y-6 pt-6">
        {tab === 'overview' &&
        <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
              <div className="min-w-0 space-y-5">
                <Panel className="overflow-hidden">
                  <TitleBlock label="Build progress" reference={`${project.startDate} → ${project.targetDate}`} />
                  <div className="space-y-4 p-4">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <SpecLabel>Construction complete</SpecLabel>
                        <span className="measure text-[14px] font-bold text-ink-900">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} tone="ink" className="mt-1.5" />
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between">
                        <SpecLabel>Procurement complete</SpecLabel>
                        <span className="measure text-[14px] font-bold text-ink-900">{project.procurement}%</span>
                      </div>
                      <Progress value={project.procurement} className="mt-1.5" />
                    </div>
                    <p className="border-t border-ink-100 pt-3.5 text-[13px] leading-relaxed text-ink-600">
                      {project.description}
                    </p>
                  </div>
                </Panel>

                <Panel className="overflow-hidden">
                  <TitleBlock
                  label="Traceability"
                  title="Plan set to payment"
                  reference="Every stage links to its record" />
                
                  <div className="p-4">
                    <PipelineTrail stages={trail} />
                  </div>
                </Panel>
              </div>

              <div className="min-w-0 space-y-5">
                <Panel className="overflow-hidden">
                  <TitleBlock label="Project record" reference={project.number} />
                  <dl className="divide-y divide-ink-100 px-4">
                    <SpecRow label="Project manager" value={memberName(project.managerId)} />
                    <SpecRow label="Superintendent" value="Maria Delgado" />
                    <SpecRow label="Start" value={project.startDate} mono />
                    <SpecRow label="Target" value={project.targetDate} mono />
                    <SpecRow
                    label="Next milestone"
                    value={`${project.nextMilestone} · ${project.nextMilestoneDate}`} />
                  
                    <SpecRow
                    label="Suppliers"
                    value={project.supplierIds.map(supplierName).join(', ') || 'None assigned'} />
                  
                    <SpecRow label="Open issues" value={String(project.openIssues)} mono />
                  </dl>
                </Panel>
              </div>
            </div>

            <Card className="p-4">
              <SectionHeader title="Assigned team" />
              <div className="flex items-center justify-between">
                <AvatarStack names={['Alex Whitfield', 'John Smith', 'Maria Delgado', 'Dana Kim']} />
                <Button size="sm" variant="secondary" onClick={() => navigate('/team')}>
                  Manage
                </Button>
              </div>
            </Card>

            {/* One clear primary action for this project, then the rest. */}
            {(app.can('plans.upload') || app.can('takeoff.review')) &&
          <Panel className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-ink-900">
                    Upload drawings to start an AI takeoff
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-500">
                    A plan set becomes measured quantities you review before anything is priced
                  </p>
                </div>
                <Button
              onClick={() => navigate(`/takeoff/new?project=${project.id}`)}
              icon={<ScanSearchIcon className="h-4 w-4" />}>
              
                  Upload drawings
                </Button>
              </Panel>
          }

            <div className="flex flex-wrap gap-2.5">
              {app.can('request.create') &&
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/procurement/requests/new')}
              icon={<PlusIcon className="h-4 w-4" />}>
              
                  Material request
                </Button>
            }
              {app.can('issue.create') &&
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/jobsite')}
              icon={<TriangleAlertIcon className="h-4 w-4" />}>
              
                  Report issue
                </Button>
            }
            </div>
          </>
        }

        {tab === 'plans' &&
        <>
            <InlineAlert
            tone="info"
            title="Versions are never overwritten"
            body="Uploading a new plan set creates the next version and keeps every previous one available." />
          
            {app.can('plans.upload') &&
          <Button block onClick={() => setUploadOpen(true)} icon={<UploadIcon className="h-4 w-4" />}>
                Upload plan set
              </Button>
          }
            {plans.length === 0 ?
          <EmptyState
            icon={<FileTextIcon className="h-5 w-5" />}
            title="No plan sets yet"
            body="Upload drawings as a PDF plan set, CAD files or scanned sheets to start a takeoff."
            action={app.can('plans.upload') ? 'Upload drawings' : undefined}
            onAction={() => setUploadOpen(true)} /> :


          <Card className="divide-y divide-ink-100">
                {plans.map((plan) =>
            <PlanRow key={plan.id} plan={plan} onOpen={() => navigate(`/documents/${plan.id}`)} />
            )}
              </Card>
          }
          </>
        }

        {tab === 'takeoff' &&
        <>
            {projectTakeoffs.length === 0 ?
          <EmptyState
            icon={<ScanSearchIcon className="h-5 w-5" />}
            title="No takeoffs generated"
            body="Select a plan set and let AI detect materials and quantities."
            action={app.can('takeoff.review') ? 'Start AI takeoff' : undefined}
            onAction={() => navigate(`/takeoff/new?project=${project.id}`)} /> :


          <Card className="divide-y divide-ink-100">
                {projectTakeoffs.map((t) =>
            <TakeoffRow key={t.id} takeoff={t} />
            )}
              </Card>
          }
          </>
        }

        {tab === 'materials' &&
        <>
            {app.can('request.create') &&
          <Button block variant="secondary" onClick={() => navigate('/procurement/requests/new')} icon={<PlusIcon className="h-4 w-4" />}>
                New material request
              </Button>
          }
            {projectRequests.length === 0 ?
          <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No material requests" body="Approved takeoffs can be turned into a request in one step." /> :

          <Card className="divide-y divide-ink-100">
                {projectRequests.map((r) =>
            <RequestRow key={r.id} request={r} />
            )}
              </Card>
          }
          </>
        }

        {tab === 'orders' && (
        projectOrders.length === 0 ?
        <EmptyState icon={<ReceiptIcon className="h-5 w-5" />} title="No purchase orders" body="Orders appear here once a quote is selected and approved." /> :

        <Card className="divide-y divide-ink-100">
              {projectOrders.map((o) =>
          <OrderRow key={o.id} order={o} />
          )}
            </Card>)
        }

        {tab === 'deliveries' && (
        projectDeliveries.length === 0 ?
        <EmptyState icon={<TruckIcon className="h-5 w-5" />} title="No deliveries scheduled" body="Confirmed orders will show their delivery window and proof of delivery here." /> :

        <Card className="divide-y divide-ink-100">
              {projectDeliveries.map((d) =>
          <DeliveryRow key={d.id} delivery={d} />
          )}
            </Card>)
        }

        {tab === 'finance' && (
        !app.can('invoice.view') ?
        <ErrorState variant="permission" title="Financial records are restricted" body="Your active role can see project delivery and progress, but not invoices or payments." /> :
        projectInvoices.length === 0 ?
        <EmptyState icon={<ReceiptIcon className="h-5 w-5" />} title="No invoices received" body="Supplier invoices matched to this project's orders will appear here." /> :

        <Card className="divide-y divide-ink-100">
              {projectInvoices.map((i) =>
          <InvoiceRow key={i.id} invoice={i} />
          )}
            </Card>)
        }

        {tab === 'field' &&
        <>
            <SectionHeader title="Tasks" hint={`${projectTasks.length} on this project`} />
            {projectTasks.length === 0 ?
          <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No tasks" body="Create tasks to coordinate the field and office." /> :

          <Card className="divide-y divide-ink-100">
                {projectTasks.map((t) =>
            <TaskRow key={t.id} task={t} />
            )}
              </Card>
          }
            <SectionHeader className="mt-5" title="Issues" hint={`${projectIssues.length} logged`} />
            {projectIssues.length === 0 ?
          <EmptyState icon={<TriangleAlertIcon className="h-5 w-5" />} title="No issues" body="Field issues reported from the jobsite show up here." /> :

          <Card className="divide-y divide-ink-100">
                {projectIssues.map((i) =>
            <IssueRow key={i.id} issue={i} />
            )}
              </Card>
          }
          </>
        }

        {tab === 'activity' && (
        events.length === 0 ?
        <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No activity yet" body="Every plan upload, takeoff, order and payment will be recorded here." /> :

        <Card className="divide-y divide-ink-100">
              <ActivityList events={events} />
            </Card>)
        }
      </div>

      <UploadPlanSheet open={uploadOpen} onClose={() => setUploadOpen(false)} project={project} />
    </div>);

}