import { Sun, Moon, Sparkles, Smartphone, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppTheme, type AppTheme } from '../../hooks/useAppTheme';
import { DesktopPageHeader } from '../DesktopUI';

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

export function DesktopAppearance() {
  const { theme, changeTheme } = useAppTheme();

  return (
    <div>
      <DesktopPageHeader title="Giao diện" subtitle="Tùy chỉnh trải nghiệm của bạn" />

      <div className="grid grid-cols-4 gap-4">
        {themes.map(item => {
          const Icon = item.icon;
          const isSelected = theme === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => changeTheme(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`relative bg-white rounded-3xl p-4 border-2 text-left transition-all ${
                isSelected ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-transparent'
              }`}
            >
              <div className={`w-full aspect-[4/3] rounded-2xl border ${item.preview} mb-3 p-3 flex flex-col gap-2 overflow-hidden`}>
                <div className={`w-14 h-1.5 ${item.barColor} rounded-full`} />
                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                  <div className="w-full h-1 rounded-full bg-current opacity-10" />
                  <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-700">{item.name}</span>
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

      <p className="text-sm text-gray-400 font-medium pt-5 px-1">
        {theme === 'auto'
          ? 'Tự động dùng chế độ Sáng hoặc Tối theo cài đặt của thiết bị.'
          : `Chủ đề ${themes.find(t => t.id === theme)?.name} đang được áp dụng.`}
      </p>
    </div>
  );
}
