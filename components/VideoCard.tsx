'use client';

import React from 'react';
import Image from 'next/image';
import {
  Play,
  BookmarkPlus,
  BookmarkCheck,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { YouTubeVideoItem, formatRelativeDate } from '@/lib/youtube';
import { SavedVideoItem, removeSavedVideo } from '@/store/slices/savedVideosSlice';
import { playVideo } from '@/store/slices/playerSlice';
import { openSaveModal, showToast } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface VideoCardProps {
  video: YouTubeVideoItem | SavedVideoItem;
  isSavedCard?: boolean;
}

export default function VideoCard({ video, isSavedCard = false }: VideoCardProps) {
  const dispatch = useAppDispatch();
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);
  const { items: folders } = useAppSelector((state) => state.folders);

  const videoId = 'id' in video ? video.id : video.videoId;
  const isSaved = savedVideos.some((v) => v.videoId === videoId);
  const savedItem = savedVideos.find((v) => v.videoId === videoId);

  const handlePlay = () => {
    dispatch(playVideo(video));
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert to YouTubeVideoItem format for save modal if needed
    const itemToSave: YouTubeVideoItem = {
      id: videoId,
      title: video.title,
      description: video.description || '',
      channelTitle: video.channelTitle,
      channelId: video.channelId || '',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      durationSec: video.durationSec,
      viewCount: video.viewCount,
      publishedAt: video.publishedAt,
      isShortOrReel: false,
    };
    dispatch(openSaveModal(itemToSave));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeSavedVideo(videoId));
    dispatch(showToast({ message: 'Removed from saved videos', type: 'info' }));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      dispatch(showToast({ message: 'YouTube link copied to clipboard!', type: 'success' }));
    }
  };

  // Get names of folders where this video is saved
  const folderNames = (savedItem?.folderIds || [])
    .map((slug) => folders.find((f) => f.slug === slug)?.name)
    .filter(Boolean);

  return (
    <div
      onClick={handlePlay}
      className="group flex flex-col bg-[#141414] hover:bg-[#1c1c1c] rounded-2xl overflow-hidden border border-[#242424] hover:border-[#383838] transition duration-200 cursor-pointer shadow-md hover:shadow-xl active:scale-[0.99]"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full bg-[#1e1e1e] overflow-hidden">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#222222] text-neutral-500">
            <Play className="w-10 h-10" />
          </div>
        )}

        {/* Hover Dark Overlay with Play Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge (Bottom Right) */}
        <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wider">
          {video.duration || '0:00'}
        </div>

        {/* Quick Action Overlay (Top Right) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
          <button
            onClick={handleSaveClick}
            title={isSaved ? 'Manage folders' : 'Save to folder'}
            className={`p-2 rounded-xl backdrop-blur-md transition shadow-md ${
              isSaved
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-black/70 text-white hover:bg-black/90'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>

          {isSavedCard && (
            <button
              onClick={handleRemove}
              title="Delete from saved videos"
              className="p-2 rounded-xl bg-black/70 hover:bg-red-900/80 text-neutral-300 hover:text-white backdrop-blur-md transition shadow-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Title (2-line clamp) */}
          <h3
            className="text-sm font-semibold text-neutral-100 line-clamp-2 leading-snug group-hover:text-white transition"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Channel Name */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
            <span className="truncate hover:text-neutral-200">{video.channelTitle}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
          </div>

          {/* Views & Date */}
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span>{video.viewCount}</span>
            <span>•</span>
            <span>{formatRelativeDate(video.publishedAt)}</span>
          </div>
        </div>

        {/* Folder Tags if saved */}
        {folderNames.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#222222] flex flex-wrap gap-1.5">
            {folderNames.map((fname, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/50"
              >
                📁 {fname}
              </span>
            ))}
          </div>
        )}

        {/* User Notes snippet if saved */}
        {'notes' in video && video.notes && (
          <div className="mt-2 text-[11px] text-amber-300/80 bg-amber-950/20 border border-amber-800/30 rounded-lg p-1.5 line-clamp-1 italic">
            📝 &quot;{video.notes}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
