import { Play, Pause, RotateCcw, Music, Volume2, MoreHorizontal, Check, ChevronDown, Ban } from 'lucide-react';
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
} from '../hooks/useFocus';

export function Focus() {
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
  } = useFocus();

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

  const renderSongRow = (song: Song, selectable: boolean, checked: boolean) => {
    const isPlaying = currentSong?.id === song.id;
    return (
      <button
        key={song.id}
        type="button"
        onClick={() => (selectable ? toggleCustomSong(song.id) : previewSong(song))}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
          isPlaying ? 'bg-green-50' : 'hover:bg-white'
        }`}
      >
        {selectable ? (
          <span
            className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
              checked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
            }`}
          >
            {checked && <Check className="w-3 h-3 text-white" />}
          </span>
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPlaying ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
        <span className="flex-1 min-w-0">
          <span className={`block text-xs font-semibold truncate ${isPlaying ? 'text-green-700' : 'text-gray-700'}`}>
            {song.title}
          </span>
          <span className="block text-[10px] text-gray-400 truncate">{song.artist}</span>
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
          className={`w-full flex items-center gap-4 p-4 transition-all border ${
            isSelected ? 'border-green-200 bg-green-50 rounded-2xl' : 'border-transparent bg-gray-50 hover:bg-gray-100 rounded-2xl'
          }`}
        >
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.dot}`} />
          <span className={`flex-1 text-left text-sm font-semibold ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
            {cat.name}
          </span>
          {isSelected && !isNone && playingBars}
          {!isNone && (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isExpanded && !isNone && (
          <div className="mt-2 ml-3 border-l-2 border-gray-100 pl-3 space-y-0.5">
            {isCustom && customEditing ? (
              <>
                <p className="text-[11px] text-gray-400 px-1 pb-1">Chọn các bài bạn muốn, rồi nhấn Lưu</p>
                {allSongs.map(song => renderSongRow(song, true, customSelection.includes(song.id)))}
                <button
                  type="button"
                  onClick={saveCustomPlaylist}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-semibold"
                >
                  Lưu ({customSelection.length})
                </button>
              </>
            ) : songs.length > 0 ? (
              <>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => selectCategory('custom')}
                    className="text-[11px] font-semibold text-pink-500 px-1 pb-1"
                  >
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
          <div className="flex justify-center relative z-10">
            <div className="relative">
              {isRunning && (
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
                  {!isRunning ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      {(['hours', 'minutes', 'seconds'] as const).map((type, i) => (
                        <div key={type} className="flex items-center gap-0.5">
                          {i > 0 && <span className="text-4xl font-light text-white/80">:</span>}
                          <div
                            onWheel={e => { e.preventDefault(); handleWheel(type, e.deltaY); }}
                            onTouchStart={e => handleTouchStart(e, type)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="cursor-ns-resize select-none touch-none"
                          >
                            <span className="text-4xl font-bold text-white">
                              {String(type === 'hours' ? hours : type === 'minutes' ? minutes : seconds).padStart(2, '0')}
                            </span>
                          </div>
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
                    {!isRunning ? 'Vuốt để điều chỉnh' : 'Đang tập trung'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-6 relative z-10">
            {!isRunning && (
              <div className="flex gap-2">
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
            {isRunning && (
              <button onClick={resetTimer}
                className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleTimer}
              className="w-14 h-14 rounded-full bg-white text-green-600 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
          {activeTab === 'Hướng dẫn' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Cách sử dụng</h3>
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

              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">Mẹo tập trung</p>
                <p className="text-xs text-green-700 leading-relaxed">
                  Kỹ thuật Pomodoro: học 25 phút, nghỉ 5 phút. Sau 4 vòng, nghỉ dài 15-30 phút.
                </p>
              </div>
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
                    <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
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

              <div className="space-y-2">
                {musicCategories.map(cat => renderCategory(cat))}
                {renderCategory(CUSTOM_CATEGORY)}
                {renderCategory(NONE_CATEGORY)}
              </div>

              {customPlaylist.length === 0 && selectedMusic === 'custom' && (
                <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                  <Ban className="w-3 h-3" /> Danh sách Custom đang trống.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
