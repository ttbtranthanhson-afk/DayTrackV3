import { useEffect, useState } from 'react';
import { dailyInsight } from '../services/gemini';
import { reconcileDailyInsight, type DailyInsight } from '../../../shared/ai';
import { readUserProfile } from './userProfile';
import type { ScheduleBlock } from './scheduleData';

interface DailyInsightState {
  insight: DailyInsight | null;
  loading: boolean;
  error: string | null;
}

export function useDailyInsight(day: string, schedule: ScheduleBlock[], enabled: boolean): DailyInsightState {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleKey = schedule.map(s => `${s.title}|${s.time}`).join('||');

  useEffect(() => {
    if (!enabled || schedule.length === 0) {
      setInsight(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const slots = schedule.map(s => ({ title: s.title, time: s.time }));
    setLoading(true);
    setError(null);

    dailyInsight({
      day,
      schedule: slots,
      profile: readUserProfile(),
    })
      .then(result => {
        if (!cancelled) setInsight(reconcileDailyInsight(result, slots));
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải gợi ý AI.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, day, scheduleKey]);

  return { insight, loading, error };
}
