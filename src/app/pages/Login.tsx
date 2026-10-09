import { useState } from 'react';
import { Mail, Lock, User, Briefcase, Calendar, Target, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
}

interface LoginProps {
  onLogin: (userData: UserData) => void;
}

function InputField({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  extra,
}: {
  icon: any;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  extra?: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-11 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

export function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [habits, setHabits] = useState('');
  const [goals, setGoals] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: 'Người dùng', email: loginEmail });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName.trim()) {
      onLogin({ name: signupName.trim(), email: signupEmail, age, job, habits, goals });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 px-8 pt-20 pb-16 overflow-hidden flex-shrink-0">
        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 right-8 w-20 h-20 bg-white/10 rounded-full" />

        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Logo size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DayTrack</h1>
              <p className="text-sm text-white/70 font-medium">Năng suất lành mạnh</p>
            </div>
          </div>
          <p className="text-white/90 text-lg font-semibold leading-snug">
            {activeTab === 'login' ? 'Chào mừng\ntrở lại 👋' : 'Bắt đầu\nhành trình 🌱'}
          </p>
        </div>

        {/* Wave bottom */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 390 32" preserveAspectRatio="none">
          <path d="M0,32 L0,16 Q97.5,0 195,16 Q292.5,32 390,16 L390,32 Z" fill="white" />
        </svg>
      </div>

      {/* Form area */}
      <div className="flex-1 bg-white max-w-md mx-auto w-full px-6 pt-6 pb-10 overflow-y-auto">
        {/* Tab switcher */}
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
              <InputField icon={Mail} label="Email" type="email" value={loginEmail}
                onChange={setLoginEmail} placeholder="email@cuaban.com" required />
              <InputField icon={Lock} label="Mật khẩu" type="password" value={loginPassword}
                onChange={setLoginPassword} placeholder="Nhập mật khẩu" required />

              <div className="flex justify-end">
                <button type="button" className="text-xs font-semibold text-blue-500 hover:text-blue-700">
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
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
              <InputField icon={User} label="Tên của bạn *" value={signupName}
                onChange={setSignupName} placeholder="Nhập tên của bạn" required />
              <InputField icon={Mail} label="Email *" type="email" value={signupEmail}
                onChange={setSignupEmail} placeholder="email@cuaban.com" required />
              <InputField icon={Lock} label="Mật khẩu *" type="password" value={signupPassword}
                onChange={setSignupPassword} placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)" required />

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400">Thông tin thêm (tùy chọn)</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <InputField icon={Calendar} label="Tuổi" type="number" value={age}
                onChange={setAge} placeholder="Tuổi của bạn" />
              <InputField icon={Briefcase} label="Nghề nghiệp / Học tập" value={job}
                onChange={setJob} placeholder="VD: Sinh viên, Lập trình viên" />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Thói quen hiện tại
                </label>
                <textarea
                  value={habits}
                  onChange={e => setHabits(e.target.value)}
                  placeholder="VD: Học buổi sáng, tập thể dục 3 lần/tuần..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mục tiêu với DayTrack
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    placeholder="VD: Quản lý thời gian tốt hơn, giảm stress..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                Tạo tài khoản
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Được tạo ra cho những sinh viên quan tâm đến sự cân bằng
        </p>
      </div>
    </div>
  );
}
