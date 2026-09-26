import React, { useMemo, useState } from 'react';
import { BuildingIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { ProjectCard } from '../components/project/ProjectCard';
import { Button } from '../components/ui/Button';
import { Input, SearchField, SegmentedControl, Select, TextArea } from '../components/ui/Field';
import { BottomSheet } from '../components/ui/Sheet';
import { EmptyState, SkeletonCard } from '../components/ui/Feedback';
import { useApp } from '../contexts/AppContext';
import { IMAGES } from '../data/images';
import { Project } from '../types';

type Filter = 'all' | 'active' | 'risk' | 'completed';
type Sort = 'activity' | 'spend' | 'progress';

export function Projects() {
  const { projects, can, addProject, toast, user, branchId } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('activity');
  const [createOpen, setCreateOpen] = useState(false);

  const list = useMemo(() => {
    let out = projects.filter((p) => {
      if (filter === 'active') return p.status === 'In Progress';
      if (filter === 'risk') return p.status === 'At Risk';
      if (filter === 'completed') return p.status === 'Completed';
      return true;
    });
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
        p.name.toLowerCase().includes(q) ||
        p.number.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    return [...out].sort((a, b) =>
    sort === 'spend' ? b.spend - a.spend : sort === 'progress' ? b.progress - a.progress : 0
    );
  }, [projects, filter, query, sort]);

  return (
    <div>
      <PageHeader
        back={false}
        title="Projects"
        subtitle={`${projects.length} projects · ${projects.filter((p) => p.status === 'At Risk').length} at risk`}
        action={
        can('project.create') ?
        <Button size="sm" onClick={() => setCreateOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>
              New
            </Button> :
        undefined
        } />
      

      <div className="mb-5 space-y-3">
        <div className="max-w-[420px]">
          <SearchField value={query} onChange={setQuery} placeholder="Search name, number or address" />
        </div>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'risk', label: 'At risk' },
          { value: 'completed', label: 'Completed' }]
          } />
        
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink-400">{list.length} results</span>
          <label className="flex items-center gap-2 text-[12px] text-ink-400">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-[12px] font-semibold text-ink-700">
              
              <option value="activity">Last activity</option>
              <option value="spend">Material spend</option>
              <option value="progress">Progress</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {list.length === 0 ?
        <div className="md:col-span-2 2xl:col-span-3">
            {query ?
          <EmptyState
            icon={<SearchXIcon className="h-5 w-5" />}
            title="No projects match your search"
            body="Try a different name, project number or clear the filters."
            action="Clear search"
            onAction={() => {
              setQuery('');
              setFilter('all');
            }} /> :


          <EmptyState
            icon={<BuildingIcon className="h-5 w-5" />}
            title="No projects yet"
            body="Create your first project, then upload a plan set to run an AI takeoff."
            action={can('project.create') ? 'Create project' : undefined}
            onAction={() => setCreateOpen(true)} />

          }
          </div> :

        list.map((p) => <ProjectCard key={p.id} project={p} />)
        }
      </div>

      <CreateProjectSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(project) => {
          addProject(project);
          setCreateOpen(false);
          toast({ tone: 'success', title: 'Project created', body: `${project.name} is ready for plans.` });
        }}
        managerId={user.id}
        branchId={branchId} />
      
    </div>);

}

function CreateProjectSheet({
  open,
  onClose,
  onCreate,
  managerId,
  branchId






}: {open: boolean;onClose: () => void;onCreate: (project: Project) => void;managerId: string;branchId: string;}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Project name is required';
    if (!number.trim()) next.number = 'Project number is required';
    if (!address.trim()) next.address = 'Address is required';
    if (value && Number.isNaN(Number(value.replace(/[^0-9.]/g, '')))) next.value = 'Enter a number';
    setErrors(next);
    if (Object.keys(next).length) return;
    onCreate({
      id: `pr-${number.replace(/\D/g, '') || Date.now()}`,
      number: number.toUpperCase(),
      name: name.trim(),
      address: address.trim(),
      image: IMAGES.projectCommercial,
      status: 'Planning',
      progress: 0,
      procurement: 0,
      value: Number(value.replace(/[^0-9.]/g, '')) || 0,
      spend: 0,
      managerId,
      branchId,
      startDate: 'Not set',
      targetDate: 'Not set',
      nextMilestone: 'Upload plan set',
      nextMilestoneDate: 'This week',
      openIssues: 0,
      pendingActions: 1,
      supplierIds: [],
      lastActivity: 'Project created · just now',
      description: 'Newly created project. Upload a plan set to start an AI takeoff.'
    });
    setName('');
    setNumber('');
    setAddress('');
    setValue('');
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Create project"
      description="Owners and project managers can create projects."
      footer={
      <Button block size="lg" onClick={submit}>
          Create project
        </Button>
      }>
      
      <div className="space-y-4">
        <Input label="Project name" value={name} error={errors.name} onChange={(e) => setName(e.target.value)} placeholder="Cedar Park Residence" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Project number" value={number} error={errors.number} onChange={(e) => setNumber(e.target.value)} placeholder="PR-1055" />
          <Input label="Project value" hint="Optional" value={value} error={errors.value} onChange={(e) => setValue(e.target.value)} placeholder="850000" />
        </div>
        <Input label="Address" value={address} error={errors.address} onChange={(e) => setAddress(e.target.value)} placeholder="City, State" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" placeholder="mm/dd/yyyy" />
          <Input label="Est. completion" placeholder="mm/dd/yyyy" />
        </div>
        <Select label="Assigned project manager" defaultValue="u-2">
          <option value="u-2">John Smith</option>
          <option value="u-6">Ethan Brooks</option>
        </Select>
        <TextArea label="Description" hint="Optional" placeholder="Scope, phasing and anything the field should know." />
      </div>
    </BottomSheet>);

}

export function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
    </div>);

}