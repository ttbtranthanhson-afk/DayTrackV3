import type { AchievementIdea, BlockType } from '../../../shared/ai';

export interface AchievementTemplate extends AchievementIdea {
  keywords: string[];
  types?: BlockType[];
}

export const AI_ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    title: "Chinh Phục Đỉnh Cao Toán Học",
    description: "Hoàn thành xuất sắc chuỗi thử thách toán học.",
    reason: "Ghi nhận nỗ lực giải quyết các bài tập toán khó.",
    target: 50,
    unit: "bài toán",
    emoji: "📐",
    keywords: ["lam bai tap ve nha mon toan","tu hoc"],
  types: ["study"],
  },
  {
    title: "Văn Hay Chữ Tốt",
    description: "Luyện tập tư duy ngôn ngữ và sáng tạo qua từng trang viết.",
    reason: "Hoàn thành các bài tập và bài văn dài.",
    target: 30,
    unit: "bài viết",
    emoji: "✍",
    keywords: ["lam bai tap ve nha mon ngu van","viet bao cao"],
  types: ["study"],
  },
  {
    title: "Bậc Thầy Ngoại Ngữ",
    description: "Giao tiếp thành thạo và mở rộng vốn từ vựng tiếng Anh.",
    reason: "Duy trì thói quen học từ vựng và luyện nói mỗi ngày.",
    target: 100,
    unit: "từ",
    emoji: "🌐",
    keywords: ["hoc tu vung tieng anh","luyen noi tieng anh"],
  types: ["study"],
  },
  {
    title: "Nhà Khoa Học Nhí",
    description: "Khám phá thế giới tự nhiên và các định luật vật lí.",
    reason: "Hoàn thành các bài tập khoa học tự nhiên.",
    target: 40,
    unit: "bài tập",
    emoji: "🧪",
    keywords: ["lam bai tap ve nha mon vat li","lam bai tap ve nha mon hoa hoc"],
  types: ["study"],
  },
  {
    title: "Sử Gia Tương Lai",
    description: "Nắm vững dòng chảy thời gian và kiến thức xã hội.",
    reason: "Hoàn thành ôn tập các môn lịch sử và địa lí.",
    target: 25,
    unit: "chủ đề",
    emoji: "📜",
    keywords: ["lam bai tap ve nha mon lich su","lam bai tap ve nha mon dia li"],
  types: ["study"],
  },
  {
    title: "Bậc Thầy Tập Trung Pomodoro",
    description: "Làm việc hiệu quả cao không xao nhãng.",
    reason: "Áp dụng thành công phương pháp 25 phút tập trung.",
    target: 50,
    unit: "phiên",
    emoji: "🍅",
    keywords: ["tu hoc","on bai","lam bai tap"],
  types: ["study","other"],
  },
  {
    title: "Tư Duy Sâu Chuyên Sâu",
    description: "Làm chủ nhịp sinh học với các khối thời gian dài.",
    reason: "Duy trì trạng thái làm việc sâu theo chu kì tối ưu.",
    target: 30,
    unit: "buổi",
    emoji: "🧠",
    keywords: ["tu hoc","lam viec","doc sach"],
  types: ["study","other"],
  },
  {
    title: "Chiến Thần Tự Sắp Xếp",
    description: "Lên kế hoạch và tổng kết công việc hoàn hảo.",
    reason: "Thực hiện đầy đủ quy trình lập kế hoạch ngược và sắp xếp.",
    target: 30,
    unit: "lần",
    emoji: "📋",
    keywords: ["lap ke hoach cong viec","chuan bi dung cu, sach vo cho ngay mai"],
  types: ["other"],
  },
  {
    title: "Bình Minh Thức Giấc",
    description: "Bắt đầu ngày mới đầy năng lượng và kỷ luật.",
    reason: "Dậy sớm và thực hiện đúng lịch trình buổi sáng.",
    target: 40,
    unit: "ngày",
    emoji: "🌅",
    keywords: ["thuc day","the duc buoi sang"],
  types: ["other"],
  },
  {
    title: "Năng Lượng Bữa Sáng",
    description: "Nạp đầy dinh dưỡng để khởi đầu ngày mới tỉnh táo.",
    reason: "Duy trì thói quen ăn sáng đầy đủ năng lượng.",
    target: 45,
    unit: "bữa",
    emoji: "🍳",
    keywords: ["an sang","com trang"],
  types: ["eating"],
  },
  {
    title: "Bữa Trưa Hoàn Hảo",
    description: "Bổ sung dưỡng chất cho nửa ngày làm việc tiếp theo.",
    reason: "Hoàn thành bữa trưa đúng giờ và đủ dinh dưỡng.",
    target: 50,
    unit: "bữa",
    emoji: "🍱",
    keywords: ["an trua","com gao lut"],
  types: ["eating"],
  },
  {
    title: "Bữa Tối Ấm Áp",
    description: "Quây quần bên gia đình và tái tạo năng lượng.",
    reason: "Thưởng thức bữa tối ngon miệng và đầm ấm.",
    target: 40,
    unit: "bữa",
    emoji: "🍲",
    keywords: ["an toi","pho bo"],
  types: ["eating"],
  },
  {
    title: "Giấc Ngủ Phục Hồi",
    description: "Sạc đầy pin cho não bộ sau những giờ học căng thẳng.",
    reason: "Duy trì giấc ngủ trưa khoa học và đúng giờ.",
    target: 30,
    unit: "lần",
    emoji: "💤",
    keywords: ["nghỉ trưa","ngu"],
  types: ["other"],
  },
  {
    title: "Giấc Ngủ Đêm Hoàn Hảo",
    description: "Chìm vào giấc ngủ đúng giờ để cơ thể tái tạo toàn diện.",
    reason: "Tuân thủ nghiêm ngặt lịch đi ngủ đúng giờ.",
    target: 40,
    unit: "đêm",
    emoji: "🌙",
    keywords: ["di ngu dung gio","ngu"],
  types: ["other"],
  },
  {
    title: "Tăng Cơ Bền Bỉ",
    description: "Xây dựng vóc dáng săn chắc với các bài tập đẩy ngực.",
    reason: "Hoàn thành xuất sắc các hiệp tập tăng cơ.",
    target: 30,
    unit: "hiệp",
    emoji: "🏋",
    keywords: ["tap gym","bench press (day nguc ngang) (4 hiep x 6-10 lan)"],
  types: ["exercise"],
  },
  {
    title: "Đánh Bay Mỡ Thừa",
    description: "Đốt cháy calo tối đa để giữ gìn vóc dáng thon gọn.",
    reason: "Hoàn thành chuỗi bài tập giảm cân cường độ cao.",
    target: 25,
    unit: "buổi",
    emoji: "🔥",
    keywords: ["tap gym","chong day (push-up) (3-4 hiep x 8-20 lan)"],
  types: ["exercise"],
  },
  {
    title: "Vươn Tới Tầm Cao",
    description: "Cải thiện tư thế và hỗ trợ phát triển chiều cao tối ưu.",
    reason: "Duy trì các bài tập xà và giãn cơ đều đặn.",
    target: 30,
    unit: "lần",
    emoji: "📈",
    keywords: ["tap gym","pull-up (keo xa) (3-4 hiep x toi da lan)"],
  types: ["exercise"],
  },
  {
    title: "Trái Tim Sức Bền",
    description: "Nâng cao thể lực và sức bền hệ thống tim phổi.",
    reason: "Hoàn thành các bài tập tim mạch và vận động liên tục.",
    target: 20,
    unit: "buổi",
    emoji: "🫀",
    keywords: ["chạy bộ","burpee (4 hiep x 10-15 lan)"],
  types: ["exercise"],
  },
  {
    title: "Linh Hoạt Dẻo Dai",
    description: "Giải phóng cơ bắp và mang lại sự thư giãn tuyệt đối.",
    reason: "Hoàn thành các bài tập giãn cơ và yoga.",
    target: 25,
    unit: "buổi",
    emoji: "🧘",
    keywords: ["tap yoga","cobra stretch (tu the ran ho mang) (3 hiep x 20-30 giay)"],
  types: ["exercise"],
  },
  {
    title: "Sân Cỏ Sục Sôi",
    description: "Thể hiện kỹ năng bóng đá đỉnh cao trên sân.",
    reason: "Tham gia trận đấu bóng đá nhiệt huyết cùng đồng đội.",
    target: 20,
    unit: "trận",
    emoji: "⚽",
    keywords: ["bóng đá","bong da ~500 kcal/h"],
  types: ["exercise"],
  },
  {
    title: "Tay Vợt Cừ Khôi",
    description: "Phản xạ nhanh nhạy và những đường cầu chuẩn xác.",
    reason: "Hoàn thành buổi tập cầu lông hết mình.",
    target: 20,
    unit: "buổi",
    emoji: "🏸",
    keywords: ["đi chơi","cau long ~400 kcal/h"],
  types: ["exercise"],
  },
  {
    title: "Vua Chạy Bộ",
    description: "Chinh phục những cung đường dài với bước chạy bền bỉ.",
    reason: "Đạt mục tiêu quãng đường chạy bộ.",
    target: 50,
    unit: "km",
    emoji: "🏃",
    keywords: ["chạy bộ","chay bo ~600 kcal/h"],
  types: ["exercise"],
  },
  {
    title: "Kình Ngư Đường Bơi",
    description: "Lướt đi mượt mà và chinh phục làn nước xanh mát.",
    reason: "Hoàn thành thời gian bơi lội rèn luyện thể lực.",
    target: 20,
    unit: "lần",
    emoji: "🏊",
    keywords: ["bơi","boi loi (30-45 phut)"],
  types: ["exercise"],
  },
  {
    title: "Bậc Thầy Đọc Sách",
    description: "Mở rộng tri thức qua từng trang sách giá trị.",
    reason: "Duy trì thói quen đọc sách mỗi ngày.",
    target: 30,
    unit: "chương",
    emoji: "📚",
    keywords: ["đọc sách","doc sach giao khoa / tai lieu"],
  types: ["study","other"],
  },
  {
    title: "Đầu Sư Gia Viết Lách",
    description: "Lưu giữ cảm xúc và tổng kết ngày tuyệt vời.",
    reason: "Viết nhật kí và tổng kết các hoạt động trong ngày.",
    target: 30,
    unit: "ngày",
    emoji: "📓",
    keywords: ["viet nhat ki / tong ket ngay","tu hoc"],
  types: ["other"],
  },
  {
    title: "Giai Điệu Tâm Hồn",
    description: "Rèn luyện sự khéo léo và cảm thụ âm nhạc tinh tế.",
    reason: "Hoàn thành phiên luyện tập nhạc cụ.",
    target: 25,
    unit: "buổi",
    emoji: "🎸",
    keywords: ["nghe nhạc","luyen dan / nhac cu"],
  types: ["other"],
  },
  {
    title: "Họa Sĩ Tài Ba",
    description: "Sáng tạo nên những bức tranh mang đậm dấu ấn cá nhân.",
    reason: "Dành thời gian cho nghệ thuật và hội họa.",
    target: 20,
    unit: "tác phẩm",
    emoji: "🎨",
    keywords: ["đi chơi","ve / sang tao"],
  types: ["other"],
  },
  {
    title: "Chuyên Gia Dinh Dưỡng Mục Tiêu",
    description: "Lựa chọn thực phẩm chuẩn xác theo chế độ ăn tăng cơ giảm mỡ.",
    reason: "Ăn uống đúng thực đơn đã đề ra.",
    target: 40,
    unit: "bữa",
    emoji: "🥗",
    keywords: ["uc ga ap chao","com gao lut"],
  types: ["eating"],
  },
  {
    title: "Siêu Nhân Việc Nhà",
    description: "Giữ gìn không gian sống gọn gàng, sạch sẽ tinh tươm.",
    reason: "Hoàn thành xuất sắc các nhiệm vụ dọn dẹp nhà cửa.",
    target: 35,
    unit: "lần",
    emoji: "🧹",
    keywords: ["làm việc nhà","quet nha","lau nha"],
  types: ["other"],
  },
  {
    title: "Đầu Bếp Đảm Đang",
    description: "Nấu những món ăn ngon phục vụ bản thân và gia đình.",
    reason: "Hoàn thành nấu nướng các bữa ăn ngon miệng.",
    target: 40,
    unit: "món",
    emoji: "🍲",
    keywords: ["nấu cơm","an com cung gia dinh"],
  types: ["eating","other"],
  },
  {
    title: "Học Tập Trực Tuyến Đỉnh Cao",
    description: "Lĩnh hội kiến thức mới từ các khóa học online chất lượng.",
    reason: "Hoàn thành các video bài giảng trực tuyến.",
    target: 30,
    unit: "video",
    emoji: "💻",
    keywords: ["hoc online (video, khoa hoc)","tu hoc"],
  types: ["study"],
  },
  {
    title: "Chiến Thần Đề Thi Thử",
    description: "Luyện tập giải đề dưới áp lực thời gian chuẩn thật.",
    reason: "Hoàn thành các bài thi thử đánh giá năng lực.",
    target: 25,
    unit: "đề",
    emoji: "🎯",
    keywords: ["lam de thi thu (thpt / vao 10 / danh gia nang luc)","on bai"],
  types: ["study"],
  },
  {
    title: "Làm Việc Sáng Tạo Không Ngừng",
    description: "Hoàn thành các dự án dài hạn với sự tập trung tuyệt đối.",
    reason: "Dành nhiều giờ liền cho công việc chuyên môn.",
    target: 30,
    unit: "giờ",
    emoji: "⚡",
    keywords: ["đi làm","lam viec tu do (freelance)"],
  types: ["study","other"],
  },
  {
    title: "Họp Nhóm Hiệu Quả",
    description: "Phối hợp ăn ý và giải quyết vấn đề cùng đồng đội.",
    reason: "Tham gia tích cực các buổi họp nhóm.",
    target: 20,
    unit: "buổi",
    emoji: "👥",
    keywords: ["họp nhóm","hoc nhom voi ban"],
  types: ["study","other"],
  },
  {
    title: "Kỷ Luật Thép",
    description: "Tuân thủ nghiêm ngặt kế hoạch đã đề ra mỗi ngày.",
    reason: "Duy trì chuỗi ngày không phá vỡ thói quen tốt.",
    target: 30,
    unit: "ngày",
    emoji: "🛡",
    keywords: ["tu hoc","on bai","lam bai tập"],
  types: ["study","other"],
  },
  {
    title: "Thư Giãn Đỉnh Cao",
    description: "Nạp lại tinh thần sảng khoái sau giờ làm việc mệt mỏi.",
    reason: "Dành thời gian xem phim hoặc nghe nhạc thư giãn.",
    target: 25,
    unit: "lần",
    emoji: "🎧",
    keywords: ["nghe nhạc","xem phim","nghỉ ngơi"],
  types: ["other"],
  },
  {
    title: "Gắn Kết Gia Đình",
    description: "Trân trọng những khoảnh khắc ấm áp bên người thân yêu.",
    reason: "Tham gia các hoạt động quây quần bên gia đình.",
    target: 30,
    unit: "lần",
    emoji: "❤",
    keywords: ["an com cung gia dinh","goi dien tham gia dinh"],
  types: ["other"],
  },
  {
    title: "Chinh Phục Tri Thức Mới",
    description: "Học hỏi các kỹ năng mới để hoàn thiện bản thân mỗi ngày.",
    reason: "Hoàn thành các bài học kỹ năng mới.",
    target: 25,
    unit: "bài",
    emoji: "🚀",
    keywords: ["hoc ki nang moi (online)","tu hoc"],
  types: ["study"],
  },
  {
    title: "Góc Làm Việc Gọn Gàng",
    description: "Dọn dẹp bàn học và máy tính sạch sẽ để tối ưu tư duy.",
    reason: "Thực hiện sắp xếp không gian làm việc ngăn nắp.",
    target: 20,
    unit: "lần",
    emoji: "✨",
    keywords: ["don ban hoc / khong gian lam viec","sao lưu dữ liệu / dọn máy tính"],
  types: ["other"],
  },
  {
    title: "Sẵn Sàng Cho Ngày Mai",
    description: "Chuẩn bị chu đáo mọi thứ từ tối hôm trước.",
    reason: "Soạn sẵn sách vở và dụng cụ học tập cho ngày hôm sau.",
    target: 40,
    unit: "lần",
    emoji: "🎒",
    keywords: ["chuan bi dung cu, sach vo cho ngay mai","on bai"],
  types: ["study","other"],
  },
];

const norm = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export interface AchievementBlock {
  title: string;
  type: BlockType;
  tasks: string[];
}

export function resolveAiAchievements(blocks: AchievementBlock[]): AchievementIdea[] {
  const used = new Set<string>();
  const result: AchievementIdea[] = [];

  for (const block of blocks) {
    if (result.length >= 3) break;
    const words = new Set(norm([block.title, ...(block.tasks ?? [])].join(' ')).split(' ').filter(Boolean));
    if (!words.size) continue;

    let matched: AchievementTemplate | undefined;
    for (const template of AI_ACHIEVEMENT_TEMPLATES) {
      if (used.has(template.title)) continue;
      if (template.types && !template.types.includes(block.type)) continue;
      const hit = template.keywords.some(keyword =>
        norm(keyword)
          .split(' ')
          .filter(Boolean)
          .every(word => words.has(word)),
      );
      if (hit) {
        matched = template;
        break;
      }
    }

    if (!matched) continue;
    used.add(matched.title);
    result.push({
      title: matched.title,
      description: matched.description,
      reason: matched.reason,
      target: matched.target,
      unit: matched.unit,
      emoji: matched.emoji,
    });
  }

  return result;
}
