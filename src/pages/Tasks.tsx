import { useState } from 'react';
import { ListChecksIcon, PlusIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, SegmentedControl, Select, TextArea } from '../components/ui/Field';
import { BottomSheet } from '../components/ui/Sheet';
import { EmptyState } from '../components/ui/Feedback';
import { TaskRow } from '../components/common/Rows';
import { useApp } from '../contexts/AppContext';
import { tasks as seedTasks } from '../data/operations';
import { Task } from '../types';

type Filter = 'all' | 'mine' | 'overdue' | 'done';

export function Tasks() {
  const app = useApp();
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [filter, setFilter] = useState<Filter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const list = tasks.filter((t) => {
    if (filter === 'mine') return t.assignee === app.user.name;
    if (filter === 'overdue') return t.status !== 'Completed' && t.dueDate === 'Aug 18';
    if (filter === 'done') return t.status === 'Completed';
    return true;
  });

  return (
    <div>
      <PageHeader
        back={false}
        title="Tasks"
        subtitle={`${tasks.filter((t) => t.status !== 'Completed').length} open across your projects`}
        action={
        <Button size="sm" onClick={() => setCreateOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>
            New
          </Button>
        } />
      
      <div className="mb-5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'mine', label: 'My tasks' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'done', label: 'Completed' }]
          } />
        
      </div>
      <div>
        {list.length === 0 ?
        <EmptyState icon={<ListChecksIcon className="h-5 w-5" />} title="No tasks here" body="Create a task to coordinate the field, office and suppliers." action="Create task" onAction={() => setCreateOpen(true)} /> :

        <Card className="divide-y divide-ink-100">
            {list.map((t) =>
          <TaskRow key={t.id} task={t} />
          )}
          </Card>
        }
      </div>

      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create task"
        footer={
        <Button
          block
          size="lg"
          onClick={() => {
            if (!title.trim()) {
              setError('Give the task a title');
              return;
            }
            setTasks((prev) => [
            {
              id: `TS-${310 + prev.length}`,
              projectId: 'pr-1024',
              title: title.trim(),
              assignee: 'Maria Delgado',
              dueDate: 'Aug 24',
              priority: 'Medium',
              status: 'Created'
            },
            ...prev]
            );
            app.toast({ tone: 'success', title: 'Task created', body: 'Maria Delgado was notified.' });
            setTitle('');
            setError('');
            setCreateOpen(false);
          }}>
          
            Create task
          </Button>
        }>
        
        <div className="space-y-3">
          <Input label="Title" value={title} error={error} onChange={(e) => setTitle(e.target.value)} placeholder="Confirm crane window for truss set" />
          <TextArea label="Description" hint="Optional" placeholder="Coordinate with the supplier so the truss load lands before the crane arrives." />
          <Select label="Project" defaultValue="pr-1024">
            {app.projects.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name}
              </option>
            )}
          </Select>
          <Select label="Assign to" defaultValue="u-3">
            <option value="u-2">John Smith · Project Manager</option>
            <option value="u-3">Maria Delgado · Superintendent</option>
            <option value="u-4">Dana Kim · Purchasing</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due date" placeholder="mm/dd/yyyy" />
            <Select label="Priority" defaultValue="Medium">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </Select>
          </div>
        </div>
      </BottomSheet>
    </div>);

}