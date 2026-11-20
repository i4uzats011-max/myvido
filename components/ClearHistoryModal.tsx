'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  RotateCcw,
  AlertTriangle,
  History,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setClearHistoryModalOpen, showToast, setActiveView } from '@/store/slices/uiSlice';
import { clearAllHistory } from '@/store/slices/playerSlice';
import { resetSearchPreferences, clearSearchHistory, clearSearch } from '@/store/slices/searchSlice';
import { fetchSavedVideos } from '@/store/slices/savedVideosSlice';

export default function ClearHistoryModal() {
  const dispatch = useAppDispatch();
  const { isClearHistoryModalOpen } = useAppSelector((state) => state.ui);
  const [deleteSavedVideosToo, setDeleteSavedVideosToo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isClearHistoryModalOpen) return null;

  const handleExecuteReset = async () => {
    setIsDeleting(true);
    try {
      // 1. Clear Watch History from Redux and LocalStorage
      dispatch(clearAllHistory());

      // 2. Clear Search History & Reset Search Preferences
      dispatch(clearSearchHistory());
      dispatch(resetSearchPreferences());
      dispatch(clearSearch());

      // 3. If user selected to clear saved videos as well
      if (deleteSavedVideosToo) {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope: 'all_saved' }),
        });
        await dispatch(fetchSavedVideos());
      }

      dispatch(setActiveView('saved'));
      dispatch(
        showToast({
          message: deleteSavedVideosToo
            ? 'All history, saved videos, and preferences have been cleared!'
            : 'Watch history and search preferences successfully reset!',
          type: 'success',
        })
      );
      dispatch(setClearHistoryModalOpen(false));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-white text-base">Reset History & Preferences</h2>
          </div>
          <button
            onClick={() => dispatch(setClearHistoryModalOpen(false))}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-neutral-300">
          <p className="leading-relaxed">
            In one click, you can delete your search history, watch history, and restore all filters to clean default settings.
          </p>

          <div className="space-y-2 bg-[#121212] p-3.5 rounded-2xl border border-[#2b2b2b]">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What will be cleared:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1 text-[11px]">
              <li>All past YouTube search history & autocomplete suggestions</li>
              <li>Recently watched video history</li>
              <li>Filter preferences (reset to default &gt;2.5m Anti-Reels filter)</li>
            </ul>
          </div>

          {/* Optional: Checkbox to also wipe saved videos */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-950/20 border border-red-900/30 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteSavedVideosToo}
              onChange={(e) => setDeleteSavedVideosToo(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-600 rounded"
            />
            <div className="text-[11px]">
              <span className="font-semibold text-red-300 block">
                Also delete all saved videos from MongoDB
              </span>
              <span className="text-neutral-400">
                Check this only if you want to completely empty your saved folders as well.
              </span>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#141414] border-t border-[#262626] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => dispatch(setClearHistoryModalOpen(false))}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteReset}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Resetting...' : '1-Click Reset All'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
