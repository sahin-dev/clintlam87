import { useState } from 'react';
import { CheckIcon, MailPlusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { InlineAlert } from '../ui/Feedback';
import { ROLES, ROLE_ORDER } from '../../utils/rbac';
import { RoleId } from '../../types';

export function OrganizationStep({
  onNext,
  onBack



}: {onNext: (companyName: string) => void;onBack: () => void;}) {
  const [name, setName] = useState('ABC Construction');
  return (
    <AuthLayout
      step={3}
      totalSteps={6}
      title="Set up your company"
      body="This becomes the organization every project, plan and purchase order belongs to."
      onBack={onBack}
      footer={
      <Button block size="lg" onClick={() => onNext(name.trim() || 'ABC Construction')}>
          Continue
        </Button>
      }>
      
      <div className="space-y-4">
        <Input
          label="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ABC Construction" />
        
        <Select label="Company type" defaultValue="residential">
          <option value="residential">Residential builder</option>
          <option value="commercial">Commercial builder</option>
          <option value="mixed">Mixed / general contractor</option>
          <option value="remodel">Remodel &amp; renovation</option>
        </Select>
        <Input label="Business address" defaultValue="1420 Congress Ave, Austin, TX 78701" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" defaultValue="(512) 555-0148" />
          <Input label="Website" hint="Optional" defaultValue="abcconstruction.com" />
        </div>
      </div>
    </AuthLayout>);

}

export function BranchStep({ onNext, onBack }: {onNext: () => void;onBack: () => void;}) {
  const [branches, setBranches] = useState([
  { name: 'Austin HQ', city: 'Austin, TX', primary: true },
  { name: 'San Antonio', city: 'San Antonio, TX', primary: false }]
  );
  return (
    <AuthLayout
      step={4}
      totalSteps={6}
      title="Branches"
      body="Projects, purchasing and reporting can be scoped per branch. You can add more later."
      onBack={onBack}
      footer={
      <Button block size="lg" onClick={onNext}>
          Continue
        </Button>
      }>
      
      <ul className="space-y-2.5">
        {branches.map((b, i) =>
        <li
          key={b.name}
          className="flex items-center gap-3 rounded-xl border border-ink-100 px-3.5 py-3">
          
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink-900">{b.name}</p>
              <p className="text-[12px] text-ink-400">{b.city}</p>
            </div>
            {b.primary ?
          <Badge tone="brand">Primary</Badge> :

          <button
            aria-label={`Remove ${b.name}`}
            onClick={() => setBranches((prev) => prev.filter((_, idx) => idx !== i))}
            className="text-ink-300 transition-colors duration-150 ease-smooth hover:text-danger-600">
            
                <Trash2Icon className="h-4 w-4" />
              </button>
          }
          </li>
        )}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        icon={<PlusIcon className="h-4 w-4" />}
        onClick={() =>
        setBranches((prev) => [...prev, { name: `Branch ${prev.length + 1}`, city: 'Texas', primary: false }])
        }>
        
        Add branch
      </Button>
    </AuthLayout>);

}

interface Invitee {
  email: string;
  roles: RoleId[];
}

export function InviteStep({ onNext, onBack }: {onNext: () => void;onBack: () => void;}) {
  const [invites, setInvites] = useState<Invitee[]>([
  { email: 'john@abcconstruction.com', roles: ['project_manager'] },
  { email: 'maria@abcconstruction.com', roles: ['superintendent'] },
  { email: 'dana@abcconstruction.com', roles: ['purchasing_manager'] }]
  );
  const [email, setEmail] = useState('');

  const add = () => {
    const next = email.trim() || `teammate${invites.length + 1}@abcconstruction.com`;
    setInvites((prev) => [...prev, { email: next, roles: ['project_manager'] }]);
    setEmail('');
  };

  const toggleRole = (idx: number, role: RoleId) =>
  setInvites((prev) =>
  prev.map((inv, i) =>
  i === idx ?
  {
    ...inv,
    roles: inv.roles.includes(role) ?
    inv.roles.filter((r) => r !== role) :
    [...inv.roles, role]
  } :
  inv
  )
  );

  return (
    <AuthLayout
      step={5}
      totalSteps={6}
      title="Invite your team"
      body="Assign one or more roles per person. A single person can hold several roles in a small company."
      onBack={onBack}
      footer={
      <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onNext}>
            Skip for now
          </Button>
          <Button size="lg" className="flex-1" onClick={onNext}>
            Send {invites.length} invites
          </Button>
        </div>
      }>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
          
        </div>
        <Button
          variant="secondary"
          className="h-12 shrink-0"
          onClick={add}
          icon={<MailPlusIcon className="h-4 w-4" />}>
          
          Add
        </Button>
      </div>

      <ul className="mt-4 space-y-3">
        {invites.map((inv, idx) =>
        <li key={inv.email} className="rounded-xl border border-ink-100 p-3.5">
            <div className="flex items-center gap-2.5">
              <Avatar name={inv.email.split('@')[0].replace('.', ' ')} size="sm" />
              <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink-900">
                {inv.email}
              </p>
              <button
              aria-label={`Remove ${inv.email}`}
              onClick={() => setInvites((prev) => prev.filter((_, i) => i !== idx))}
              className="text-ink-300 transition-colors duration-150 ease-smooth hover:text-danger-600">
              
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ROLE_ORDER.filter((r) => r !== 'owner').map((role) => {
              const on = inv.roles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(idx, role)}
                  className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors duration-150 ease-smooth ${
                  on ?
                  'border-brand-500 bg-brand-50 text-brand-700' :
                  'border-ink-200 text-ink-500 hover:bg-ink-50'}`
                  }>
                  
                    {ROLES[role].short}
                  </button>);

            })}
            </div>
          </li>
        )}
      </ul>

      <div className="mt-4">
        <InlineAlert
          tone="info"
          title="Roles drive the interface"
          body="Each person sees one shared app; their role decides which modules, approvals and actions appear." />
        
      </div>
    </AuthLayout>);

}

export function SuccessStep({ onFinish, company }: {onFinish: () => void;company: string;}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-positive-50 text-positive-600">
        <CheckIcon className="h-8 w-8" strokeWidth={3} />
      </div>
      <h1 className="display-tight mt-6 text-[26px] font-extrabold leading-tight text-ink-900">
        {company} is ready
      </h1>
      <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-ink-500">
        Your organization, branches and roles are set. Next: create a project and upload a plan set to run
        your first AI takeoff.
      </p>
      <div className="mt-7 w-full max-w-[320px] space-y-2.5 text-left">
        {[
        'Organization created',
        '2 branches configured',
        'Owner / Administrator assigned to you',
        '3 team invites sent'].
        map((line) =>
        <div key={line} className="flex items-center gap-2.5 rounded-xl bg-ink-50 px-3.5 py-2.5">
            <CheckIcon className="h-4 w-4 shrink-0 text-positive-600" strokeWidth={3} />
            <span className="text-[13px] font-medium text-ink-700">{line}</span>
          </div>
        )}
      </div>
      <Button size="lg" block className="mt-8 max-w-[320px]" onClick={onFinish}>
        Go to dashboard
      </Button>
    </div>);

}