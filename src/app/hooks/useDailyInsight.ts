import { useEffect, useState } from 'react';
import { dailyInsight } from '../services/gemini';
import type { ScheduleBlock } from './scheduleData';

interface DailyInsightState {
  text: string;
  loading: boolean;
  error: string | null;
}

export function useDailyInsight(day: string, schedule: ScheduleBlock[], enabled: boolean): DailyInsightState {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleKey = schedule.map(s => `${s.title}|${s.time}`).join('||');

  useEffect(() => {
    if (!enabled || schedule.length === 0) {
      setText('');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    dailyInsight({ day, schedule: schedule.map(s => ({ title: s.title, time: s.time })) })
      .then(result => {
        if (!cancelled) setText(result);
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

  return { text, loading, error };
}
