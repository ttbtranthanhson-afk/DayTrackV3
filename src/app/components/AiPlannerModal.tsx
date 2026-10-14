import { useEffect, useMemo, useState } from 'react';
import {
  X, Sparkles, Loader2, Wand2, ArrowLeft, Check, UtensilsCrossed, BookOpen,
  Dumbbell, Calendar, Info, Clock, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { BlockType, Need, PlanAnalysis, PlanOption, PlannedBlock } from '../../../shared/ai';
import { analyzeBlock, planSchedule } from '../services/gemini';
import { blockColors, type ScheduleBlock, type ScheduleTask } from '../hooks/scheduleData';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleBlock[];
  day: string;
  busy: string[];
  focusTitles?: string[];
  onApply: (blocks: ScheduleBlock[], optionName: string, meta: { title: string; type: BlockType; tasks: string[] }[]) => void;
}

type Status = 'loading' | 'ready' | 'error';

const DEFAULT_TIME_OPTIONS = ['16:00 - 17:00', '16:30 - 17:30', '17:00 - 18:00'];

const TYPE_META: Record<BlockType, { label: string; icon: typeof UtensilsCrossed; chip: string; soft: string; text: string }> = {
  eating: { label: 'Ăn uống', icon: UtensilsCrossed, chip: 'bg-orange-400', soft: 'bg-orange-50', text: 'text-orange-600' },
  study: { label: 'Học tập', icon: BookOpen, chip: 'bg-blue-400', soft: 'bg-blue-50', text: 'text-blue-600' },
  exercise: { label: 'Thể dục', icon: Dumbbell, chip: 'bg-emerald-400', soft: 'bg-emerald-50', text: 'text-emerald-600' },
  other: { label: 'Khác', icon: Calendar, chip: 'bg-gray-400', soft: 'bg-gray-50', text: 'text-gray-500' },
};

const NEED_LABELS: Record<Need, string> = { gain: 'Tăng cân', lose: 'Giảm cân', muscle: 'Tăng cơ' };
const NEED_OPTIONS: Record<'eating' | 'exercise', Need[]> = {
  eating: ['gain', 'lose', 'muscle'],
  exercise: ['lose', 'muscle'],
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

function parseRangeTime(time: string): { start: string; end: string } {
  const m = time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return { start: '08:00', end: '09:00' };
  return { start: m[1], end: m[2] };
}

function toMinutes(value: string): number | null {
  const m = value.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return +m[1] * 60 + +m[2];
}

function hasAdvice(analysis: PlanAnalysis): boolean {
  return (
    analysis.suggestions.length > 0 ||
    Boolean(analysis.method) ||
    analysis.healthTips.length > 0 ||
    Boolean(analysis.why)
  );
}

function emptyAnalysis(): PlanAnalysis {
  return { timeOptions: DEFAULT_TIME_OPTIONS, suggestions: [], healthTips: [], why: '' };
}

function buildCustomOption(schedule: ScheduleBlock[]): PlanOption {
  return {
    id: 'custom',
    name: 'Tùy chỉnh',
    description: 'Giữ nguyên thứ tự và thời gian gốc, không để AI sắp xếp lại.',
    blocks: schedule.map(block => {
      const { start, end } = parseRangeTime(block.time);
      return {
        title: block.title,
        type: 'other' as BlockType,
        start,
        end,
        tasks: (block.tasks || []).map(t => t.title),
        analysis: emptyAnalysis(),
      };
    }),
  };
}

function toScheduleBlocks(option: PlanOption, original: ScheduleBlock[]): ScheduleBlock[] {
  const originalTasksByTitle = new Map<string, Set<string>>();
  original.forEach(block => {
    originalTasksByTitle.set(block.title, new Set((block.tasks || []).map(t => t.title)));
  });

  return option.blocks.map((block, index) => {
    const allowed = originalTasksByTitle.get(block.title);
    const safeTitles = allowed ? block.tasks.filter(title => allowed.has(title)) : [];
    const tasks: ScheduleTask[] = safeTitles.map((title, ti) => ({
      id: `ai-${slug(block.title)}-${ti}`,
      title,
      priority: 'medium',
    }));
    return {
      id: `ai-${option.id}-${index}-${slug(block.title)}`,
      title: block.title,
      time: `${block.start} - ${block.end}`,
      color: blockColors[index % blockColors.length],
      type: block.type,
      tasks,
      analysis: hasAdvice(block.analysis) ? block.analysis : undefined,
    };
  });
}

export function AiPlannerModal({ isOpen, onClose, schedule, day, busy, focusTitles = [], onApply }: AiPlannerModalProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [options, setOptions] = useState<PlanOption[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ index: number; time: string } | null>(null);
  const [loadingBlock, setLoadingBlock] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const originalByTitle = useMemo(() => {
    const map = new Map<string, { start: number | null; end: number | null }>();
    schedule.forEach(block => {
      const { start, end } = parseRangeTime(block.time);
      map.set(block.title, { start: toMinutes(start), end: toMinutes(end) });
    });
    return map;
  }, [schedule]);

  const load = () => {
    setStatus('loading');
    setError('');
    setSelectedBlock(null);
    setPendingConfirm(null);

    planSchedule({
      day,
      busy,
      schedule: schedule.map(s => ({ title: s.title, time: s.time, tasks: s.tasks?.map(t => t.title) })),
    })
      .then(result => {
        const list = [...result.options, buildCustomOption(schedule)];
        if (!result.options.length) {
          setStatus('error');
          setError('AI chưa đưa ra được phương án nào. Vui lòng thử lại.');
          return;
        }
        setOptions(list);
        setSelectedId(list[0].id);
        setStatus('ready');
      })
      .catch(err => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Không thể kết nối AI. Vui lòng thử lại.');
      });
  };

  useEffect(() => {
    if (isOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selected = options.find(o => o.id === selectedId) || options[0];

  const needsAnalysis = (block: PlannedBlock): boolean => {
    if (focusTitles.includes(block.title)) return true;
    const original = originalByTitle.get(block.title);
    if (!original) return true;
    return original.start !== toMinutes(block.start) || original.end !== toMinutes(block.end);
  };

  const updateBlock = (index: number, updater: (block: PlannedBlock) => PlannedBlock) => {
    setOptions(prev => prev.map(option => {
      if (option.id !== selected?.id) return option;
      return { ...option, blocks: option.blocks.map((b, i) => (i === index ? updater(b) : b)) };
    }));
  };

  const requestAnalysis = async (index: number) => {
    if (!selected) return;
    const block = selected.blocks[index];
    if (!block) return;
    setLoadingBlock(index);
    try {
      const analysis = await analyzeBlock({
        day,
        title: block.title,
        type: block.type,
        time: `${block.start} - ${block.end}`,
        need: block.analysis.need,
        tasks: block.tasks,
      });
      updateBlock(index, b => ({ ...b, analysis }));
    } catch {
      // keep existing analysis on failure
    } finally {
      setLoadingBlock(null);
    }
  };

  const openBlock = (index: number) => {
    setSelectedBlock(index);
    setPendingConfirm(null);
    const block = selected?.blocks[index];
    if (block && needsAnalysis(block) && !hasAdvice(block.analysis)) {
      void requestAnalysis(index);
    }
  };

  const applyNeed = async (index: number, need: Need) => {
    if (!selected) return;
    const block = selected.blocks[index];
    updateBlock(index, b => ({ ...b, analysis: { ...b.analysis, need } }));
    setLoadingBlock(index);
    try {
      const analysis = await analyzeBlock({
        day,
        title: block.title,
        type: block.type,
        time: `${block.start} - ${block.end}`,
        need,
        tasks: block.tasks,
      });
      updateBlock(index, b => ({ ...b, analysis }));
    } catch {
      // keep existing analysis on failure
    } finally {
      setLoadingBlock(null);
    }
  };

  const confirmTime = () => {
    if (!pendingConfirm || !selected) return;
    const { index, time } = pendingConfirm;
    const { start, end } = parseRangeTime(time);
    updateBlock(index, b => ({ ...b, start, end }));
    setPendingConfirm(null);
  };

  const handleSave = () => {
    if (!selected) return;
    setSaving(true);
    const blocks = toScheduleBlocks(selected, schedule);
    const meta = blocks.map((b, index) => ({
      title: b.title,
      type: selected.blocks[index]?.type ?? 'other',
      tasks: (b.tasks || []).map(t => t.title),
    }));
    onApply(blocks, selected.name, meta);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              data-tour="planner-modal"
              className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden pointer-events-auto shadow-xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">AI sắp xếp lịch</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{day} · {schedule.length} khối lịch</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              {status === 'loading' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-200">
                      <Sparkles className="w-7 h-7 text-white animate-pulse" />
                    </div>
                    <div className="absolute -inset-2 rounded-[28px] border-2 border-violet-200 border-t-violet-500 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">AI đang xếp lịch cho bạn...</p>
                    <p className="text-xs text-gray-400 mt-1">Đang phân loại từng khối và tối ưu thời gian</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-rose-50 flex items-center justify-center">
                    <Info className="w-6 h-6 text-rose-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">Không thể sắp xếp lịch</p>
                  <p className="text-xs text-rose-500 leading-relaxed max-w-xs">{error}</p>
                  <button onClick={load}
                    className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-50 text-violet-600 text-sm font-bold hover:bg-violet-100 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Thử lại
                  </button>
                </div>
              )}

              {status === 'ready' && selected && (
                <div data-tour="planner-options" className="flex-1 flex flex-col sm:flex-row min-h-0">
                  {/* Options column */}
                  <div data-tour="planner-option-list" className="sm:w-52 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 p-3 sm:overflow-y-auto">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Phương án</p>
                    <div className="flex sm:flex-col gap-2">
                      {options.map(option => {
                        const active = option.id === selected.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelectedId(option.id)}
                            className={`text-left rounded-2xl p-3 border transition-all flex-1 sm:flex-none min-w-0 ${
                              active
                                ? 'bg-violet-50 border-violet-200'
                                : 'bg-white border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {active && <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />}
                              <span className={`text-xs font-bold truncate ${active ? 'text-violet-700' : 'text-gray-600'}`}>
                                {option.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule column */}
                  <div data-tour="planner-block-list" className="flex-1 min-h-0 overflow-y-auto p-4">
                    {selected.description && (
                      <div className="flex items-start gap-2 bg-violet-50/60 border border-violet-100 rounded-2xl px-3 py-2.5 mb-3">
                        <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-violet-700 leading-relaxed">{selected.description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {selected.blocks.map((block, index) => {
                        const meta = TYPE_META[block.type];
                        const Icon = meta.icon;
                        const needs = needsAnalysis(block);
                        return (
                          <button
                            key={`${block.title}-${index}`}
                            onClick={() => openBlock(index)}
                            className="w-full text-left bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-violet-200 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.soft}`}>
                                <Icon className={`w-4 h-4 ${meta.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{block.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                                    <Clock className="w-3 h-3" />{block.start} - {block.end}
                                  </span>
                                  <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${meta.chip}`}>
                                    {meta.label}
                                  </span>
                                </div>
                              </div>
                              {needs ? (
                                <span className="text-[10px] font-bold text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  Phân tích →
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-gray-300 flex-shrink-0">
                                  Giữ nguyên
                                </span>
                              )}
                            </div>
                            {block.tasks.length > 0 && (
                              <p className="text-[11px] text-gray-400 mt-2 pl-12 truncate">
                                {block.tasks.join(' · ')}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              {status === 'ready' && (
                <div className="bg-white border-t border-gray-100 px-5 py-4 flex gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    data-tour="planner-save"
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4" />
                    Lưu & thêm vào hôm nay
                  </button>
                </div>
              )}

              {/* Analysis overlay */}
              <AnimatePresence>
                {status === 'ready' && selected && selectedBlock !== null && selected.blocks[selectedBlock] && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/30 flex items-end sm:items-center justify-center z-20"
                    onClick={() => { setSelectedBlock(null); setPendingConfirm(null); }}
                  >
                    <motion.div
                      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                      className="w-full sm:max-w-lg max-h-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      <BlockAnalysisPanel
                        block={selected.blocks[selectedBlock]}
                        loading={loadingBlock === selectedBlock}
                        needsAnalysis={needsAnalysis(selected.blocks[selectedBlock])}
                        pendingConfirm={pendingConfirm}
                        onNeedChange={need => applyNeed(selectedBlock, need)}
                        onRequestAnalysis={() => requestAnalysis(selectedBlock)}
                        onRequestTime={time => {
                          const current = `${selected.blocks[selectedBlock].start} - ${selected.blocks[selectedBlock].end}`;
                          if (time === current) return;
                          setPendingConfirm({ index: selectedBlock, time });
                        }}
                        onConfirmTime={confirmTime}
                        onCancelConfirm={() => setPendingConfirm(null)}
                        onClose={() => { setSelectedBlock(null); setPendingConfirm(null); }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function BlockAnalysisPanel({
  block,
  loading,
  needsAnalysis,
  pendingConfirm,
  onNeedChange,
  onRequestAnalysis,
  onRequestTime,
  onConfirmTime,
  onCancelConfirm,
  onClose,
}: {
  block: PlannedBlock;
  loading: boolean;
  needsAnalysis: boolean;
  pendingConfirm: { index: number; time: string } | null;
  onNeedChange: (need: Need) => void;
  onRequestAnalysis: () => void;
  onRequestTime: (time: string) => void;
  onConfirmTime: () => void;
  onCancelConfirm: () => void;
  onClose: () => void;
}) {
  const meta = TYPE_META[block.type];
  const Icon = meta.icon;
  const current = `${block.start} - ${block.end}`;
  const needTypes: ('eating' | 'exercise')[] = ['eating', 'exercise'];
  const supportsNeed = needTypes.includes(block.type as 'eating' | 'exercise');
  const showAdvice = hasAdvice(block.analysis);

  return (
    <>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.soft}`}>
          <Icon className={`w-4 h-4 ${meta.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{block.title}</p>
          <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-violet-500 animate-spin flex-shrink-0" />}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {supportsNeed && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">Nhu cầu của bạn</p>
            <div className="flex flex-wrap gap-2">
              {NEED_OPTIONS[block.type as 'eating' | 'exercise'].map(need => {
                const active = block.analysis.need === need;
                return (
                  <button
                    key={need}
                    onClick={() => onNeedChange(need)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      active
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-violet-200'
                    }`}
                  >
                    {NEED_LABELS[need]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Time options */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Khung giờ đề xuất
          </p>
          <div className="grid grid-cols-1 gap-2">
            {block.analysis.timeOptions.map(time => {
              const active = time === current;
              return (
                <div key={time}>
                  <button
                    onClick={() => onRequestTime(time)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-violet-50 border-violet-300 text-violet-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-violet-200'
                    }`}
                  >
                    <span>{time}</span>
                    {active ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500">
                        <Check className="w-3 h-3" /> Đang chọn
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-violet-400">Chọn →</span>
                    )}
                  </button>
                  <AnimatePresence>
                    {pendingConfirm?.time === time && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1.5 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
                          <p className="flex-1 text-[11px] text-amber-700 font-semibold">
                            Đổi khối này sang {time}?
                          </p>
                          <button onClick={onCancelConfirm}
                            className="px-2.5 py-1 rounded-lg bg-white text-[11px] font-bold text-gray-500 border border-gray-200">
                            Không
                          </button>
                          <button onClick={onConfirmTime}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-[11px] font-bold text-white">
                            Đổi lịch
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {!showAdvice && (
          loading ? (
            <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-100 rounded-2xl px-3.5 py-3">
              <Loader2 className="w-4 h-4 text-violet-500 animate-spin flex-shrink-0" />
              <p className="text-xs text-violet-700 font-semibold">AI đang phân tích khối này...</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-3.5 py-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-xs text-gray-500 leading-relaxed">
                  {needsAnalysis
                    ? 'Chưa có phân tích cho khối này.'
                    : 'Khối này giữ nguyên thời gian so với lịch gốc nên không cần phân tích lại.'}
                </p>
              </div>
              <button
                onClick={onRequestAnalysis}
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 text-xs font-bold hover:bg-violet-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Nhờ AI phân tích
              </button>
            </div>
          )
        )}

        {/* Suggestions */}
        {block.analysis.suggestions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">
              {block.type === 'eating' ? 'Thực đơn gợi ý' : block.type === 'exercise' ? 'Bài tập gợi ý' : 'Gợi ý'}
            </p>
            <ul className="space-y-1.5">
              {block.analysis.suggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${meta.chip}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Method */}
        {block.analysis.method && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5">
            <p className="text-xs font-bold text-blue-700 mb-1">Phương pháp học</p>
            <p className="text-xs text-blue-600 leading-relaxed">{block.analysis.method}</p>
          </div>
        )}

        {/* Health tips */}
        {block.analysis.healthTips.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">Tư thế & nghỉ ngơi</p>
            <ul className="space-y-1.5">
              {block.analysis.healthTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why */}
        {block.analysis.why && (
          <div className="flex items-start gap-2 bg-violet-50/60 border border-violet-100 rounded-2xl px-3.5 py-3">
            <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700 leading-relaxed">{block.analysis.why}</p>
          </div>
        )}
      </div>
    </>
  );
}
