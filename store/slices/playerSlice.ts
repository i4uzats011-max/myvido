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
  playerMode: PlayerMode; // 'ad-free' = Invidious/Piped (No ads), 'nocookie' = YouTube Privacy
  isTheaterMode: boolean;
  notes: string;
  history: HistoryItem[];
}

const initialState: PlayerState = {
  currentVideo: null,
  isOpen: false,
  playerMode: 'nocookie', // Default to 100% reliable Clean Privacy Player
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

      // Keep max 50 items in history
      if (state.history.length > 50) {
        state.history.pop();
      }

      // Save history to localStorage if in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zen_watch_history', JSON.stringify(state.history));
        } catch {}
      }
    },
    closePlayer: (state) => {
      state.isOpen = false;
      state.currentVideo = null;
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
  setPlayerMode,
  toggleTheaterMode,
  setVideoNotes,
  loadHistoryFromStorage,
  clearAllHistory,
} = playerSlice.actions;

export default playerSlice.reducer;
