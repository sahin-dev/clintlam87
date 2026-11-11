import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheckIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, SectionHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { BottomSheet } from '../components/ui/Sheet';
import { EmptyState, InlineAlert } from '../components/ui/Feedback';
import { TextArea } from '../components/ui/Field';
import { useApp } from '../contexts/AppContext';
import { currency } from '../utils/format';
import { projectName } from '../data/projects';
import { memberName } from '../data/organization';
import { Approval } from '../types';

export function Approvals() {
  const navigate = useNavigate();
  const app = useApp();
  const [changesFor, setChangesFor] = useState<Approval | null>(null);
  const [note, setNote] = useState('');

  const mine = app.approvals.filter((a) => app.can(a.requiredPermission));
  const pending = mine.filter((a) => a.status === 'pending');
  const resolved = mine.filter((a) => a.status !== 'pending');
  const totalValue = pending.reduce((s, a) => s + (a.amount ?? 0), 0);

  const open = (a: Approval) => {
    if (a.type === 'Proposal' || a.type === 'Change Order') navigate(`/orders/${a.refId}`);else
    if (a.type === 'Takeoff') navigate(`/takeoff/${a.refId}`);else
    if (a.type === 'Material Request') navigate(`/procurement/requests/${a.refId}`);else
    navigate(`/accounting/invoices/${a.refId}`);
  };

  return (
    <div>
      <PageHeader
        back={false}
        title="Approvals"
        subtitle={`${pending.length} waiting · ${currency(totalValue, { compact: true })} in play`} />
      

      <div className="space-y-6">
        {pending.length === 0 ?
        <EmptyState
          icon={<ClipboardCheckIcon className="h-5 w-5" />}
          title="Nothing waiting on you"
          body="Proposals, takeoffs and invoices that need your sign-off will appear here." /> :


        <ul className="space-y-3">
            {pending.map((a) =>
          <li key={a.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">
                          {a.type}
                        </span>
                        <StatusBadge status={a.priority} dot={false} />
                      </div>
                      <p className="mt-1 text-[15px] font-bold leading-snug text-ink-900">{a.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-400">
                        {projectName(a.projectId)} · {a.refId}
                      </p>
                    </div>
                    {a.amount !== null &&
                <p className="tabular shrink-0 text-[17px] font-extrabold text-ink-900">
                        {currency(a.amount)}
                      </p>
                }
                  </div>

                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-600">{a.summary}</p>

                  <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                    <Avatar name={memberName(a.requesterId)} size="xs" />
                    <p className="min-w-0 flex-1 truncate text-[11.5px] text-ink-400">
                      {memberName(a.requesterId)} · {a.createdAt}
                    </p>
                    <button onClick={() => open(a)} className="shrink-0 text-[12.5px] font-bold text-brand-600">
                      View details
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    app.resolveApproval(a.id, 'rejected');
                    app.toast({ tone: 'info', title: 'Rejected', body: `${a.refId} was returned as rejected.` });
                  }}>
                  
                      Reject
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setChangesFor(a)}>
                      Changes
                    </Button>
                    <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    app.resolveApproval(a.id, 'approved');
                    /* Approving a proposal releases the order to the yard —
                       it must travel, not just change status locally. */
                    if (a.type === 'Proposal') app.approveOrder(a.refId);
                    if (a.type === 'Invoice') app.setInvoiceStatus(a.refId, 'Approved');
                    app.toast({ tone: 'success', title: 'Approved', body: `${a.refId} moves to the next step.` });
                  }}>
                  
                      Approve
                    </Button>
                  </div>
                </Card>
              </li>
          )}
          </ul>
        }

        <InlineAlert
          tone="info"
          title="You only see what you can act on"
          body="Approvals are filtered by your active role — purchasing sees takeoff approvals, the owner sees spend, accounting sees invoices." />
        

        {resolved.length > 0 &&
        <section>
            <SectionHeader title="Recently decided" />
            <Card className="divide-y divide-ink-100">
              {resolved.map((a) =>
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-ink-900">{a.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-400">
                      {a.refId} · {projectName(a.projectId)}
                    </p>
                  </div>
                  <StatusBadge
                status={
                a.status === 'approved' ? 'Approved' : a.status === 'rejected' ? 'Rejected' : 'Under Review'
                } />
              
                </div>
            )}
            </Card>
          </section>
        }
      </div>

      <BottomSheet
        open={!!changesFor}
        onClose={() => setChangesFor(null)}
        title="Request changes"
        description={changesFor ? `${changesFor.refId} goes back to ${memberName(changesFor.requesterId)}` : ''}
        footer={
        <Button
          block
          size="lg"
          onClick={() => {
            if (changesFor) app.resolveApproval(changesFor.id, 'changes_requested');
            app.toast({ tone: 'info', title: 'Sent back for revision' });
            setChangesFor(null);
            setNote('');
          }}>
          
            Send back
          </Button>
        }>
        
        <TextArea
          label="What needs to change"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Please re-quote with delivery before Aug 24 and confirm plywood availability." />
        
      </BottomSheet>
    </div>);

}