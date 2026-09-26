import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BuildingIcon,
  CheckIcon,
  ChevronRightIcon,
  LogOutIcon,
  ShieldIcon,
  UsersIcon } from
'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, DataRow, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Sheet';
import { useApp } from '../contexts/AppContext';
import { ROLES } from '../utils/rbac';

export function Profile() {
  const navigate = useNavigate();
  const app = useApp();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const branch = app.organization.branches.find((b) => b.id === app.branchId)!;

  return (
    <div className="detail-column">
      <PageHeader back={false} title="Profile & settings" />

      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={app.user.name} size="lg" tone="brand" />
            <div className="min-w-0">
              <p className="display-tight truncate text-[18px] font-bold text-ink-900">{app.user.name}</p>
              <p className="truncate text-[12.5px] text-ink-400">{app.user.email}</p>
              <p className="mt-1 text-[12px] font-semibold text-ink-600">
                {app.organization.name} · {branch.name}
              </p>
            </div>
          </div>
        </Card>

        <section>
          <SectionHeader title="Your roles" hint="Switch the lens applied to the app" />
          <Card className="divide-y divide-ink-100">
            {app.userRoles.map((role) => {
              const active = role === app.activeRole;
              return (
                <button
                  key={role}
                  onClick={() => {
                    app.setActiveRole(role);
                    app.toast({ tone: 'info', title: `Viewing as ${ROLES[role].short}`, body: 'Navigation and actions updated.' });
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
                  
                  <ShieldIcon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-ink-300'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-bold text-ink-900">{ROLES[role].label}</p>
                      {active && <Badge tone="brand" dot={false}>Active</Badge>}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-ink-400">{ROLES[role].focus}</p>
                    <p className="mt-1 text-[11px] font-semibold text-ink-500">
                      {ROLES[role].permissions.length} permissions
                    </p>
                  </div>
                  {active && <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />}
                </button>);

            })}
          </Card>
        </section>

        <section>
          <SectionHeader title="Organization" />
          <Card className="px-4 py-1">
            <dl className="divide-y divide-ink-100">
              <DataRow label="Company" value={app.organization.name} />
              <DataRow label="Type" value={app.organization.type} />
              <DataRow label="Address" value={app.organization.address} />
              <DataRow label="Phone" value={app.organization.phone} />
              <DataRow label="Website" value={app.organization.website} />
            </dl>
          </Card>
        </section>

        <section>
          <SectionHeader title="Branch scope" />
          <Card className="divide-y divide-ink-100">
            {app.organization.branches.map((b) =>
            <button
              key={b.id}
              onClick={() => app.setBranchId(b.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
              
                <BuildingIcon className="h-4 w-4 shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink-900">{b.name}</p>
                  <p className="text-[11.5px] text-ink-400">{b.city}</p>
                </div>
                {b.id === app.branchId && <CheckIcon className="h-4 w-4 text-brand-600" strokeWidth={3} />}
              </button>
            )}
          </Card>
        </section>

        <Card className="divide-y divide-ink-100">
          {[
          { label: 'Notification preferences', icon: BellIcon, to: '/notifications' },
          { label: 'Team & roles', icon: UsersIcon, to: '/team' },
          { label: 'Documents & records', icon: BuildingIcon, to: '/documents' }].
          map(({ label, icon: Icon, to }) =>
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
            
              <Icon className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="flex-1 text-[13.5px] font-semibold text-ink-800">{label}</span>
              <ChevronRightIcon className="h-4 w-4 text-ink-300" />
            </button>
          )}
        </Card>

        <Button variant="secondary" block className="text-danger-600" onClick={() => setSignOutOpen(true)} icon={<LogOutIcon className="h-4 w-4" />}>
          Sign out
        </Button>

        <p className="pb-2 text-center text-[11px] text-ink-400">SM PRO · Builder v2.4.1</p>
      </div>

      <Modal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Sign out of SM PRO?"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setSignOutOpen(false)}>
              Stay signed in
            </Button>
            <Button variant="danger" className="flex-1" onClick={app.signOut}>
              Sign out
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-ink-600">
          You will need your email and password to get back in. Any draft takeoff corrections are saved.
        </p>
      </Modal>
    </div>);

}