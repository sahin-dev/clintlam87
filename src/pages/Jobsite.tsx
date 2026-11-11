import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, ClipboardCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, Metric, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, SegmentedControl, TextArea } from '../components/ui/Field';
import { BottomSheet } from '../components/ui/Sheet';
import { EmptyState, InlineAlert } from '../components/ui/Feedback';
import { DeliveryRow, IssueRow, TaskRow } from '../components/common/Rows';
import { useApp } from '../contexts/AppContext';
import { issues, tasks } from '../data/operations';
import { IMAGES } from '../data/images';
import { Issue } from '../types';

const JOBSITE = IMAGES.jobsite;
const MATERIALS = IMAGES.materialsStaged;

export function Jobsite() {
  const navigate = useNavigate();
  const app = useApp();
  const [projectId, setProjectId] = useState('pr-1024');
  const [tab, setTab] = useState<'today' | 'materials' | 'issues' | 'photos'>('today');
  const [issueOpen, setIssueOpen] = useState(false);
  /* Issues reported from this screen join the list they are reported into. */
  const [logged, setLogged] = useState<Issue[]>([]);
  const [form, setForm] = useState({
    category: 'Material' as Issue['category'],
    priority: 'High' as Issue['priority'],
    description: '',
    assignee: 'John Smith · Project Manager'
  });
  const [issuePhotos, setIssuePhotos] = useState<string[]>([]);
  const [sitePhotos, setSitePhotos] = useState<string[]>([]);
  const issueFile = useRef<HTMLInputElement>(null);
  const siteFile = useRef<HTMLInputElement>(null);

  const project = app.projects.find((p) => p.id === projectId)!;
  const todays = app.deliveries.filter((d) => ['Out for Delivery', 'Scheduled', 'Delayed'].includes(d.status));
  const projectIssues = [...logged, ...issues].filter((i) => i.projectId === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  return (
    <div>
      <PageHeader back={false} title="Jobsite" subtitle="Field operations, receiving and issues" />

      <div className="space-y-5">
        <div className="max-w-[420px]">
          <Select label="Active jobsite" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {app.projects.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name} · {p.number}
              </option>
            )}
          </Select>
        </div>

        <Card className="overflow-hidden">
          <img src={JOBSITE} alt="Superintendent reviewing plans on site" className="h-52 w-full object-cover" />
          <div className="grid grid-cols-3 gap-6 p-5">
            <Metric label="Deliveries today" value={String(todays.filter((d) => d.status === 'Out for Delivery').length)} />
            <Metric label="Open issues" value={String(projectIssues.filter((i) => i.status !== 'Closed' && i.status !== 'Resolved').length)} tone="alert" />
            <Metric label="Field tasks" value={String(projectTasks.filter((t) => t.status !== 'Completed').length)} />
          </div>
        </Card>

        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => navigate('/deliveries')} icon={<ClipboardCheckIcon className="h-4 w-4" />}>
            Receive delivery
          </Button>
          <Button variant="secondary" onClick={() => setIssueOpen(true)} icon={<TriangleAlertIcon className="h-4 w-4" />}>
            Report issue
          </Button>
        </div>

        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
          { value: 'today', label: "Today's activity" },
          { value: 'materials', label: 'Materials' },
          { value: 'issues', label: 'Issues' },
          { value: 'photos', label: 'Photos' }]
          } />
        

        {tab === 'today' &&
        <>
            {todays.some((d) => d.status === 'Delayed') &&
          <InlineAlert
            tone="warning"
            title="A delivery slipped"
            body="Rebar for Sunset Apartments moved to Aug 22. Crew assignments may need to change."
            action="Open delivery"
            onAction={() => navigate('/deliveries/DL-1011')} />

          }
            <SectionHeader title="Deliveries" hint={`${todays.length} inbound`} />
            <Card className="divide-y divide-ink-100">
              {todays.map((d) =>
            <DeliveryRow key={d.id} delivery={d} showProject />
            )}
            </Card>
            <SectionHeader className="mt-5" title="Field tasks" />
            {projectTasks.length === 0 ?
          <EmptyState icon={<ClipboardCheckIcon className="h-5 w-5" />} title="No tasks today" body="Assigned field tasks will appear here." /> :

          <Card className="divide-y divide-ink-100">
                {projectTasks.map((t) =>
            <TaskRow key={t.id} task={t} />
            )}
              </Card>
          }
          </>
        }

        {tab === 'materials' &&
        <>
            <Card className="overflow-hidden">
              <img src={MATERIALS} alt="Materials staged on site" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-[13.5px] font-bold text-ink-900">On-site material status</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                  Quantities below reflect verified receipts against approved purchase orders for{' '}
                  {project.name}.
                </p>
              </div>
            </Card>
            <Card className="divide-y divide-ink-100">
              {[
            ['2×4 SPF Stud — 8 ft', '1,180 of 1,180 received'],
            ['2×6 SPF — 10 ft', '0 of 620 · arriving Aug 24'],
            ['½" CDX Plywood 4×8', '0 of 320 · arriving Aug 24']].
            map(([item, status]) =>
            <div key={item} className="px-4 py-3">
                  <p className="text-[13.5px] font-semibold text-ink-900">{item}</p>
                  <p className="mt-0.5 text-[12px] text-ink-400">{status}</p>
                </div>
            )}
            </Card>
          </>
        }

        {tab === 'issues' && (
        projectIssues.length === 0 ?
        <EmptyState icon={<TriangleAlertIcon className="h-5 w-5" />} title="No issues logged" body="Report shortages, damage or safety concerns straight from the field." action="Report issue" onAction={() => setIssueOpen(true)} /> :

        <Card className="divide-y divide-ink-100">
              {projectIssues.map((i) =>
          <IssueRow key={i.id} issue={i} />
          )}
            </Card>)
        }

        {tab === 'photos' &&
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[JOBSITE, MATERIALS, JOBSITE, MATERIALS].map((src, i) =>
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white">
                <img src={src} alt={`Jobsite photo ${i + 1}`} className="h-36 w-full object-cover" />
                <p className="px-3 py-2.5 text-[11px] text-ink-400">Aug {19 - i} · Maria Delgado</p>
              </div>
          )}
            {sitePhotos.map((name) =>
          <div key={name} className="flex flex-col justify-between overflow-hidden rounded-xl border border-ink-100 bg-white">
                <div className="flex h-36 items-center justify-center bg-ink-50">
                  <CameraIcon className="h-5 w-5 text-ink-300" />
                </div>
                <p className="truncate px-3 py-2.5 text-[11px] text-ink-400">{`${name} · just now`}</p>
              </div>
          )}
            <input
            ref={siteFile}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const names = Array.from(e.target.files ?? []).map((f) => f.name);
              if (names.length) {
                setSitePhotos((prev) => [...prev, ...names]);
                app.toast({
                  tone: 'success',
                  title: `${names.length} photo${names.length === 1 ? '' : 's'} added`,
                  body: `Filed against ${project.name}.`
                });
              }
              e.target.value = '';
            }} />
          
            <button
            onClick={() => siteFile.current?.click()}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 px-4 py-5 text-[13px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:border-ink-300 hover:bg-ink-50 md:col-span-4">
            
              <CameraIcon className="h-4 w-4" />
              Add jobsite photos
            </button>
          </div>
        }
      </div>

      <BottomSheet
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Report a jobsite issue"
        description={`${project.name} · goes to the project manager and purchasing`}
        footer={
        <Button
          block
          size="lg"
          disabled={!form.description.trim()}
          onClick={() => {
            setLogged((prev) => [
            {
              id: `IS-${300 + prev.length}`,
              projectId,
              title: form.description.trim(),
              category: form.category,
              priority: form.priority,
              status: 'Assigned',
              reportedBy: app.user.name,
              at: 'Just now',
              photos: issuePhotos.length
            },
            ...prev]
            );
            app.toast({
              tone: 'success',
              title: 'Issue reported',
              body: `${form.assignee.split(' · ')[0]} was notified and it is now on the Issues tab.`
            });
            setForm({ ...form, description: '' });
            setIssuePhotos([]);
            setTab('issues');
            setIssueOpen(false);
          }}>
          
            Submit issue
          </Button>
        }>
        
        <div className="space-y-3">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Issue['category'] })}>
            
            <option>Material</option>
            <option>Safety</option>
            <option>Schedule</option>
            <option>Quality</option>
          </Select>
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Issue['priority'] })}>
            
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
          <TextArea
            label="Description"
            placeholder="Short 180 pieces of #5 rebar for the Level 3 mat."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          
          <Select
            label="Assign to"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
            
            <option>John Smith · Project Manager</option>
            <option>Dana Kim · Purchasing</option>
          </Select>

          <input
            ref={issueFile}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const names = Array.from(e.target.files ?? []).map((f) => f.name);
              if (names.length) setIssuePhotos((prev) => [...prev, ...names]);
              e.target.value = '';
            }} />
          
          <button
            onClick={() => issueFile.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 px-4 py-5 text-[13px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:border-ink-300 hover:bg-ink-50">
            
            <CameraIcon className="h-4 w-4" />
            {issuePhotos.length ?
            `${issuePhotos.length} photo${issuePhotos.length === 1 ? '' : 's'} attached` :
            'Add photos'}
          </button>
        </div>
      </BottomSheet>
    </div>);

}