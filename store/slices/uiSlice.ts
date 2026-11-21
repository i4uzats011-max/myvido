import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { YouTubeVideoItem } from '@/lib/youtube';
import { SavedVideoItem } from './savedVideosSlice';

type VideoModalTarget = YouTubeVideoItem | SavedVideoItem | null;
export type ActiveAppView = 'tasks' | 'calendar' | 'ledger' | 'warehouse' | 'saved' | 'search' | 'history';

interface UiState {
  isSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;
  isSaveModalOpen: boolean;
  saveModalVideo: VideoModalTarget;
  isManageFoldersOpen: boolean;
  isSettingsOpen: boolean;
  isPasswordModalOpen: boolean;
  isClearHistoryModalOpen: boolean;
  activeView: ActiveAppView;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const initialState: UiState = {
  isSidebarOpen: true,
  isMobileDrawerOpen: false,
  isSaveModalOpen: false,
  saveModalVideo: null,
  isManageFoldersOpen: false,
  isSettingsOpen: false,
  isPasswordModalOpen: false,
  isClearHistoryModalOpen: false,
  activeView: 'tasks', // Default view requested: Tasks open first upon login!
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
    setPasswordModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPasswordModalOpen = action.payload;
    },
    setClearHistoryModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isClearHistoryModalOpen = action.payload;
    },
    setActiveView: (state, action: PayloadAction<ActiveAppView>) => {
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
  setPasswordModalOpen,
  setClearHistoryModalOpen,
  setActiveView,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
