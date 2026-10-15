import { useState } from 'react';
import { Mail, Lock, User, Briefcase, Calendar, Target, ArrowRight, Eye, EyeOff, HeartPulse, Brain, CheckCircle2, Circle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import {
  isValidEmail,
  isPasswordStrong,
  getPasswordChecks,
  accountExists,
  registerAccount,
  verifyAccount,
  getAccountName,
} from '../hooks/accountStorage';

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
  const [health, setHealth] = useState('');
  const [mental, setMental] = useState('');
  const [error, setError] = useState('');

  const passwordChecks = getPasswordChecks(signupPassword);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = loginEmail.trim();
    if (!isValidEmail(email)) {
      setError('Email không hợp lệ. Vui lòng nhập địa chỉ email thật (ví dụ: ten@gmail.com).');
      return;
    }
    const result = verifyAccount(email, loginPassword);
    if (result === 'not_found') {
      setError('Tài khoản này chưa được tạo. Hãy chuyển sang "Tạo tài khoản" để đăng ký.');
      return;
    }
    if (result === 'bad_password') {
      setError('Mật khẩu không đúng. Vui lòng thử lại.');
      return;
    }
    onLogin({ name: getAccountName(email) || 'Người dùng', email });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = signupEmail.trim();
    if (!signupName.trim()) {
      setError('Vui lòng nhập tên của bạn.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Email không hợp lệ. Vui lòng nhập địa chỉ email thật (ví dụ: ten@gmail.com).');
      return;
    }
    if (!isPasswordStrong(signupPassword)) {
      setError('Mật khẩu chưa đủ mạnh: cần tối thiểu 8 ký tự, gồm chữ viết hoa, chữ số và ký tự đặc biệt.');
      return;
    }
    if (!age.trim() || !job.trim() || !habits.trim() || !goals.trim() || !health.trim()) {
      setError('Vui lòng điền đầy đủ tất cả thông tin bên dưới (tuổi, nghề nghiệp, thói quen, mục tiêu, sức khỏe).');
      return;
    }
    if (accountExists(email)) {
      setError('Email này đã được đăng ký. Hãy chuyển sang "Đăng nhập".');
      return;
    }
    registerAccount(email, signupName.trim(), signupPassword);
    onLogin({ name: signupName.trim(), email, age, job, habits, goals, health, mental });
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
              onClick={() => { setActiveTab(tab); setError(''); }}
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

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 leading-relaxed">
                  {error}
                </div>
              )}

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
                onChange={setSignupPassword} placeholder="VD: Daytrack@2026" required />

              {signupPassword.length > 0 && (
                <div className="grid grid-cols-2 gap-2 -mt-1">
                  {([
                    { ok: passwordChecks.length, text: 'Tối thiểu 8 ký tự' },
                    { ok: passwordChecks.upper, text: 'Chữ viết hoa' },
                    { ok: passwordChecks.number, text: 'Chữ số' },
                    { ok: passwordChecks.special, text: 'Ký tự đặc biệt' },
                  ]).map(rule => (
                    <div key={rule.text}
                      className={`flex items-center gap-1.5 text-xs font-semibold ${rule.ok ? 'text-green-600' : 'text-gray-400'}`}>
                      {rule.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      {rule.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400">Thông tin thêm (bắt buộc)</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <InputField icon={Calendar} label="Tuổi *" type="number" value={age}
                onChange={setAge} placeholder="Tuổi của bạn" required />
              <InputField icon={Briefcase} label="Nghề nghiệp / Học tập *" value={job}
                onChange={setJob} placeholder="VD: Sinh viên, Lập trình viên" required />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Thói quen hiện tại *
                </label>
                <textarea
                  value={habits}
                  onChange={e => setHabits(e.target.value)}
                  placeholder="VD: Học buổi sáng, tập thể dục 3 lần/tuần..."
                  required
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mục tiêu với DayTrack *
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    placeholder="VD: Quản lý thời gian tốt hơn, giảm stress..."
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tình trạng sức khỏe *
                </label>
                <div className="relative">
                  <HeartPulse className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={health}
                    onChange={e => setHealth(e.target.value)}
                    placeholder="VD: Sức khỏe tốt, thường xuyên thức khuya, hay mệt mỏi..."
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tình trạng tinh thần (nếu có)
                </label>
                <div className="relative">
                  <Brain className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={mental}
                    onChange={e => setMental(e.target.value)}
                    placeholder="VD: Tinh thần ổn định, căng thẳng kéo dài, mất ngủ..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 leading-relaxed">
                  {error}
                </div>
              )}

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
