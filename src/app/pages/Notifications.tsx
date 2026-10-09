import { useState } from 'react';
import { ChevronLeft, Bell, Volume2, Moon, Clock, CheckCircle, BookOpen, Target } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

interface NotificationSetting {
  id: string;
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  color: string;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-purple-500' : 'bg-gray-200'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 18 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export function Notifications() {
  const navigate = useNavigate();

  const [reminders, setReminders] = useState<NotificationSetting[]>([
    { id: '1', icon: BookOpen, title: 'Nhắc học tập', description: 'Nhận thông báo trước phiên học', enabled: true, color: 'bg-blue-500' },
    { id: '2', icon: CheckCircle, title: 'Nhắc hạn nhiệm vụ', description: 'Cảnh báo hạn sắp đến', enabled: true, color: 'bg-orange-500' },
    { id: '3', icon: Target, title: 'Nhắc phiên tập trung', description: 'Đến giờ bắt đầu phiên tập trung', enabled: false, color: 'bg-green-500' },
    { id: '4', icon: Bell, title: 'Nhắc tổng kết ngày', description: 'Tóm tắt buổi tối về ngày của bạn', enabled: true, color: 'bg-purple-500' },
  ]);

  const [soundSettings, setSoundSettings] = useState({ sound: true, vibrate: true, silent: false });

  const toggleReminder = (id: string) =>
    setReminders(r => r.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));

  const toggleSound = (key: 'sound' | 'vibrate' | 'silent') =>
    setSoundSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-14 pb-4 bg-gray-50">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Cài đặt
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Luôn được nhắc nhở đúng lúc</p>
        </div>

        <div className="px-5 space-y-5">
          {/* Reminders */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Nhắc nhở</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {reminders.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-4 py-4">
                    <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-[18px] h-[18px] text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                    </div>
                    <Toggle enabled={r.enabled} onToggle={() => toggleReminder(r.id)} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound & Vibration */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Âm thanh & Rung</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {([
                { key: 'sound' as const, icon: Volume2, title: 'Âm thanh thông báo', color: 'bg-blue-500' },
                { key: 'vibrate' as const, icon: Bell, title: 'Rung', color: 'bg-green-500' },
                { key: 'silent' as const, icon: Moon, title: 'Chế độ im lặng', color: 'bg-gray-500' },
              ]).map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center gap-4 px-4 py-4">
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-[18px] h-[18px] text-white" />
                    </div>
                    <span className="flex-1 text-sm font-bold text-gray-800">{item.title}</span>
                    <Toggle enabled={soundSettings[item.key]} onToggle={() => toggleSound(item.key)} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time settings */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Thời gian nhắc</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {[
                { icon: Clock, title: 'Nhắc buổi sáng', sub: 'Xem trước lịch hàng ngày', time: '8:00 SA', color: 'bg-orange-500' },
                { icon: Clock, title: 'Tổng kết buổi tối', sub: 'Tóm tắt cuối ngày', time: '9:00 CH', color: 'bg-pink-500' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-4 px-4 py-4">
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-[18px] h-[18px] text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
