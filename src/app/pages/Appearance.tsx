import { useState } from 'react';
import { ChevronLeft, Sun, Moon, Sparkles, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

const themes = [
  { id: 'light', name: 'Sáng', icon: Sun, preview: 'bg-white border-gray-200', textColor: 'text-gray-900', subColor: 'text-gray-400', barColor: 'bg-blue-400' },
  { id: 'dark', name: 'Tối', icon: Moon, preview: 'bg-gray-900 border-gray-700', textColor: 'text-white', subColor: 'text-gray-500', barColor: 'bg-purple-400' },
  { id: 'pastel', name: 'Pastel', icon: Sparkles, preview: 'bg-pink-50 border-pink-200', textColor: 'text-pink-900', subColor: 'text-pink-400', barColor: 'bg-pink-400' },
  { id: 'auto', name: 'Tự động', icon: Smartphone, preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400', textColor: 'text-gray-700', subColor: 'text-gray-400', barColor: 'bg-gray-500' },
];

const accentColors = [
  { id: 'blue', color: 'bg-blue-400', name: 'Xanh' },
  { id: 'purple', color: 'bg-purple-400', name: 'Tím' },
  { id: 'pink', color: 'bg-pink-400', name: 'Hồng' },
  { id: 'green', color: 'bg-green-400', name: 'Xanh lá' },
  { id: 'orange', color: 'bg-orange-400', name: 'Cam' },
];

function Toggle({ enabled, onToggle, color = 'bg-blue-500' }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${enabled ? color : 'bg-gray-200'}`}>
      <motion.div
        animate={{ x: enabled ? 18 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export function Appearance() {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [fontSize, setFontSize] = useState(16);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-14 pb-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Cài đặt
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Giao diện</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Tùy chỉnh trải nghiệm của bạn</p>
        </div>

        <div className="px-5 space-y-5">
          {/* Theme selection */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Chủ đề</p>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(theme => {
                const Icon = theme.icon;
                const isSelected = selectedTheme === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative bg-white rounded-2xl p-3 border-2 transition-all ${
                      isSelected ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-transparent'
                    }`}
                  >
                    {/* Mini app preview */}
                    <div className={`w-full aspect-[4/3] rounded-xl border ${theme.preview} mb-3 p-2.5 flex flex-col gap-1.5 overflow-hidden`}>
                      <div className={`w-12 h-1.5 ${theme.barColor} rounded-full`} />
                      <div className={`flex-1 flex flex-col gap-1 justify-center`}>
                        <div className={`w-full h-1 rounded-full ${theme.subColor.replace('text-', 'bg-').replace('-400', '-200').replace('-500', '-200')}`} style={{ opacity: 0.5 }} />
                        <div className={`w-3/4 h-1 rounded-full`} style={{ background: 'currentColor', opacity: 0.2 }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">{theme.name}</span>
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
          </div>

          {/* Accent colors */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Màu nhấn</p>
            <div className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-center">
                {accentColors.map(c => {
                  const isSelected = selectedColor === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedColor(c.id)}
                      className="flex flex-col items-center gap-1.5">
                      <div className={`w-11 h-11 rounded-full ${c.color} flex items-center justify-center transition-all ${
                        isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}>
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Font size */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Văn bản</p>
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-700">Cỡ chữ</span>
                  <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">{fontSize}px</span>
                </div>
                <input type="range" min="14" max="20" value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-1.5">
                  <span>Nhỏ</span>
                  <span>Lớn</span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="font-bold text-gray-800" style={{ fontSize }}>Văn bản mẫu</p>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: fontSize - 2 }}>
                  Đây là cách chữ sẽ hiển thị trong ứng dụng
                </p>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Bố cục</p>
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Chế độ gọn</p>
                  <p className="text-xs text-gray-400 mt-0.5">Giảm khoảng cách để xem nhiều nội dung hơn</p>
                </div>
                <Toggle enabled={compactMode} onToggle={() => setCompactMode(v => !v)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
