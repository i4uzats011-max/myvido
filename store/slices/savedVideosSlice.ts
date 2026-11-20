import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';

export interface SavedVideoItem {
  _id?: string;
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  duration: string;
  durationSec: number;
  viewCount: string;
  publishedAt: string;
  folderIds: string[];
  notes: string;
  isFavorite: boolean;
  createdAt?: string;
}

interface SavedVideosState {
  items: SavedVideoItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SavedVideosState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSavedVideos = createAsyncThunk(
  'savedVideos/fetchSavedVideos',
  async (folderSlug: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = folderSlug && folderSlug !== 'all' ? `/api/saved-videos?folder=${folderSlug}` : '/api/saved-videos';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch saved videos');
      const data = await res.json();
      return data.videos || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching saved videos';
      return rejectWithValue(msg);
    }
  }
);

export const saveVideo = createAsyncThunk(
  'savedVideos/saveVideo',
  async (
    payload: {
      video: YouTubeVideoItem;
      folderIds: string[];
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { video, folderIds, notes } = payload;
      const res = await fetch('/api/saved-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          title: video.title,
          description: video.description,
          channelTitle: video.channelTitle,
          channelId: video.channelId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          durationSec: video.durationSec,
          viewCount: video.viewCount,
          publishedAt: video.publishedAt,
          folderIds,
          notes: notes || '',
          isFavorite: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save video');
      return data.video;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving video';
      return rejectWithValue(msg);
    }
  }
);

export const updateSavedVideo = createAsyncThunk(
  'savedVideos/updateSavedVideo',
  async (
    payload: {
      videoId: string;
      folderIds?: string[];
      notes?: string;
      isFavorite?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const { videoId, folderIds, notes, isFavorite } = payload;
      const res = await fetch(`/api/saved-videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderIds, notes, isFavorite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update video');
      return data.video;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating video';
      return rejectWithValue(msg);
    }
  }
);

export const removeSavedVideo = createAsyncThunk(
  'savedVideos/removeSavedVideo',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/saved-videos/${videoId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete video');
      return videoId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting video';
      return rejectWithValue(msg);
    }
  }
);

const savedVideosSlice = createSlice({
  name: 'savedVideos',
  initialState,
  reducers: {
    // Quick toggle favorite or remove
    toggleLocalFavorite: (state, action: PayloadAction<string>) => {
      const v = state.items.find((item) => item.videoId === action.payload);
      if (v) v.isFavorite = !v.isFavorite;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSavedVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Could not fetch saved videos';
      })
      .addCase(saveVideo.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.videoId === action.payload.videoId);
        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateSavedVideo.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.videoId === action.payload.videoId);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removeSavedVideo.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.videoId !== action.payload);
      });
  },
});

export const { toggleLocalFavorite } = savedVideosSlice.actions;
export default savedVideosSlice.reducer;
