import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquareIcon, ScaleIcon, SendIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, DataRow, SectionHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { MaterialLineRow, QuoteRow } from '../../components/common/Rows';
import { PipelineTrail, TrailStage } from '../../components/common/PipelineTrail';
import { useApp } from '../../contexts/AppContext';
import { projectName } from '../../data/projects';
import { RequestStatus } from '../../types';

const FLOW: RequestStatus[] = ['Draft', 'Submitted', 'Under Review', 'Pricing', 'Quote Received', 'Approved', 'Ordered'];

export function RequestDetail() {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const request = app.requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Request not found" body="It may have been withdrawn by the requester." action="Back" onAction={() => navigate(-1)} />
      </div>);

  }

  const quotes = app.quotes.filter((q) => q.requestId === request.id);
  const received = quotes.filter((q) => q.status === 'Received');
  const currentIndex = FLOW.indexOf(request.status);
  const stages: TrailStage[] = FLOW.map((status, i) => ({
    label: status,
    detail:
    i === currentIndex ?
    status === 'Quote Received' ?
    `${received.length} supplier quotes in` :
    'Current stage' :
    undefined,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo'
  }));

  return (
    <div className="detail-column">
      <PageHeader
        back
        backLabel="Procurement"
        title={request.id}
        subtitle={`${projectName(request.projectId)} · ${request.lines.length} lines`}
        action={<StatusBadge status={request.status} />} />
      

      <div className="space-y-6">
        <Card className="px-4 py-1">
          <dl className="divide-y divide-ink-100">
            <DataRow label="Requested by" value={request.requestedBy} />
            <DataRow label="Raised" value={request.requestedAt} />
            <DataRow label="Required on site" value={request.requiredBy} />
            <DataRow label="Priority" value={<StatusBadge status={request.priority} dot={false} />} />
            <DataRow label="Source takeoff" value={request.takeoffId ?? 'Manual request'} />
          </dl>
        </Card>

        {request.notes &&
        <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Notes from the requester</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">{request.notes}</p>
          </Card>
        }

        <section>
          <SectionHeader title="Materials" hint="Quantities carried from the approved takeoff" />
          <Card className="divide-y divide-ink-100">
            {request.lines.map((line) =>
            <MaterialLineRow key={line.item} item={line.item} quantity={line.qty} unit={line.unit} />
            )}
          </Card>
        </section>

        <section>
          <SectionHeader title="Status" />
          <Card className="p-4">
            <PipelineTrail stages={stages} />
          </Card>
        </section>

        {quotes.length > 0 &&
        <section>
            <SectionHeader title="Supplier quotes" hint={`${received.length} received of ${quotes.length} requested`} />
            <Card className="divide-y divide-ink-100">
              {quotes.map((q) =>
            <QuoteRow
              key={q.id}
              quote={q}
              onClick={q.status !== 'Pending' ? () => navigate(`/procurement/requests/${request.id}/compare`) : undefined} />

            )}
            </Card>
            <InlineAlert
            tone="info"
            title="Supplier pricing stays private"
            body="Each supplier only ever sees their own quote — never a competitor's price, terms or lead time." />
          
          </section>
        }

        {app.can('request.manage') ?
        <div className="space-y-2.5">
            {received.length > 1 &&
          <Button block size="lg" onClick={() => navigate(`/procurement/requests/${request.id}/compare`)} icon={<ScaleIcon className="h-4 w-4" />}>
                Compare {received.length} quotes
              </Button>
          }
            {(request.status === 'Submitted' || request.status === 'Under Review') &&
          <Button
            block
            size="lg"
            variant="secondary"
            icon={<SendIcon className="h-4 w-4" />}
            onClick={() => {
              app.sendForPricing(request.id);
              app.toast({
                tone: 'success',
                title: 'Sent for pricing',
                body: 'The approved quantities are now an RFQ in the yard’s inbox.'
              });
            }}>
            
                Send for pricing
              </Button>
          }
            <Button block variant="ghost" onClick={() => navigate('/messages')} icon={<MessageSquareIcon className="h-4 w-4" />}>
              Request clarification from the requester
            </Button>
          </div> :

        <InlineAlert
          tone="info"
          title="Purchasing owns the next step"
          body="You can follow this request; pricing and supplier selection are handled by the purchasing manager." />

        }
      </div>
    </div>);

}