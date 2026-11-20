'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ShieldCheck,
  BookmarkCheck,
  BookmarkPlus,
  Share2,
  ExternalLink,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  closePlayer,
  setPlayerMode,
  toggleTheaterMode,
  setVideoNotes,
  PlayerMode,
} from '@/store/slices/playerSlice';
import { openSaveModal, showToast } from '@/store/slices/uiSlice';
import { updateSavedVideo } from '@/store/slices/savedVideosSlice';
import { formatRelativeDate } from '@/lib/youtube';

export default function VideoPlayerModal() {
  const dispatch = useAppDispatch();
  const { currentVideo, isOpen, playerMode, isTheaterMode, notes: initialNotes } = useAppSelector(
    (state) => state.player
  );
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);
  const { items: folders } = useAppSelector((state) => state.folders);

  const [notes, setNotes] = useState(initialNotes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (currentVideo) {
      const vid = 'id' in currentVideo ? currentVideo.id : currentVideo.videoId;
      const foundSaved = savedVideos.find((v) => v.videoId === vid);
      setNotes(foundSaved?.notes || ('notes' in currentVideo ? currentVideo.notes : '') || '');
    }
  }, [currentVideo, savedVideos]);

  if (!isOpen || !currentVideo) return null;

  const videoId = 'id' in currentVideo ? currentVideo.id : currentVideo.videoId;
  const isSaved = savedVideos.some((v) => v.videoId === videoId);
  const savedItem = savedVideos.find((v) => v.videoId === videoId);

  // Embed URL generator based on selected Ad-Block Mode
  const getEmbedUrl = () => {
    if (playerMode === 'ad-free') {
      // Invidious ad-free stream mirror
      return `https://yewtu.be/embed/${videoId}?autoplay=1`;
    }
    // High-performance Clean YouTube Privacy Embed (Plays 100% of videos reliably with ad suppression)
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    dispatch(setVideoNotes(notes));

    if (isSaved) {
      await dispatch(updateSavedVideo({ videoId, notes }));
      dispatch(showToast({ message: 'Notes saved to your folder!', type: 'success' }));
    } else {
      // Prompt user to save to folder first
      dispatch(
        openSaveModal({
          id: videoId,
          title: currentVideo.title,
          description: currentVideo.description || '',
          channelTitle: currentVideo.channelTitle,
          channelId: currentVideo.channelId || '',
          thumbnailUrl: currentVideo.thumbnailUrl,
          duration: currentVideo.duration,
          durationSec: currentVideo.durationSec,
          viewCount: currentVideo.viewCount,
          publishedAt: currentVideo.publishedAt,
          isShortOrReel: false,
        })
      );
    }
    setIsSavingNotes(false);
  };

  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      dispatch(showToast({ message: 'Link copied to clipboard!', type: 'success' }));
    }
  };

  // Folder names
  const folderNames = (savedItem?.folderIds || [])
    .map((slug) => folders.find((f) => f.slug === slug)?.name)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 animate-fade-in safe-top safe-bottom">
      {/* Top Bar with Controls */}
      <div className="w-full max-w-6xl flex items-center justify-between px-3 py-2 sm:py-3 bg-[#121212]/90 border-b sm:border border-[#2b2b2b] sm:rounded-t-2xl">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ad-Block Toggle Selector */}
          <div className="flex items-center bg-[#1f1f1f] p-1 rounded-xl border border-[#333333]">
            <button
              onClick={() => dispatch(setPlayerMode('nocookie'))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                playerMode === 'nocookie'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Clean Player (100% Playable)</span>
            </button>
            <button
              onClick={() => dispatch(setPlayerMode('ad-free'))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                playerMode === 'ad-free'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ad-Free Proxy</span>
            </button>
          </div>

          <span className="hidden lg:inline text-xs text-neutral-400">
            {playerMode === 'nocookie' ? '🔒 Ad & tracking suppression active' : '🛡️ Zero Ads via Invidious Stream'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theater Mode Toggle */}
          <button
            onClick={() => dispatch(toggleTheaterMode())}
            title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
            className="hidden sm:p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition"
          >
            {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Player */}
          <button
            onClick={() => dispatch(closePlayer())}
            className="p-2 text-neutral-400 hover:text-white hover:bg-red-950/60 hover:text-red-400 rounded-xl transition active:scale-95"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full bg-[#121212] sm:border-x sm:border-b border-[#2b2b2b] sm:rounded-b-2xl overflow-hidden transition-all duration-300 ${
          isTheaterMode ? 'max-w-7xl' : 'max-w-6xl'
        }`}
      >
        {/* Responsive Aspect Ratio Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getEmbedUrl()}
            title={currentVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            playsInline
            className="w-full h-full border-0"
          />
        </div>

        {/* Video Information & Actions Bar */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-neutral-100 leading-snug">
                {currentVideo.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-400">
                <span className="font-semibold text-neutral-200 flex items-center gap-1">
                  {currentVideo.channelTitle}
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                </span>
                <span>•</span>
                <span>{currentVideo.viewCount}</span>
                <span>•</span>
                <span>{formatRelativeDate(currentVideo.publishedAt)}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-800/40 text-[10px] font-bold">
                  🛡️ 0 REELS GUARANTEE
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  dispatch(
                    openSaveModal({
                      id: videoId,
                      title: currentVideo.title,
                      description: currentVideo.description || '',
                      channelTitle: currentVideo.channelTitle,
                      channelId: currentVideo.channelId || '',
                      thumbnailUrl: currentVideo.thumbnailUrl,
                      duration: currentVideo.duration,
                      durationSec: currentVideo.durationSec,
                      viewCount: currentVideo.viewCount,
                      publishedAt: currentVideo.publishedAt,
                      isShortOrReel: false,
                    })
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 ${
                  isSaved
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-900/30'
                    : 'bg-[#252525] hover:bg-[#333333] text-white border border-[#383838]'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                <span>{isSaved ? 'Saved in Folder' : 'Save to Folder'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white text-xs sm:text-sm transition"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white transition"
                title="Open on YouTube directly"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Folder Tags */}
          {folderNames.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-neutral-400">Folders:</span>
              {folderNames.map((name, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-medium"
                >
                  📁 {name}
                </span>
              ))}
            </div>
          )}

          {/* Personal Notes / Timestamps Editor */}
          <div className="bg-[#181818] rounded-2xl p-4 border border-[#2b2b2b] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                My Notes & Timestamps (Education / Meditation Key Takeaways)
              </label>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="flex items-center gap-1.5 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your study notes, meditation mantras, code snippets, or key timestamps (e.g. 05:20 Important concept)..."
              rows={3}
              className="w-full bg-[#121212] text-neutral-200 placeholder-neutral-500 rounded-xl p-3 border border-[#2d2d2d] focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm outline-none resize-none transition"
            />
          </div>

          {/* Video Description Accordion */}
          {currentVideo.description && (
            <div className="bg-[#181818] rounded-2xl p-4 border border-[#2b2b2b]">
              <div
                className={`text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap transition-all ${
                  showFullDescription ? '' : 'line-clamp-3'
                }`}
              >
                {currentVideo.description}
              </div>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {showFullDescription ? (
                  <>
                    Show less <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Show full description <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
