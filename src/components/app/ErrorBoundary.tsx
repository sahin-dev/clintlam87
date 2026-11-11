import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence: an uncaught render error shows a recoverable screen
 * instead of a blank page. Wire `reportError` to your monitoring provider
 * (Sentry, Datadog, …) when one is configured.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    /* A stale deploy leaves old chunk URLs behind; a reload picks up the new build. */
    const staleChunk = /Loading chunk|dynamically imported module|Importing a module script failed/i.test(
      error.message
    );

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="w-full max-w-[420px] rounded-[4px] border border-ink-100 bg-white p-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[4px] bg-danger-50 text-danger-600">
            <AlertTriangleIcon className="h-5 w-5" aria-hidden />
          </div>
          <h1 className="mt-4 text-[17px] text-ink-900">
            {staleChunk ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            {staleChunk ?
            'SM PRO was updated while this tab was open. Reload to continue.' :
            'An unexpected error stopped this screen from loading. Your work has not been lost — reload to try again.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="h-10 rounded-[3px] bg-brand-500 px-4 text-[13.5px] font-semibold text-white hover:bg-brand-600">
              Reload
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="h-10 rounded-[3px] border border-ink-200 bg-white px-4 text-[13.5px] font-semibold text-ink-800 hover:bg-ink-50">
              Go to start
            </button>
          </div>
          {import.meta.env.DEV &&
          <pre className="mt-6 max-h-40 overflow-auto rounded-[3px] bg-ink-50 p-3 text-left text-[11px] text-danger-700">
              {error.message}
            </pre>
          }
        </div>
      </div>);

  }
}

function reportError(error: Error, info: ErrorInfo) {
  if (import.meta.env.DEV) {
    console.error(error, info.componentStack);
  }
}
