import { useState } from 'react';
import { Star, Zap, Target, Heart, TrendingUp } from 'lucide-react';

export interface SubAchievement {
  id: string;
  title: string;
  date: string;
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

export const achievementGroups: AchievementGroup[] = [
  {
    id: '1', title: 'Bậc thầy học tập', description: 'Thành tựu phiên học',
    icon: Star, barColor: 'bg-yellow-400', dotColor: 'bg-yellow-400', count: 12,
    subAchievements: [
      { id: '1-1', title: 'Hoàn thành 50 phiên học', date: '15/5/2026', progress: 100, completed: true },
      { id: '1-2', title: 'Học 7 ngày liên tiếp', date: '12/5/2026', progress: 100, completed: true },
      { id: '1-3', title: 'Tuần học đầu tiên 10 tiếng', date: '8/5/2026', progress: 80, completed: false },
      { id: '1-4', title: 'Hoàn thành thói quen học buổi sáng', date: '5/5/2026', progress: 45, completed: false },
    ],
  },
  {
    id: '2', title: 'Nhà vô địch kiên trì', description: 'Thành tựu chuỗi và thói quen',
    icon: Zap, barColor: 'bg-purple-400', dotColor: 'bg-purple-400', count: 8,
    subAchievements: [
      { id: '2-1', title: 'Chuỗi 30 ngày', date: '14/5/2026', progress: 100, completed: true },
      { id: '2-2', title: 'Chuỗi 14 ngày', date: '10/5/2026', progress: 100, completed: true },
      { id: '2-3', title: 'Chuỗi 7 ngày', date: '6/5/2026', progress: 100, completed: true },
      { id: '2-4', title: 'Không bỏ lỡ thứ Hai nào', date: '1/5/2026', progress: 60, completed: false },
    ],
  },
  {
    id: '3', title: 'Cuộc sống cân bằng', description: 'Thành tựu cân bằng công việc-cuộc sống',
    icon: Heart, barColor: 'bg-pink-400', dotColor: 'bg-pink-400', count: 6,
    subAchievements: [
      { id: '3-1', title: 'Nghỉ giải lao mỗi 2 giờ', date: '13/5/2026', progress: 100, completed: true },
      { id: '3-2', title: 'Cân bằng học tập và tập luyện', date: '9/5/2026', progress: 70, completed: false },
      { id: '3-3', title: 'Duy trì lịch ngủ', date: '4/5/2026', progress: 50, completed: false },
    ],
  },
  {
    id: '4', title: 'Kẻ nghiền nát nhiệm vụ', description: 'Thành tựu hoàn thành nhiệm vụ',
    icon: Target, barColor: 'bg-blue-400', dotColor: 'bg-blue-400', count: 15,
    subAchievements: [
      { id: '4-1', title: 'Hoàn thành 100 nhiệm vụ', date: '11/5/2026', progress: 100, completed: true },
      { id: '4-2', title: 'Xóa hết nhiệm vụ 5 ngày liên tiếp', date: '7/5/2026', progress: 100, completed: true },
      { id: '4-3', title: 'Không có nhiệm vụ quá hạn 1 tháng', date: '3/5/2026', progress: 90, completed: false },
      { id: '4-4', title: '10 nhiệm vụ đầu tiên hoàn thành', date: '28/4/2026', progress: 100, completed: true },
    ],
  },
  {
    id: '5', title: 'Bậc thầy tập trung', description: 'Thành tựu phiên tập trung',
    icon: TrendingUp, barColor: 'bg-green-400', dotColor: 'bg-green-400', count: 10,
    subAchievements: [
      { id: '5-1', title: '100 giờ làm việc tập trung', date: '16/5/2026', progress: 85, completed: false },
      { id: '5-2', title: '50 phiên tập trung hoàn thành', date: '10/5/2026', progress: 100, completed: true },
      { id: '5-3', title: 'Tập trung lâu nhất: 2 giờ', date: '5/5/2026', progress: 100, completed: true },
    ],
  },
];

export function useAchive() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalAchievements = achievementGroups.reduce((sum, g) => sum + g.count, 0);
  const completedTotal = achievementGroups.reduce(
    (sum, g) => sum + g.subAchievements.filter(s => s.completed).length, 0
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return {
    expandedId,
    totalAchievements,
    completedTotal,
    toggleExpand,
  };
}
