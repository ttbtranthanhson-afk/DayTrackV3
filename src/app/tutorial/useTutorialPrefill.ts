import { useEffect, useRef } from 'react';

export const TUTORIAL_PREFILL_EVENT = 'tutorial:prefill';

export interface TutorialPrefillDetail {
  target: string;
  value: string;
}

/**
 * Lets the tutorial prefill a controlled input through React state instead of
 * mutating the DOM directly (which React can revert on the next render).
 */
export function useTutorialPrefill(target: string, apply: (value: string) => void) {
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<TutorialPrefillDetail>).detail;
      if (detail && detail.target === target) applyRef.current(detail.value);
    };
    window.addEventListener(TUTORIAL_PREFILL_EVENT, handler);
    return () => window.removeEventListener(TUTORIAL_PREFILL_EVENT, handler);
  }, [target]);
}
