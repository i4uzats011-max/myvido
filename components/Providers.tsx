'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/store';
import { loadHistoryFromStorage } from '@/store/slices/playerSlice';
import { loadSearchHistoryFromStorage } from '@/store/slices/searchSlice';
import { loadScreenTimeFromStorage, incrementScreenTime } from '@/store/slices/screenTimeSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && storeRef.current) {
      // Hydrate local histories if present
      try {
        const savedWatch = localStorage.getItem('zen_watch_history');
        if (savedWatch) {
          storeRef.current.dispatch(loadHistoryFromStorage(JSON.parse(savedWatch)));
        }
        const savedSearch = localStorage.getItem('zen_search_history');
        if (savedSearch) {
          storeRef.current.dispatch(loadSearchHistoryFromStorage(JSON.parse(savedSearch)));
        }
        const savedScreenTime = localStorage.getItem('zen_screen_time');
        if (savedScreenTime) {
          storeRef.current.dispatch(loadScreenTimeFromStorage(JSON.parse(savedScreenTime)));
        }
      } catch (e) {
        console.error('Failed to parse localStorage:', e);
      }

      // Active screen time tracking ticker:
      // Ticks every second when the video player is active or the page is in focus
      const timer = setInterval(() => {
        if (!storeRef.current) return;
        const state = storeRef.current.getState();
        // Track actively when a video is being played or watched
        if (state.player.isOpen && state.player.currentVideo) {
          const activeSlug = state.folders.activeFolderSlug;
          storeRef.current.dispatch(incrementScreenTime({ folderSlug: activeSlug }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
