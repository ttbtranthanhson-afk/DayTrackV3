import { ChevronLeft, Mail, Calendar, Briefcase, Heart, Target, Award, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router';

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
  health?: string;
}

interface ProfileProps {
  userData: UserData;
  achievements: Array<{
    id: string;
    title: string;
    icon: any;
    color: string;
  }>;
}

export function Profile({ userData, achievements }: ProfileProps) {
  const navigate = useNavigate();

  const initials = userData.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Thông tin của bạn</p>
        </div>

        {/* Profile Card */}
        <div className="mx-5 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-5 text-white relative overflow-hidden">
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

          {(userData.age || userData.job || userData.goals) && (
            <div className="flex gap-2 mt-4 relative z-10 flex-wrap">
              {userData.age && (
                <span className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {userData.age} tuổi
                </span>
              )}
              {userData.job && (
                <span className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {userData.job}
                </span>
              )}
              {userData.goals && (
                <span className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Có mục tiêu
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-5 space-y-5">
          {/* Personal Information */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Thông tin cá nhân
            </p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {userData.age && (
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Tuổi</p>
                    <p className="text-sm font-bold text-gray-800">{userData.age} tuổi</p>
                  </div>
                </div>
              )}
              {userData.job && (
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Nghề nghiệp</p>
                    <p className="text-sm font-bold text-gray-800">{userData.job}</p>
                  </div>
                </div>
              )}
              {userData.habits && (
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Thói quen & Sở thích</p>
                    <p className="text-sm font-bold text-gray-800">{userData.habits}</p>
                  </div>
                </div>
              )}
              {userData.goals && (
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Target className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Mục tiêu với DayTrack</p>
                    <p className="text-sm font-bold text-gray-800">{userData.goals}</p>
                  </div>
                </div>
              )}
              {userData.health && (
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                    <HeartPulse className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Tình trạng sức khỏe</p>
                    <p className="text-sm font-bold text-gray-800">{userData.health}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Thành tựu gần đây
              </p>
              <button
                onClick={() => navigate('/achive')}
                className="text-sm font-semibold text-blue-500 hover:text-blue-600"
              >
                Xem tất cả
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.slice(0, 4).map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="bg-white rounded-2xl p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {achievement.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-4">
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
              <p className="text-sm text-gray-500">
                Tiếp tục xây dựng thói quen năng suất lành mạnh! Bạn đang đi đúng hướng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}