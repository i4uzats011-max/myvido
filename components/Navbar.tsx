'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Menu,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  FolderPlus,
  PlaySquare,
  Sparkles,
  History,
  Trash2,
  Timer,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setQuery,
  searchYouTube,
  addSearchQueryToHistory,
  clearSearch,
  resetSearchPreferences,
  clearSearchHistory,
} from '@/store/slices/searchSlice';
import {
  toggleSidebar,
  toggleMobileDrawer,
  setManageFoldersOpen,
  setActiveView,
  setClearHistoryModalOpen,
} from '@/store/slices/uiSlice';
import { setPlayerMode } from '@/store/slices/playerSlice';
import { setScreenTimeModalOpen } from '@/store/slices/screenTimeSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { query, searchHistory, loading, minDurationSec, filteredReelsCount } = useAppSelector(
    (state) => state.search
  );
  const { playerMode } = useAppSelector((state) => state.player);
  const { activeFolderSlug, items: folders } = useAppSelector((state) => state.folders);
  const { totalSecondsToday } = useAppSelector((state) => state.screenTime);

  const [inputVal, setInputVal] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    dispatch(setQuery(trimmed));
    dispatch(addSearchQueryToHistory(trimmed));
    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: trimmed, minDurationSec }));
  };

  const handleSuggestionClick = (selectedQuery: string) => {
    setInputVal(selectedQuery);
    setShowSuggestions(false);
    dispatch(setQuery(selectedQuery));
    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: selectedQuery, minDurationSec }));
  };

  const handleClear = () => {
    setInputVal('');
    dispatch(clearSearch());
    dispatch(setActiveView('saved'));
    searchInputRef.current?.focus();
  };

  const activeFolderName =
    activeFolderSlug === 'all'
      ? 'All Saved Videos'
      : folders.find((f) => f.slug === activeFolderSlug)?.name || 'Library';

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727] safe-top px-3 sm:px-5 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                dispatch(toggleMobileDrawer());
              } else {
                dispatch(toggleSidebar());
              }
            }}
            className="p-2 -ml-1 text-neutral-300 hover:text-white hover:bg-[#272727] rounded-full transition active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => {
              dispatch(clearSearch());
              dispatch(setActiveView('saved'));
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition">
              <PlaySquare className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold tracking-tight text-lg text-white flex items-center gap-1">
                FocusTube
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded">
                  0-Reels
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar with Autocomplete & Quick Filter */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative flex-1 flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search YouTube (Zero Reels & Shorts guaranteed)..."
                className="w-full bg-[#121212] hover:bg-[#181818] focus:bg-[#121212] text-white placeholder-neutral-500 pl-4 pr-10 py-2 sm:py-2.5 rounded-l-full border border-[#303030] focus:border-red-500 focus:ring-1 focus:ring-red-500 transition outline-none text-base"
              />

              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 p-1 text-neutral-400 hover:text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#222222] hover:bg-[#2a2a2a] active:bg-[#333333] border border-l-0 border-[#303030] px-4 sm:px-6 py-2 sm:py-2.5 rounded-r-full text-neutral-300 hover:text-white transition flex items-center justify-center flex-shrink-0"
              aria-label="Search"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </form>

          {/* Autocomplete & History Suggestions Dropdown */}
          {showSuggestions && searchHistory.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-[#1f1f1f] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
            >
              <div className="p-2 border-b border-[#2b2b2b] flex items-center justify-between text-xs text-neutral-400 px-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(clearSearchHistory())}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] py-0.5 px-2 hover:bg-[#2c2c2c] rounded transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {searchHistory.map((hist, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(hist)}
                    className="w-full text-left px-4 py-2 hover:bg-[#282828] text-sm text-neutral-200 flex items-center gap-3 transition"
                  >
                    <Search className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="truncate">{hist}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Ad-Block Badge, Screen Time Widget, Anti-Reels Shield, Reset Preferences */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Screen Time Monitor Widget */}
          <button
            onClick={() => dispatch(setScreenTimeModalOpen(true))}
            title="Screen Time & Focus Monitor"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#252525] border border-[#2e2e2e] text-amber-400 transition active:scale-95"
          >
            <Timer className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Focus:</span>
            <span className="font-mono text-white text-[11px]">
              {Math.floor(totalSecondsToday / 60)}m
            </span>
          </button>

          {/* Ad-Block Toggle Indicator */}
          <button
            onClick={() => {
              const nextMode = playerMode === 'ad-free' ? 'nocookie' : 'ad-free';
              dispatch(setPlayerMode(nextMode));
            }}
            title={playerMode === 'ad-free' ? 'Invidious Mode: Active' : 'Clean Privacy Player: Active (100% Playable)'}
            className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              playerMode === 'ad-free'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-600/40 hover:bg-emerald-950/60'
                : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{playerMode === 'ad-free' ? 'Ad-Free Proxy' : 'Clean Player 🛡️'}</span>
          </button>

          {/* Reset Preferences & History Button (1-Click) */}
          <button
            onClick={() => dispatch(setClearHistoryModalOpen(true))}
            title="Reset preferences and clear history"
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#272727] rounded-full transition active:scale-95 flex items-center justify-center"
            aria-label="Reset preferences & history"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Folder Creator / Manager */}
          <button
            onClick={() => dispatch(setManageFoldersOpen(true))}
            title="Create or manage folders"
            className="hidden sm:flex items-center gap-1.5 bg-[#212121] hover:bg-[#2d2d2d] text-neutral-200 text-xs font-medium px-3 py-2 rounded-full border border-[#333333] transition active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 text-red-500" />
            <span>Folders</span>
          </button>
        </div>
      </div>
    </header>
  );
}
