'use client';

import React, { useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  BookOpen,
  Film,
  Plus,
  Trash2,
  Sliders,
  History,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSavedVideos } from '@/store/slices/savedVideosSlice';
import { fetchFolders, setActiveFolder } from '@/store/slices/foldersSlice';
import { setQuery, searchYouTube, loadMoreYouTube, clearSearch } from '@/store/slices/searchSlice';
import {
  setManageFoldersOpen,
  setActiveView,
  setClearHistoryModalOpen,
} from '@/store/slices/uiSlice';
import VideoCard from './VideoCard';
import { clearAllHistory } from '@/store/slices/playerSlice';

export default function ZenHomeView() {
  const dispatch = useAppDispatch();
  const { items: savedVideos, loading: savedLoading } = useAppSelector(
    (state) => state.savedVideos
  );
  const { items: folders, activeFolderSlug } = useAppSelector((state) => state.folders);
  const {
    query,
    results: searchResults,
    loading: searchLoading,
    hasSearched,
    nextPageToken,
    filteredReelsCount,
    minDurationSec,
  } = useAppSelector((state) => state.search);
  const { history } = useAppSelector((state) => state.player);
  const { activeView } = useAppSelector((state) => state.ui);

  // Fetch folders and saved videos on initial load
  useEffect(() => {
    dispatch(fetchFolders());
    dispatch(fetchSavedVideos());
  }, [dispatch]);

  // Quick query handler
  const handleQuickSearch = (sampleQuery: string) => {
    dispatch(setQuery(sampleQuery));
    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: sampleQuery, minDurationSec }));
  };

  // Filter saved videos by active folder
  const currentSavedVideos =
    activeFolderSlug === 'all'
      ? savedVideos
      : savedVideos.filter((v) => v.folderIds.includes(activeFolderSlug));

  const activeFolder = folders.find((f) => f.slug === activeFolderSlug);
  const activeFolderName =
    activeFolderSlug === 'all' ? 'All Saved Videos' : activeFolder?.name || 'Library';

  // 1. WATCH HISTORY VIEW
  if (activeView === 'history') {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252525] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <History className="w-6 h-6 text-red-500" />
              Watch History
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Recently played videos on this device ({history.length} videos)
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => dispatch(clearAllHistory())}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Watch History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-neutral-500 border border-[#2b2b2b]">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">Watch history is empty</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              Videos you watch in Ad-Free mode will show up here for quick resumption.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((hist) => {
              // Convert history item into video card format
              const cardItem = {
                id: hist.videoId,
                title: hist.title,
                description: '',
                channelTitle: hist.channelTitle,
                channelId: '',
                thumbnailUrl: hist.thumbnailUrl,
                duration: hist.duration,
                durationSec: 0,
                viewCount: 'Watched',
                publishedAt: hist.watchedAt,
                isShortOrReel: false,
              };
              return <VideoCard key={hist.videoId} video={cardItem} />;
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. SEARCH RESULTS VIEW
  if (activeView === 'search' && hasSearched) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Search Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252525] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Results for &quot;<span className="text-red-400">{query}</span>&quot;
              </h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-800/40 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {filteredReelsCount} Reels &amp; Shorts Blocked
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              All results are guaranteed regular videos (over {minDurationSec}s). Zero reels, zero ads.
            </p>
          </div>

          <button
            onClick={() => {
              dispatch(clearSearch());
              dispatch(setActiveView('saved'));
            }}
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto bg-[#1e1e1e] px-3 py-1.5 rounded-xl border border-[#2e2e2e]"
          >
            ← Back to Saved Folders
          </button>
        </div>

        {/* Results Grid */}
        {searchLoading && searchResults.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-[#141414] rounded-2xl overflow-hidden border border-[#242424] animate-pulse"
              >
                <div className="aspect-video w-full bg-[#202020]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#252525] rounded w-3/4" />
                  <div className="h-3 bg-[#202020] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-neutral-500 border border-[#2b2b2b]">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">No regular videos found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              All matching videos might have been Shorts or Reels which were filtered out. Try a broader search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {searchResults.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Load More Button */}
            {nextPageToken && (
              <div className="flex justify-center pt-6 pb-10">
                <button
                  onClick={() =>
                    dispatch(
                      loadMoreYouTube({
                        query,
                        pageToken: nextPageToken,
                        minDurationSec,
                      })
                    )
                  }
                  disabled={searchLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#333333] border border-[#333333] text-sm font-semibold text-neutral-200 hover:text-white transition shadow-lg disabled:opacity-50"
                >
                  {searchLoading ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Load More Regular Videos</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // 3. ZERO-DISTRACTION ZEN HOME VIEW (DEFAULT WHEN OPENED)
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Category Folders Chips / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252525] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              {activeFolderName}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold border border-neutral-700">
              {currentSavedVideos.length} saved
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Zero recommendations feed. Only your hand-picked, distraction-free library.
          </p>
        </div>

        {/* Quick Folder Switcher Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => dispatch(setActiveFolder('all'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFolderSlug === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#1e1e1e] text-neutral-400 hover:text-white border border-[#2d2d2d]'
            }`}
          >
            All Saved
          </button>
          {folders.map((f) => (
            <button
              key={f.slug}
              onClick={() => dispatch(setActiveFolder(f.slug))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeFolderSlug === f.slug
                  ? 'bg-neutral-800 text-white border border-neutral-600 shadow-sm'
                  : 'bg-[#1e1e1e] text-neutral-400 hover:text-white border border-[#2d2d2d]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              <span>{f.name}</span>
            </button>
          ))}
          <button
            onClick={() => dispatch(setManageFoldersOpen(true))}
            className="p-1.5 rounded-xl bg-[#1e1e1e] text-neutral-400 hover:text-white border border-[#2d2d2d] transition"
            title="Create folder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Videos Grid or Zen Empty State */}
      {currentSavedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {currentSavedVideos.map((video) => (
            <VideoCard key={video.videoId} video={video} isSavedCard={true} />
          ))}
        </div>
      ) : (
        /* The Zen Distraction-Free Greeting when opening platform with empty folder */
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-neutral-900 to-neutral-800 border border-[#333333] flex items-center justify-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Distraction-Free Zen YouTube
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              No algorithmic feeds, no clickbait rabbit holes, and{' '}
              <span className="text-red-400 font-semibold">100% Zero Reels &amp; Ads</span>.
              Use the search bar above to curate your personal study or relaxation library.
            </p>
          </div>

          {/* Quick Suggested Searches */}
          <div className="w-full bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Try a Focused YouTube Search:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                'Meditation 432Hz deep calm',
                'Learn Next.js 15 complete course',
                'TypeScript for beginners',
                'Deep work binaural focus music',
                'System design interview',
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#333333] text-xs font-medium transition active:scale-95"
                >
                  🔍 {term}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
            <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#282828] space-y-1">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                🛡️ Zero Ads
              </span>
              <p className="text-[11px] text-neutral-400">
                Piped &amp; Invidious streams bypass pre-rolls, mid-rolls, and tracking ads.
              </p>
            </div>
            <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#282828] space-y-1">
              <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                🚫 Zero Reels
              </span>
              <p className="text-[11px] text-neutral-400">
                Shorts and vertical videos under 70s are strictly eliminated.
              </p>
            </div>
            <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#282828] space-y-1">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                📁 Profile Folders
              </span>
              <p className="text-[11px] text-neutral-400">
                Organize videos into Education, Meditation, Tech, or custom folders with notes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
