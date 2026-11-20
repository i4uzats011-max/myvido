'use client';

import React from 'react';
import {
  Play,
  Pause,
  Maximize2,
  X,
  Headphones,
  ShieldCheck,
  ChevronUp,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleMiniPlayer,
  closePlayer,
  setIsPlaying,
  toggleBackgroundAudioMode,
} from '@/store/slices/playerSlice';

export default function MiniFloatingPlayer() {
  const dispatch = useAppDispatch();
  const { currentVideo, isOpen, isMiniPlayer, isPlaying, isBackgroundAudioMode } = useAppSelector(
    (state) => state.player
  );

  if (!isOpen || !currentVideo || !isMiniPlayer) return null;

  const videoId = 'id' in currentVideo ? currentVideo.id : currentVideo.videoId;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-40 max-w-[360px] w-[calc(100%-24px)] sm:w-80 bg-[#161616]/95 backdrop-blur-xl border border-[#2e2e2e] rounded-2xl shadow-2xl p-2.5 animate-fade-in transition-all">
      <div className="flex items-center gap-3">
        {/* Click thumbnail to expand */}
        <div
          onClick={() => dispatch(toggleMiniPlayer())}
          className="relative w-16 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 cursor-pointer group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentVideo.thumbnailUrl}
            alt={currentVideo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Video details */}
        <div
          onClick={() => dispatch(toggleMiniPlayer())}
          className="flex-1 overflow-hidden cursor-pointer"
        >
          <h4 className="text-xs font-semibold text-white truncate leading-tight">
            {currentVideo.title}
          </h4>
          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
            {currentVideo.channelTitle}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            {isBackgroundAudioMode ? (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                <Headphones className="w-2.5 h-2.5 animate-pulse" />
                Screen-Off Ready
              </span>
            ) : (
              <span className="text-[9px] text-neutral-400">Background Mini Player</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => dispatch(toggleBackgroundAudioMode())}
            title={isBackgroundAudioMode ? 'Screen-Off Audio Mode Active' : 'Enable Screen-Off Audio Mode'}
            className={`p-1.5 rounded-lg transition ${
              isBackgroundAudioMode
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-neutral-400 hover:text-white bg-[#222222]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => dispatch(toggleMiniPlayer())}
            title="Expand player"
            className="p-1.5 text-neutral-300 hover:text-white bg-[#222222] hover:bg-[#2c2c2c] rounded-lg transition"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => dispatch(closePlayer())}
            title="Close video"
            className="p-1.5 text-neutral-400 hover:text-red-400 bg-[#222222] hover:bg-red-950/40 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
