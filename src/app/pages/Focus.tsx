import { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Music, Volume2, MoreHorizontal, Ban, CalendarClock, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  useFocus,
  musicCategories,
  CUSTOM_CATEGORY,
  NONE_CATEGORY,
  presetTimes,
  tabs,
  blockTypeInfo,
  blockWindow,
  type MusicCategory,
  type Song,
} from '../hooks/useFocus';
import { MusicPanel } from '../components/MusicPanel';
import { formatDuration } from '../hooks/musicData';
import { UpcomingBlockDialog } from '../components/UpcomingBlockDialog';

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
      <span className="text-4xl font-bold text-white">{String(value).padStart(2, '0')}</span>
    </div>
  );
}

export function Focus() {
  const {
    activeTab,
    setActiveTab,
    isRunning,
    hours,
    minutes,
    seconds,
    selectedMusic,
    selectCategory,
    getSongs,
    musicPanel,
    openMusicPanel,
    closeMusicPanel,
    customPlaylist,
    customSelection,
    toggleCustomSong,
    saveCustomPlaylist,
    quickAddCurrent,
    currentSong,
    previewSong,
    toggleSong,
    replaySong,
    musicTime,
    musicDuration,
    circleScale,
    isShaking,
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
    circumference,
    strokeDashoffset,
    hasSession,
    currentTime,
    totalTime,
    upcomingBlocks,
    pendingBlock,
    launchBlock,
    dismissPending,
    acceptPending,
    clockNow,
  } = useFocus();

  const minutesNow = new Date(clockNow).getHours() * 60 + new Date(clockNow).getMinutes();

  const playingBars = (
    <div className="flex gap-0.5 items-end h-4">
      {[3, 5, 3, 5].map((h, i) => (
        <div
          key={i}
          className="w-0.5 bg-green-500 rounded-full animate-pulse"
          style={{ height: `${h * 3}px`, animationDelay: `${i * 75}ms` }}
        />
      ))}
    </div>
  );


  const renderCategory = (cat: MusicCategory | typeof CUSTOM_CATEGORY | typeof NONE_CATEGORY) => {
    const isNone = cat.id === NONE_CATEGORY.id;
    const isCustom = cat.id === CUSTOM_CATEGORY.id;
    const isSelected = selectedMusic === cat.id;
    const songs = isCustom ? getSongs('custom') : isNone ? [] : (cat as MusicCategory).songs;

    return (
      <div key={cat.id} className="rounded-2xl overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onPointerDown={() => selectCategory(cat.id)}
          onClick={() => selectCategory(cat.id)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectCategory(cat.id);
            }
          }}
          className={`w-full flex items-center gap-4 p-4 cursor-pointer transition-all border ${
            isSelected ? 'border-green-200 bg-green-50 rounded-2xl' : 'border-transparent bg-gray-50 hover:bg-gray-100 rounded-2xl'
          }`}
        >
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.dot}`} />
          <span className={`flex-1 text-left text-sm font-semibold ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
            {cat.name}
          </span>
          {isSelected && !isNone && playingBars}
          {!isNone && (
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                openMusicPanel(cat.id);
              }}
              className="text-xs font-semibold text-gray-500 px-2 py-1 rounded-full bg-white/70 border border-gray-100 hover:bg-white hover:text-green-700 transition-colors"
            >
              Xem
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="max-w-md mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-b from-emerald-400 to-green-500 px-6 pt-12 pb-8 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/10 rounded-full" />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
              DayTrack
            </span>
            <span className="text-sm font-semibold text-white/90">{todayLabel}</span>
            <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Timer Circle */}
          <div data-tour="focus-timer" className="flex justify-center relative z-10">
            <div className="relative">
              {hasSession && (
                <svg className="absolute top-0 left-0 w-52 h-52 -rotate-90">
                  <circle cx="104" cy="104" r="95" fill="none" stroke="rgba(255,255,255,0.3)"
                    strokeWidth="6" />
                  <circle cx="104" cy="104" r="95" fill="none" stroke="white"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              )}
              <motion.div
                animate={{ scale: circleScale, rotate: isShaking ? [0, -2, 2, -2, 2, 0] : 0 }}
                transition={{ scale: { duration: 0.15 }, rotate: { duration: 0.5 } }}
                className="w-52 h-52 rounded-full bg-white/15 flex items-center justify-center"
              >
                <div className="text-center">
                  {!hasSession ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      {(['hours', 'minutes', 'seconds'] as const).map((type, i) => (
                        <div key={type} className="flex items-center gap-0.5">
                          {i > 0 && <span className="text-4xl font-light text-white/80">:</span>}
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
                    <span className="text-4xl font-bold text-white">
                      {displayHours > 0 && `${String(displayHours).padStart(2, '0')}:`}
                      {String(displayMinutes).padStart(displayHours > 0 ? 2 : 1, '0')}:
                      {String(displaySeconds).padStart(2, '0')}
                    </span>
                  )}
                  <p className="text-xs text-white/70 mt-1 font-medium">
                    {isRunning
                      ? 'Đang tập trung'
                      : hasSession
                        ? totalTime > 0 && currentTime === 0
                          ? 'Hoàn tất'
                          : 'Tạm dừng'
                        : 'Vuốt để điều chỉnh'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-6 relative z-10">
            {!hasSession && (
              <div data-tour="focus-presets" className="flex gap-2">
                {presetTimes.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setPresetTime(p.seconds)}
                    className="text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            {isRunning || hasSession ? (
              <button onClick={resetTimer}
                className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
            ) : null}
            <button
              onClick={toggleTimer}
              data-tour="focus-play"
              className="w-14 h-14 rounded-full bg-white text-green-600 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div data-tour="focus-tabs" className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-tour={tab === 'Nhạc nền' ? 'focus-tab-music' : undefined}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === tab ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {activeTab === 'Lịch sắp tới' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Lịch sắp tới hôm nay</span>
              </div>

              {upcomingBlocks.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Không có lịch trình sắp tới.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingBlocks.map(block => {
                    const window = blockWindow(block);
                    const started = window !== null && minutesNow >= window.start;
                    const typeKey = block.type && blockTypeInfo[block.type] ? block.type : 'other';
                    const type = blockTypeInfo[typeKey];
                    return (
                      <button
                        key={block.id}
                        onClick={() => launchBlock(block)}
                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-green-200 hover:bg-green-50/40 transition-colors"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${type.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{block.title}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${type.badge}`}>
                              {type.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{block.time}</p>
                        </div>
                        {started ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <Play className="w-3 h-3" /> Bắt đầu
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <Clock className="w-3 h-3" /> Sắp tới
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Nhạc nền' && (
            <div>
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
                      <div key={i} className="w-1 bg-pink-400 rounded-full animate-pulse"
                        style={{ height: `${h * 4}px`, animationDelay: `${i * 75}ms` }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Music className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Chọn nhạc nền</span>
              </div>

              <div data-tour="focus-music" className="space-y-2">
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
                Nhạc gốc từ Free Music Archive (FMA) theo giấy phép CC0 / CC BY / CC BY-SA — ghi công đầy đủ tại
                ATTRIBUTIONS.md.
              </p>
            </div>
          )}
        </div>
      
      <MusicPanel
        open={musicPanel === 'study'}
        title="Học tập"
        dotClass="bg-blue-400"
        accentClass="text-blue-700"
        songs={musicCategories.find(c => c.id === 'study')?.songs ?? []}
        selectable={false}
        selection={[]}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={previewSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onClose={closeMusicPanel}
        placeholder="Không có bài nhạc."
      />
      <MusicPanel
        open={musicPanel === 'work'}
        title="Làm việc"
        dotClass="bg-purple-400"
        accentClass="text-purple-700"
        songs={musicCategories.find(c => c.id === 'work')?.songs ?? []}
        selectable={false}
        selection={[]}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={previewSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onClose={closeMusicPanel}
        placeholder="Không có bài nhạc."
      />
      <MusicPanel
        open={musicPanel === 'exercise'}
        title="Tập luyện"
        dotClass="bg-orange-400"
        accentClass="text-orange-700"
        songs={musicCategories.find(c => c.id === 'exercise')?.songs ?? []}
        selectable={false}
        selection={[]}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={previewSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onClose={closeMusicPanel}
        placeholder="Không có bài nhạc."
      />
      <MusicPanel
        open={musicPanel === 'relax'}
        title="Thư giãn"
        dotClass="bg-green-400"
        accentClass="text-green-700"
        songs={musicCategories.find(c => c.id === 'relax')?.songs ?? []}
        selectable={false}
        selection={[]}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={previewSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onClose={closeMusicPanel}
        placeholder="Không có bài nhạc."
      />
      <MusicPanel
        open={musicPanel === 'focus'}
        title="Tập trung sâu"
        dotClass="bg-indigo-400"
        accentClass="text-indigo-700"
        songs={musicCategories.find(c => c.id === 'focus')?.songs ?? []}
        selectable={false}
        selection={[]}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={previewSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onClose={closeMusicPanel}
        placeholder="Không có bài nhạc."
      />
      <MusicPanel
        open={musicPanel === 'custom'}
        title="Custom"
        dotClass="bg-pink-400"
        accentClass="text-pink-700"
        songs={getSongs('custom')}
        selectable={true}
        selection={customSelection}
        currentSong={currentSong}
        musicTime={musicTime}
        musicDuration={musicDuration}
        onSongTap={toggleCustomSong}
        onSongToggle={toggleSong}
        onReplay={replaySong}
        onQuickAdd={quickAddCurrent}
        onSave={saveCustomPlaylist}
        onClose={closeMusicPanel}
        placeholder="Chưa có bài nào trong danh sách Custom."
      /></div>

      <UpcomingBlockDialog
        block={pendingBlock}
        onSkip={dismissPending}
        onStart={acceptPending}
      />
    </div>
  );
}
