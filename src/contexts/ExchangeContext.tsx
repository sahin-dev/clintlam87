import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ExchangeEvent } from '../data/interop';

/**
 * The integration layer between the two organizations.
 *
 * Neither platform reads the other's state. They publish business events onto
 * this channel and subscribe to the ones addressed to them, exactly as two
 * separate systems would exchange documents. The ledger is kept so the
 * handoff is inspectable from either side.
 */

export interface LedgerEntry extends Record<string, unknown> {
  id: number;
  event: ExchangeEvent;
}

interface ExchangeState {
  publish: (event: ExchangeEvent) => void;
  /** Returns an unsubscribe function. Handlers only see the other side's events. */
  subscribe: (audience: 'builder' | 'supplier', handler: (event: ExchangeEvent) => void) => () => void;
  ledger: LedgerEntry[];
}

const ExchangeContext = createContext<ExchangeState | null>(null);

export function ExchangeProvider({ children }: {children: React.ReactNode;}) {
  const builderHandlers = useRef(new Set<(e: ExchangeEvent) => void>());
  const supplierHandlers = useRef(new Set<(e: ExchangeEvent) => void>());
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const seq = useRef(0);

  const subscribe = useCallback<ExchangeState['subscribe']>((audience, handler) => {
    const set = audience === 'builder' ? builderHandlers.current : supplierHandlers.current;
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }, []);

  const publish = useCallback<ExchangeState['publish']>((event) => {
    seq.current += 1;
    setLedger((prev) => [{ id: seq.current, event }, ...prev].slice(0, 60));

    /* An event published by one side is only ever delivered to the other, so
       applying an inbound event can never loop back to its publisher. */
    const audience = event.origin === 'builder' ? supplierHandlers.current : builderHandlers.current;
    audience.forEach((handler) => handler(event));
  }, []);

  return (
    <ExchangeContext.Provider value={{ publish, subscribe, ledger }}>{children}</ExchangeContext.Provider>);

}

export function useExchange(): ExchangeState {
  const ctx = useContext(ExchangeContext);
  if (!ctx) throw new Error('useExchange must be used inside ExchangeProvider');
  return ctx;
}

/** Subscribes for the lifetime of the component. */
export function useExchangeSubscription(
audience: 'builder' | 'supplier',
handler: (event: ExchangeEvent) => void)
{
  const { subscribe } = useExchange();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => subscribe(audience, (e) => ref.current(e)), [subscribe, audience]);
}