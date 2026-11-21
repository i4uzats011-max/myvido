'use client';

import React from 'react';
import {
  CheckSquare,
  Calendar,
  IndianRupee,
  Film,
  History,
  Folder,
  BookOpen,
  Sparkles,
  Code,
  Headphones,
  Heart,
  Plus,
  Shield,
  RotateCcw,
  BookmarkCheck,
  X,
  PlaySquare,
  Lock,
  Boxes,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveFolder } from '@/store/slices/foldersSlice';
import {
  setManageFoldersOpen,
  setMobileDrawerOpen,
  setActiveView,
  setClearHistoryModalOpen,
  setPasswordModalOpen,
} from '@/store/slices/uiSlice';
import { setMinDurationSec, clearSearch, searchYouTube } from '@/store/slices/searchSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { items: folders, activeFolderSlug } = useAppSelector((state) => state.folders);
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);
  const { isSidebarOpen, isMobileDrawerOpen, activeView } = useAppSelector((state) => state.ui);
  const { query, minDurationSec } = useAppSelector((state) => state.search);
  const { history } = useAppSelector((state) => state.player);
  const { items: tasks } = useAppSelector((state) => state.tasks);
  const { persons } = useAppSelector((state) => state.ledger);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const handleSelectFolder = (slug: string) => {
    dispatch(clearSearch());
    dispatch(setActiveFolder(slug));
    dispatch(setActiveView('saved'));
    dispatch(setMobileDrawerOpen(false));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-3 px-3 overflow-y-auto">
      {/* Top Mobile Header */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-[#262626]">
        <span className="font-bold text-white text-base flex items-center gap-2">
          <PlaySquare className="w-5 h-5 text-red-500" />
          FocusTube &amp; Planner
        </span>
        <button
          onClick={() => dispatch(setMobileDrawerOpen(false))}
          className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CORE WORKFLOW MODULES */}
      <div className="space-y-1 mb-5">
        <div className="px-3 mb-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          Daily Workspace
        </div>

        {/* 1. Daily Tasks */}
        <button
          onClick={() => {
            dispatch(setActiveView('tasks'));
            dispatch(setMobileDrawerOpen(false));
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.99] ${
            activeView === 'tasks'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4 text-white" />
            <span>Daily Tasks &amp; Planner</span>
          </div>
          {pendingTasksCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeView === 'tasks' ? 'bg-white text-red-600' : 'bg-red-950/60 text-red-400 border border-red-800/40'
              }`}
            >
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* 2. Calendar & Compliance */}
        <button
          onClick={() => {
            dispatch(setActiveView('calendar'));
            dispatch(setMobileDrawerOpen(false));
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.99] ${
            activeView === 'calendar'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Compliance &amp; Festivals</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252525] text-amber-300 font-mono">
            TDS·GST
          </span>
        </button>

        {/* 3. Hisaab-Kitaab Ledger */}
        <button
          onClick={() => {
            dispatch(setActiveView('ledger'));
            dispatch(setMobileDrawerOpen(false));
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.99] ${
            activeView === 'ledger'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <span>हिसाब-किताब Ledger</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#252525] text-emerald-400">
            {persons.length}
          </span>
        </button>

        {/* 4. Warehouse Tracker & Entry Dates */}
        <button
          onClick={() => {
            dispatch(setActiveView('warehouse'));
            dispatch(setMobileDrawerOpen(false));
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.99] ${
            activeView === 'warehouse'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Boxes className="w-4 h-4 text-blue-400" />
            <span>Warehouse Tracker</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252525] text-blue-300 font-mono">
            入仓
          </span>
        </button>
      </div>

      {/* YOUTUBE ZERO-REELS VIDEO SECTION */}
      <div className="space-y-1 mb-5 pt-3 border-t border-[#222222]">
        <div className="px-3 mb-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          FocusTube Videos
        </div>

        <button
          onClick={() => handleSelectFolder('all')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.99] ${
            activeFolderSlug === 'all' && activeView === 'saved'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Film className="w-4 h-4 text-red-500" />
            <span>All Saved Videos</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-400">
            {savedVideos.length}
          </span>
        </button>

        <button
          onClick={() => {
            dispatch(setActiveView('history'));
            dispatch(setMobileDrawerOpen(false));
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.99] ${
            activeView === 'history'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 text-neutral-400" />
            <span>Watch History</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-400">
            {history.length}
          </span>
        </button>
      </div>

      {/* Folders List */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Profiles &amp; Folders</span>
          <button
            onClick={() => dispatch(setManageFoldersOpen(true))}
            className="p-1 hover:text-white hover:bg-[#272727] rounded-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => {
            const count = savedVideos.filter((v) => v.folderIds.includes(folder.slug)).length;
            const isSelected = activeFolderSlug === folder.slug && activeView === 'saved';

            return (
              <button
                key={folder.slug}
                onClick={() => handleSelectFolder(folder.slug)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.99] ${
                  isSelected
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                    : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span
                    className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                  >
                    <Folder className="w-4 h-4" />
                  </span>
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-400 ml-2">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings: Password Change & Preferences */}
      <div className="mt-auto pt-4 border-t border-[#242424] space-y-2">
        <button
          onClick={() => dispatch(setPasswordModalOpen(true))}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1c1c1c] border border-[#2b2b2b] transition"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Password</span>
          </div>
          <span className="text-[10px] text-neutral-500">Change</span>
        </button>

        <button
          onClick={() => dispatch(setClearHistoryModalOpen(true))}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs text-neutral-400 hover:text-red-400 hover:bg-red-950/20 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Preferences</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block w-64 bg-[#0f0f0f] border-r border-[#242424] h-[calc(100dvh-57px)] sticky top-[57px] transition-all duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          />
          <div className="fixed inset-y-0 left-0 max-w-[280px] w-full bg-[#121212] border-r border-[#2d2d2d] shadow-2xl safe-top safe-bottom z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
