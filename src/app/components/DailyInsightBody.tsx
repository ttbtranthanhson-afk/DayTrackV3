import type { DailyInsight } from '../../../shared/ai';

interface DailyInsightBodyProps {
  insight: DailyInsight | null;
  loading: boolean;
  error: string | null;
  emptyHint: string;
  className?: string;
}

export function DailyInsightBody({ insight, loading, error, emptyHint, className }: DailyInsightBodyProps) {
  if (error) {
    return <p className={`text-red-500 leading-relaxed ${className ?? ''}`}>{error}</p>;
  }

  if (!insight) {
    return (
      <p className={`leading-relaxed ${className ?? ''}`}>
        {loading ? 'Đang phân tích lịch của bạn...' : emptyHint}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {insight.summary && <p className={`leading-relaxed ${className ?? ''}`}>{insight.summary}</p>}
      {insight.items.length > 0 && (
        <ul className="space-y-2">
          {insight.items.map((item, i) => (
            <li key={i} className="rounded-xl border border-blue-100 bg-white/70 p-2.5">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                  {item.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-900">{item.title}</p>
                  {item.detail && (
                    <p className="mt-0.5 text-xs leading-relaxed text-blue-700">{item.detail}</p>
                  )}
                  {item.method && (
                    <p className="mt-1 text-[11px] font-semibold text-blue-600">Phương pháp: {item.method}</p>
                  )}
                  {(item.steps ?? []).length > 0 && (
                    <ol className="mt-1 space-y-0.5">
                      {(item.steps ?? []).map((step, si) => (
                        <li key={si} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-600">
                          <span className="font-bold text-blue-400">{si + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
