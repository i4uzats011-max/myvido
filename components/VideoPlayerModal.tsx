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
  Headphones,
  Sun,
  Minimize,
  Zap,
  Heart,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  closePlayer,
  setPlayerMode,
  toggleTheaterMode,
  setVideoNotes,
  toggleMiniPlayer,
  toggleBackgroundAudioMode,
  toggleWakeLock,
  PlayerMode,
} from '@/store/slices/playerSlice';
import { openSaveModal, showToast } from '@/store/slices/uiSlice';
import { updateSavedVideo, saveVideo } from '@/store/slices/savedVideosSlice';
import { formatRelativeDate } from '@/lib/youtube';

export default function VideoPlayerModal() {
  const dispatch = useAppDispatch();
  const {
    currentVideo,
    isOpen,
    isMiniPlayer,
    isBackgroundAudioMode,
    isWakeLockActive,
    playerMode,
    isTheaterMode,
    notes: initialNotes,
  } = useAppSelector((state) => state.player);
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

  // When player is not open or no video, unmount entirely
  if (!isOpen || !currentVideo) return null;

  const videoId = 'id' in currentVideo ? currentVideo.id : currentVideo.videoId;
  const isSaved = savedVideos.some((v) => v.videoId === videoId);
  const savedItem = savedVideos.find((v) => v.videoId === videoId);

  // Embed URL generator based on selected Ad-Block Mode
  const getEmbedUrl = () => {
    if (playerMode === 'ad-free') {
      return `https://yewtu.be/embed/${videoId}?autoplay=1`;
    }
    if (playerMode === 'yout-ube') {
      return `https://www.youtube-nocookie.com/embed/${videoId}?playlist=${videoId}&autoplay=1&iv_load_policy=3&loop=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    dispatch(setVideoNotes(notes));

    if (isSaved) {
      await dispatch(updateSavedVideo({ videoId, notes }));
      dispatch(showToast({ message: 'Notes saved to your folder!', type: 'success' }));
    } else {
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

  const isFavorite = savedItem?.isFavorite ?? false;

  const handleToggleFavorite = async () => {
    if (!currentVideo) return;
    const videoToSave = {
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
    };

    if (isSaved) {
      await dispatch(updateSavedVideo({ videoId, isFavorite: !isFavorite }));
      dispatch(
        showToast({
          message: !isFavorite ? 'Saved to Liked Videos ❤️' : 'Removed from Liked Videos',
          type: 'success',
        })
      );
    } else {
      await dispatch(
        saveVideo({
          video: videoToSave,
          folderIds: ['education'],
          notes: '',
        })
      );
      dispatch(showToast({ message: 'Liked and saved to your library! ❤️', type: 'success' }));
    }
  };

  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      dispatch(showToast({ message: 'Link copied to clipboard!', type: 'success' }));
    }
  };

  const folderNames = (savedItem?.folderIds || [])
    .map((slug) => folders.find((f) => f.slug === slug)?.name)
    .filter(Boolean);

  return (
    <>
      {/* 
        CRITICAL FOR BACKGROUND PLAYBACK:
        Single persistent iframe container that NEVER unmounts when minimizing.
        If isMiniPlayer is active, transitions smoothly to a compact picture-in-picture floating box.
      */}
      <div
        className={`transition-all duration-300 z-50 ${
          isMiniPlayer
            ? 'fixed bottom-20 md:bottom-6 right-3 sm:right-6 w-72 sm:w-80 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-red-600/80 bg-black'
            : 'fixed inset-0 overflow-y-auto bg-black/90 backdrop-blur-md flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 safe-top safe-bottom'
        }`}
      >
        {/* Floating Mini Controls Header when in Mini Player mode */}
        {isMiniPlayer && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-neutral-700">
            <button
              onClick={() => dispatch(toggleMiniPlayer())}
              className="p-1 text-white hover:text-amber-400 transition"
              title="Expand Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(closePlayer())}
              className="p-1 text-neutral-400 hover:text-red-400 transition"
              title="Close Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Controls Header (When NOT Minimized) */}
        {!isMiniPlayer && (
          <div className="w-full max-w-6xl flex items-center justify-between px-3 py-2 sm:py-3 bg-[#121212]/95 border-b sm:border border-[#2b2b2b] sm:rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                  <span>Clean Player</span>
                </button>
                <button
                  onClick={() => dispatch(setPlayerMode('yout-ube'))}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    playerMode === 'yout-ube'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>yout-ube Mode</span>
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

              {/* Background Audio Mode */}
              <button
                onClick={() => {
                  dispatch(toggleBackgroundAudioMode());
                  dispatch(
                    showToast({
                      message: !isBackgroundAudioMode
                        ? 'Screen-Off Audio Active! Continuous audio enabled.'
                        : 'Screen-Off Audio disabled.',
                      type: 'info',
                    })
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                  isBackgroundAudioMode
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-[#1e1e1e] border-[#333333] text-neutral-400 hover:text-white'
                }`}
              >
                <Headphones className={`w-3.5 h-3.5 ${isBackgroundAudioMode ? 'animate-pulse text-amber-400' : ''}`} />
                <span>{isBackgroundAudioMode ? 'Screen-Off: ON 🎧' : 'Screen-Off Mode'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => dispatch(toggleWakeLock())}
                className={`p-2 rounded-xl transition ${
                  isWakeLockActive ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
                title="Keep Screen Awake"
              >
                <Sun className="w-4 h-4" />
              </button>

              <button
                onClick={() => dispatch(toggleMiniPlayer())}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-[#252525] rounded-xl transition text-xs font-medium"
              >
                <Minimize className="w-4 h-4" />
                <span className="hidden sm:inline">Background</span>
              </button>

              <button
                onClick={() => dispatch(closePlayer())}
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/60 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 
          THE SINGLE PERSISTENT IFRAME:
          Never unmounts or reloads across mini/maximized transitions
        */}
        <div
          className={`w-full ${
            isMiniPlayer
              ? 'h-full aspect-video'
              : `bg-[#121212] sm:border-x sm:border-b border-[#2b2b2b] sm:rounded-b-2xl overflow-hidden transition-all duration-300 ${
                  isTheaterMode ? 'max-w-7xl' : 'max-w-6xl'
                }`
          }`}
        >
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

          {/* Video Information & Notes (Only visible when full modal) */}
          {!isMiniPlayer && (
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
                      🛡️ ZERO REELS GUARANTEE
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 ${
                      isFavorite
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-[#252525] hover:bg-[#333333] text-neutral-300 hover:text-white border border-[#383838]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-rose-400'}`} />
                    <span>{isFavorite ? 'Liked' : 'Like'}</span>
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
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Personal Notes */}
              <div className="bg-[#181818] rounded-2xl p-4 border border-[#2b2b2b] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Video Study Notes &amp; Timestamps
                  </label>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="flex items-center gap-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key takeaways, formulas, meditation timestamps..."
                  rows={2}
                  className="w-full bg-[#121212] text-neutral-200 placeholder-neutral-500 rounded-xl p-3 border border-[#2d2d2d] focus:border-red-500 text-sm outline-none resize-none transition"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
