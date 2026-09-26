import React from 'react';
import { ChevronLeftIcon, Layers3Icon, ScanSearchIcon, TruckIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { IMAGES } from '../../data/images';

const HERO = IMAGES.blueprint;

const PILLARS = [
{
  icon: ScanSearchIcon,
  title: 'Traceable AI takeoffs',
  body: 'Every quantity links back to its sheet, page and confidence.'
},
{
  icon: Layers3Icon,
  title: 'One connected workspace',
  body: 'Projects, purchasing, field updates and finance stay together.'
},
{
  icon: TruckIcon,
  title: 'Procurement to payment',
  body: 'Quotes, orders, deliveries and invoices stay connected.'
}];


/**
 * Full-page web auth layout. The brand panel is pinned to the viewport and the
 * form column reserves a fixed content height, so nothing shifts vertically as
 * the user moves between onboarding steps with different amounts of content.
 */
export function AuthLayout({
  step,
  totalSteps,
  eyebrow,
  title,
  body,
  children,
  footer,
  onBack









}: {step?: number;totalSteps?: number;eyebrow?: string;title: string;body?: string;children: React.ReactNode;footer?: React.ReactNode;onBack?: () => void;}) {
  const stepped = typeof step === 'number' && typeof totalSteps === 'number';

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hairline-grid sticky top-0 hidden h-screen w-[42%] max-w-[560px] shrink-0 flex-col justify-between overflow-hidden bg-ink-900 p-10 lg:flex">
        <img src={HERO} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative">
          <Logo size="md" inverted />
        </div>
        <div className="relative">
          <h2 className="display-tight max-w-[420px] text-[32px] font-extrabold leading-[1.1] text-white">
            From drawings to delivered materials — in one system.
          </h2>
          <ul className="mt-8 space-y-4">
            {PILLARS.map(({ icon: Icon, title: t, body: b }) =>
            <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-500">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-white">{t}</span>
                  <span className="block text-[12.5px] leading-snug text-white/50">{b}</span>
                </span>
              </li>
            )}
          </ul>
        </div>
        <p className="relative text-[11.5px] text-white/35">
          SM PRO · AI-powered construction procurement &amp; project management
        </p>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center gap-3 px-6 lg:px-12">
          {onBack ?
          <button
            onClick={onBack}
            className="-ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-[13px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
            
              <ChevronLeftIcon className="h-4 w-4" />
              Back
            </button> :

          <span className="lg:hidden">
              <Logo size="sm" />
            </span>
          }
          {stepped &&
          <span className="ml-auto text-[12.5px] font-semibold text-ink-400">
              Step {step} of {totalSteps}
            </span>
          }
        </div>

        <div className="flex flex-1 justify-center px-6 pb-10 lg:px-12">
          <div className="flex w-full max-w-[440px] flex-col">
            {/* Fixed-height intro block keeps the form fields at the same y-position on every step. */}
            <div className="flex min-h-[168px] shrink-0 flex-col justify-end pb-1">
              {stepped &&
              <div className="mb-7 flex gap-1.5">
                  {Array.from({ length: totalSteps as number }).map((_, i) =>
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-200 ease-smooth ${
                  i < (step as number) ? 'bg-brand-500' : 'bg-ink-100'}`
                  } />

                )}
                </div>
              }
              {eyebrow && <p className="mb-2 text-[12px] font-bold text-brand-600">{eyebrow}</p>}
              <h1 className="display-tight text-[28px] font-extrabold leading-[1.15] text-ink-900">{title}</h1>
              {body && <p className="mt-2.5 text-[14px] leading-relaxed text-ink-500">{body}</p>}
            </div>

            <div className="mt-7 min-w-0 flex-1">{children}</div>

            {footer && <div className="mt-8 shrink-0 border-t border-ink-100 pt-5">{footer}</div>}
          </div>
        </div>
      </div>
    </div>);

}
