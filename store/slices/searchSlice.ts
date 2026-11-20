import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';

interface SearchState {
  query: string;
  results: YouTubeVideoItem[];
  nextPageToken: string | null;
  filteredReelsCount: number;
  totalFilteredTotal: number;
  minDurationSec: number; // default 70s (> 1 min 10s) to block all shorts
  searchHistory: string[];
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}

const DEFAULT_MIN_DURATION = 70;

const initialState: SearchState = {
  query: '',
  results: [],
  nextPageToken: null,
  filteredReelsCount: 0,
  totalFilteredTotal: 0,
  minDurationSec: DEFAULT_MIN_DURATION,
  searchHistory: [],
  loading: false,
  hasSearched: false,
  error: null,
};

export const searchYouTube = createAsyncThunk(
  'search/searchYouTube',
  async (
    payload: { query: string; minDurationSec?: number },
    { rejectWithValue }
  ) => {
    try {
      const { query, minDurationSec = 70 } = payload;
      if (!query || query.trim() === '') {
        return { items: [], nextPageToken: null, filteredCount: 0 };
      }

      const url = `/api/search?q=${encodeURIComponent(query)}&minDuration=${minDurationSec}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing search';
      return rejectWithValue(msg);
    }
  }
);

export const loadMoreYouTube = createAsyncThunk(
  'search/loadMoreYouTube',
  async (
    payload: { query: string; pageToken: string; minDurationSec?: number },
    { rejectWithValue }
  ) => {
    try {
      const { query, pageToken, minDurationSec = 70 } = payload;
      const url = `/api/search?q=${encodeURIComponent(query)}&pageToken=${pageToken}&minDuration=${minDurationSec}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load more videos');
      }

      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading more';
      return rejectWithValue(msg);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setMinDurationSec: (state, action: PayloadAction<number>) => {
      state.minDurationSec = action.payload;
    },
    addSearchQueryToHistory: (state, action: PayloadAction<string>) => {
      const q = action.payload.trim();
      if (!q) return;
      state.searchHistory = [q, ...state.searchHistory.filter((item) => item !== q)].slice(0, 20);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zen_search_history', JSON.stringify(state.searchHistory));
        } catch {}
      }
    },
    loadSearchHistoryFromStorage: (state, action: PayloadAction<string[]>) => {
      state.searchHistory = action.payload;
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zen_search_history');
        } catch {}
      }
    },
    resetSearchPreferences: (state) => {
      state.minDurationSec = DEFAULT_MIN_DURATION;
      state.query = '';
      state.results = [];
      state.nextPageToken = null;
      state.filteredReelsCount = 0;
      state.hasSearched = false;
      state.error = null;
      state.searchHistory = [];
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zen_search_history');
          localStorage.removeItem('zen_search_preferences');
        } catch {}
      }
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.nextPageToken = null;
      state.filteredReelsCount = 0;
      state.hasSearched = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchYouTube.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchYouTube.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.items || [];
        state.nextPageToken = action.payload.nextPageToken || null;
        state.filteredReelsCount = action.payload.filteredCount || 0;
        state.totalFilteredTotal += action.payload.filteredCount || 0;
        state.hasSearched = true;
      })
      .addCase(searchYouTube.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Search failed';
      })
      .addCase(loadMoreYouTube.fulfilled, (state, action) => {
        state.results = [...state.results, ...(action.payload.items || [])];
        state.nextPageToken = action.payload.nextPageToken || null;
        state.filteredReelsCount += action.payload.filteredCount || 0;
        state.totalFilteredTotal += action.payload.filteredCount || 0;
      });
  },
});

export const {
  setQuery,
  setMinDurationSec,
  addSearchQueryToHistory,
  loadSearchHistoryFromStorage,
  clearSearchHistory,
  resetSearchPreferences,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
