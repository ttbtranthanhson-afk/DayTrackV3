import { ChevronLeft, Globe, MessageCircle, Mail, Instagram, FileText, Shield, ExternalLink, Send } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

const team = [
  { name: 'Alex Chen', role: 'Người sáng lập', avatar: 'A', color: 'bg-blue-500' },
  { name: 'Sarah Kim', role: 'Nhà thiết kế', avatar: 'S', color: 'bg-pink-500' },
  { name: 'David Lee', role: 'Lập trình viên', avatar: 'D', color: 'bg-green-500' },
];

const social = [
  { icon: Globe, label: 'Website', value: 'daytrack.app', color: 'bg-blue-500' },
  { icon: MessageCircle, label: 'Discord', value: 'Tham gia cộng đồng', color: 'bg-indigo-500' },
  { icon: Mail, label: 'Email', value: 'hello@daytrack.app', color: 'bg-orange-500' },
  { icon: Instagram, label: 'Instagram', value: '@daytrack', color: 'bg-pink-500' },
];

export function About() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold text-gray-900">Giới thiệu</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Về DayTrack</p>
        </div>

        <div className="px-5 space-y-5">
          {/* Brand hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <Logo size={48} />
              </div>
              <h2 className="text-2xl font-bold">DayTrack</h2>
              <p className="text-white/80 mt-1 font-medium italic">"Xây dựng ngày hoàn hảo của bạn."</p>
            </div>
          </motion.div>

          {/* App info */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Thông tin ứng dụng</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {[
                { label: 'Phiên bản', value: '1.0.0' },
                { label: 'Cập nhật gần nhất', value: '18/6/2026' },
                { label: 'Số bản dựng', value: '2026.06.001' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                  <span className="text-sm font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Đội ngũ</p>
            <div className="grid grid-cols-3 gap-3">
              {team.map(m => (
                <div key={m.name} className="bg-white rounded-2xl p-4 text-center">
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${m.color} flex items-center justify-center text-white text-xl font-bold`}>
                    {m.avatar}
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{m.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{m.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Liên hệ</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {social.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-[18px] h-[18px] text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-gray-800">{item.value}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Pháp lý</p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
              {[
                { icon: Shield, label: 'Chính sách bảo mật' },
                { icon: FileText, label: 'Điều khoản dịch vụ' },
                { icon: FileText, label: 'Giấy phép mã nguồn mở' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm font-bold text-gray-700">{item.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl py-4 font-bold text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Gửi phản hồi
          </motion.button>

          <p className="text-center text-xs text-gray-400 pb-2 font-medium">
            Được tạo ra với ❤️ cho những sinh viên quan tâm đến sự cân bằng<br />
            © 2026 DayTrack. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
}
