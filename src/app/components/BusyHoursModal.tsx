import { useRef, useState, useCallback, useEffect } from 'react';
import { X, Trash2, Sparkles, CalendarOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ScheduleBlock } from '../hooks/useTimetable';
import { colorMap } from '../hooks/useTimetable';

const HOUR_H = 64;
const MIN_PX = HOUR_H / 60;
const SNAP = 5;
const LONG_MS = 420;
const MOVE_THRESH = 6;

function parseRange(t: string): { s: number; e: number } | null {
  const m = t.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/);
  if (!m) return null;
  return { s: +m[1] * 60 + +m[2], e: +m[3] * 60 + +m[4] };
}

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function snapMin(v: number) {
  return Math.max(0, Math.min(24 * 60, Math.round(v / SNAP) * SNAP));
}

interface Pair { id: string; a: number; b: number; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleBlock[];
  day: string;
  onGeneratePlan?: (busy: string[]) => void;
}

type Mode = 'idle' | 'pending' | 'scrolling' | 'creating';

export function BusyHoursModal({ isOpen, onClose, schedule, day, onGeneratePlan }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [creating, setCreating] = useState<{ a: number; b: number } | null>(null);
  const [dragging, setDragging] = useState<{ pairId: string; which: 'a' | 'b' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const modeRef = useRef<Mode>('idle');
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpOrigin = useRef<{ x: number; y: number; min: number } | null>(null);
  const scrollStart = useRef<{ y: number; top: number } | null>(null);
  const activePtrId = useRef<number | null>(null);
  const creatingR = useRef<{ a: number; b: number } | null>(null);

  const pxToMin = useCallback((clientY: number) => {
    const el = scrollRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return snapMin((clientY - rect.top + el.scrollTop) / MIN_PX);
  }, []);

  const writeCreating = (v: typeof creating) => {
    creatingR.current = v;
    setCreating(v);
  };

  // Scroll to 8am by default
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_H;
    }
  }, [isOpen]);

  // Needle drag effect
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const min = pxToMin(e.clientY);
      setPairs(prev => prev.map(p =>
        p.id !== dragging.pairId ? p :
          dragging.which === 'a' ? { ...p, a: min } : { ...p, b: min }
      ));
    };
    const onUp = () => setDragging(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, pxToMin]);

  const onTLDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('[data-nh]')) return;
    const target = e.currentTarget;
    const pid = e.pointerId;
    activePtrId.current = pid;
    modeRef.current = 'pending';
    const min = pxToMin(e.clientY);
    lpOrigin.current = { x: e.clientX, y: e.clientY, min };
    scrollStart.current = { y: e.clientY, top: scrollRef.current?.scrollTop ?? 0 };

    lpTimer.current = setTimeout(() => {
      if (activePtrId.current !== pid || modeRef.current !== 'pending') return;
      try { target.setPointerCapture(pid); } catch {}
      modeRef.current = 'creating';
      writeCreating({ a: lpOrigin.current!.min, b: lpOrigin.current!.min });
    }, LONG_MS);
  };

  const onTLMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activePtrId.current) return;

    if (modeRef.current === 'pending') {
      if (!lpOrigin.current) return;
      const dy = e.clientY - lpOrigin.current.y;
      const dx = Math.abs(e.clientX - lpOrigin.current.x);
      if (Math.abs(dy) > MOVE_THRESH || dx > MOVE_THRESH) {
        clearTimeout(lpTimer.current!);
        modeRef.current = 'scrolling';
        scrollStart.current = { y: e.clientY, top: scrollRef.current?.scrollTop ?? 0 };
      }
      return;
    }

    if (modeRef.current === 'scrolling') {
      if (scrollRef.current && scrollStart.current) {
        const dy = e.clientY - scrollStart.current.y;
        scrollRef.current.scrollTop = scrollStart.current.top - dy;
      }
      return;
    }

    if (modeRef.current === 'creating') {
      const min = pxToMin(e.clientY);
      writeCreating(creatingR.current ? { ...creatingR.current, b: min } : null);
    }
  };

  const onTLUp = () => {
    clearTimeout(lpTimer.current!);
    activePtrId.current = null;
    if (modeRef.current === 'creating' && creatingR.current) {
      const lo = Math.min(creatingR.current.a, creatingR.current.b);
      const hi = Math.max(creatingR.current.a, creatingR.current.b);
      if (hi - lo >= SNAP) {
        setPairs(prev => [...prev, { id: Date.now().toString(), a: lo, b: hi }]);
      }
      writeCreating(null);
    }
    modeRef.current = 'idle';
    lpOrigin.current = null;
    scrollStart.current = null;
  };

  const onNeedleDown = (e: React.PointerEvent, pairId: string, which: 'a' | 'b') => {
    e.stopPropagation();
    const o = { x: e.clientX, y: e.clientY };
    let moved = false;
    const canDelete = Boolean((e.target as Element).closest('[data-del]'));
    const t = canDelete
      ? setTimeout(() => { if (!moved) setDeleteTarget(pairId); }, LONG_MS)
      : null;
    const mv = (me: PointerEvent) => {
      if (!moved && (Math.abs(me.clientX - o.x) > 4 || Math.abs(me.clientY - o.y) > 4)) {
        moved = true;
        if (t) clearTimeout(t);
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        setDragging({ pairId, which });
      }
    };
    const up = () => {
      if (t) clearTimeout(t);
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const handleAI = () => {
    const busy = pairs.map(p => `${fmt(Math.min(p.a, p.b))}–${fmt(Math.max(p.a, p.b))}`);
    onGeneratePlan?.(busy);
  };

  const blocks = schedule.map(b => ({ ...b, range: parseRange(b.time) })).filter(b => b.range);
  const TLHEIGHT = 24 * HOUR_H;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto shadow-xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <CalendarOff className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Cài đặt giờ bận</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{day}</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Timeline card */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div
                  ref={scrollRef}
                  className="overflow-hidden bg-white"
                  style={{ height: 300 }}
                >
              {/* Inner div handles all pointer events and manual scroll */}
              <div
                className="relative"
                style={{ height: TLHEIGHT, userSelect: 'none', touchAction: 'none', cursor: 'crosshair' }}
                onPointerDown={onTLDown}
                onPointerMove={onTLMove}
                onPointerUp={onTLUp}
                onPointerCancel={onTLUp}
              >
                {/* Hour grid lines + labels */}
                {Array.from({ length: 25 }, (_, h) => (
                  <div key={h} className="absolute left-0 right-0" style={{ top: h * HOUR_H }}>
                    <div className="flex items-center">
                      <span className="text-[10px] font-bold text-gray-300 w-11 text-right pr-2 flex-shrink-0 leading-none select-none">
                        {h < 24 ? `${h}:00` : ''}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                  </div>
                ))}

                {/* 30-min faint lines */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={`hh${h}`} className="absolute right-0 h-px bg-gray-50"
                    style={{ top: h * HOUR_H + HOUR_H / 2, left: 44 }} />
                ))}

                {/* Schedule blocks */}
                {blocks.map(b => {
                  if (!b.range) return null;
                  const c = colorMap[b.color] || colorMap['bg-blue-400'];
                  const borderClass = b.color.replace('bg-', 'border-');
                  return (
                    <div key={b.id}
                      className={`absolute rounded-xl overflow-hidden ${c.bg} border-l-4 ${borderClass}`}
                      style={{ left: 44, right: 32, top: b.range.s * MIN_PX + 1, height: Math.max((b.range.e - b.range.s) * MIN_PX - 2, 18) }}
                    >
                      <div className="px-2 pt-1">
                        <p className={`text-[10px] font-bold ${c.text} truncate leading-tight`}>{b.title}</p>
                        <p className="text-[9px] text-gray-400 truncate">{b.time}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Placed busy pairs */}
                {pairs.map(pair => {
                  const lo = Math.min(pair.a, pair.b);
                  const hi = Math.max(pair.a, pair.b);
                  return (
                    <div key={pair.id}>
                      {/* Red fill */}
                      <div className="absolute bg-rose-400/20 border-l border-r border-rose-200 pointer-events-none"
                        style={{ left: 44, right: 0, top: lo * MIN_PX, height: (hi - lo) * MIN_PX }} />

                      {/* Needle A */}
                      <NeedleRow min={pair.a} pairId={pair.id} which="a" onNeedleDown={onNeedleDown} />
                      {/* Needle B */}
                      <NeedleRow min={pair.b} pairId={pair.id} which="b" onNeedleDown={onNeedleDown} />
                    </div>
                  );
                })}

                {/* Creating preview */}
                {creating && (() => {
                  const lo = Math.min(creating.a, creating.b);
                  const hi = Math.max(creating.a, creating.b);
                  return (
                    <>
                      {hi > lo && (
                        <div className="absolute bg-rose-500/25 border-t border-b border-rose-400 pointer-events-none"
                          style={{ left: 44, right: 0, top: lo * MIN_PX, height: (hi - lo) * MIN_PX }} />
                      )}
                      <CreatingNeedle min={creating.a} />
                      {creating.b !== creating.a && <CreatingNeedle min={creating.b} active />}
                    </>
                  );
                })()}
              </div>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <p className="text-[11px] font-semibold text-gray-400">Nhấn giữ trên đường thời gian → kéo để chọn vùng bận</p>
                </div>
              </div>
              {/* Busy summary chips */}
              <div className="rounded-2xl border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Khung giờ bận đã đặt</p>
                {pairs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {pairs.map(p => {
                      const lo = Math.min(p.a, p.b);
                      const hi = Math.max(p.a, p.b);
                      return (
                        <button key={p.id} onClick={() => setDeleteTarget(p.id)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-full hover:bg-rose-100 transition-colors">
                          {fmt(lo)}–{fmt(hi)}
                          <X className="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300">Chưa có khung giờ bận nào</p>
                )}
              </div>

              {/* AI button */}
              <button
                onClick={handleAI}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 text-sm font-bold hover:bg-violet-100 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Gọi AI sắp xếp lịch
              </button>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Xong
              </button>
            </div>
          </motion.div>
          </div>

          {/* Delete confirm dialog */}
          <AnimatePresence>
            {deleteTarget && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center px-8 bg-black/20"
                onClick={() => setDeleteTarget(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-xs bg-white rounded-3xl shadow-2xl p-5"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-center text-sm font-bold text-gray-800 mb-1">Xóa khung giờ bận?</p>
                  <p className="text-center text-xs text-gray-400 mb-4">
                    {(() => {
                      const p = pairs.find(x => x.id === deleteTarget);
                      if (!p) return '';
                      return `${fmt(Math.min(p.a, p.b))} – ${fmt(Math.max(p.a, p.b))}`;
                    })()}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                      Hủy
                    </button>
                    <button
                      onClick={() => { setPairs(prev => prev.filter(p => p.id !== deleteTarget)); setDeleteTarget(null); }}
                      className="flex-1 py-3 rounded-xl bg-rose-500 text-sm font-bold text-white"
                    >
                      Xóa
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function NeedleRow({ min, pairId, which, onNeedleDown }: {
  min: number;
  pairId: string;
  which: 'a' | 'b';
  onNeedleDown: (e: React.PointerEvent, pairId: string, which: 'a' | 'b') => void;
}) {
  return (
    <div
      data-nh="true"
      className="absolute left-0 right-0 z-10 flex items-center cursor-grab active:cursor-grabbing"
      style={{ top: min * MIN_PX, transform: 'translateY(-50%)', touchAction: 'none' }}
      onPointerDown={e => onNeedleDown(e, pairId, which)}
    >
      <div className="w-11 flex-shrink-0 flex justify-end pr-1">
        <span className="text-[9px] font-bold text-rose-500 bg-white border border-rose-300 px-1 py-0.5 rounded leading-none whitespace-nowrap">
          {fmt(min)}
        </span>
      </div>
      <div className="flex-1 h-px bg-rose-400" />
      <div
        data-del="true"
        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
      >
        {/* Triangle handle pointing right */}
        <div style={{
          width: 0, height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderLeft: '10px solid #f87171',
        }} />
      </div>
    </div>
  );
}

function CreatingNeedle({ min, active }: { min: number; active?: boolean }) {
  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
      style={{ top: min * MIN_PX, transform: 'translateY(-50%)' }}
    >
      <div className="w-11 flex-shrink-0 flex justify-end pr-1">
        <span className={`text-[9px] font-bold px-1 py-0.5 rounded leading-none whitespace-nowrap ${
          active ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
        }`}>
          {fmt(min)}
        </span>
      </div>
      <div className={`flex-1 h-px ${active ? 'bg-rose-500' : 'bg-rose-400'}`} />
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <div style={{
          width: 0, height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderLeft: `10px solid ${active ? '#ef4444' : '#f87171'}`,
        }} />
      </div>
    </div>
  );
}
