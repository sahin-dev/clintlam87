import { useLocation, useNavigate } from 'react-router-dom';
import { HardHatIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Panel, SpecLabel, TickRule } from '../../components/smpro/Primitives';
import { SUPPLIER_MODULES } from '../../components/supplier/navigation';
import { useSupplier } from '../../contexts/SupplierContext';

/**
 * Placeholder for yard modules that are specified but not built yet, so
 * navigation never dead-ends on a 404 mid-review.
 */
export function SupplierModulePending() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { can } = useSupplier();

  const module = SUPPLIER_MODULES.find((m) => pathname.startsWith(m.path));
  const built = SUPPLIER_MODULES.filter(
    (m) => (!m.permission || can(m.permission)) && m.id !== module?.id
  ).slice(0, 6);

  return (
    <div className="detail-column">
      <PageHeader
        title={module?.label ?? 'Page not found'}
        subtitle={module?.description ?? 'This address does not match a supplier module'} />
      

      <Panel className="overflow-hidden">
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <HardHatIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[18px] font-bold text-ink-900">
            We couldn&apos;t find that page
          </h2>
          <p className="mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-ink-500">
            The link may be out of date, or the record moved to another builder relationship. Every
            module your role can reach is in the sidebar.
          </p>
          <Button className="mt-6" onClick={() => navigate('/supplier/home')}>
            Back to yard home
          </Button>
        </div>
        <TickRule />
        <div className="px-4 py-3.5">
          <SpecLabel>Available now for your role</SpecLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {built.map((m) =>
            <button
              key={m.id}
              onClick={() => navigate(m.path)}
              className="rounded-[2px] border border-ink-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-600 transition-colors duration-150 ease-smooth hover:border-brand-300 hover:text-brand-700">
              
                {m.label}
              </button>
            )}
          </div>
        </div>
      </Panel>
    </div>);

}