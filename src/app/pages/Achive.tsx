import { Award, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAchive, achievementGroups } from '../hooks/useAchive';
import { useAchievements } from '../hooks/achievementStore';

export function Achive() {
  const { expandedId, totalAchievements, completedTotal, toggleExpand } = useAchive();
  const aiAchievements = useAchievements();
  const aiCompleted = aiAchievements.filter(a => a.current >= a.target).length;

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Thành tựu</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tiến trình của bạn</p>
        </div>

        {/* Stats banner */}
        <div data-tour="achive-stats" className="mx-5 mb-5 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{completedTotal + aiCompleted}</span>
              <span className="text-sm text-gray-400">/ {totalAchievements + aiAchievements.length} thành tựu</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Tiếp tục phát huy! Bạn đang làm rất tốt.</p>
          </div>
        </div>

        {/* AI achievements */}
        {aiAchievements.length > 0 && (
          <div data-tour="achive-ai" className="px-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-gray-800">Mục tiêu từ AI</span>
              <span className="text-xs font-bold text-gray-400 ml-auto">{aiCompleted}/{aiAchievements.length}</span>
            </div>
            <div className="space-y-2.5">
              {aiAchievements.map(achievement => {
                const percent = Math.min(100, Math.round((achievement.current / achievement.target) * 100));
                const done = achievement.current >= achievement.target;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-2xl px-4 py-3"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                        done ? 'bg-green-100' : 'bg-white'
                      }`}>
                        {achievement.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-bold ${done ? 'text-green-600' : 'text-gray-800'}`}>
                            {achievement.title}
                          </p>
                          {done && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Đạt được</span>}
                        </div>
                        {achievement.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-400 flex-shrink-0">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${done ? 'bg-green-400' : achievement.barColor}`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {achievement.current}/{achievement.target} {achievement.unit}
                      {achievement.reason ? ` · ${achievement.reason}` : ''}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievement groups */}
        <div data-tour="achive-groups" className="px-5 space-y-px">
          {achievementGroups.map(group => {
            const Icon = group.icon;
            const isExpanded = expandedId === group.id;
            const completed = group.subAchievements.filter(s => s.completed).length;

            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleExpand(group.id)}
                  className="w-full flex items-center group"
                >
                  <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${group.barColor}`}
                    style={{ minHeight: '60px' }} />
                  <div className="flex-1 flex items-center gap-3 py-4 border-b border-gray-50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${group.barColor}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-gray-800">{group.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-500">{completed}/{group.subAchievements.length}</span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
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
                      <div className="ml-4 mb-3 space-y-2">
                        {group.subAchievements.map(sub => (
                          <motion.div
                            key={sub.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-gray-50 rounded-xl px-4 py-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.completed ? 'bg-green-400' : 'bg-gray-200'}`} />
                                <span className={`text-xs font-semibold ${sub.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                                  {sub.title}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-gray-400">{sub.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${sub.progress}%` }}
                                transition={{ duration: 0.5, delay: 0.05 }}
                                className={`h-full rounded-full ${
                                  sub.completed ? 'bg-green-400' : group.barColor
                                }`}
                              />
                            </div>
                          </motion.div>
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
  );
}
