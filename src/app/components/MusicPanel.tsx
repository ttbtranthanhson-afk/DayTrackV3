import { useEffect, useRef, useState } from 'react';
import { X, Plus, Check, Play, Pause, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Song } from '../hooks/musicData';
import { formatDuration } from '../hooks/musicData';

interface MusicPanelProps {
  open: boolean;
  title: string;
  dotClass: string;
  accentClass: string;
  songs: Song[];
  selectable: boolean;
  selection: string[];
  currentSong: Song | null;
  musicTime: number;
  musicDuration: number;
  onSongTap: (song: Song) => void;
  onSongToggle?: (song: Song) => void;
  onReplay?: () => void;
  onQuickAdd: () => void;
  onSave?: () => void;
  onClose: () => void;
  placeholder?: string;
}

export function MusicPanel({
  open,
  title,
  dotClass,
  accentClass,
  songs,
  selectable,
  selection,
  currentSong,
  musicTime,
  musicDuration,
  onSongTap,
  onSongToggle,
  onReplay,
  onQuickAdd,
  onSave,
  onClose,
  placeholder,
}: MusicPanelProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    };
  }, []);

  const handleQuickAdd = () => {
    onQuickAdd();
    setJustAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 1400);
  };

  const canAdd = !!currentSong && !(selectable && selection.includes(currentSong.id));
  const progress = musicDuration > 0 ? Math.min(musicTime / musicDuration, 1) : 0;
  const isPlayingCurrent = !!(currentSong && musicDuration >= 0); // simple

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} />
              <span className={`flex-1 text-sm font-semibold ${accentClass}`}>{title}</span>
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={!canAdd}
                title="Thêm bài đang phát vào Custom"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  justAdded
                    ? 'bg-green-500 text-white'
                    : canAdd
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {songs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-xs text-gray-400">{placeholder ?? 'Danh sách trống.'}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {songs.map(song => {
                  const isCurrent = currentSong?.id === song.id;
                  const isSelected = selection.includes(song.id);
                  return (
                    <div key={song.id} className="border-b border-gray-50 last:border-none">
                      <div
                        className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                          isCurrent ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSongToggle?.(song)}
                          className="flex-1 flex items-center gap-3 text-left min-w-0"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isCurrent ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCurrent ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </div>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-sm font-semibold truncate ${isCurrent ? 'text-green-700' : 'text-gray-800'}`}>{song.title}</span>
                            <span className="block text-xs text-gray-400 truncate">{song.artist} · {formatDuration(song.duration)}</span>
                          </span>
                        </button>
                        {selectable && (
                          <button
                            type="button"
                            onClick={() => onSongTap(song)}
                            title={isSelected ? 'Bỏ chọn' : 'Chọn'}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-gray-50 bg-white px-5 py-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>{currentSong ? formatDuration(musicTime) : '0:00'}</span>
                  <span>{currentSong ? formatDuration(musicDuration) : '0:00'}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-200 ${currentSong ? '' : 'opacity-30'}`} style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {currentSong ? (
                      <div className="truncate">
                        <p className="text-sm font-semibold text-gray-800 truncate">{currentSong.title}</p>
                        <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Chưa phát bài nào</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={onReplay} disabled={!currentSong} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${currentSong ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={currentSong ? () => onSongToggle?.(currentSong) : undefined} disabled={!currentSong} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentSong ? 'bg-green-500 text-white shadow-lg shadow-green-200/60 hover:bg-green-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      {currentSong ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {selectable && onSave && (
                <button type="button" onClick={onSave} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-pink-200/50">
                  Lưu ({selection.length})
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
