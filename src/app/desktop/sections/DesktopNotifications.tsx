import { useState } from 'react';
import { CalendarDays, AlertCircle, Bell, Volume2, Moon, Sun, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { loadSettings, saveSettings, type NotificationSettings } from '../../hooks/notificationSettings';
import { requestPermission, formatClock } from '../../hooks/notificationService';
import { TimePickerModal } from '../../components/TimePickerModal';
import { DesktopPageHeader, DesktopCard } from '../DesktopUI';

function Toggle({ enabled, onToggle, color = 'bg-purple-500' }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${enabled ? color : 'bg-gray-200'}`}
    >
      <motion.div
        animate={{ x: enabled ? 18 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export function DesktopNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
  const [picker, setPicker] = useState<{ key: 'morning' | 'evening'; title: string } | null>(null);

  const apply = (next: NotificationSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const toggleReminder = (id: 'schedule' | 'deadline' | 'summary') => {
    const next = { ...settings, reminders: { ...settings.reminders, [id]: !settings.reminders[id] } };
    if (next.reminders[id]) requestPermission();
    apply(next);
  };

  const toggleSound = (key: 'sound' | 'vibrate' | 'silent') => {
    const s = { ...settings.sound };
    if (key === 'silent') {
      s.silent = !s.silent;
      if (s.silent) { s.sound = false; s.vibrate = false; }
    } else {
      if (key === 'sound') s.sound = !s.sound;
      else s.vibrate = !s.vibrate;
      if (s.sound || s.vibrate) s.silent = false;
    }
    apply({ ...settings, sound: s });
  };

  const reminders = [
    { id: 'schedule' as const, icon: CalendarDays, title: 'Nhắc lịch trình', description: 'Nhận thông báo trước lịch trình', color: 'bg-blue-500', enabled: settings.reminders.schedule },
    { id: 'deadline' as const, icon: AlertCircle, title: 'Nhắc hạn nhiệm vụ', description: 'Nhắc nhiệm vụ chưa hoàn thành trước khi hết giờ', color: 'bg-orange-500', enabled: settings.reminders.deadline },
    { id: 'summary' as const, icon: Bell, title: 'Nhắc tổng kết ngày', description: 'Tổng kết buổi tối về ngày của bạn', color: 'bg-purple-500', enabled: settings.reminders.summary },
  ];

  const soundItems = [
    { key: 'sound' as const, icon: Volume2, title: 'Âm thanh thông báo', color: 'bg-blue-500' },
    { key: 'vibrate' as const, icon: Bell, title: 'Rung', color: 'bg-green-500' },
    { key: 'silent' as const, icon: Moon, title: 'Chế độ im lặng', color: 'bg-gray-500' },
  ];

  const timeItems = [
    { key: 'morning' as const, icon: Sun, title: 'Nhắc buổi sáng', sub: 'Xem trước lịch hàng ngày', color: 'bg-orange-500' },
    { key: 'evening' as const, icon: Moon, title: 'Tổng kết buổi tối', sub: 'Tóm tắt cuối ngày', color: 'bg-pink-500' },
  ];

  return (
    <div>
      <DesktopPageHeader title="Thông báo" subtitle="Luôn được nhắc nhở đúng lúc" />

      <div className="grid grid-cols-2 gap-6">
        <DesktopCard title="Nhắc nhở" bodyClassName="">
          <div className="divide-y divide-gray-50">
            {reminders.map(r => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                  </div>
                  <Toggle enabled={r.enabled} onToggle={() => toggleReminder(r.id)} color={r.color} />
                </div>
              );
            })}
          </div>
        </DesktopCard>

        <DesktopCard title="Âm thanh & Rung" bodyClassName="">
          <div className="divide-y divide-gray-50">
            {soundItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  <span className="flex-1 text-sm font-bold text-gray-800">{item.title}</span>
                  <Toggle enabled={settings.sound[item.key]} onToggle={() => toggleSound(item.key)} />
                </div>
              );
            })}
          </div>
        </DesktopCard>

        <DesktopCard title="Thời gian nhắc" bodyClassName="" className="col-span-2">
          <div className="divide-y divide-gray-50">
            {timeItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => setPicker({ key: item.key, title: item.key === 'morning' ? 'Nhắc buổi sáng' : 'Tổng kết buổi tối' })}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatClock(settings.times[item.key])}
                  </button>
                </div>
              );
            })}
          </div>
        </DesktopCard>
      </div>

      {picker && (
        <TimePickerModal
          key={picker.key}
          open
          title={picker.title}
          value={settings.times[picker.key]}
          onClose={() => setPicker(null)}
          onSave={time => apply({ ...settings, times: { ...settings.times, [picker.key]: time } })}
        />
      )}
    </div>
  );
}
