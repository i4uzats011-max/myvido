import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface FolderItem {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  videoCount?: number;
}

interface FoldersState {
  items: FolderItem[];
  activeFolderSlug: string; // 'all' or specific slug like 'education'
  loading: boolean;
  error: string | null;
}

const initialState: FoldersState = {
  items: [
    {
      name: 'Education',
      slug: 'education',
      icon: 'book-open',
      color: '#3b82f6',
      description: 'Tutorials, lectures, and lessons',
    },
    {
      name: 'Meditation',
      slug: 'meditation',
      icon: 'sparkles',
      color: '#10b981',
      description: 'Mindfulness & relaxing sounds',
    },
    {
      name: 'Coding & Tech',
      slug: 'coding',
      icon: 'code',
      color: '#8b5cf6',
      description: 'Programming, AI, and architecture',
    },
    {
      name: 'Focus & Calm',
      slug: 'focus-calm',
      icon: 'headphones',
      color: '#f59e0b',
      description: 'Deep work & focus soundscapes',
    },
  ],
  activeFolderSlug: 'all',
  loading: false,
  error: null,
};

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/folders');
    if (!res.ok) throw new Error('Failed to fetch folders');
    const data = await res.json();
    return data.folders || [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching folders';
    return rejectWithValue(msg);
  }
});

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async (
    folderData: { name: string; icon?: string; color?: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create folder');
      return data.folder;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating folder';
      return rejectWithValue(msg);
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'folders/deleteFolder',
  async (folderId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete folder');
      return folderId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting folder';
      return rejectWithValue(msg);
    }
  }
);

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setActiveFolder: (state, action: PayloadAction<string>) => {
      state.activeFolderSlug = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Could not load folders';
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.activeFolderSlug = action.payload.slug;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.activeFolderSlug === action.payload) {
          state.activeFolderSlug = 'all';
        }
      });
  },
});

export const { setActiveFolder } = foldersSlice.actions;
export default foldersSlice.reducer;
