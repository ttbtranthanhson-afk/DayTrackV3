import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Apple, Dumbbell, BookOpen, Info, Loader2, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { suggestForBlock, type AiSuggestion } from '../services/gemini';
import type { BlockAnalysis } from '../../../shared/ai';

interface AIScheduleSuggestionProps {
  scheduleTitle: string;
  scheduleTime: string;
  day?: string;
  tasks?: string[];
  analysis?: BlockAnalysis;
}

function hasAdvice(analysis?: BlockAnalysis): boolean {
  return Boolean(
    analysis &&
      (analysis.suggestions.length > 0 ||
        Boolean(analysis.method) ||
        analysis.healthTips.length > 0 ||
        Boolean(analysis.why)),
  );
}

type Category = 'eating' | 'exercise' | 'study';

function categoryOf(title: string): Category {
  const t = title.toLowerCase();
  if (t.includes('ăn') || t.includes('bữa') || t.includes('sáng') || t.includes('trưa') || t.includes('tối') || t.includes('eat') || t.includes('meal') || t.includes('breakfast') || t.includes('lunch') || t.includes('dinner')) {
    return 'eating';
  }
  if (t.includes('tập') || t.includes('thể dục') || t.includes('gym') || t.includes('thể thao') || t.includes('exercise') || t.includes('workout') || t.includes('sport')) {
    return 'exercise';
  }
  return 'study';
}

const CATEGORY_META: Record<Category, { icon: typeof Apple; color: string; bg: string }> = {
  eating: { icon: Apple, color: 'text-orange-500', bg: 'bg-orange-50' },
  exercise: { icon: Dumbbell, color: 'text-green-500', bg: 'bg-green-50' },
  study: { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
};

export function AIScheduleSuggestion({ scheduleTitle, scheduleTime, day = '', tasks, analysis }: AIScheduleSuggestionProps) {
  const category = categoryOf(scheduleTitle);
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const saved = hasAdvice(analysis);

  const [data, setData] = useState<AiSuggestion | null>(null);
  const [loading, setLoading] = useState(!saved);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const tasksKey = (tasks ?? []).join('|');

  useEffect(() => {
    if (saved) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    suggestForBlock({ day, title: scheduleTitle, time: scheduleTime, tasks })
      .then(result => {
        if (!cancelled) setData(result);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tạo gợi ý AI.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [saved, scheduleTitle, scheduleTime, day, tasksKey, reloadKey]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-3 pb-4 border-t border-gray-200">
        {saved && analysis && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${meta.color}`} />
              <h4 className="font-medium text-gray-800">{scheduleTitle}</h4>
            </div>

            {analysis.suggestions.length > 0 && (
              <div className={`rounded-xl p-3 ${meta.bg}`}>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {category === 'eating' ? 'Thực đơn gợi ý' : category === 'exercise' ? 'Bài tập gợi ý' : 'Gợi ý'}
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {analysis.suggestions.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.method && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800 mb-1">Phương pháp</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.method}</p>
                {(analysis.methodSteps ?? []).length > 0 && (
                  <ol className="mt-2 space-y-1.5">
                    {(analysis.methodSteps ?? []).map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {analysis.healthTips.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800 mb-2">Tư thế & nghỉ ngơi</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {analysis.healthTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.why && (
              <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">{analysis.why}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
              <Clock className="w-3 h-3" />
              Phân tích đã lưu cho khung {scheduleTime}
            </div>
          </div>
        )}

        {!saved && loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <p className="text-xs font-medium">AI đang phân tích khối lịch...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 rounded-xl p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed flex-1">{error}</p>
            </div>
            <button
              onClick={() => setReloadKey(k => k + 1)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${meta.color}`} />
              <h4 className="font-medium text-gray-800">{data.title}</h4>
            </div>

            {data.sections.map((section, index) => (
              <div
                key={index}
                className={`rounded-xl p-3 ${index === 0 ? meta.bg : 'bg-blue-50'}`}
              >
                <p className="text-sm font-medium text-gray-800 mb-2">{section.heading}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {section.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {data.note && (
              <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">{data.note}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
              <Clock className="w-3 h-3" />
              Phân tích cho khung {scheduleTime}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
