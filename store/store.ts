import { configureStore } from '@reduxjs/toolkit';
import foldersReducer from './slices/foldersSlice';
import savedVideosReducer from './slices/savedVideosSlice';
import searchReducer from './slices/searchSlice';
import playerReducer from './slices/playerSlice';
import uiReducer from './slices/uiSlice';
import screenTimeReducer from './slices/screenTimeSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
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
