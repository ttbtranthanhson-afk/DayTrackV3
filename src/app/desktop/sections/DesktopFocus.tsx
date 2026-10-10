import { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Music, Volume2, Check, ChevronDown, Ban } from 'lucide-react';
import { motion } from 'motion/react';
import {
  useFocus,
  musicCategories,
  allSongs,
  CUSTOM_CATEGORY,
  NONE_CATEGORY,
  presetTimes,
  tabs,
  type MusicCategory,
  type Song,
} from '../../hooks/useFocus';
import { DesktopPageHeader, DesktopCard, DesktopAnimatedSwitch } from '../DesktopUI';

type TimeType = 'hours' | 'minutes' | 'seconds';

function TimeDigit({
  type,
  value,
  onWheel,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: {
  type: TimeType;
  value: number;
  onWheel: (type: TimeType, delta: number) => void;
  onTouchStart: (e: React.TouchEvent, type: TimeType) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      onWheel(type, e.deltaY);
    };
    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', onNativeWheel);
  }, [type, onWheel]);

  return (
    <div
      ref={ref}
      onTouchStart={e => onTouchStart(e, type)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="cursor-ns-resize select-none touch-none"
    >
      <span className="text-5xl font-bold text-white">{String(value).padStart(2, '0')}</span>
    </div>
  );
}

export function DesktopFocus() {
  const {
    activeTab,
    setActiveTab,
    isRunning,
    hours,
    minutes,
    seconds,
    selectedMusic,
    expandedCategory,
    selectCategory,
    getSongs,
    customPlaylist,
    customSelection,
    customEditing,
    toggleCustomSong,
    saveCustomPlaylist,
    currentSong,
    previewSong,
    todayLabel,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    toggleTimer,
    resetTimer,
    setPresetTime,
    displayHours,
    displayMinutes,
    displaySeconds,
    progress,
  } = useFocus();

  const ringRadius = 118;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - (progress / 100) * ringCircumference;

  const playingBars = (
    <div className="flex gap-0.5 items-end h-4">
      {[3, 5, 3, 5].map((h, i) => (
        <div key={i} className="w-0.5 bg-green-500 rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 75}ms` }} />
      ))}
    </div>
  );

  const renderSongRow = (song: Song, selectable: boolean, checked: boolean) => {
    const isPlaying = currentSong?.id === song.id;
    return (
      <button
        key={song.id}
        type="button"
        onClick={() => (selectable ? toggleCustomSong(song.id) : previewSong(song))}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${isPlaying ? 'bg-green-50' : 'hover:bg-gray-50'}`}
      >
        {selectable ? (
          <span className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
            {checked && <Check className="w-3 h-3 text-white" />}
          </span>
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPlaying ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
        <span className="flex-1 min-w-0">
          <span className={`block text-xs font-semibold truncate ${isPlaying ? 'text-green-700' : 'text-gray-700'}`}>{song.title}</span>
          <span className="block text-[10px] text-gray-400 truncate">
            {song.artist}
            {song.license && <span className="text-gray-300"> · {song.license}</span>}
          </span>
        </span>
        {isPlaying && playingBars}
      </button>
    );
  };

  const renderCategory = (cat: MusicCategory | typeof CUSTOM_CATEGORY | typeof NONE_CATEGORY) => {
    const isNone = cat.id === NONE_CATEGORY.id;
    const isCustom = cat.id === CUSTOM_CATEGORY.id;
    const isSelected = selectedMusic === cat.id;
    const isExpanded = expandedCategory === cat.id;
    const songs = isCustom ? getSongs('custom') : isNone ? [] : (cat as MusicCategory).songs;

    return (
      <div key={cat.id} className="rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => selectCategory(cat.id)}
          className={`w-full flex items-center gap-4 p-3.5 transition-all border rounded-2xl ${
            isSelected ? 'border-green-200 bg-green-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.dot}`} />
          <span className={`flex-1 text-left text-sm font-semibold ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>{cat.name}</span>
          {isSelected && !isNone && playingBars}
          {!isNone && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
        </button>

        {isExpanded && !isNone && (
          <div className="mt-2 ml-3 border-l-2 border-gray-100 pl-3 space-y-0.5">
            {isCustom && customEditing ? (
              <>
                <p className="text-[11px] text-gray-400 px-1 pb-1">Chọn các bài bạn muốn, rồi nhấn Lưu</p>
                {allSongs.map(song => renderSongRow(song, true, customSelection.includes(song.id)))}
                <button type="button" onClick={saveCustomPlaylist}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-semibold">
                  Lưu ({customSelection.length})
                </button>
              </>
            ) : songs.length > 0 ? (
              <>
                {isCustom && (
                  <button type="button" onClick={() => selectCategory('custom')}
                    className="text-[11px] font-semibold text-pink-500 px-1 pb-1">
                    Nhấn để chọn lại nhạc
                  </button>
                )}
                {songs.map(song => renderSongRow(song, false, false))}
              </>
            ) : (
              <p className="text-[11px] text-gray-400 px-1 py-1">
                {isCustom ? 'Chưa có bài nào. Nhấn "Custom" để chọn nhạc.' : 'Không có bài nào.'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <DesktopPageHeader title="Tập trung" subtitle={todayLabel} />

      <div className="grid grid-cols-5 gap-6">
        {/* Timer hero */}
        <div className="col-span-2 self-start h-[440px] rounded-3xl bg-gradient-to-b from-emerald-400 to-green-500 p-8 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-white/10 rounded-full" />

          <div className="flex justify-center relative z-10 w-full mt-2">
            <div className="relative">
              {isRunning && (
                <svg className="absolute top-0 left-0 w-64 h-64 -rotate-90">
                  <circle cx="128" cy="128" r="118" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
                  <circle cx="128" cy="128" r="118" fill="none" stroke="white" strokeWidth="6"
                    strokeDasharray={ringCircumference} strokeDashoffset={ringDashoffset} strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear" />
                </svg>
              )}
              <motion.div
                animate={{ scale: 1, rotate: 0 }}
                className="w-64 h-64 rounded-full bg-white/15 flex items-center justify-center"
              >
                <div className="text-center">
                  {!isRunning ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      {(['hours', 'minutes', 'seconds'] as const).map((type, i) => (
                        <div key={type} className="flex items-center gap-0.5">
                          {i > 0 && <span className="text-5xl font-light text-white/80">:</span>}
                          <TimeDigit
                            type={type}
                            value={type === 'hours' ? hours : type === 'minutes' ? minutes : seconds}
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-5xl font-bold text-white">
                      {displayHours > 0 && `${String(displayHours).padStart(2, '0')}:`}
                      {String(displayMinutes).padStart(displayHours > 0 ? 2 : 1, '0')}:
                      {String(displaySeconds).padStart(2, '0')}
                    </span>
                  )}
                  <p className="text-xs text-white/70 mt-2 font-medium">
                    {!isRunning ? 'Vuốt để điều chỉnh' : 'Đang tập trung'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 mt-8 relative z-10">
            {!isRunning && (
              <div className="flex gap-2">
                {presetTimes.map(p => (
                  <button key={p.label} onClick={() => setPresetTime(p.seconds)}
                    className="text-xs font-semibold bg-white/20 text-white px-3.5 py-2 rounded-full hover:bg-white/30 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            {isRunning && (
              <button onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <button onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-white text-green-600 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Content panel */}
        <div className="col-span-3">
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-2xl p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <DesktopAnimatedSwitch id={activeTab}>
          {activeTab === 'Hướng dẫn' && (
            <DesktopCard title="Cách sử dụng">
              <div className="space-y-3">
                {[
                  'Chọn nhanh 25/45/60 phút, hoặc vuốt (cuộn) vào từng ô giờ, phút, giây để đặt thời gian.',
                  'Vào tab Nhạc nền, nhấn vào một chủ đề để xem danh sách bài nhạc.',
                  'Nhấn nút Play để bắt đầu — nhạc sẽ phát ngẫu nhiên trong chủ đề đã chọn.',
                  'Chọn Custom để tự chọn bài, hoặc Không nhạc để tập trung yên tĩnh.',
                  'Nhấn Pause để tạm dừng, nút mũi tên tròn để đặt lại.',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed flex-1">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-green-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">Mẹo tập trung</p>
                <p className="text-xs text-green-700 leading-relaxed">
                  Kỹ thuật Pomodoro: học 25 phút, nghỉ 5 phút. Sau 4 vòng, nghỉ dài 15-30 phút.
                </p>
              </div>
            </DesktopCard>
          )}

          {activeTab === 'Nhạc nền' && (
            <DesktopCard title="Chọn nhạc nền" icon={Music} accent="text-gray-500">
              {currentSong && (
                <div className="mb-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{currentSong.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentSong.artist}
                      {currentSong.license && <span className="text-gray-400"> · {currentSong.license}</span>}
                    </p>
                  </div>
                  <div className="flex gap-0.5 items-end h-5">
                    {[4, 6, 4, 6, 4].map((h, i) => (
                      <div key={i} className="w-1 bg-pink-400 rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 75}ms` }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {musicCategories.map(cat => renderCategory(cat))}
                {renderCategory(CUSTOM_CATEGORY)}
                {renderCategory(NONE_CATEGORY)}
              </div>

              {customPlaylist.length === 0 && selectedMusic === 'custom' && (
                <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                  <Ban className="w-3 h-3" /> Danh sách Custom đang trống.
                </p>
              )}

              <p className="text-[10px] text-gray-300 mt-5 leading-relaxed">
                Nhạc gốc từ Free Music Archive (FMA) theo giấy phép CC0 / CC BY / CC BY-SA — ghi công đầy đủ tại ATTRIBUTIONS.md.
              </p>
            </DesktopCard>
          )}
          </DesktopAnimatedSwitch>
        </div>
      </div>
    </div>
  );
}
