import { useSyncExternalStore } from 'react';

export type TourStatus = 'idle' | 'asking' | 'running' | 'done';

interface TourState {
  status: TourStatus;
  stepIndex: number;
}

let state: TourState = { status: 'idle', stepIndex: 0 };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function setState(next: Partial<TourState>) {
  state = { ...state, ...next };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTutorial(): TourState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getTutorialState(): TourState {
  return state;
}

export function askTutorial() {
  if (state.status === 'idle' || state.status === 'done') {
    setState({ status: 'asking', stepIndex: 0 });
  }
}

export function declineTutorial() {
  setState({ status: 'done', stepIndex: 0 });
}

export function startTutorial() {
  setState({ status: 'running', stepIndex: 0 });
}

export function finishTutorial() {
  setState({ status: 'done', stepIndex: 0 });
}

export function nextStep(maxIndex: number) {
  setState({ stepIndex: Math.min(state.stepIndex + 1, maxIndex) });
}

export function setStep(index: number) {
  setState({ stepIndex: Math.max(0, index) });
}
