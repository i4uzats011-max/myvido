'use client';

import React from 'react';
import {
  Folder,
  BookOpen,
  Sparkles,
  Code,
  Headphones,
  Heart,
  Plus,
  Shield,
  Sliders,
  History,
  Trash2,
  BookmarkCheck,
  Film,
  X,
  RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveFolder } from '@/store/slices/foldersSlice';
import {
  setManageFoldersOpen,
  setMobileDrawerOpen,
  setActiveView,
  setClearHistoryModalOpen,
} from '@/store/slices/uiSlice';
import { setMinDurationSec, clearSearch } from '@/store/slices/searchSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { items: folders, activeFolderSlug } = useAppSelector((state) => state.folders);
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);
  const { isSidebarOpen, isMobileDrawerOpen, activeView } = useAppSelector((state) => state.ui);
  const { minDurationSec, filteredReelsCount } = useAppSelector((state) => state.search);
  const { history } = useAppSelector((state) => state.player);

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'book-open':
        return <BookOpen className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'headphones':
        return <Headphones className="w-4 h-4" />;
      case 'heart':
        return <Heart className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  const getFolderVideoCount = (slug: string) => {
    if (slug === 'all') return savedVideos.length;
    return savedVideos.filter((v) => v.folderIds.includes(slug)).length;
  };

  const handleSelectFolder = (slug: string) => {
    dispatch(clearSearch());
    dispatch(setActiveFolder(slug));
    dispatch(setActiveView('saved'));
    dispatch(setMobileDrawerOpen(false));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-3 px-3 overflow-y-auto">
      {/* Top Mobile Close Button */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-[#262626]">
        <span className="font-bold text-white text-base flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-red-500" />
          My Library
        </span>
        <button
          onClick={() => dispatch(setMobileDrawerOpen(false))}
          className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Sections */}
      <div className="space-y-1 mb-5">
        <button
          onClick={() => handleSelectFolder('all')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.99] ${
            activeFolderSlug === 'all' && activeView === 'saved'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-300 hover:bg-[#1f1f1f] hover:text-white'
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
              : 'text-neutral-300 hover:bg-[#1f1f1f] hover:text-white'
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

      {/* Folders / Profiles List */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Profiles & Folders</span>
          <button
            onClick={() => dispatch(setManageFoldersOpen(true))}
            className="p-1 hover:text-white hover:bg-[#272727] rounded-md transition"
            title="Add new folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => {
            const count = getFolderVideoCount(folder.slug);
            const isSelected = activeFolderSlug === folder.slug && activeView === 'saved';

            return (
              <button
                key={folder.slug}
                onClick={() => handleSelectFolder(folder.slug)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.99] ${
                  isSelected
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                    : 'text-neutral-300 hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span
                    className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${folder.color}20`,
                      color: folder.color,
                    }}
                  >
                    {getFolderIcon(folder.icon)}
                  </span>
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-400 ml-2">
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => dispatch(setManageFoldersOpen(true))}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-[#1b1b1b] transition border border-dashed border-[#333333] mt-2 justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Folder</span>
          </button>
        </div>
      </div>

      {/* Anti-Reels & Duration Filter Control */}
      <div className="mt-auto pt-4 border-t border-[#262626] space-y-3">
        <div className="bg-[#181818] p-3 rounded-2xl border border-[#2d2d2d]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              Anti-Reels Filter
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
              ACTIVE 🛡️
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
            All YouTube Shorts & vertical reels are automatically blocked.
          </p>

          <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
            Min Duration Threshold:
          </label>
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            <button
              onClick={() => dispatch(setMinDurationSec(70))}
              className={`py-1 rounded-lg font-medium transition ${
                minDurationSec === 70
                  ? 'bg-red-600 text-white'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              &gt; 1 min
            </button>
            <button
              onClick={() => dispatch(setMinDurationSec(240))}
              className={`py-1 rounded-lg font-medium transition ${
                minDurationSec === 240
                  ? 'bg-red-600 text-white'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              &gt; 4 mins
            </button>
            <button
              onClick={() => dispatch(setMinDurationSec(1200))}
              className={`py-1 rounded-lg font-medium transition ${
                minDurationSec === 1200
                  ? 'bg-red-600 text-white'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              &gt; 20 mins
            </button>
          </div>
        </div>

        {/* 1-Click Delete All History / Reset Preferences */}
        <button
          onClick={() => dispatch(setClearHistoryModalOpen(true))}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs text-neutral-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Preferences & History</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block w-64 bg-[#0f0f0f] border-r border-[#262626] h-[calc(100dvh-57px)] sticky top-[57px] transition-all duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Safari / iPhone Drawer with backdrop */}
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
