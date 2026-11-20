import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';
import { SavedVideoItem } from './savedVideosSlice';

type VideoModalTarget = YouTubeVideoItem | SavedVideoItem | null;

interface UiState {
  isSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;
  isSaveModalOpen: boolean;
  saveModalVideo: VideoModalTarget;
  isManageFoldersOpen: boolean;
  isSettingsOpen: boolean;
  isClearHistoryModalOpen: boolean;
  activeView: 'saved' | 'search' | 'history';
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const initialState: UiState = {
  isSidebarOpen: true,
  isMobileDrawerOpen: false,
  isSaveModalOpen: false,
  saveModalVideo: null,
  isManageFoldersOpen: false,
  isSettingsOpen: false,
  isClearHistoryModalOpen: false,
  activeView: 'saved',
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleMobileDrawer: (state) => {
      state.isMobileDrawerOpen = !state.isMobileDrawerOpen;
    },
    setMobileDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileDrawerOpen = action.payload;
    },
    openSaveModal: (state, action: PayloadAction<YouTubeVideoItem | SavedVideoItem>) => {
      state.saveModalVideo = action.payload;
      state.isSaveModalOpen = true;
    },
    closeSaveModal: (state) => {
      state.isSaveModalOpen = false;
      state.saveModalVideo = null;
    },
    setManageFoldersOpen: (state, action: PayloadAction<boolean>) => {
      state.isManageFoldersOpen = action.payload;
    },
    setSettingsOpen: (state, action: PayloadAction<boolean>) => {
      state.isSettingsOpen = action.payload;
    },
    setClearHistoryModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isClearHistoryModalOpen = action.payload;
    },
    setActiveView: (state, action: PayloadAction<'saved' | 'search' | 'history'>) => {
      state.activeView = action.payload;
    },
    showToast: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>
    ) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileDrawer,
  setMobileDrawerOpen,
  openSaveModal,
  closeSaveModal,
  setManageFoldersOpen,
  setSettingsOpen,
  setClearHistoryModalOpen,
  setActiveView,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
