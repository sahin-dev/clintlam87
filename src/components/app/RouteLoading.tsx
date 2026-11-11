import { ComponentType, lazy, Suspense, ReactNode } from 'react';

/**
 * Lazily load one named export from a route module, so each screen ships in
 * its own chunk instead of one monolithic bundle.
 */
export function lazyPage<M, K extends keyof M>(loader: () => Promise<M>, name: K) {
  type Props = M[K] extends ComponentType<infer P> ? P : never;
  return lazy(async () => ({ default: (await loader())[name] as ComponentType<Props> }));
}

/** Quiet placeholder shown while a route chunk downloads. */
export function RouteFallback({ fullScreen }: {fullScreen?: boolean;}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[50vh]'}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
      <span className="sr-only">Loading</span>
    </div>);

}

export function RouteSuspense({ children, fullScreen }: {children: ReactNode;fullScreen?: boolean;}) {
  return <Suspense fallback={<RouteFallback fullScreen={fullScreen} />}>{children}</Suspense>;
}
