import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';

interface SearchState {
  query: string;
  results: YouTubeVideoItem[];
  searchHistory: string[];
  isLoading: boolean;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
  filteredReelsCount: number;
  minDurationSec: number;
  nextPageToken?: string | null;
  suggestions: string[];
  isSuggestionsLoading: boolean;
  quota: {
    dailyLimit: number; // 10,000 units/day default
    dailyUsed: number;
    monthlyLimit: number; // 300,000 units/month
    monthlyUsed: number;
    lastResetDate: string;
  };
}

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const initialQuota = {
  dailyLimit: 10000,
  dailyUsed: 120,
  monthlyLimit: 300000,
  monthlyUsed: 2450,
  lastResetDate: getTodayDateStr(),
};

const initialState: SearchState = {
  query: '',
  results: [],
  searchHistory: [],
  isLoading: false,
  loading: false,
  hasSearched: false,
  error: null,
  filteredReelsCount: 0,
  minDurationSec: 150,
  nextPageToken: null,
  suggestions: [],
  isSuggestionsLoading: false,
  quota: initialQuota,
};

export const searchYouTube = createAsyncThunk(
  'search/searchYouTube',
  async (
    { query, minDurationSec = 150 }: { query: string; minDurationSec?: number },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&minDuration=${minDurationSec}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to search YouTube');
      }

      dispatch(consumeQuota(100));

      return {
        videos: data.videos as YouTubeVideoItem[],
        filteredReelsCount: data.filteredReelsCount || 0,
        nextPageToken: data.nextPageToken || null,
      };
    } catch {
      return rejectWithValue('Network error occurred while fetching videos');
    }
  }
);

export const loadMoreYouTube = createAsyncThunk(
  'search/loadMoreYouTube',
  async (
    { query, minDurationSec = 150, pageToken }: { query: string; minDurationSec?: number; pageToken?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&minDuration=${minDurationSec}${pageToken ? `&pageToken=${pageToken}` : ''}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to load more videos');
      }

      dispatch(consumeQuota(100));

      return {
        videos: data.videos as YouTubeVideoItem[],
        filteredReelsCount: data.filteredReelsCount || 0,
      };
    } catch {
      return rejectWithValue('Network error occurred while fetching more videos');
    }
  }
);

export const fetchAutoSuggestions = createAsyncThunk(
  'search/fetchAutoSuggestions',
  async (query: string) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
          query
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data[1]) ? (data[1] as string[]).slice(0, 8) : [];
      }
    } catch {}
    return [
      `${query} full documentary`,
      `${query} lecture tutorial`,
      `${query} meditation music`,
      `${query} podcast full episode`,
    ];
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.filteredReelsCount = 0;
      state.suggestions = [];
    },
    setMinDurationSec: (state, action: PayloadAction<number>) => {
      state.minDurationSec = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zen_search_min_duration', action.payload.toString());
      }
    },
    addSearchQueryToHistory: (state, action: PayloadAction<string>) => {
      const clean = action.payload.trim();
      if (!clean) return;
      state.searchHistory = [clean, ...state.searchHistory.filter((q) => q !== clean)].slice(0, 20);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zen_search_history', JSON.stringify(state.searchHistory));
        } catch {}
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zen_search_history');
      }
    },
    resetSearchPreferences: (state) => {
      state.minDurationSec = 150;
      state.searchHistory = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zen_search_min_duration');
        localStorage.removeItem('zen_search_history');
      }
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    consumeQuota: (state, action: PayloadAction<number>) => {
      const today = getTodayDateStr();
      if (state.quota.lastResetDate !== today) {
        state.quota.dailyUsed = 0;
        state.quota.lastResetDate = today;
      }
      state.quota.dailyUsed += action.payload;
      state.quota.monthlyUsed += action.payload;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('focustube_quota', JSON.stringify(state.quota));
        } catch {}
      }
    },
    loadSearchHistoryFromStorage: (state, action: PayloadAction<string[]>) => {
      state.searchHistory = action.payload;
    },
    loadQuotaFromStorage: (state, action: PayloadAction<typeof initialQuota>) => {
      const today = getTodayDateStr();
      state.quota = {
        ...initialQuota,
        ...action.payload,
      };
      if (state.quota.lastResetDate !== today) {
        state.quota.dailyUsed = 0;
        state.quota.lastResetDate = today;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchYouTube.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.hasSearched = true;
        state.error = null;
        state.suggestions = [];
      })
      .addCase(searchYouTube.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.hasSearched = true;
        state.results = action.payload.videos;
        state.filteredReelsCount = action.payload.filteredReelsCount;
        state.nextPageToken = action.payload.nextPageToken;
      })
      .addCase(searchYouTube.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.hasSearched = true;
        state.error = action.payload as string;
      });

    builder.addCase(loadMoreYouTube.fulfilled, (state, action) => {
      state.results = [...state.results, ...action.payload.videos];
    });

    builder.addCase(fetchAutoSuggestions.fulfilled, (state, action) => {
      state.suggestions = action.payload;
    });
  },
});

export const {
  setQuery,
  clearSearch,
  setMinDurationSec,
  addSearchQueryToHistory,
  clearSearchHistory,
  resetSearchPreferences,
  clearSuggestions,
  consumeQuota,
  loadSearchHistoryFromStorage,
  loadQuotaFromStorage,
} = searchSlice.actions;

export default searchSlice.reducer;
