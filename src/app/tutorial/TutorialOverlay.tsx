import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GraduationCap, ArrowRight, X } from 'lucide-react';
import type { TutorialStep } from './tutorialSteps';

interface TutorialOverlayProps {
  step: TutorialStep;
  rect: DOMRect | null;
  index: number;
  total: number;
  isLast: boolean;
  primaryLabel: string | null;
  onPrimary: () => void;
  onSkip: () => void;
  hidePanel?: boolean;
}

const PAD = 8;
const PANEL_W = 360;

export function TutorialOverlay({
  step,
  rect,
  index,
  total,
  isLast,
  primaryLabel,
  onPrimary,
  onSkip,
  hidePanel = false,
}: TutorialOverlayProps) {
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(0);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Measure the real panel height before paint: bodies vary a lot (e.g. the
  // Focus tab step) and the placement math must not assume a fixed size.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setPanelH(prev => (prev === h ? prev : h));
  });

  const { w, h } = viewport;
  const centered = !rect || step.placement === 'center';

  let panelStyle: React.CSSProperties;
  if (centered) {
    panelStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const panelW = Math.min(PANEL_W, w - 24);
    const left = Math.max(12, Math.min(rect!.left + rect!.width / 2 - panelW / 2, w - panelW - 12));
    const gap = PAD + 8;
    const est = panelH || 200;
    const spaceBelow = h - rect!.bottom - gap;
    const spaceAbove = rect!.top - gap;
    let top: number;
    if (spaceBelow >= est) top = rect!.bottom + gap;
    else if (spaceAbove >= est) top = rect!.top - gap - est;
    else {
      // No side fits the full panel on a short screen: pick the roomier side
      // but keep the panel entirely on-screen.
      const guess = spaceBelow >= spaceAbove ? rect!.bottom + gap : rect!.top - gap - est;
      top = Math.max(8, Math.min(guess, h - est - 8));
    }
    panelStyle = { left, top };
  }

  const holeStyle: React.CSSProperties | null = rect
    ? {
        left: rect.left - PAD,
        top: rect.top - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* Dim with a transparent hole */}
      {holeStyle ? (
        <div
          className="absolute rounded-2xl"
          style={{ ...holeStyle, boxShadow: '0 0 0 9999px rgba(15,23,42,0.66)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/66" />
      )}

      {/* Click / drag / scroll blockers around the hole */}
      {rect ? (
        <Blockers rect={rect} w={w} h={h} />
      ) : (
        <Blocker style={{ left: 0, top: 0, width: w, height: h }} />
      )}

      {/* Outline around the spotlight */}
      {holeStyle && (
        <div
          className="absolute rounded-2xl ring-2 ring-white/80 pointer-events-none"
          style={holeStyle}
        />
      )}

      {/* Guide panel */}
      {!hidePanel && (
      <div data-tour-panel ref={panelRef} className="fixed w-[360px] max-w-[calc(100vw-24px)] z-[310] pointer-events-auto" style={panelStyle}>
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-5 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                Hướng dẫn · {index + 1}/{total}
              </p>
              <h3 className="text-base font-bold text-gray-900 leading-snug">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Đóng hướng dẫn"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <p className="px-5 text-sm text-gray-600 leading-relaxed">{step.body}</p>

          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
            <button
              onClick={onSkip}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Bỏ qua
            </button>
            {primaryLabel ? (
              <button
                onClick={onPrimary}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                {primaryLabel}
                {!isLast && <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="text-xs font-semibold text-blue-500 animate-pulse">
                {step.requires === 'enter' ? 'Nhấn Enter để tiếp tục' : 'Hãy thực hiện thao tác trên'}
              </span>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function Blocker({ style }: { style: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  // Block page scrolling/dragging that starts on the dimmed area. React attaches
  // wheel/touch listeners as passive, so bind them natively to allow preventDefault.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stop = (e: Event) => e.preventDefault();
    el.addEventListener('wheel', stop, { passive: false });
    el.addEventListener('touchmove', stop, { passive: false });
    return () => {
      el.removeEventListener('wheel', stop);
      el.removeEventListener('touchmove', stop);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-auto touch-none"
      style={style}
    />
  );
}

function Blockers({ rect, w, h }: { rect: DOMRect; w: number; h: number }) {
  const top = rect.top - PAD;
  const left = rect.left - PAD;
  const width = rect.width + PAD * 2;
  const height = rect.height + PAD * 2;

  const blocks: React.CSSProperties[] = [
    { left: 0, top: 0, width: w, height: Math.max(0, top) },
    { left: 0, top: top + height, width: w, height: Math.max(0, h - (top + height)) },
    { left: 0, top, width: Math.max(0, left), height },
    { left: left + width, top, width: Math.max(0, w - (left + width)), height },
  ];

  return (
    <>
      {blocks.map((style, i) => (
        <Blocker key={i} style={style} />
      ))}
    </>
  );
}
