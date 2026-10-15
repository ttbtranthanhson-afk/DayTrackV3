import { Mail, Calendar, Briefcase, Heart, Target, Award, HeartPulse, Brain } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DesktopPageHeader } from '../DesktopUI';

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
  health?: string;
  mental?: string;
}

interface DesktopProfileProps {
  userData: UserData;
  achievements: Array<{ id: string; title: string; icon: any; color: string }>;
}

export function DesktopProfile({ userData, achievements }: DesktopProfileProps) {
  const navigate = useNavigate();
  const initials = userData.name
    ? userData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  const infoRows = [
    userData.age && { icon: Calendar, color: 'bg-blue-500', label: 'Tuổi', value: `${userData.age} tuổi` },
    userData.job && { icon: Briefcase, color: 'bg-purple-500', label: 'Nghề nghiệp', value: userData.job },
    userData.habits && { icon: Heart, color: 'bg-pink-500', label: 'Thói quen & Sở thích', value: userData.habits },
    userData.goals && { icon: Target, color: 'bg-orange-500', label: 'Mục tiêu với DayTrack', value: userData.goals },
    userData.health && { icon: HeartPulse, color: 'bg-red-500', label: 'Tình trạng sức khỏe', value: userData.health },
    userData.mental && { icon: Brain, color: 'bg-purple-500', label: 'Tình trạng tinh thần', value: userData.mental },
  ].filter(Boolean) as Array<{ icon: any; color: string; label: string; value: string }>;

  return (
    <div>
      <DesktopPageHeader
        title="Hồ sơ"
        subtitle="Thông tin của bạn"
        actions={
          <button onClick={() => navigate('/settings')} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
            ← Cài đặt
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute bottom-0 right-8 w-16 h-16 bg-white/10 rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{userData.name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-white/60" />
                  <p className="text-sm text-white/70 truncate">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{achievements.length}</h2>
                <p className="text-sm text-gray-400">Nhóm thành tựu</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-pink-100">
              <p className="text-sm text-gray-500">Tiếp tục xây dựng thói quen năng suất lành mạnh! Bạn đang đi đúng hướng.</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          {infoRows.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Thông tin cá nhân</p>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {infoRows.map(row => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-4 px-4 py-4">
                      <div className={`w-9 h-9 rounded-xl ${row.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-[18px] h-[18px] text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                        <p className="text-sm font-bold text-gray-800">{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thành tựu gần đây</p>
              <button onClick={() => navigate('/achive')} className="text-sm font-semibold text-blue-500 hover:text-blue-600">
                Xem tất cả
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {achievements.slice(0, 4).map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{achievement.title}</h4>
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
