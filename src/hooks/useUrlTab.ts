import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Tab state mirrored to the `?tab=` query parameter so a tab can be linked to,
 * bookmarked and restored with the browser's back button. Unknown values fall
 * back to the default.
 */
export function useUrlTab<T extends string>(allowed: readonly T[], fallback: T) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  const setTab = useCallback(
    (next: string) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next === fallback) out.delete('tab');else
          out.set('tab', next);
          return out;
        },
        { replace: true }
      );
    },
    [fallback, setParams]
  );

  return [tab, setTab] as const;
}
