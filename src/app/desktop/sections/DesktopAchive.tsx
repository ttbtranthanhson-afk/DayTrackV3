import { Award, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAchive } from '../../hooks/useAchive';
import { useAchievements } from '../../hooks/achievementStore';
import { DesktopPageHeader, DesktopCard } from '../DesktopUI';

export function DesktopAchive() {
  const { expandedId, totalAchievements, completedTotal, toggleExpand, groups } = useAchive();
  const aiAchievements = useAchievements();
  const aiCompleted = aiAchievements.filter(a => a.current >= a.target).length;

  return (
    <div>
      <DesktopPageHeader title="Thành tựu" subtitle="Tiến trình của bạn" />

      {/* Stats banner */}
      <div data-tour="achive-stats" className="rounded-3xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 p-5 flex items-center gap-5 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
          <Award className="w-7 h-7 text-pink-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900">{completedTotal + aiCompleted}</span>
            <span className="text-sm text-gray-400">/ {totalAchievements + aiAchievements.length} thành tựu</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Tiếp tục phát huy! Bạn đang làm rất tốt.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* AI achievements */}
        <div data-tour="achive-ai" className="col-span-1">
          <DesktopCard
            title="Mục tiêu từ AI"
            icon={Sparkles}
            accent="text-violet-500"
            action={<span className="text-xs font-bold text-gray-400">{aiCompleted}/{aiAchievements.length}</span>}
            className="sticky top-0"
          >
            {aiAchievements.length > 0 ? (
              <div className="space-y-3">
                {aiAchievements.map(achievement => {
                  const percent = Math.min(100, Math.round((achievement.current / achievement.target) * 100));
                  const done = achievement.current >= achievement.target;
                  return (
                    <motion.div key={achievement.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 rounded-2xl px-4 py-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${done ? 'bg-green-100' : 'bg-white'}`}>
                          {achievement.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-bold ${done ? 'text-green-600' : 'text-gray-800'}`}>{achievement.title}</p>
                            {done && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Đạt được</span>}
                          </div>
                          {achievement.description && <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>}
                        </div>
                        <span className="text-xs font-bold text-gray-400 flex-shrink-0">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${done ? 'bg-green-400' : achievement.barColor}`} />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {achievement.current}/{achievement.target} {achievement.unit}
                        {achievement.reason ? ` · ${achievement.reason}` : ''}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-300 font-semibold text-center py-8">
                Dùng "Khảo sát" trong Lịch trình để AI tạo mục tiêu cho bạn.
              </p>
            )}
          </DesktopCard>
        </div>

        {/* Achievement groups */}
        <div data-tour="achive-groups" className="col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {groups.map((group, gi) => {
              const Icon = group.icon;
              const isExpanded = expandedId === group.id;
              const completed = group.subAchievements.filter(s => s.completed).length;
              return (
                <div key={group.id} className={gi > 0 ? 'border-t border-gray-50' : ''}>
                  <button onClick={() => toggleExpand(group.id)} className="w-full flex items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${group.barColor}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left ml-3">
                      <p className="text-sm font-bold text-gray-800">{group.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500 mr-3">{completed}/{group.subAchievements.length}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 grid grid-cols-2 gap-2.5">
                          {group.subAchievements.map(sub => (
                            <div key={sub.id} className="bg-gray-50 rounded-xl px-4 py-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.completed ? 'bg-green-400' : 'bg-gray-200'}`} />
                                  <span className={`text-xs font-semibold truncate ${sub.completed ? 'text-gray-700' : 'text-gray-500'}`}>{sub.title}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 flex-shrink-0">{sub.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${sub.completed ? 'bg-green-400' : group.barColor}`} style={{ width: `${sub.progress}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
