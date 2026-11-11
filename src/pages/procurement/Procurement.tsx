import { useNavigate } from 'react-router-dom';
import { LayersIcon, PlusIcon, QuoteIcon, ShoppingCartIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/Card';
import { Measured, Panel, TitleBlock } from '../../components/smpro/Primitives';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/Feedback';
import { OrderRow, QuoteRow, RequestRow, TakeoffRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { useUrlTab } from '../../hooks/useUrlTab';
import { currency } from '../../utils/format';

export function Procurement() {
  const navigate = useNavigate();
  const { requests, quotes, orders, takeoffs, can } = useApp();
  const [tab, setTab] = useUrlTab(['requests', 'takeoffs', 'quotes', 'orders'] as const, 'requests');

  const openRequests = requests.filter((r) => r.status !== 'Ordered');
  const liveQuotes = quotes.filter((q) => q.status === 'Received' || q.status === 'Pending');
  const approvedTakeoffs = takeoffs.filter((t) => t.status === 'Approved');
  const openOrders = orders.filter((o) => o.status !== 'Closed');
  const committed = openOrders.reduce((sum, o) => sum + o.total, 0);

  const tabs = [
  { value: 'requests', label: 'Requests', count: openRequests.length },
  { value: 'takeoffs', label: 'Approved takeoffs', count: approvedTakeoffs.length },
  { value: 'quotes', label: 'Quotes', count: liveQuotes.length },
  { value: 'orders', label: 'Orders', count: openOrders.length }];


  return (
    <div>
      <PageHeader
        back={false}
        title="Procurement"
        subtitle="Requests → quotes → orders"
        action={
        can('request.create') || can('request.manage') ?
        <Button size="sm" onClick={() => navigate('/procurement/requests/new')} icon={<PlusIcon className="h-4 w-4" />}>
              New
            </Button> :
        undefined
        } />
      

      {/* Procurement pipeline — volume sitting at each stage of the buy, so a
           purchasing manager sees where work is piling up before opening a tab. */}
      <Panel className="overflow-hidden">
        <TitleBlock
          label="Procurement pipeline"
          reference={`${currency(committed, { compact: true })} committed`} />
        
        <ol className="flex divide-x divide-ink-100 overflow-x-auto no-scrollbar">
          {[
          { stage: 'Approved takeoffs', value: approvedTakeoffs.length, note: 'Ready to requisition' },
          { stage: 'Material requirements', value: openRequests.length, note: 'Awaiting pricing' },
          { stage: 'Supplier quotes', value: liveQuotes.length, note: 'Awaiting decision' },
          { stage: 'Purchase orders', value: openOrders.length, note: 'Placed, not closed' }].
          map((s, i, all) =>
          <li key={s.stage} className="relative min-w-[176px] flex-1 px-4 py-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="measure flex h-[18px] w-[18px] items-center justify-center rounded-[2px] bg-ink-900 text-[9.5px] font-bold text-white">
                  {i + 1}
                </span>
                {i < all.length - 1 && <span className="h-px flex-1 bg-ink-200" aria-hidden />}
              </div>
              <Measured
              label={s.stage}
              value={String(s.value)}
              note={s.note}
              size="md"
              tone={s.value === 0 ? 'muted' : i === 2 && s.value > 0 ? 'brand' : 'default'} />
            
            </li>
          )}
        </ol>
      </Panel>

      <div className="sticky top-16 z-20 mt-5 border border-ink-100 bg-white">
        <Tabs tabs={tabs} value={tab} onChange={setTab} className="border-b-0" />
      </div>

      <div className="pt-6">
        {tab === 'requests' && (
        openRequests.length === 0 ?
        <EmptyState icon={<LayersIcon className="h-5 w-5" />} title="No open requests" body="Material requests raised from approved takeoffs will land here." /> :

        <Card className="divide-y divide-ink-100">
              {openRequests.map((r) =>
          <RequestRow key={r.id} request={r} showProject />
          )}
            </Card>)
        }

        {tab === 'takeoffs' && (
        approvedTakeoffs.length === 0 ?
        <EmptyState icon={<LayersIcon className="h-5 w-5" />} title="No approved takeoffs" body="Approved AI takeoffs are ready to convert into a material request." /> :

        <Card className="divide-y divide-ink-100">
              {approvedTakeoffs.map((t) =>
          <TakeoffRow key={t.id} takeoff={t} />
          )}
            </Card>)
        }

        {tab === 'quotes' && (
        liveQuotes.length === 0 ?
        <EmptyState icon={<QuoteIcon className="h-5 w-5" />} title="No supplier quotes" body="Send a request for pricing and quotes will appear here as suppliers respond." /> :

        <div className="space-y-4">
              {Array.from(new Set(liveQuotes.map((q) => q.requestId))).map((requestId) => {
            const group = liveQuotes.filter((q) => q.requestId === requestId);
            return (
              <div key={requestId}>
                    <div className="mb-2 flex items-end justify-between px-1">
                      <p className="text-[13px] font-bold text-ink-900">{requestId}</p>
                      {group.filter((q) => q.status === 'Received').length > 1 && can('quote.manage') &&
                  <button
                    onClick={() => navigate(`/procurement/requests/${requestId}/compare`)}
                    className="text-[12.5px] font-bold text-brand-600">
                    
                          Compare {group.filter((q) => q.status === 'Received').length}
                        </button>
                  }
                    </div>
                    <Card className="divide-y divide-ink-100">
                      {group.map((q) =>
                  <QuoteRow
                    key={q.id}
                    quote={q}
                    onClick={
                    q.status === 'Received' ?
                    () => navigate(`/procurement/requests/${q.requestId}/compare`) :
                    undefined
                    } />

                  )}
                    </Card>
                  </div>);

          })}
            </div>)
        }

        {tab === 'orders' && (
        openOrders.length === 0 ?
        <EmptyState icon={<ShoppingCartIcon className="h-5 w-5" />} title="No open orders" body="Approved proposals become purchase orders and show up here." /> :

        <Card className="divide-y divide-ink-100">
              {openOrders.map((o) =>
          <OrderRow key={o.id} order={o} showProject />
          )}
            </Card>)
        }
      </div>
    </div>);

}