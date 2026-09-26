import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { useAdmin } from '../../contexts/AdminContext';
import { IMAGES } from '../../data/images';

type Step = 'credentials' | 'verification' | 'access';

const STEPS: {id: Step;label: string;heading: string;}[] = [
{ id: 'credentials', label: 'Credentials', heading: 'Sign in to platform administration' },
{ id: 'verification', label: 'Verification', heading: 'Verify with your hardware key' },
{ id: 'access', label: 'Access review', heading: 'Review this platform session' }];


/**
 * Platform administration sign-in. Structurally identical to the builder and
 * supplier flows — pinned brand panel, named step ribbon, one heading per step —
 * so the only thing that reads differently is what the account governs.
 */
export function AdminAuth() {
  const navigate = useNavigate();
  const { signIn, admin } = useAdmin();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('hasnain@smpro.build');
  const [password, setPassword] = useState('••••••••••••');
  /* Demo build: the platform account and its key code are pre-filled, so every
     step advances on a single click. */
  const [code, setCode] = useState(['3', '9', '0', '5', '7', '2']);
  const [pending, setPending] = useState(false);

  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const index = STEPS.findIndex((s) => s.id === step);

  const enter = () => {
    setPending(true);
    timer.current = window.setTimeout(() => {
      signIn();
      navigate('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel — pinned, so the form column never shifts between steps. */}
      <aside className="relative hidden w-[42%] max-w-[520px] shrink-0 overflow-hidden bg-ink-900 lg:block">
        <img src={IMAGES.aiAnalysis} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-ink-900/70" />
        <div className="relative flex h-full flex-col justify-between p-9">
          <div>
            <Logo size="md" inverted />
            <p className="spec-label mt-3 text-caution-500">Platform administration</p>
          </div>
          <div>
            <h2 className="display-tight text-[26px] font-bold leading-tight text-white">
              Govern every organization on SM PRO — without working inside any of them.
            </h2>
            <ul className="mt-6 space-y-2.5">
              {[
              'Tenancy, licensing and feature entitlements',
              'AI configuration, model runs and integrations',
              'System health, support access, security and audit'].
              map((line) =>
              <li key={line} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/70">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caution-500" strokeWidth={3} />
                  {line}
                </li>
              )}
            </ul>
          </div>
          <p className="measure text-[10.5px] text-white/40">
            NOT A MEMBER OF ANY BUILDER OR SUPPLIER ORGANIZATION
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 items-start justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          {/* Fixed-height intro block keeps every step's first field on one line. */}
          <div className="mt-6 flex min-h-[124px] flex-col justify-end lg:mt-0">
            <StepRibbon current={index} />
            <h1 className="display-tight mt-4 text-[24px] font-bold leading-tight text-ink-900">
              {STEPS[index].heading}
            </h1>
          </div>

          <div className="mt-6">
            {step === 'credentials' &&
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep('verification');
              }}
              className="space-y-4">
              
                <Input
                label="Platform email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" />
              
                <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" />
              
                <InlineAlert
                tone="info"
                title="Demo account ready"
                body={`${admin.name} holds the platform administrator credential. It is pre-filled — just continue.`} />
              
                <Button type="submit" size="lg" block icon={<ArrowRightIcon className="h-4 w-4" />}>
                  Continue
                </Button>
                <p className="text-center text-[12.5px] text-ink-400">
                  Not a platform administrator?{' '}
                  <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="font-semibold text-brand-600">
                  
                    Return to account sign in
                  </button>
                </p>
              </form>
            }

            {step === 'verification' &&
            <div>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  Enter the six-digit code from the hardware key registered to{' '}
                  <span className="font-bold text-ink-800">{email}</span>. Platform accounts cannot fall back
                  to SMS.
                </p>
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {code.map((digit, i) =>
                <input
                  key={i}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) =>
                  setCode((prev) =>
                  prev.map((c, idx) => idx === i ? e.target.value.replace(/\D/g, '') : c)
                  )
                  }
                  className="measure h-12 w-full min-w-0 rounded-[3px] border border-ink-200 bg-white text-center text-[17px] font-semibold text-ink-900 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />

                )}
                </div>
                <div className="mt-5 flex gap-2.5">
                  <Button variant="secondary" onClick={() => setStep('credentials')}>
                    Back
                  </Button>
                  <Button className="flex-1" size="lg" onClick={() => setStep('access')}>
                    Verify
                  </Button>
                </div>
              </div>
            }

            {step === 'access' &&
            <div>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  These checks pass before a platform session opens. The session itself is recorded, and so is
                  every governing action taken during it.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                'Device recognised — registered 14 Feb 2026',
                'Network within the platform allow-list',
                'No open security events on this account',
                'Session and every action written to the audit log'].
                map((c) =>
                <li
                  key={c}
                  className="flex items-start gap-2.5 rounded-[3px] border border-ink-200 bg-white px-3.5 py-2.5">
                  
                      <CheckIcon className="mt-[2px] h-4 w-4 shrink-0 text-positive-600" strokeWidth={3} />
                      <span className="text-[12.5px] leading-snug text-ink-700">{c}</span>
                    </li>
                )}
                </ul>
                <div className="mt-5 flex gap-2.5">
                  <Button variant="secondary" onClick={() => setStep('verification')}>
                    Back
                  </Button>
                  <Button
                  className="flex-1"
                  size="lg"
                  loading={pending}
                  onClick={enter}
                  icon={<ShieldCheckIcon className="h-4 w-4" />}>
                  
                    Enter Super Admin
                  </Button>
                </div>
              </div>
            }
          </div>

          <div className="mt-6">
            <InlineAlert
              tone="warning"
              title="This is not a tenant account"
              body="Builder and supplier administrators manage their own organization. Platform administration governs the platform they both run on." />
            
          </div>
        </div>
      </main>
    </div>);

}

/** Named step ribbon — each step is labelled, so nothing relies on a number. */
function StepRibbon({ current }: {current: number;}) {
  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.id} className="flex items-center">
            <span
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-2">
              
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                done ?
                'border-brand-500 bg-brand-500 text-white' :
                active ?
                'border-brand-500 bg-white' :
                'border-ink-200 bg-white'}`
                }>
                
                {done ?
                <CheckIcon className="h-3 w-3" strokeWidth={3} /> :

                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-brand-500' : 'bg-ink-200'}`} />
                }
              </span>
              <span
                className={`text-[12.5px] ${
                active ? 'font-semibold text-ink-900' : done ? 'font-medium text-ink-600' : 'text-ink-400'}`
                }>
                
                {s.label}
              </span>
            </span>
            {i < STEPS.length - 1 &&
            <span aria-hidden="true" className="mx-2.5 h-px w-6 bg-ink-200 sm:w-8" />
            }
          </li>);

      })}
    </ol>);

}
