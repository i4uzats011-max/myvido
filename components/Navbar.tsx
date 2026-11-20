'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Menu,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  FolderPlus,
  PlaySquare,
  Sparkles,
  History,
  Trash2,
  Timer,
  Mic,
  MicOff,
  BarChart3,
  CheckSquare,
  IndianRupee,
  Calendar,
  Lock,
  LogOut,
  User,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setQuery,
  searchYouTube,
  setMinDurationSec,
  clearSearch,
  fetchAutoSuggestions,
} from '@/store/slices/searchSlice';
import {
  toggleSidebar,
  toggleMobileDrawer,
  setManageFoldersOpen,
  setActiveView,
  setClearHistoryModalOpen,
  setPasswordModalOpen,
  showToast,
} from '@/store/slices/uiSlice';
import { setPlayerMode, playVideo } from '@/store/slices/playerSlice';
import { setScreenTimeModalOpen } from '@/store/slices/screenTimeSlice';
import { logoutUser } from '@/store/slices/authSlice';
import { extractYouTubeVideoId } from '@/lib/youtube';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { query, results, minDurationSec, suggestions, quota, isLoading } = useAppSelector(
    (state) => state.search
  );
  const { playerMode } = useAppSelector((state) => state.player);
  const { totalSecondsToday } = useAppSelector((state) => state.screenTime);
  const { activeView } = useAppSelector((state) => state.ui);
  const { username } = useAppSelector((state) => state.auth);

  const [inputVal, setInputVal] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuotaTooltip, setShowQuotaTooltip] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal && inputVal.trim().length >= 2) {
        dispatch(fetchAutoSuggestions(inputVal.trim()));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [inputVal, dispatch]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice typing in search
  const toggleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(showToast({ message: 'Voice search not supported on this browser', type: 'error' }));
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        dispatch(showToast({ message: 'Listening for YouTube search... बोलिए...', type: 'info' }));
      };

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputVal(text);
        setIsRecording(false);
        dispatch(setQuery(text));
        dispatch(setActiveView('search'));
        dispatch(searchYouTube({ query: text, minDurationSec }));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    dispatch(setQuery(trimmed));

    // Direct YouTube link playback
    const directVideoId = extractYouTubeVideoId(trimmed);
    if (directVideoId) {
      dispatch(
        playVideo({
          id: directVideoId,
          title: `Direct Stream (${directVideoId})`,
          description: `Direct playback: ${trimmed}`,
          channelTitle: 'FocusTube Player',
          channelId: '',
          thumbnailUrl: `https://i.ytimg.com/vi/${directVideoId}/hqdefault.jpg`,
          duration: 'Direct Stream',
          durationSec: 0,
          viewCount: 'Ad-Free Play',
          publishedAt: new Date().toISOString(),
          isShortOrReel: false,
        })
      );
      dispatch(showToast({ message: 'Playing in Ad-Free mode! 🛡️', type: 'success' }));
    }

    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: trimmed, minDurationSec }));
  };

  const handleSelectSuggestion = (text: string) => {
    setInputVal(text);
    setShowSuggestions(false);
    dispatch(setQuery(text));
    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: text, minDurationSec }));
  };

  const handleClear = () => {
    setInputVal('');
    dispatch(clearSearch());
    searchInputRef.current?.focus();
  };

  const dailyRemaining = Math.max(0, quota.dailyLimit - quota.dailyUsed);
  const dailyPercent = Math.min(100, Math.round((quota.dailyUsed / quota.dailyLimit) * 100));

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#242424] safe-top px-3 sm:px-5 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger + Brand + App View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                dispatch(toggleMobileDrawer());
              } else {
                dispatch(toggleSidebar());
              }
            }}
            className="p-2 -ml-1 text-neutral-300 hover:text-white hover:bg-[#252525] rounded-full transition active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => dispatch(setActiveView('tasks'))}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition">
              <PlaySquare className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold tracking-tight text-base text-white flex items-center gap-1.5">
                FocusTube
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded">
                  Pro Zen
                </span>
              </span>
            </div>
          </button>

          {/* Quick Nav Mode Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#2b2b2b]">
            <button
              onClick={() => dispatch(setActiveView('tasks'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'tasks' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Daily Tasks</span>
            </button>

            <button
              onClick={() => dispatch(setActiveView('calendar'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'calendar' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar &amp; Tax</span>
            </button>

            <button
              onClick={() => dispatch(setActiveView('ledger'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'ledger' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>हिसाब-किताब</span>
            </button>

            <button
              onClick={() => dispatch(setActiveView('saved'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'saved' || activeView === 'search'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="YouTube Zero-Reels Ad-Free Player"
            >
              <PlaySquare className="w-3.5 h-3.5 text-white" />
              <span>Videos</span>
            </button>
          </div>
        </div>

        {/* Center: Large Enhanced Search Bar with Autocomplete & Voice Typing */}
        <div className="flex-1 max-w-xl relative">
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
                placeholder="Search videos (Zero Shorts & Ads) or paste YouTube URL..."
                className="w-full bg-[#161616] hover:bg-[#1b1b1b] focus:bg-[#161616] text-white placeholder-neutral-500 pl-4 pr-16 py-2.5 rounded-l-2xl border border-[#303030] focus:border-red-500 focus:ring-1 focus:ring-red-500 transition outline-none text-xs sm:text-sm font-medium"
              />

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`absolute right-9 p-1.5 rounded-lg transition ${
                  isRecording ? 'text-red-500 animate-pulse' : 'text-neutral-400 hover:text-white'
                }`}
                title="Voice Search YouTube"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 p-1 text-neutral-400 hover:text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#242424] hover:bg-[#2e2e2e] border-y border-r border-[#303030] px-4 py-2.5 rounded-r-2xl text-neutral-300 hover:text-white transition flex items-center justify-center flex-shrink-0"
              aria-label="Search"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
            >
              <div className="p-2 border-b border-[#282828] text-[11px] text-neutral-400 px-3 font-semibold flex items-center justify-between">
                <span>Auto Suggestions</span>
                <span className="text-[10px] text-red-400 font-bold">ANTI-SHORTS 🛡️</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left px-4 py-2 hover:bg-[#262626] text-xs sm:text-sm text-neutral-200 flex items-center gap-2.5 transition"
                  >
                    <Search className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="truncate">{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: API Quota Tracker, Screen Time, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* YouTube API Quota Credit Live Counter */}
          <div className="relative">
            <button
              onClick={() => setShowQuotaTooltip(!showQuotaTooltip)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] text-[11px] font-semibold text-neutral-300 transition"
              title="YouTube Data API Credit Limit"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Quota:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {dailyRemaining.toLocaleString()}
              </span>
            </button>

            {/* Quota Tooltip Card */}
            {showQuotaTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#181818] border border-[#333] rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#282828]">
                  <span className="font-bold text-white">YouTube API Credits</span>
                  <span className="text-[10px] text-emerald-400 font-mono">10,000 / Day</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Today Used: {quota.dailyUsed} units</span>
                    <span>Remaining: {dailyRemaining}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-[#282828] flex justify-between">
                  <span>Monthly Used: {quota.monthlyUsed} units</span>
                  <span>Limit: 300,000</span>
                </div>
              </div>
            )}
          </div>

          {/* Admin User & Password Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] border border-[#303030] text-neutral-300 transition"
              title="Admin Account Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#181818] border border-[#333] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <div className="px-3 py-2 border-b border-[#2a2a2a] mb-1">
                  <span className="text-xs font-bold text-white block">Signed in as Admin</span>
                  <span className="text-[10px] text-neutral-400">Solo Administrator</span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    dispatch(setPasswordModalOpen(true));
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#252525] transition"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    dispatch(logoutUser());
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
