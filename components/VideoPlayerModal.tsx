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
  AlertTriangle,
  RotateCcw,
  Search,
  HelpCircle,
  PlayCircle,
  Radio,
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
import { openSaveModal, showToast, setActiveView } from '@/store/slices/uiSlice';
import { updateSavedVideo, saveVideo } from '@/store/slices/savedVideosSlice';
import { setQuery, searchYouTube } from '@/store/slices/searchSlice';
import { formatRelativeDate } from '@/lib/youtube';

type ProxyEngine = 'standard' | 'yewtu' | 'piped' | 'nerdvpn';

interface PlaybackErrorState {
  code: number;
  title: string;
  message: string;
}

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
  const [activeProxyEngine, setActiveProxyEngine] = useState<ProxyEngine>('standard');
  const [playbackError, setPlaybackError] = useState<PlaybackErrorState | null>(null);
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);

  const videoId = currentVideo ? ('id' in currentVideo ? currentVideo.id : currentVideo.videoId) : '';

  useEffect(() => {
    if (currentVideo) {
      const vid = 'id' in currentVideo ? currentVideo.id : currentVideo.videoId;
      const foundSaved = savedVideos.find((v) => v.videoId === vid);
      setNotes(foundSaved?.notes || ('notes' in currentVideo ? currentVideo.notes : '') || '');
      // Reset error and proxy engine on new video
      setPlaybackError(null);
      setActiveProxyEngine('standard');
      setShowTroubleshootModal(false);
    }
  }, [currentVideo, savedVideos]);

  // Listen to YouTube postMessage events to automatically detect embed restrictions (Error 101/150/100)
  useEffect(() => {
    if (!videoId) return;

    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {}
        }

        if (data && typeof data === 'object') {
          // Check for YouTube Iframe API error events
          const eventType = data.event;
          const info = data.info;
          const errorCode = typeof info === 'number' ? info : info?.error;

          if (eventType === 'onError' || errorCode === 101 || errorCode === 150 || errorCode === 100 || errorCode === 2 || errorCode === 5) {
            const code = typeof errorCode === 'number' ? errorCode : 101;
            setPlaybackError({
              code,
              title:
                code === 101 || code === 150
                  ? 'प्रतिबंधित वीडियो (Embed Restricted by Creator)'
                  : code === 100
                  ? 'वीडियो अनुपलब्ध (Video Unavailable or Removed)'
                  : 'प्लेबैक समस्या (Playback Issue)',
              message:
                code === 101 || code === 150
                  ? 'YouTube क्रिएटर / म्यूज़िक लेबल ने इस वीडियो को अन्य वेबसाइट्स पर चलने से लॉक किया हुआ है (Error 101/150: Playback disabled by video owner).'
                  : 'यह वीडियो या तो निजी (Private) है, हटा दिया गया है या इस डिवाइस पर सीधे स्ट्रीम नहीं हो पा रहा है।',
            });
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [videoId]);

  // When player is not open or no video, unmount entirely
  if (!isOpen || !currentVideo) return null;

  const isSaved = savedVideos.some((v) => v.videoId === videoId);
  const savedItem = savedVideos.find((v) => v.videoId === videoId);

  // Embed URL generator based on selected Proxy Engine and Ad-Block Mode
  const getEmbedUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (activeProxyEngine === 'yewtu') {
      return `https://yewtu.be/embed/${videoId}?autoplay=1`;
    }
    if (activeProxyEngine === 'piped') {
      return `https://piped.video/embed/${videoId}?autoplay=1`;
    }
    if (activeProxyEngine === 'nerdvpn') {
      return `https://invidious.nerdvpn.de/embed/${videoId}?autoplay=1`;
    }

    if (playerMode === 'ad-free') {
      return `https://yewtu.be/embed/${videoId}?autoplay=1`;
    }
    if (playerMode === 'yout-ube') {
      return `https://www.youtube-nocookie.com/embed/${videoId}?playlist=${videoId}&autoplay=1&iv_load_policy=3&loop=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${origin}`;
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

  // Switch to Alternative Proxy Engine
  const handleSwitchProxy = (engine: ProxyEngine) => {
    setActiveProxyEngine(engine);
    setPlaybackError(null);
    setShowTroubleshootModal(false);
    dispatch(showToast({ message: `Switched playback mirror to ${engine.toUpperCase()} 🚀`, type: 'info' }));
  };

  // Open Directly in YouTube
  const handleOpenInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  // Search clean alternatives without reels
  const handleFindAlternatives = () => {
    if (!currentVideo) return;
    const cleanTitle = currentVideo.title
      .replace(/[\(\)\[\]\{\}]/g, ' ')
      .replace(/\b(official video|hd|4k|audio|lyric video|music video|full song|teaser|trailer)\b/gi, '')
      .trim();

    dispatch(closePlayer());
    dispatch(setQuery(cleanTitle));
    dispatch(setActiveView('search'));
    dispatch(searchYouTube({ query: cleanTitle }));
    dispatch(showToast({ message: 'Searching clean, reels-free alternatives...', type: 'info' }));
  };

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
                  onClick={() => {
                    setActiveProxyEngine('standard');
                    dispatch(setPlayerMode('nocookie'));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeProxyEngine === 'standard' && playerMode === 'nocookie'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Clean Player</span>
                </button>
                <button
                  onClick={() => {
                    setActiveProxyEngine('standard');
                    dispatch(setPlayerMode('yout-ube'));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeProxyEngine === 'standard' && playerMode === 'yout-ube'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Loop Mode</span>
                </button>
                <button
                  onClick={() => handleSwitchProxy('yewtu')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeProxyEngine === 'yewtu'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Invidious Proxy (Bypasses external embed restrictions)"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Proxy Mirror</span>
                </button>
              </div>

              {/* Troubleshooting / Video not playing help button */}
              <button
                onClick={() => setShowTroubleshootModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                  playbackError
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 animate-pulse'
                    : 'bg-[#1b1b1b] border-[#333] text-neutral-300 hover:text-white hover:border-neutral-500'
                }`}
                title="वीडियो चलने में दिक्कत आ रही है? क्लिक करें"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>समस्या आ रही है? (Fix Issue)</span>
              </button>

              {/* Background Audio Mode */}
              <button
                onClick={() => {
                  dispatch(toggleBackgroundAudioMode());
                  dispatch(
                    showToast({
                      message: !isBackgroundAudioMode
                        ? 'Screen-Off Audio Active! Continuous background audio.'
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
          className={`w-full relative ${
            isMiniPlayer
              ? 'h-full aspect-video'
              : `bg-[#121212] sm:border-x sm:border-b border-[#2b2b2b] sm:rounded-b-2xl overflow-hidden transition-all duration-300 ${
                  isTheaterMode ? 'max-w-7xl' : 'max-w-6xl'
                }`
          }`}
        >
          <div className="relative aspect-video w-full bg-black">
            <iframe
              key={`${videoId}-${activeProxyEngine}`}
              src={getEmbedUrl()}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              playsInline
              className="w-full h-full border-0"
            />

            {/* Smart Interactive Overlay for Restricted / Unplayable Videos */}
            {playbackError && !isMiniPlayer && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                  <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-lg">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
                    <span>{playbackError.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {playbackError.message}
                  </p>
                  <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                    (निदान: YouTube Studio में वीडियो मालिक द्वारा &quot;Allow embedding&quot; बंद किया गया है)
                  </p>
                </div>

                {/* Instant 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 max-w-md">
                  <button
                    onClick={() => handleSwitchProxy('yewtu')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
                  >
                    <Radio className="w-4 h-4" />
                    <span>प्रॉक्सी मिरर 1 से चलाएँ</span>
                  </button>

                  <button
                    onClick={() => handleSwitchProxy('piped')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Piped स्ट्रीम से चलाएँ</span>
                  </button>

                  <button
                    onClick={handleOpenInYouTube}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>सीधे YouTube पर खोलें</span>
                  </button>

                  <button
                    onClick={handleFindAlternatives}
                    className="flex items-center gap-2 px-4 py-2 bg-[#252525] hover:bg-[#333] border border-[#3d3d3d] text-neutral-200 text-xs font-semibold rounded-xl transition"
                  >
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>समान बिना रील्स वीडियो खोजें</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlaybackError(null);
                      setActiveProxyEngine('standard');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-neutral-400 hover:text-white text-xs font-medium transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>पुनः लोड करें</span>
                  </button>
                </div>
              </div>
            )}
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
                    {activeProxyEngine !== 'standard' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold">
                        ⚡ {activeProxyEngine.toUpperCase()} MIRROR
                      </span>
                    )}
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

                  <button
                    onClick={handleOpenInYouTube}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white text-xs sm:text-sm transition"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">YouTube</span>
                  </button>
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

      {/* Troubleshooting & Engine Switcher Modal */}
      {showTroubleshootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>वीडियो प्लेबैक सहायता (Video Playback Solutions)</span>
              </h3>
              <button
                onClick={() => setShowTroubleshootModal(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              यदि वीडियो में <strong className="text-amber-400">&quot;Playback on other websites has been disabled by video owner&quot;</strong> या वीडियो अनुपलब्ध दिख रहा है, तो इन विकल्पों से चलाएं:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSwitchProxy('yewtu')}
                className="w-full flex items-center justify-between p-3 bg-[#131313] hover:bg-[#202020] border border-[#2f2f2f] rounded-xl text-left transition group"
              >
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Invidious Mirror (Yewtu.be)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    थर्ड-पार्टी एम्बेड प्रतिबंधों को बायपास करके सीधा स्ट्रीम करता है।
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 -rotate-90" />
              </button>

              <button
                onClick={() => handleSwitchProxy('piped')}
                className="w-full flex items-center justify-between p-3 bg-[#131313] hover:bg-[#202020] border border-[#2f2f2f] rounded-xl text-left transition group"
              >
                <div>
                  <h4 className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Piped Proxy Stream</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    ओपन-सोर्स प्राइवेसी इंजन जो विज्ञापनों और प्रतिबंधों को रोकता है।
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 -rotate-90" />
              </button>

              <button
                onClick={handleOpenInYouTube}
                className="w-full flex items-center justify-between p-3 bg-[#131313] hover:bg-[#202020] border border-[#2f2f2f] rounded-xl text-left transition group"
              >
                <div>
                  <h4 className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>सीधे YouTube वेबसाइट / ऐप में खोलें</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    यदि वीडियो आयु-प्रतिबंधित (Age-restricted) है या केवल YouTube पर ही उपलब्ध है।
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 -rotate-90" />
              </button>

              <button
                onClick={handleFindAlternatives}
                className="w-full flex items-center justify-between p-3 bg-[#131313] hover:bg-[#202020] border border-[#2f2f2f] rounded-xl text-left transition group"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>समान बिना रील्स वाला वीडियो खोजें</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    इसी टॉपिक का अन्य चैनल का फ्री व अनरेस्ट्रिक्टेड वीडियो खोजें।
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 -rotate-90" />
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowTroubleshootModal(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
