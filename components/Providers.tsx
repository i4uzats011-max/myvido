'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/store';
import { loadHistoryFromStorage } from '@/store/slices/playerSlice';
import { loadSearchHistoryFromStorage, setMinDurationSec, loadQuotaFromStorage } from '@/store/slices/searchSlice';
import { loadScreenTimeFromStorage, incrementScreenTime } from '@/store/slices/screenTimeSlice';
import { loadPriorityColorsFromStorage } from '@/store/slices/tasksSlice';
import { checkAuth } from '@/store/slices/authSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && storeRef.current) {
      // 1. Register PWA Service Worker for background caching & sync
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => console.log('FocusTube PWA Service Worker Registered'))
          .catch((err) => console.warn('SW registration warning:', err));
      }

      // 2. Hydrate local state
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
        const savedMinDuration = localStorage.getItem('zen_search_min_duration');
        if (savedMinDuration) {
          const parsed = parseInt(savedMinDuration, 10);
          if (!isNaN(parsed) && parsed > 0) {
            storeRef.current.dispatch(setMinDurationSec(parsed));
          }
        }
        const savedColors = localStorage.getItem('focustube_priority_colors');
        if (savedColors) {
          storeRef.current.dispatch(loadPriorityColorsFromStorage(JSON.parse(savedColors)));
        }
        const savedQuota = localStorage.getItem('focustube_quota');
        if (savedQuota) {
          storeRef.current.dispatch(loadQuotaFromStorage(JSON.parse(savedQuota)));
        }
      } catch (e) {
        console.error('Failed to parse localStorage:', e);
      }

      // Check auth session
      storeRef.current.dispatch(checkAuth());

      // Screen time tracking ticker
      const timer = setInterval(() => {
        if (!storeRef.current) return;
        const state = storeRef.current.getState();
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
