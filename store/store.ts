import { configureStore } from '@reduxjs/toolkit';
import foldersReducer from './slices/foldersSlice';
import savedVideosReducer from './slices/savedVideosSlice';
import searchReducer from './slices/searchSlice';
import playerReducer from './slices/playerSlice';
import uiReducer from './slices/uiSlice';
import screenTimeReducer from './slices/screenTimeSlice';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import ledgerReducer from './slices/ledgerSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: tasksReducer,
      ledger: ledgerReducer,
      folders: foldersReducer,
      savedVideos: savedVideosReducer,
      search: searchReducer,
      player: playerReducer,
      ui: uiReducer,
      screenTime: screenTimeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
