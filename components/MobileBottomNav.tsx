'use client';

import React from 'react';
import { Home, Search, Folder, History, RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveView, setMobileDrawerOpen, setClearHistoryModalOpen } from '@/store/slices/uiSlice';
import { clearSearch } from '@/store/slices/searchSlice';

export default function MobileBottomNav() {
  const dispatch = useAppDispatch();
  const { activeView } = useAppSelector((state) => state.ui);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-lg border-t border-[#262626] safe-bottom px-4 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => {
            dispatch(clearSearch());
            dispatch(setActiveView('saved'));
          }}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition ${
            activeView === 'saved' ? 'text-red-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Library</span>
        </button>

        <button
          onClick={() => dispatch(setMobileDrawerOpen(true))}
          className="flex flex-col items-center gap-1 min-w-[56px] py-1 text-neutral-400 hover:text-white transition"
        >
          <Folder className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-medium">Folders</span>
        </button>

        <button
          onClick={() => {
            dispatch(setActiveView('history'));
          }}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition ${
            activeView === 'history' ? 'text-red-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </button>

        <button
          onClick={() => dispatch(setClearHistoryModalOpen(true))}
          className="flex flex-col items-center gap-1 min-w-[56px] py-1 text-neutral-400 hover:text-red-400 transition"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reset</span>
        </button>
      </div>
    </nav>
  );
}
