'use client';

import React from 'react';
import { CheckSquare, Calendar, IndianRupee, PlaySquare, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveView, setMobileDrawerOpen } from '@/store/slices/uiSlice';
import { clearSearch } from '@/store/slices/searchSlice';

export default function MobileBottomNav() {
  const dispatch = useAppDispatch();
  const { activeView } = useAppSelector((state) => state.ui);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-[#262626] safe-bottom px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Daily Tasks */}
        <button
          onClick={() => dispatch(setActiveView('tasks'))}
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition ${
            activeView === 'tasks' ? 'text-red-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </button>

        {/* Calendar & Tax */}
        <button
          onClick={() => dispatch(setActiveView('calendar'))}
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition ${
            activeView === 'calendar' ? 'text-red-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        {/* Hisaab-Kitaab */}
        <button
          onClick={() => dispatch(setActiveView('ledger'))}
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition ${
            activeView === 'ledger' ? 'text-emerald-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-5 h-5" />
          <span className="text-[10px]">लेजर</span>
        </button>

        {/* Videos */}
        <button
          onClick={() => {
            dispatch(clearSearch());
            dispatch(setActiveView('saved'));
          }}
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition ${
            activeView === 'saved' || activeView === 'search' || activeView === 'history'
              ? 'text-amber-500 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px]">Videos</span>
        </button>

        {/* Folders & Menu */}
        <button
          onClick={() => dispatch(setMobileDrawerOpen(true))}
          className="flex flex-col items-center gap-1 min-w-[50px] py-1 text-neutral-400 hover:text-white transition"
        >
          <Folder className="w-5 h-5 text-neutral-400" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </nav>
  );
}
