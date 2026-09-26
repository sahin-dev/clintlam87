import React, { useState } from 'react';
import { TruckIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, Metric } from '../../components/ui/Card';
import { SegmentedControl } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Feedback';
import { DeliveryRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';

type Filter = 'today' | 'upcoming' | 'issues' | 'completed';

export function Deliveries() {
  const { deliveries } = useApp();
  const [filter, setFilter] = useState<Filter>('today');

  const list = deliveries.filter((d) => {
    if (filter === 'today') return d.status === 'Out for Delivery' || d.date === 'Aug 20, 2026';
    if (filter === 'upcoming') return d.status === 'Scheduled';
    if (filter === 'issues') return d.status === 'Delayed' || d.status === 'Cancelled';
    return d.status === 'Delivered';
  });

  return (
    <div>
      <PageHeader back={false} title="Deliveries" subtitle="Tracking, receiving and proof of delivery" />
      <div>
        <Card className="grid grid-cols-3 gap-6 p-5">
          <Metric label="Today" value={String(deliveries.filter((d) => d.status === 'Out for Delivery').length)} />
          <Metric label="Scheduled" value={String(deliveries.filter((d) => d.status === 'Scheduled').length)} />
          <Metric
            label="Delayed"
            value={String(deliveries.filter((d) => d.status === 'Delayed').length)}
            tone="alert" />
          
        </Card>
      </div>
      <div className="my-5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'today', label: 'Today' },
          { value: 'upcoming', label: 'Scheduled' },
          { value: 'issues', label: 'Delayed' },
          { value: 'completed', label: 'Delivered' }]
          } />
        
      </div>
      <div>
        {list.length === 0 ?
        <EmptyState
          icon={<TruckIcon className="h-5 w-5" />}
          title="Nothing here right now"
          body="Deliveries appear once a supplier schedules a confirmed order." /> :


        <Card className="divide-y divide-ink-100">
            {list.map((d) =>
          <DeliveryRow key={d.id} delivery={d} showProject />
          )}
          </Card>
        }
      </div>
    </div>);

}