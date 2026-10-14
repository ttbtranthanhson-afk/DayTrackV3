import { useMemo, useState } from 'react';
import { Star, Zap, Target, Heart, TrendingUp } from 'lucide-react';
import { useAchievementStats, type AchievementStats } from './achievementStats';

export interface SubAchievement {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
}

export interface AchievementGroup {
  id: string;
  title: string;
  description: string;
  icon: any;
  barColor: string;
  dotColor: string;
  count: number;
  subAchievements: SubAchievement[];
}

type Metric =
  | 'currentStreak'
  | 'longestStreak'
  | 'visitDays'
  | 'focusSessions'
  | 'focusHours'
  | 'longestFocusHours'
  | 'studySessions'
  | 'studyHours'
  | 'studyMorningHours'
  | 'studyStreak'
  | 'tasksCompleted'
  | 'schedulesCompleted';

interface SubDef {
  id: string;
  title: string;
  metric: Metric;
  target: number;
  unit: string;
}

interface GroupDef {
  id: string;
  title: string;
  description: string;
  icon: any;
  barColor: string;
  dotColor: string;
  subs: SubDef[];
}

const GROUP_DEFS: GroupDef[] = [
  {
    id: '1',
    title: 'Bậc thầy học tập',
    description: 'Thành tựu phiên học',
    icon: Star,
    barColor: 'bg-yellow-400',
    dotColor: 'bg-yellow-400',
    subs: [
      { id: '1-1', title: 'Học 50 phiên', metric: 'studySessions', target: 50, unit: 'phiên' },
      { id: '1-2', title: 'Học 10 giờ', metric: 'studyHours', target: 10, unit: 'giờ' },
      { id: '1-3', title: 'Học 7 ngày liên tiếp', metric: 'studyStreak', target: 7, unit: 'ngày' },
      { id: '1-4', title: 'Thói quen học buổi sáng 5 giờ', metric: 'studyMorningHours', target: 5, unit: 'giờ' },
    ],
  },
  {
    id: '2',
    title: 'Nhà vô địch kiên trì',
    description: 'Thành tựu chuỗi và thói quen',
    icon: Zap,
    barColor: 'bg-purple-400',
    dotColor: 'bg-purple-400',
    subs: [
      { id: '2-1', title: 'Chuỗi 30 ngày', metric: 'longestStreak', target: 30, unit: 'ngày' },
      { id: '2-2', title: 'Chuỗi 14 ngày', metric: 'longestStreak', target: 14, unit: 'ngày' },
      { id: '2-3', title: 'Chuỗi 7 ngày', metric: 'longestStreak', target: 7, unit: 'ngày' },
      { id: '2-4', title: 'Tổng 100 ngày đồng hành', metric: 'visitDays', target: 100, unit: 'ngày' },
    ],
  },
  {
    id: '3',
    title: 'Cuộc sống cân bằng',
    description: 'Thành tựu cân bằng công việc-cuộc sống',
    icon: Heart,
    barColor: 'bg-pink-400',
    dotColor: 'bg-pink-400',
    subs: [
      { id: '3-1', title: 'Chuỗi 7 ngày năng suất', metric: 'currentStreak', target: 7, unit: 'ngày' },
      { id: '3-2', title: 'Tập trung 50 giờ', metric: 'focusHours', target: 50, unit: 'giờ' },
      { id: '3-3', title: 'Hoàn thành 20 lịch trình', metric: 'schedulesCompleted', target: 20, unit: 'lịch' },
    ],
  },
  {
    id: '4',
    title: 'Kẻ nghiền nát nhiệm vụ',
    description: 'Thành tựu hoàn thành nhiệm vụ',
    icon: Target,
    barColor: 'bg-blue-400',
    dotColor: 'bg-blue-400',
    subs: [
      { id: '4-1', title: 'Hoàn thành 100 nhiệm vụ', metric: 'tasksCompleted', target: 100, unit: 'nhiệm vụ' },
      { id: '4-2', title: 'Hoàn thành 50 nhiệm vụ', metric: 'tasksCompleted', target: 50, unit: 'nhiệm vụ' },
      { id: '4-3', title: 'Hoàn thành 10 nhiệm vụ', metric: 'tasksCompleted', target: 10, unit: 'nhiệm vụ' },
      { id: '4-4', title: 'Hoàn thành 5 lịch trình', metric: 'schedulesCompleted', target: 5, unit: 'lịch' },
    ],
  },
  {
    id: '5',
    title: 'Bậc thầy tập trung',
    description: 'Thành tựu phiên tập trung',
    icon: TrendingUp,
    barColor: 'bg-green-400',
    dotColor: 'bg-green-400',
    subs: [
      { id: '5-1', title: '100 giờ tập trung', metric: 'focusHours', target: 100, unit: 'giờ' },
      { id: '5-2', title: '50 phiên tập trung', metric: 'focusSessions', target: 50, unit: 'phiên' },
      { id: '5-3', title: 'Tập trung lâu nhất: 2 giờ', metric: 'longestFocusHours', target: 2, unit: 'giờ' },
    ],
  },
];

function toHours(seconds: number): number {
  return seconds / 3600;
}

function studyRun(dates: string[]): number {
  const times = [...new Set(dates)]
    .map(key => {
      const match = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!match) return NaN;
      const time = new Date(+match[1], +match[2] - 1, +match[3]).getTime();
      return Number.isNaN(time) ? NaN : time;
    })
    .filter((t): t is number => !Number.isNaN(t))
    .sort((a, b) => a - b);
  if (!times.length) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < times.length; i++) {
    run = times[i] - times[i - 1] === 86400000 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return longest;
}

function metricValue(stats: AchievementStats, metric: Metric): number {
  switch (metric) {
    case 'studyHours': return toHours(stats.studySeconds);
    case 'studyMorningHours': return toHours(stats.studyMorningSeconds);
    case 'focusHours': return toHours(stats.focusSeconds);
    case 'longestFocusHours': return toHours(stats.longestFocusSeconds);
    case 'studyStreak': return studyRun(stats.studyDates);
    case 'visitDays': return stats.visitDates.length;
    case 'currentStreak': return stats.currentStreak;
    case 'longestStreak': return stats.longestStreak;
    case 'focusSessions': return stats.focusSessions;
    case 'studySessions': return stats.studySessions;
    case 'tasksCompleted': return stats.tasksCompleted;
    case 'schedulesCompleted': return stats.schedulesCompleted;
    default: return 0;
  }
}

export function buildAchievementGroups(stats: AchievementStats): AchievementGroup[] {
  return GROUP_DEFS.map(group => ({
    id: group.id,
    title: group.title,
    description: group.description,
    icon: group.icon,
    barColor: group.barColor,
    dotColor: group.dotColor,
    count: group.subs.length,
    subAchievements: group.subs.map(sub => {
      const value = metricValue(stats, sub.metric);
      const progress = Math.min(100, Math.round((value / sub.target) * 100));
      return {
        id: sub.id,
        title: sub.title,
        progress,
        completed: value >= sub.target,
      };
    }),
  }));
}

export function useAchive() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const stats = useAchievementStats();
  const groups = useMemo(() => buildAchievementGroups(stats), [stats]);

  const totalAchievements = groups.reduce((sum, g) => sum + g.subAchievements.length, 0);
  const completedTotal = groups.reduce(
    (sum, g) => sum + g.subAchievements.filter(s => s.completed).length,
    0,
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return {
    expandedId,
    totalAchievements,
    completedTotal,
    toggleExpand,
    groups,
  };
}