import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';
import { SavedVideoItem } from './savedVideosSlice';

export type VideoPlayable = YouTubeVideoItem | SavedVideoItem;

export type PlayerMode = 'ad-free' | 'nocookie';

interface HistoryItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
  watchedAt: string;
}

interface PlayerState {
  currentVideo: VideoPlayable | null;
  isOpen: boolean;
  isMiniPlayer: boolean; // Background floating player when minimized
  isPlaying: boolean;
  isBackgroundAudioMode: boolean; // Screen-off / lock-screen continuous audio playback
  isWakeLockActive: boolean;
  playerMode: PlayerMode;
  isTheaterMode: boolean;
  notes: string;
  history: HistoryItem[];
}

const initialState: PlayerState = {
  currentVideo: null,
  isOpen: false,
  isMiniPlayer: false,
  isPlaying: true,
  isBackgroundAudioMode: false,
  isWakeLockActive: false,
  playerMode: 'nocookie',
  isTheaterMode: false,
  notes: '',
  history: [],
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playVideo: (state, action: PayloadAction<VideoPlayable>) => {
      state.currentVideo = action.payload;
      state.isOpen = true;
      state.isMiniPlayer = false;
      state.isPlaying = true;
      const v = action.payload;
      const videoId = 'id' in v ? v.id : v.videoId;
      state.notes = 'notes' in v ? v.notes : '';

      // Add to watch history
      const existsIndex = state.history.findIndex((h) => h.videoId === videoId);
      const newHistoryItem: HistoryItem = {
        videoId,
        title: v.title,
        channelTitle: v.channelTitle,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        watchedAt: new Date().toISOString(),
      };

      if (existsIndex >= 0) {
        state.history.splice(existsIndex, 1);
      }
      state.history.unshift(newHistoryItem);

      if (state.history.length > 50) {
        state.history.pop();
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zen_watch_history', JSON.stringify(state.history));
        } catch {}
      }
    },
    closePlayer: (state) => {
      state.isOpen = false;
      state.isMiniPlayer = false;
      state.currentVideo = null;
      state.isPlaying = false;
      state.isBackgroundAudioMode = false;
    },
    toggleMiniPlayer: (state) => {
      state.isMiniPlayer = !state.isMiniPlayer;
    },
    setMiniPlayer: (state, action: PayloadAction<boolean>) => {
      state.isMiniPlayer = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    toggleBackgroundAudioMode: (state) => {
      state.isBackgroundAudioMode = !state.isBackgroundAudioMode;
    },
    setBackgroundAudioMode: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundAudioMode = action.payload;
    },
    toggleWakeLock: (state) => {
      state.isWakeLockActive = !state.isWakeLockActive;
    },
    setPlayerMode: (state, action: PayloadAction<PlayerMode>) => {
      state.playerMode = action.payload;
    },
    toggleTheaterMode: (state) => {
      state.isTheaterMode = !state.isTheaterMode;
    },
    setVideoNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    loadHistoryFromStorage: (state, action: PayloadAction<HistoryItem[]>) => {
      state.history = action.payload;
    },
    clearAllHistory: (state) => {
      state.history = [];
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zen_watch_history');
          localStorage.removeItem('zen_search_history');
        } catch {}
      }
    },
  },
});

export const {
  playVideo,
  closePlayer,
  toggleMiniPlayer,
  setMiniPlayer,
  setIsPlaying,
  toggleBackgroundAudioMode,
  setBackgroundAudioMode,
  toggleWakeLock,
  setPlayerMode,
  toggleTheaterMode,
  setVideoNotes,
  loadHistoryFromStorage,
  clearAllHistory,
} = playerSlice.actions;

export default playerSlice.reducer;
