import { ChevronLeft, Sun, Moon, Sparkles, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAppTheme, type AppTheme } from '../hooks/useAppTheme';

const themes: Array<{
  id: AppTheme;
  name: string;
  icon: typeof Sun;
  preview: string;
  textColor: string;
  subColor: string;
  barColor: string;
}> = [
  { id: 'light', name: 'Sáng', icon: Sun, preview: 'bg-white border-gray-200', textColor: 'text-gray-900', subColor: 'text-gray-400', barColor: 'bg-blue-400' },
  { id: 'dark', name: 'Tối', icon: Moon, preview: 'bg-gray-900 border-gray-700', textColor: 'text-white', subColor: 'text-gray-500', barColor: 'bg-purple-400' },
  { id: 'pastel', name: 'Pastel', icon: Sparkles, preview: 'bg-pink-50 border-pink-200', textColor: 'text-pink-900', subColor: 'text-pink-400', barColor: 'bg-pink-400' },
  { id: 'auto', name: 'Tự động', icon: Smartphone, preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400', textColor: 'text-gray-700', subColor: 'text-gray-400', barColor: 'bg-gray-500' },
];

export function Appearance() {
  const navigate = useNavigate();
  const { theme, changeTheme } = useAppTheme();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-14 pb-4 bg-gray-50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Cài đặt
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Giao diện</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Tùy chỉnh trải nghiệm của bạn</p>
        </div>

        <div className="px-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Chủ đề</p>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(item => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => changeTheme(item.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative bg-white rounded-2xl p-3 border-2 transition-all ${
                      isSelected ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-transparent'
                    }`}
                  >
                    {/* Mini app preview */}
                    <div className={`w-full aspect-[4/3] rounded-xl border ${item.preview} mb-3 p-2.5 flex flex-col gap-1.5 overflow-hidden`}>
                      <div className={`w-12 h-1.5 ${item.barColor} rounded-full`} />
                      <div className={`flex-1 flex flex-col gap-1 justify-center`}>
                        <div className={`w-full h-1 rounded-full ${item.subColor.replace('text-', 'bg-').replace('-400', '-200').replace('-500', '-200')}`} style={{ opacity: 0.5 }} />
                        <div className={`w-3/4 h-1 rounded-full`} style={{ background: 'currentColor', opacity: 0.2 }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">{item.name}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 font-medium pt-3 px-1">
              {theme === 'auto'
                ? 'Tự động dùng chế độ Sáng hoặc Tối theo cài đặt của thiết bị.'
                : `Chủ đề ${themes.find(t => t.id === theme)?.name} đang được áp dụng.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}