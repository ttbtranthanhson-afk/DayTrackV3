import { motion } from 'motion/react';
import { Clock, Apple, Dumbbell, BookOpen, Info } from 'lucide-react';

interface AIScheduleSuggestionProps {
  scheduleTitle: string;
  scheduleTime: string;
}

export function AIScheduleSuggestion({ scheduleTitle, scheduleTime }: AIScheduleSuggestionProps) {
  const getCategory = () => {
    const title = scheduleTitle.toLowerCase();
    if (title.includes('ăn') || title.includes('bữa') || title.includes('sáng') || title.includes('trưa') || title.includes('tối') || title.includes('eat') || title.includes('meal') || title.includes('breakfast') || title.includes('lunch') || title.includes('dinner')) {
      return 'eating';
    } else if (title.includes('tập') || title.includes('thể dục') || title.includes('gym') || title.includes('thể thao') || title.includes('exercise') || title.includes('workout') || title.includes('sport')) {
      return 'exercise';
    } else {
      return 'study';
    }
  };

  const category = getCategory();

  const renderEatingSuggestion = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Apple className="w-5 h-5 text-orange-500" />
        <h4 className="font-medium text-gray-800">Gợi ý dinh dưỡng</h4>
      </div>

      {/* Goals */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Mục tiêu của bạn:</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-sm">
            Tăng cân
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Giảm cân
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Tăng cơ
          </button>
        </div>
      </div>

      {/* Suggested Time */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Thời gian gợi ý:</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm">
            16:00 - 17:00
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            16:30 - 17:30
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            17:00 - 18:00
          </button>
        </div>
      </div>

      {/* Food Suggestions */}
      <div className="bg-orange-50 rounded-xl p-3">
        <p className="text-sm font-medium text-gray-800 mb-2">Bữa ăn được đề xuất:</p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Ức gà - 150g (protein)</li>
          <li>• Gạo lứt - 100g (carbs)</li>
          <li>• Rau củ hỗn hợp - 80g (chất xơ, vitamin)</li>
          <li>• Dầu ô liu - 1 tbsp (chất béo lành mạnh)</li>
        </ul>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          Bữa ăn này cung cấp macro cân bằng cho tăng cơ: protein cao để phục hồi,
          carb phức tạp để tạo năng lượng, và chất béo lành mạnh cho sản xuất hormone.
        </p>
      </div>
    </div>
  );

  const renderStudySuggestion = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-purple-500" />
        <h4 className="font-medium text-gray-800">Gợi ý phương pháp học tập</h4>
      </div>

      {/* Suggested Time */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Thời gian học gợi ý:</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm">
            16:00 - 17:00
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            16:30 - 17:30
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            17:00 - 18:00
          </button>
        </div>
      </div>

      {/* Study Method */}
      <div className="bg-purple-50 rounded-xl p-3">
        <p className="text-sm font-medium text-gray-800 mb-2">Phương pháp được đề xuất:</p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Sử dụng kỹ thuật Pomodoro (25p tập trung + 5p nghỉ)</li>
          <li>• Gợi nhớ chủ động: tự kiểm tra không xem ghi chú</li>
          <li>• Ghi chép tay để ghi nhớ tốt hơn</li>
          <li>• Ôn tập tài liệu trong vòng 24 giờ</li>
        </ul>
      </div>

      {/* Posture & Health */}
      <div className="bg-green-50 rounded-xl p-3">
        <p className="text-sm font-medium text-gray-800 mb-2">Mẹo học tập lành mạnh:</p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Ngồi thẳng, chân phẳng trên sàn</li>
          <li>• Màn hình ngang tầm mắt, cách 50cm</li>
          <li>• Nghỉ 5 phút sau mỗi 25 phút</li>
          <li>• Duỗi người và nhìn ra xa màn hình</li>
        </ul>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          Phương pháp này tối đa hóa sự tập trung và ghi nhớ trong khi ngăn ngừa kiệt sức.
          Nghỉ ngơi thường xuyên giúp duy trì sự tập trung và bảo vệ sức khỏe thể chất.
        </p>
      </div>
    </div>
  );

  const renderExerciseSuggestion = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell className="w-5 h-5 text-green-500" />
        <h4 className="font-medium text-gray-800">Gợi ý tập luyện</h4>
      </div>

      {/* Goals */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Mục tiêu của bạn:</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm">
            Tăng cơ
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Giảm cân
          </button>
        </div>
      </div>

      {/* Suggested Time */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Thời gian gợi ý:</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm">
            16:00 - 17:00
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            16:30 - 17:30
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            17:00 - 18:00
          </button>
        </div>
      </div>

      {/* Exercise Plan */}
      <div className="bg-green-50 rounded-xl p-3">
        <p className="text-sm font-medium text-gray-800 mb-2">Bài tập hôm nay:</p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Chạy bộ - 3km (khởi động cardio)</li>
          <li>• Chống đẩy - 3 sets 15 lần</li>
          <li>• Plank - 3 sets 45 giây</li>
          <li>• Squat - 3 sets 20 lần</li>
        </ul>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          Bài tập này kết hợp cardio và rèn luyện sức mạnh để tăng cơ tối ưu.
          Các bài tập nhắm vào các nhóm cơ chính trong khi cải thiện sức bền.
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-3 pb-4 border-t border-gray-200">
        {category === 'eating' && renderEatingSuggestion()}
        {category === 'study' && renderStudySuggestion()}
        {category === 'exercise' && renderExerciseSuggestion()}
      </div>
    </motion.div>
  );
}
