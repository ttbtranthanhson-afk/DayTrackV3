import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CalendarDays, Calendar, CheckSquare, Clock, Award, Settings, LogOut } from 'lucide-react';
import { LogoMini } from '../components/Logo';

interface DesktopUser {
  name: string;
  email: string;
}

interface DesktopLayoutProps {
  userData: DesktopUser;
  onLogout: () => void;
  children: ReactNode;
}

const navItems = [
  { path: '/timetable', icon: CalendarDays, label: 'Lịch trình', accent: 'text-blue-500' },
  { path: '/calendar', icon: Calendar, label: 'Lịch', accent: 'text-purple-500' },
  { path: '/tasks', icon: CheckSquare, label: 'Nhiệm vụ', accent: 'text-orange-500' },
  { path: '/focus', icon: Clock, label: 'Tập trung', accent: 'text-green-500' },
  { path: '/achive', icon: Award, label: 'Thành tựu', accent: 'text-pink-500' },
  { path: '/settings', icon: Settings, label: 'Cài đặt', accent: 'text-gray-500' },
];

export function DesktopLayout({ userData, onLogout, children }: DesktopLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = location.pathname === '/' ? '/timetable' : location.pathname;

  const initials = userData.name
    ? userData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'DT';

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="desktop-ui flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <LogoMini size={40} />
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">DayTrack</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Năng suất lành mạnh</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = item.path === activePath;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                  isActive ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.accent}`} strokeWidth={isActive ? 2.3 : 1.9} />
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-gray-800 truncate">{userData.name || 'Người dùng'}</p>
              <p className="text-[11px] text-gray-400 truncate">{userData.email}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1700px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
