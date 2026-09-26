import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Input, Checkbox } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { Panel, SpecLabel, TickRule } from '../../components/smpro/Primitives';
import { useSupplier } from '../../contexts/SupplierContext';
import { SUPPLIER_ROLES } from '../../utils/supplierRbac';
import { IMAGES } from '../../data/images';

type Step = 'signin' | 'verify' | 'organization' | 'branch';

const STEPS: {id: Step;label: string;}[] = [
{ id: 'signin', label: 'Sign in' },
{ id: 'verify', label: 'Verification' },
{ id: 'organization', label: 'Organization' },
{ id: 'branch', label: 'Yard scope' }];


/**
 * Supplier sign-in. Kept deliberately short: the yard's people sign in many
 * times a day, so the flow is credentials → 2FA → which organization → which
 * yard, and it resolves the role set before the shell renders.
 */
export function SupplierAuth() {
  const navigate = useNavigate();
  const { org, branches, branchId, setBranchId, signIn, userRoles, activeRole, setActiveRole } = useSupplier();

  const [step, setStep] = useState<Step>('signin');
  const [email, setEmail] = useState('ray@abclumber.com');
  const [password, setPassword] = useState('••••••••••');
  const [remember, setRemember] = useState(true);
  /* Demo build: the yard account and its 2FA code are pre-filled, so every
     step advances on a single click. */
  const [code, setCode] = useState(['7', '1', '4', '2', '6', '9']);

  const index = STEPS.findIndex((s) => s.id === step);

  const submitSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('verify');
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel — pinned, so the form column never shifts between steps. */}
      <aside className="relative hidden w-[42%] max-w-[520px] shrink-0 overflow-hidden bg-ink-900 lg:block">
        <img src={IMAGES.lumberYard} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-ink-900/55" />
        <div className="relative flex h-full flex-col justify-between p-9">
          <div>
            <Logo size="md" inverted />
            <p className="spec-label mt-3 text-brand-400">Supplier / lumber yard</p>
          </div>
          <div>
            <h2 className="display-tight text-[26px] font-bold leading-tight text-white">
              Price the builder&apos;s approved quantities — then fulfil, deliver and bill from the same
              record.
            </h2>
            <ul className="mt-6 space-y-2.5">
              {[
              'Inbound takeoffs arrive with sheet, page and confidence intact',
              'Estimate, map to your SKUs and hold your own margin',
              'Dispatch, capture POD and invoice without re-keying'].
              map((line) =>
              <li key={line} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/70">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={3} />
                  {line}
                </li>
              )}
            </ul>
          </div>
          <p className="measure text-[10.5px] text-white/40">SEPARATE TENANT FROM ANY BUILDER ORGANIZATION</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 items-start justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          {/* Fixed-height intro block keeps every step's first field on one line. */}
          <div className="mt-6 flex h-[124px] flex-col justify-end lg:mt-0">
            <ol className="mb-4 flex items-center gap-1.5">
              {STEPS.map((s, i) =>
              <li
                key={s.id}
                className={`h-[3px] flex-1 rounded-[1px] ${i <= index ? 'bg-brand-500' : 'bg-ink-200'}`}
                aria-current={s.id === step ? 'step' : undefined} />

              )}
            </ol>
            <SpecLabel>{`Step ${index + 1} of ${STEPS.length} · ${STEPS[index].label}`}</SpecLabel>
            <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
              {step === 'signin' && 'Sign in to your yard'}
              {step === 'verify' && 'Verify this sign-in'}
              {step === 'organization' && 'Choose your organization'}
              {step === 'branch' && 'Choose your yard'}
            </h1>
          </div>

          <div className="mt-6">
            {step === 'signin' &&
            <form onSubmit={submitSignIn} className="space-y-4">
                <Input
                label="Work email"
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
                body="Ray Delgado holds Owner/Management, Sales and Estimator at ABC Lumber & Supply. Credentials are pre-filled — just continue." />
              
                <div className="flex items-center justify-between gap-3">
                  <Checkbox checked={remember} onChange={setRemember}>
                    Remember this device
                  </Checkbox>
                  <button type="button" className="text-[13px] font-semibold text-brand-600">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" size="lg" block icon={<ArrowRightIcon className="h-4 w-4" />}>
                  Sign in
                </Button>
                <p className="text-center text-[12.5px] text-ink-400">
                  New yard?{' '}
                  <button
                  type="button"
                  onClick={() => navigate('/create/supplier')}
                  className="font-semibold text-brand-600">
                  
                    Register your organization
                  </button>{' '}
                  ·{' '}
                  <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="font-semibold text-brand-600">
                  
                    Return to account sign in
                  </button>
                </p>
              </form>
            }

            {step === 'verify' &&
            <div>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  We sent a six-digit code to <span className="font-bold text-ink-800">{email}</span>. Codes
                  expire after ten minutes.
                </p>
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {code.map((digit, i) =>
                <input
                  key={i}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => {
                    const next = [...code];
                    next[i] = e.target.value.replace(/\D/g, '');
                    setCode(next);
                  }}
                  className="measure h-12 w-full min-w-0 rounded-[3px] border border-ink-200 bg-white text-center text-[17px] font-bold text-ink-900 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />

                )}
                </div>
                <Button
                size="lg"
                block
                className="mt-5"
                onClick={() => setStep('organization')}
                icon={<ShieldCheckIcon className="h-4 w-4" />}>
                
                  Verify and continue
                </Button>
                <div className="mt-3 flex items-center justify-between">
                  <button
                  onClick={() => setStep('signin')}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500">
                  
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <button className="text-[12.5px] font-semibold text-brand-600">Resend code</button>
                </div>
              </div>
            }

            {step === 'organization' &&
            <div>
                <Panel className="overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="measure flex h-10 w-10 items-center justify-center rounded-[2px] bg-brand-500 text-[12px] font-bold text-white">
                      AB
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-ink-900">{org.name}</p>
                      <p className="text-[12px] text-ink-400">{org.type} · 3 yards</p>
                    </div>
                    <CheckIcon className="ml-auto h-4 w-4 text-brand-600" strokeWidth={3} />
                  </div>
                  <TickRule />
                  <div className="px-4 py-3.5">
                    <SpecLabel>Roles resolved for this account</SpecLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {userRoles.map((r) =>
                    <button
                      key={r}
                      onClick={() => setActiveRole(r)}
                      aria-pressed={activeRole === r}
                      className={`rounded-[2px] border px-2 py-1 text-[11.5px] font-semibold transition-colors duration-150 ease-smooth ${
                      activeRole === r ?
                      'border-brand-500 bg-brand-50 text-brand-700' :
                      'border-ink-200 bg-white text-ink-600 hover:border-ink-300'}`
                      }>
                      
                          {SUPPLIER_ROLES[r].label}
                        </button>
                    )}
                    </div>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-ink-500">
                      You will start in <span className="font-bold text-ink-800">{SUPPLIER_ROLES[activeRole].label}</span>{' '}
                      — {SUPPLIER_ROLES[activeRole].focus.toLowerCase()}. You can change lens at any time.
                    </p>
                  </div>
                </Panel>
                <Button size="lg" block className="mt-5" onClick={() => setStep('branch')}>
                  Continue
                </Button>
              </div>
            }

            {step === 'branch' &&
            <div>
                <ul className="space-y-2">
                  {branches.map((b) =>
                <li key={b.id}>
                      <button
                    onClick={() => setBranchId(b.id)}
                    aria-pressed={branchId === b.id}
                    className={`flex w-full items-center gap-3 rounded-[3px] border px-4 py-3 text-left transition-colors duration-150 ease-smooth ${
                    branchId === b.id ?
                    'border-brand-500 bg-brand-50/60' :
                    'border-ink-200 bg-white hover:border-ink-300'}`
                    }>
                    
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-bold text-ink-900">{b.name}</p>
                          <p className="text-[12px] text-ink-400">
                            {b.city} · {b.yard}
                          </p>
                        </div>
                        {branchId === b.id && <CheckIcon className="h-4 w-4 text-brand-600" strokeWidth={3} />}
                      </button>
                    </li>
                )}
                </ul>
                <Button
                size="lg"
                block
                className="mt-5"
                onClick={() => {
                  signIn();
                  navigate(SUPPLIER_ROLES[activeRole].landing);
                }}
                icon={<ArrowRightIcon className="h-4 w-4" />}>
                
                  Enter supplier platform
                </Button>
                <p className="mt-3 text-center text-[12px] text-ink-400">
                  Yard scope filters customers, orders and loads. Change it any time from the sidebar.
                </p>
              </div>
            }
          </div>
        </div>
      </main>
    </div>);

}
