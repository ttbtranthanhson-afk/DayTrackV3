export interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  root: number;
  waveform: OscillatorType;
  tempo: number;
  scale: number[];
}

export const scales = {
  penta: [0, 2, 4, 7, 9, 12, 14, 16],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
};

const ARTIST = 'DayTrack Studio';

const song = (
  id: string,
  title: string,
  category: string,
  root: number,
  waveform: OscillatorType,
  tempo: number,
  scale: number[],
): Song => ({ id, title, artist: ARTIST, category, root, waveform, tempo, scale });

export const studySongs: Song[] = [
  song('study-1', 'Ánh sáng ban mai', 'study', 261.63, 'sine', 620, scales.penta),
  song('study-2', 'Trang sách mở', 'study', 246.94, 'triangle', 700, scales.major),
  song('study-3', 'Nhịp bút chì', 'study', 293.66, 'sine', 560, scales.penta),
  song('study-4', 'Khung cửa sổ', 'study', 220.00, 'triangle', 760, scales.dorian),
  song('study-5', 'Giai điệu ôn bài', 'study', 233.08, 'sine', 640, scales.major),
];

export const workSongs: Song[] = [
  song('work-1', 'Nhịp gõ phím', 'work', 196.00, 'triangle', 540, scales.dorian),
  song('work-2', 'Buổi chiều văn phòng', 'work', 174.61, 'sine', 680, scales.penta),
  song('work-3', 'Dòng công việc', 'work', 220.00, 'triangle', 580, scales.minor),
  song('work-4', 'Tách cà phê', 'work', 207.65, 'sine', 720, scales.major),
  song('work-5', 'Tiến độ', 'work', 185.00, 'triangle', 520, scales.dorian),
];

export const exerciseSongs: Song[] = [
  song('exercise-1', 'Khởi động', 'exercise', 261.63, 'triangle', 380, scales.major),
  song('exercise-2', 'Nhịp chạy', 'exercise', 293.66, 'sawtooth', 340, scales.penta),
  song('exercise-3', 'Năng lượng', 'exercise', 329.63, 'triangle', 360, scales.dorian),
  song('exercise-4', 'Bứt tốc', 'exercise', 349.23, 'sawtooth', 300, scales.major),
  song('exercise-5', 'Hạ nhiệt', 'exercise', 246.94, 'triangle', 460, scales.minor),
];

export const relaxSongs: Song[] = [
  song('relax-1', 'Sóng biển', 'relax', 174.61, 'sine', 900, scales.penta),
  song('relax-2', 'Mưa nhẹ', 'relax', 164.81, 'sine', 1000, scales.minor),
  song('relax-3', 'Rừng thông', 'relax', 185.00, 'triangle', 840, scales.dorian),
  song('relax-4', 'Chiều tà', 'relax', 155.56, 'sine', 960, scales.major),
  song('relax-5', 'Hơi thở', 'relax', 196.00, 'sine', 1100, scales.penta),
];

export const focusSongs: Song[] = [
  song('focus-1', 'Trường thiền', 'focus', 146.83, 'sine', 1040, scales.minor),
  song('focus-2', 'Tầng sâu', 'focus', 130.81, 'sine', 1160, scales.penta),
  song('focus-3', 'Màn sương', 'focus', 138.59, 'triangle', 980, scales.dorian),
  song('focus-4', 'Kim đồng hồ', 'focus', 155.56, 'sine', 900, scales.minor),
  song('focus-5', 'Tĩnh lặng', 'focus', 123.47, 'sine', 1240, scales.penta),
];

export interface MusicCategory {
  id: string;
  name: string;
  color: string;
  dot: string;
  songs: Song[];
}

export const musicCategories: MusicCategory[] = [
  { id: 'study', name: 'Học tập', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', songs: studySongs },
  { id: 'work', name: 'Làm việc', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400', songs: workSongs },
  { id: 'exercise', name: 'Tập luyện', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400', songs: exerciseSongs },
  { id: 'relax', name: 'Thư giãn', color: 'bg-green-100 text-green-700', dot: 'bg-green-400', songs: relaxSongs },
  { id: 'focus', name: 'Tập trung sâu', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400', songs: focusSongs },
];

export const CUSTOM_CATEGORY = { id: 'custom', name: 'Custom', color: 'bg-pink-100 text-pink-700', dot: 'bg-pink-400' };
export const NONE_CATEGORY = { id: 'none', name: 'Không nhạc', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

export const allSongs: Song[] = musicCategories.flatMap(c => c.songs);
