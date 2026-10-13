import { useState } from 'react';
import { Mail, Lock, User, Briefcase, Calendar, Target, ArrowRight, Eye, EyeOff, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
  health?: string;
}

interface DesktopLoginProps {
  onLogin: (userData: UserData) => void;
}

function Field({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  icon: any;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-11 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function DesktopLogin({ onLogin }: DesktopLoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [habits, setHabits] = useState('');
  const [goals, setGoals] = useState('');
  const [health, setHealth] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: 'Người dùng', email: loginEmail });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName.trim()) {
      onLogin({ name: signupName.trim(), email: signupEmail, age, job, habits, goals, health });
    }
  };

  return (
    <div className="desktop-ui min-h-screen w-full flex bg-white">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[45%] relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-14 flex-col justify-between overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Logo size={36} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DayTrack</h1>
            <p className="text-sm text-white/70 font-medium">Năng suất lành mạnh</p>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Xây dựng ngày<br />hoàn hảo của bạn.
          </h2>
          <p className="text-white/80 mt-4 text-sm max-w-sm leading-relaxed">
            Lên lịch trình tuần, quản lý nhiệm vụ, tập trung với nhạc nền và theo dõi thành tựu — tất cả trong một.
          </p>
        </div>
        <p className="relative z-10 text-white/60 text-xs">© 2026 DayTrack. Mọi quyền được bảo lưu.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center">
              <Logo size={30} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">DayTrack</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {activeTab === 'login' ? 'Chào mừng trở lại 👋' : 'Bắt đầu hành trình 🌱'}
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-medium">
            {activeTab === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản miễn phí'}
          </p>

          <div className="flex mb-6 border-b border-gray-100">
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <Field icon={Mail} label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="email@cuaban.com" required />
                <Field icon={Lock} label="Mật khẩu" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="Nhập mật khẩu" required />
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-semibold text-blue-500 hover:text-blue-700">Quên mật khẩu?</button>
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                  Đăng nhập <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={User} label="Tên *" value={signupName} onChange={setSignupName} placeholder="Tên của bạn" required />
                  <Field icon={Calendar} label="Tuổi" type="number" value={age} onChange={setAge} placeholder="Tuổi" />
                </div>
                <Field icon={Mail} label="Email *" type="email" value={signupEmail} onChange={setSignupEmail} placeholder="email@cuaban.com" required />
                <Field icon={Lock} label="Mật khẩu *" type="password" value={signupPassword} onChange={setSignupPassword} placeholder="Tối thiểu 6 ký tự" required />
                <Field icon={Briefcase} label="Nghề nghiệp / Học tập" value={job} onChange={setJob} placeholder="VD: Sinh viên" />
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Thói quen hiện tại</label>
                  <textarea value={habits} onChange={e => setHabits(e.target.value)} rows={2}
                    placeholder="VD: Học buổi sáng, tập thể dục 3 lần/tuần..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mục tiêu với DayTrack</label>
                  <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={2}
                    placeholder="VD: Quản lý thời gian tốt hơn, giảm stress..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tình trạng sức khỏe</label>
                  <textarea value={health} onChange={e => setHealth(e.target.value)} rows={2}
                    placeholder="VD: Sức khỏe tốt, thường xuyên thức khuya, hay mệt mỏi..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 transition-all resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                  Tạo tài khoản <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
