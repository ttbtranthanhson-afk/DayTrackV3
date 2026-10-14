import { useState } from 'react';
import { toast } from 'sonner';
import type { BlockType } from '../../../shared/ai';
import { replaceScheduleDay } from './scheduleStore';
import { replaceCalendarDay } from './calendarStore';
import { setBusyRanges, useBusyData } from './busyStore';
import { addAiAchievements } from './achievementStore';
import { generateAchievements } from '../services/gemini';
import type { ScheduleBlock, ScheduleTask } from './scheduleData';

export type PlanBlockMeta = { title: string; type: BlockType; tasks: string[] };

interface UseAiPlannerOptions {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string, scheduleBlockId?: string, blockType?: BlockType) => void;
  onApplied?: () => void;
  successMessage?: string;
  dateKey?: string;
  busyKey?: string;
}

export function useAiPlanner(day: string, schedule: ScheduleBlock[], options: UseAiPlannerOptions = {}) {
  const [busyOpen, setBusyOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [localBusy, setLocalBusy] = useState<string[]>([]);

  const busyData = useBusyData();
  const busy = options.busyKey ? busyData[options.busyKey] ?? [] : localBusy;

  const setBusy = (nextBusy: string[]) => {
    if (options.busyKey) setBusyRanges(options.busyKey, nextBusy);
    else setLocalBusy(nextBusy);
  };

  const openSurvey = () => setBusyOpen(true);
  const closeSurvey = () => setBusyOpen(false);

  const generate = (nextBusy: string[]) => {
    setBusy(nextBusy);
    setBusyOpen(false);
    setPlannerOpen(true);
  };

  const apply = (blocks: ScheduleBlock[], optionName: string, meta: PlanBlockMeta[]) => {
    if (options.dateKey) replaceCalendarDay(options.dateKey, blocks);
    else replaceScheduleDay(day, blocks);

    if (options.onAddTasks) {
      blocks.forEach(block => {
        if (block.tasks && block.tasks.length > 0) {
          options.onAddTasks!(block.tasks, optionName, day, options.dateKey, block.id, block.type);
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
    setBusy,
    generate,
    apply,
    closePlanner: () => setPlannerOpen(false),
  };
}
