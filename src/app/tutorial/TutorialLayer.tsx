import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Sparkles } from 'lucide-react';
import { TutorialOverlay } from './TutorialOverlay';
import { tutorialSteps, type TutorialPrefill, type TutorialStep } from './tutorialSteps';
import {
  askTutorial,
  declineTutorial,
  finishTutorial,
  nextStep,
  startTutorial,
  useTutorial,
} from './tutorialStore';
import { setTutorialActive } from './tutorialMode';
import { scrollTourTargetIntoView } from './scrollTourTargetIntoView';
import { seedTutorialData, restoreTutorialData } from './tutorialData';
import { getAccountItem, setAccountItem } from '../hooks/accountStorage';
import { useIsDesktop } from '../desktop/useIsDesktop';

const SEEN_KEY = 'daytrack_tutorial_seen';

function applyPrefill(prefill: TutorialPrefill): boolean {
  // Let React-controlled inputs set their state directly.
  window.dispatchEvent(new CustomEvent('tutorial:prefill', { detail: prefill }));

  const el = document.querySelector(`[data-tour="${prefill.target}"]`) as HTMLInputElement | null;
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(el, prefill.value);
  else el.value = prefill.value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  try { el.focus(); } catch { /* ignore */ }
  return true;
}

export function TutorialLayer({ enabled }: { enabled: boolean }) {
  const { status, stepIndex } = useTutorial();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const step: TutorialStep | undefined = tutorialSteps[stepIndex];

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [found, setFound] = useState(false);

  const askedRef = useRef(false);
  const seededRef = useRef(false);
  const advancedRef = useRef(false);
  const prefilledRef = useRef<string | null>(null);
  const scrollAttemptsRef = useRef(0);
  const lastScrollAtRef = useRef(0);

  // Ask about the tour on first login.
  useEffect(() => {
    if (!enabled || askedRef.current) return;
    askedRef.current = true;
    if (!getAccountItem(SEEN_KEY)) askTutorial();
  }, [enabled]);

  // Activate AI interception + seed sample data while the tour runs.
  useEffect(() => {
    if (status === 'running') {
      setTutorialActive(true);
      if (!seededRef.current) {
        seededRef.current = true;
        seedTutorialData();
      }
    } else if (status === 'done') {
      setTutorialActive(false);
      if (seededRef.current) {
        seededRef.current = false;
        restoreTutorialData();
      }
    }
  }, [status]);

  // Restore data if the layer unmounts mid-tour.
  useEffect(() => {
    return () => {
      setTutorialActive(false);
      restoreTutorialData();
    };
  }, []);

  const advance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (stepIndex >= tutorialSteps.length - 1) finishTutorial();
    else nextStep(tutorialSteps.length - 1);
  }, [stepIndex]);

  // Navigate to the step route.
  useEffect(() => {
    if (status !== 'running' || !step?.route) return;
    const current = window.location.hash.replace(/^#/, '').split('?')[0] || '/';
    if (current !== step.route) navigate(step.route);
  }, [status, stepIndex, step?.route, navigate]);

  // Measure the target and apply input prefills.
  useEffect(() => {
    if (status !== 'running') return;
    advancedRef.current = false;
    prefilledRef.current = null;
    scrollAttemptsRef.current = 0;
    const selector = step?.target ? `[data-tour="${step.target}"]` : null;
    const waitSelector = step?.waitFor ? `[data-tour="${step.waitFor}"]` : null;

    // Targets can sit below the fold on short phone screens (the dimmed
    // backdrop blocks manual scrolling), so pull them into view ourselves —
    // scrolling the container that actually holds them (e.g. a modal card).
    // No-op when the target is already visible, so the tour stays calm.
    const bringIntoView = (target: HTMLElement) => {
      if (step?.placement === 'center') return;
      if (scrollAttemptsRef.current >= 2) return;
      if (Date.now() - lastScrollAtRef.current < 700) return;
      if (scrollTourTargetIntoView(target)) {
        scrollAttemptsRef.current += 1;
        lastScrollAtRef.current = Date.now();
      }
    };

    const measure = () => {
      if (waitSelector && document.querySelector(waitSelector)) {
        advance();
        return;
      }
      const el = selector ? (document.querySelector(selector) as HTMLElement | null) : null;
      if (el) {
        bringIntoView(el);
        setRect(el.getBoundingClientRect());
        setFound(true);
        if (step?.prefill && prefilledRef.current !== step.id) {
          if (applyPrefill(step.prefill)) prefilledRef.current = step.id;
        }
      } else {
        setRect(null);
        setFound(false);
      }
    };

    measure();
    const interval = window.setInterval(measure, 150);
    const onScroll = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [status, stepIndex, step?.id, step?.target, step?.prefill, step?.waitFor, advance]);

  // Advance on click.
  useEffect(() => {
    if (status !== 'running' || step?.requires !== 'click') return;
    const handler = (e: MouseEvent) => {
      const target = step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null;
      if (!target) return;
      if (target.contains(e.target as Node)) advance();
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [status, stepIndex, step?.id, step?.requires, step?.target, advance]);

  // Advance on Enter.
  useEffect(() => {
    if (status !== 'running' || step?.requires !== 'enter') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const target = step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null;
      if (!target) {
        advance();
        return;
      }
      if (target.contains(document.activeElement)) advance();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [status, stepIndex, step?.id, step?.requires, step?.target, advance]);

  // Auto-advance steps (e.g. the AI processing demo).
  useEffect(() => {
    if (status !== 'running' || step?.autoDelay == null) return;
    if (step.target && !found) return;
    const timer = window.setTimeout(advance, step.autoDelay);
    return () => window.clearTimeout(timer);
  }, [status, stepIndex, step?.id, step?.target, step?.autoDelay, found, advance]);

  const handleStart = () => {
    setAccountItem(SEEN_KEY, '1');
    startTutorial();
  };

  const handleDecline = () => {
    setAccountItem(SEEN_KEY, '1');
    declineTutorial();
  };

  const handleSkip = () => {
    setAccountItem(SEEN_KEY, '1');
    finishTutorial();
  };

  if (!enabled) return null;

  if (status === 'asking') {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Chào mừng đến DayTrack!</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Bạn có muốn được hướng dẫn nhanh cách sử dụng ứng dụng không?
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDecline}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Không, cảm ơn
            </button>
            <button
              onClick={handleStart}
              className="flex-[1.4] flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Có, hướng dẫn tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'running' || !step) return null;

  const isLast = stepIndex >= tutorialSteps.length - 1;

  let primaryLabel: string | null;
  let onPrimary: () => void;

  const isMobile = !isDesktop;

  if (isMobile && step.mobileContinue) {
    // On phones the action button can be pushed off-screen and the dimmed
    // backdrop blocks scrolling to it. Let the user tap "Tiếp tục" instead,
    // which performs the action on their behalf.
    primaryLabel = isLast ? 'Hoàn tất' : 'Tiếp tục';
    onPrimary = () => {
      const el = step.target
        ? (document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null)
        : null;
      el?.click();
      advance();
    };
  } else if (step.requires) {
    if (found) {
      primaryLabel = null;
      onPrimary = advance;
    } else if (step.openEvent) {
      primaryLabel = 'Mở';
      onPrimary = () => {
        window.dispatchEvent(new CustomEvent(step.openEvent!));
        advance();
      };
    } else {
      primaryLabel = 'Tiếp tục';
      onPrimary = advance;
    }
  } else {
    primaryLabel = isLast ? 'Hoàn tất' : 'Tiếp tục';
    onPrimary = advance;
  }

  return (
    <TutorialOverlay
      step={step}
      rect={step.placement === 'center' ? null : rect}
      index={stepIndex}
      total={tutorialSteps.length}
      isLast={isLast}
      primaryLabel={primaryLabel}
      onPrimary={onPrimary}
      onSkip={handleSkip}
      hidePanel={step.bare}
    />
  );
}
