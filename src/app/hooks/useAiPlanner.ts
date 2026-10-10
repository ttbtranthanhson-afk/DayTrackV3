import { useState } from 'react';
import { toast } from 'sonner';
import type { BlockType } from '../../../shared/ai';
import { replaceScheduleDay } from './scheduleStore';
import { addAiAchievements } from './achievementStore';
import { generateAchievements } from '../services/gemini';
import type { ScheduleBlock, ScheduleTask } from './scheduleData';

export type PlanBlockMeta = { title: string; type: BlockType; tasks: string[] };

interface UseAiPlannerOptions {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
  onApplied?: () => void;
  successMessage?: string;
}

export function useAiPlanner(day: string, schedule: ScheduleBlock[], options: UseAiPlannerOptions = {}) {
  const [busyOpen, setBusyOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [busy, setBusy] = useState<string[]>([]);

  const openSurvey = () => setBusyOpen(true);
  const closeSurvey = () => setBusyOpen(false);

  const generate = (nextBusy: string[]) => {
    setBusy(nextBusy);
    setBusyOpen(false);
    setPlannerOpen(true);
  };

  const apply = (blocks: ScheduleBlock[], optionName: string, meta: PlanBlockMeta[]) => {
    replaceScheduleDay(day, blocks);

    if (options.onAddTasks) {
      blocks.forEach(block => {
        if (block.tasks && block.tasks.length > 0) {
          options.onAddTasks!(block.tasks, optionName, day);
        }
      });
    }

    options.onApplied?.();
    toast.success(options.successMessage ?? 'Đã áp dụng lịch AI');

    generateAchievements({ day, scheduleName: optionName, blocks: meta })
      .then(ideas => {
        const created = addAiAchievements(ideas, { scheduleName: optionName, day });
        if (created.length > 0) {
          toast.success(`Mở khoá ${created.length} mục tiêu mới trong Thành tựu!`);
        }
      })
      .catch(() => {
        // achievement generation is best-effort
      });
  };

  return {
    busyOpen,
    plannerOpen,
    busy,
    schedule,
    openSurvey,
    closeSurvey,
    generate,
    apply,
    closePlanner: () => setPlannerOpen(false),
  };
}
