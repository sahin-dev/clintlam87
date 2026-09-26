import React, { useState } from 'react';
import { MailPlusIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { BottomSheet } from '../components/ui/Sheet';
import { EmptyState, ErrorState, InlineAlert } from '../components/ui/Feedback';
import { Input } from '../components/ui/Field';
import { useApp } from '../contexts/AppContext';
import { ROLES, ROLE_ORDER } from '../utils/rbac';
import { team } from '../data/organization';
import { RoleId, TeamMember } from '../types';

export function Team() {
  const { can, organization, toast } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [draftRoles, setDraftRoles] = useState<RoleId[]>([]);
  /* The roster is edited here, so it lives in state rather than the seed file. */
  const [members, setMembers] = useState<TeamMember[]>(team);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  if (!can('team.manage')) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState
          variant="permission"
          title="Team management is owner-only"
          body="Only the organization owner or administrator can invite people and change roles." />
        
      </div>);

  }

  return (
    <div>
      <PageHeader
        back={false}
        title="Team & roles"
        subtitle={`${members.length} people · ${organization.branches.length} branches`}
        action={
        <Button size="sm" onClick={() => setInviteOpen(true)} icon={<MailPlusIcon className="h-4 w-4" />}>
            Invite
          </Button>
        } />
      

      <div className="space-y-6">
        {members.length === 0 ?
        <EmptyState icon={<UsersIcon className="h-5 w-5" />} title="No team members" body="Invite your project managers, field staff and accounting." /> :

        <Card className="divide-y divide-ink-100">
            {members.map((m) =>
          <button
            key={m.id}
            onClick={() => {
              setEditing(m);
              setDraftRoles(m.roles);
            }}
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
            
                <Avatar name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-ink-900">{m.name}</p>
                    {m.status === 'invited' && <Badge tone="caution" dot={false}>Invited</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-ink-400">{m.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.roles.map((r) =>
                <Badge key={r} tone={r === 'owner' ? 'brand' : 'neutral'} dot={false}>
                        {ROLES[r].short}
                      </Badge>
                )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">
                    {organization.branches.find((b) => b.id === m.branchId)?.name} · {m.lastActive}
                  </p>
                </div>
              </button>
          )}
          </Card>
        }

        <InlineAlert
          tone="info"
          title="One person can hold several roles"
          body="In a small company the owner is often also purchasing and accounting. Roles stack — permissions are the union of them all." />
        

        <section>
          <SectionHeader title="Permission matrix" hint="What each role can do" />
          <Card className="overflow-hidden">
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60">
                    <th className="sticky left-0 bg-ink-50 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                      Capability
                    </th>
                    {ROLE_ORDER.map((r) =>
                    <th key={r} className="px-2.5 py-2.5 text-center text-[11px] font-bold text-ink-500">
                        {ROLES[r].short}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[
                  ['Business overview', 'business.overview'],
                  ['Create project', 'project.create'],
                  ['Upload plans', 'plans.upload'],
                  ['Approve takeoff', 'takeoff.approve'],
                  ['Manage requests', 'request.manage'],
                  ['Manage quotes', 'quote.manage'],
                  ['Approve proposal', 'proposal.approve'],
                  ['Verify delivery', 'delivery.verify'],
                  ['Manage invoices', 'invoice.manage'],
                  ['Manage payments', 'payment.manage'],
                  ['Manage team', 'team.manage']].
                  map(([label, permission]) =>
                  <tr key={label} className="border-b border-ink-100 last:border-0">
                      <td className="sticky left-0 bg-white px-3 py-2.5 font-semibold text-ink-800">{label}</td>
                      {ROLE_ORDER.map((r) => {
                      const has = ROLES[r].permissions.includes(permission as never);
                      return (
                        <td key={r} className="px-2.5 py-2.5 text-center">
                            {has ?
                          <ShieldCheckIcon className="mx-auto h-4 w-4 text-positive-600" /> :

                          <span className="text-ink-200">—</span>
                          }
                          </td>);

                    })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>

      <BottomSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.name}'s roles` : ''}
        description="Roles decide which modules and actions this person sees."
        footer={
        <Button
          block
          size="lg"
          disabled={draftRoles.length === 0}
          onClick={() => {
            if (!editing) return;
            setMembers((prev) =>
            prev.map((m) => m.id === editing.id ? { ...m, roles: draftRoles } : m)
            );
            toast({
              tone: 'success',
              title: `${editing.name}'s roles updated`,
              body: draftRoles.map((r) => ROLES[r].short).join(', ')
            });
            setEditing(null);
          }}>
          
            Save roles
          </Button>
        }>
        
        <div className="space-y-2">
          {ROLE_ORDER.map((role) => {
            const on = draftRoles.includes(role);
            return (
              <button
                key={role}
                onClick={() =>
                setDraftRoles((prev) => on ? prev.filter((r) => r !== role) : [...prev, role])
                }
                className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-150 ease-smooth ${
                on ? 'border-brand-500 bg-brand-50/50' : 'border-ink-100 hover:bg-ink-50'}`
                }>
                
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold text-ink-900">{ROLES[role].label}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-400">{ROLES[role].focus}</span>
                </span>
                <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${on ? 'border-brand-500 bg-brand-500' : 'border-ink-300'}`} />
              </button>);

          })}
        </div>
        {editing?.status === 'invited' &&
        <div className="mt-4">
            <InlineAlert
            tone="warning"
            title="Invite pending"
            body="This person has not accepted their invite yet."
            action="Resend invite"
            onAction={() =>
            toast({
              tone: 'success',
              title: 'Invite resent',
              body: `A new invite is on its way to ${editing.email}.`
            })
            } />
          
          </div>
        }
      </BottomSheet>

      <BottomSheet
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        footer={
        <Button
          block
          size="lg"
          disabled={!inviteEmail.trim() || !inviteName.trim()}
          onClick={() => {
            setMembers((prev) => [
            ...prev,
            {
              id: `tm-${Date.now()}`,
              name: inviteName.trim(),
              email: inviteEmail.trim(),
              roles: ['superintendent'],
              branchId: organization.branches[0].id,
              status: 'invited',
              lastActive: 'Invited just now'
            }]
            );
            toast({
              tone: 'success',
              title: `Invite sent to ${inviteName.trim()}`,
              body: 'They start with project view only until you assign more roles.'
            });
            setInviteEmail('');
            setInviteName('');
            setInviteOpen(false);
          }}>
          
            Send invite
          </Button>
        }>
        
        <div className="space-y-3">
          <Input
            label="Work email"
            placeholder="name@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)} />
          
          <Input
            label="Full name"
            placeholder="Jamie Rivera"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)} />
          
          <p className="text-[12.5px] text-ink-500">
            You can assign roles now or after they accept. New members default to project view only.
          </p>
        </div>
      </BottomSheet>
    </div>);

}