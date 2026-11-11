import { useState } from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/Card';
import { SearchField, SegmentedControl } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Feedback';
import { OrderRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { currency } from '../../utils/format';
import { supplierName } from '../../data/procurement';
import { projectName } from '../../data/projects';

type Filter = 'all' | 'approval' | 'live' | 'closed';

export function Orders() {
  const { orders } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const list = orders.
  filter((o) => {
    if (filter === 'approval') return o.status === 'Pending Approval';
    if (filter === 'live') return ['Confirmed', 'In Production', 'Dispatched'].includes(o.status);
    if (filter === 'closed') return ['Delivered', 'Closed'].includes(o.status);
    return true;
  }).
  filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      supplierName(o.supplierId).toLowerCase().includes(q) ||
      projectName(o.projectId).toLowerCase().includes(q));

  });

  const committed = list.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <PageHeader
        back={false}
        title="Purchase orders"
        subtitle={`${list.length} orders · ${currency(committed, { compact: true })} committed`} />
      
      <div className="mb-5 space-y-3">
        <div className="max-w-[420px]">
          <SearchField value={query} onChange={setQuery} placeholder="Search order, supplier or project" />
        </div>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'approval', label: 'Awaiting approval' },
          { value: 'live', label: 'In progress' },
          { value: 'closed', label: 'Completed' }]
          } />
        
      </div>
      <div>
        {list.length === 0 ?
        <EmptyState
          icon={<ShoppingCartIcon className="h-5 w-5" />}
          title="No orders here"
          body="Orders appear once a supplier quote is selected and the proposal is approved." /> :


        <Card className="divide-y divide-ink-100">
            {list.map((o) =>
          <OrderRow key={o.id} order={o} showProject />
          )}
          </Card>
        }
      </div>
    </div>);

}