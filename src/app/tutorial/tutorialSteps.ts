export interface TutorialPrefill {
  target: string;
  value: string;
}

export interface TutorialStep {
  id: string;
  route?: string;
  target?: string;
  waitFor?: string;
  title: string;
  body: string;
  requires?: 'click' | 'enter';
  autoDelay?: number;
  timeout?: number;
  placement?: 'top' | 'bottom' | 'center';
  bare?: boolean;
  mobileContinue?: boolean;
  openEvent?: string;
  prefill?: TutorialPrefill;
  view?: 'week' | 'today';
}

export const tutorialSteps: TutorialStep[] = [
  // ── Phase 1: thanh điều hướng (6 mục) ──
  {
    id: 'nav-timetable',
    route: '/timetable',
    target: 'nav-timetable',
    view: 'week',
    title: 'Lịch trình',
    body: 'Đây là tab Lịch trình — nơi bạn xây dựng lịch tuần của mình.',
  },
  {
    id: 'nav-calendar',
    route: '/calendar',
    target: 'nav-calendar',
    title: 'Lịch',
    body: 'Tab Lịch cho bạn xem lịch theo từng ngày trong tháng.',
  },
  {
    id: 'nav-tasks',
    route: '/tasks',
    target: 'nav-tasks',
    title: 'Nhiệm vụ',
    body: 'Tab Nhiệm vụ quản lý các việc cần làm theo mức ưu tiên.',
  },
  {
    id: 'nav-focus',
    route: '/focus',
    target: 'nav-focus',
    title: 'Tập trung',
    body: 'Tab Tập trung giúp bạn làm việc theo kỹ thuật Pomodoro.',
  },
  {
    id: 'nav-achive',
    route: '/achive',
    target: 'nav-achive',
    title: 'Thành tựu',
    body: 'Tab Thành tựu lưu lại các mục tiêu và tiến độ của bạn.',
  },
  {
    id: 'nav-settings',
    route: '/settings',
    target: 'nav-settings',
    title: 'Cài đặt',
    body: 'Tab Cài đặt để chỉnh hồ sơ, thông báo và giao diện.',
  },
  {
    id: 'nav-back',
    route: '/timetable',
    target: 'nav-timetable',
    view: 'week',
    title: 'Quay lại Lịch trình',
    body: 'Giờ chúng ta cùng khám phá chi tiết Lịch trình nhé!',
  },

  // ── Phase 2: Lịch trình ──
  {
    id: 'tt-open',
    route: '/timetable',
    target: 'nav-action',
    requires: 'click',
    openEvent: 'tutorial:open-create',
    view: 'week',
    title: 'Tạo khối lịch trình',
    body: 'Bấm vào nút + để mở bảng tạo khối lịch trình.',
  },
  {
    id: 'tt-name',
    target: 'schedule-name',
    prefill: { target: 'schedule-name', value: 'Tự học' },
    title: 'Đặt tên khối',
    body: 'Đây là ô đặt tên cho khối lịch. Mình đã điền sẵn "Tự học", bạn có thể sửa lại tuỳ ý.',
  },
  {
    id: 'tt-task',
    target: 'schedule-task-input',
    requires: 'enter',
    title: 'Thêm nhiệm vụ',
    body: 'Nhập một nhiệm vụ cho khối này rồi nhấn Enter để thêm.',
  },
  {
    id: 'tt-task-add',
    target: 'schedule-task-add',
    title: 'Nút thêm nhiệm vụ',
    body: 'Bạn cũng có thể bấm dấu + để thêm nhiệm vụ đang nhập.',
  },
  {
    id: 'tt-time',
    target: 'schedule-time',
    title: 'Chọn thời gian',
    body: 'Đặt giờ bắt đầu và kết thúc cho khối lịch ở đây.',
  },
  {
    id: 'tt-submit',
    target: 'schedule-submit',
    requires: 'click',
    mobileContinue: true,
    title: 'Lưu khối lịch',
    body: 'Bấm "Tạo" để lưu khối lịch trình vừa nhập.',
  },
  {
    id: 'tt-list',
    route: '/timetable',
    target: 'tt-blocks',
    title: 'Danh sách lịch',
    body: 'Các khối lịch hiển thị ở đây. Bấm vào một khối để chỉnh sửa hoặc xoá.',
  },
  {
    id: 'tt-survey',
    target: 'tt-survey',
    requires: 'click',
    openEvent: 'tutorial:open-busy',
    view: 'week',
    title: 'Khảo sát',
    body: 'Bấm "Khảo sát" để cho AI biết những khung giờ bạn bận.',
  },
  {
    id: 'busy-intro',
    target: 'busy-timeline',
    timeout: 3000,
    title: 'Khung giờ bận',
    body: 'Nhấn giữ và kéo trên trục thời gian để đánh dấu những lúc bạn bận. Ta thử gọi AI nhé!',
  },
  {
    id: 'busy-ai',
    target: 'busy-ai',
    requires: 'click',
    openEvent: 'tutorial:open-planner',
    title: 'Gọi AI sắp xếp lịch',
    body: 'Bấm "Gọi AI sắp xếp lịch" để AI tối ưu lại lịch trình cho bạn.',
  },
  {
    id: 'planner-wait',
    target: 'planner-modal',
    waitFor: 'planner-options',
    autoDelay: 8000,
    bare: true,
    title: 'AI đang sắp xếp',
    body: 'AI đang phân tích và sắp xếp lại lịch của bạn.',
  },
  {
    id: 'planner-options',
    target: 'planner-option-list',
    title: 'Phương án',
    body: 'Đây là cột Phương án — mỗi phương án là một cách AI sắp xếp lịch khác nhau. Bấm vào từng phương án để xem và so sánh.',
  },
  {
    id: 'planner-blocks',
    target: 'planner-block-list',
    title: 'Các khối lịch khoa học',
    body: 'Các khối lịch đã được AI sắp xếp lại một cách khoa học theo nhịp sinh học trong ngày. Bấm vào một khối để xem phân tích và gợi ý chi tiết.',
  },
  {
    id: 'planner-save',
    target: 'planner-save',
    requires: 'click',
    title: 'Áp dụng lịch AI',
    body: 'Khi đã hài lòng với phương án, bấm "Lưu & thêm vào hôm nay" để áp dụng.',
  },
  {
    id: 'tt-today',
    route: '/timetable',
    target: 'tt-today',
    view: 'today',
    title: 'Chế độ Hôm nay',
    body: 'Lịch AI đã được áp dụng và tự bật chế độ Hôm nay. Bấm nút này để chuyển đổi giữa tuần và hôm nay.',
  },

  // ── Phase 3: Lịch ──
  {
    id: 'cal-grid',
    route: '/calendar',
    target: 'cal-grid',
    title: 'Lịch tháng',
    body: 'Đây là lịch tháng. Chấm màu cho biết ngày đó có lịch trình.',
  },
  {
    id: 'cal-list',
    target: 'cal-list',
    title: 'Lịch trong ngày',
    body: 'Chọn một ngày để xem chi tiết các khối lịch của ngày đó.',
  },
  {
    id: 'cal-lock',
    target: 'cal-lock',
    title: 'Khoá ngày',
    body: 'Bạn có thể khoá một ngày để tránh chỉnh sửa nhầm.',
  },

  // ── Phase 4: Nhiệm vụ ──
  {
    id: 'tasks-open',
    route: '/tasks',
    target: 'nav-action',
    requires: 'click',
    openEvent: 'tutorial:open-create',
    title: 'Thêm nhiệm vụ',
    body: 'Bấm nút + để mở bảng thêm nhiệm vụ mới.',
  },
  {
    id: 'tasks-title',
    target: 'task-title',
    prefill: { target: 'task-title', value: 'Đọc sách' },
    title: 'Tên nhiệm vụ',
    body: 'Nhập tên nhiệm vụ. Mình điền sẵn "Đọc sách" cho bạn.',
  },
  {
    id: 'tasks-priority',
    target: 'task-priority',
    title: 'Mức ưu tiên',
    body: 'Chọn mức ưu tiên để nhiệm vụ được sắp xếp hợp lý.',
  },
  {
    id: 'tasks-daily',
    target: 'task-daily',
    title: 'Lặp hằng ngày',
    body: 'Bật tuỳ chọn này nếu muốn nhiệm vụ lặp lại mỗi ngày.',
  },
  {
    id: 'tasks-submit',
    target: 'task-submit',
    requires: 'click',
    title: 'Lưu nhiệm vụ',
    body: 'Bấm "Thêm nhiệm vụ" để lưu.',
  },
  {
    id: 'tasks-list',
    target: 'tasks-list',
    title: 'Danh sách nhiệm vụ',
    body: 'Nhiệm vụ được nhóm theo mức ưu tiên. Bấm vào ô tròn để đánh dấu hoàn thành.',
  },

  // ── Phase 5: Tập trung ──
  {
    id: 'focus-timer',
    route: '/focus',
    target: 'focus-timer',
    title: 'Đồng hồ tập trung',
    body: 'Đây là đồng hồ Pomodoro giúp bạn tập trung theo phiên.',
  },
  {
    id: 'focus-presets',
    target: 'focus-presets',
    title: 'Chọn phiên',
    body: 'Chọn nhanh thời lượng cho phiên làm việc hoặc nghỉ.',
  },
  {
    id: 'focus-play',
    target: 'focus-play',
    title: 'Bắt đầu',
    body: 'Bấm nút này để bắt đầu hoặc tạm dừng phiên tập trung.',
  },
  {
    id: 'focus-tabs',
    target: 'focus-tabs',
    title: 'Hai tab của Tập trung',
    body: 'Chuyển giữa tab "Lịch sắp tới" và "Nhạc nền" tại đây.',
  },
  {
    id: 'focus-music-tab',
    target: 'focus-tab-music',
    requires: 'click',
    title: 'Mở Nhạc nền',
    body: 'Bấm vào tab "Nhạc nền" để xem các chủ đề nhạc.',
  },
  {
    id: 'focus-music',
    target: 'focus-music',
    title: 'Chủ đề nhạc & cách chọn',
    body: 'Mỗi dòng là một chủ đề: Học tập, Làm việc, Tập luyện, Thư giãn, Tập trung sâu. Bấm vào một chủ đề để mở danh sách bài hát, chọn Custom để tự chọn bài, hoặc "Không nhạc" để tập trung yên tĩnh.',
  },

  // ── Phase 6: Thành tựu ──
  {
    id: 'achive-stats',
    route: '/achive',
    target: 'achive-stats',
    title: 'Tổng quan thành tựu',
    body: 'Theo dõi số mục tiêu và tiến độ hoàn thành của bạn.',
  },
  {
    id: 'achive-ai',
    target: 'achive-ai',
    title: 'Mục tiêu từ AI',
    body: 'AI sẽ tạo mục tiêu dựa trên lịch trình bạn lưu tại đây.',
  },
  {
    id: 'achive-groups',
    target: 'achive-groups',
    title: 'Bộ thành tựu',
    body: 'Hoàn thành nhiệm vụ để tăng tiến độ các thành tựu này.',
  },

  // ── Phase 7: Cài đặt ──
  {
    id: 'settings-profile',
    route: '/settings',
    target: 'settings-profile',
    title: 'Hồ sơ',
    body: 'Thông tin cá nhân của bạn nằm ở đây.',
  },
  {
    id: 'settings-groups',
    target: 'settings-groups',
    title: 'Tuỳ chỉnh ứng dụng',
    body: 'Bạn có thể chỉnh sửa thông báo, giao diện và xem giới thiệu ứng dụng.',
  },
  {
    id: 'settings-replay',
    target: 'settings-replay',
    title: 'Hướng dẫn lại',
    body: 'Khi cần, bạn có thể xem lại toàn bộ hướng dẫn ngay tại đây.',
  },

  // ── Phase 8: kết thúc ──
  {
    id: 'final',
    route: '/timetable',
    placement: 'center',
    title: 'Chúc bạn dùng ứng dụng vui vẻ!',
    body: 'Bạn đã nắm hết các tính năng của DayTrack. Hãy bắt đầu xây dựng lịch trình lành mạnh nhé!',
  },
];
