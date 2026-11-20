'use client';

import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  Code,
  Headphones,
  Heart,
  Folder,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSaveModal, showToast } from '@/store/slices/uiSlice';
import { saveVideo } from '@/store/slices/savedVideosSlice';
import { createFolder } from '@/store/slices/foldersSlice';
import { YouTubeVideoItem } from '@/lib/youtube';

export default function SaveToFolderModal() {
  const dispatch = useAppDispatch();
  const { isSaveModalOpen, saveModalVideo } = useAppSelector((state) => state.ui);
  const { items: folders } = useAppSelector((state) => state.folders);
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);

  const [selectedFolderSlugs, setSelectedFolderSlugs] = useState<string[]>(['education']);
  const [notes, setNotes] = useState('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected folders if already saved
  React.useEffect(() => {
    if (saveModalVideo) {
      const vid = 'id' in saveModalVideo ? saveModalVideo.id : saveModalVideo.videoId;
      const existing = savedVideos.find((v) => v.videoId === vid);
      if (existing) {
        setSelectedFolderSlugs(existing.folderIds || ['education']);
        setNotes(existing.notes || '');
      } else {
        setSelectedFolderSlugs(['education']);
        setNotes('');
      }
    }
  }, [saveModalVideo, savedVideos]);

  if (!isSaveModalOpen || !saveModalVideo) return null;

  const toggleFolder = (slug: string) => {
    if (selectedFolderSlugs.includes(slug)) {
      if (selectedFolderSlugs.length > 1) {
        setSelectedFolderSlugs(selectedFolderSlugs.filter((s) => s !== slug));
      }
    } else {
      setSelectedFolderSlugs([...selectedFolderSlugs, slug]);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await dispatch(
        createFolder({
          name: newFolderName.trim(),
          color: newFolderColor,
          icon: 'folder',
        })
      ).unwrap();

      setSelectedFolderSlugs((prev) => [...prev, res.slug]);
      setNewFolderName('');
      setIsCreatingNewFolder(false);
      dispatch(showToast({ message: `Folder "${res.name}" created!`, type: 'success' }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating folder';
      dispatch(showToast({ message: msg, type: 'error' }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const videoToSave: YouTubeVideoItem = {
        id: 'id' in saveModalVideo ? saveModalVideo.id : saveModalVideo.videoId,
        title: saveModalVideo.title,
        description: saveModalVideo.description || '',
        channelTitle: saveModalVideo.channelTitle,
        channelId: saveModalVideo.channelId || '',
        thumbnailUrl: saveModalVideo.thumbnailUrl,
        duration: saveModalVideo.duration,
        durationSec: saveModalVideo.durationSec,
        viewCount: saveModalVideo.viewCount,
        publishedAt: saveModalVideo.publishedAt,
        isShortOrReel: false,
      };

      await dispatch(
        saveVideo({
          video: videoToSave,
          folderIds: selectedFolderSlugs,
          notes,
        })
      ).unwrap();

      dispatch(showToast({ message: 'Video saved into your profile folders!', type: 'success' }));
      dispatch(closeSaveModal());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-white text-base">Save to Profile / Folders</h2>
          </div>
          <button
            onClick={() => dispatch(closeSaveModal())}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="p-4 bg-[#141414] border-b border-[#242424] flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={saveModalVideo.thumbnailUrl}
            alt={saveModalVideo.title}
            className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{saveModalVideo.title}</h4>
            <p className="text-[11px] text-neutral-400 truncate">{saveModalVideo.channelTitle}</p>
          </div>
        </div>

        {/* Folder Selection List */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Select Profile / Category Folder(s):
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {folders.map((folder) => {
                const isSelected = selectedFolderSlugs.includes(folder.slug);
                return (
                  <button
                    key={folder.slug}
                    type="button"
                    onClick={() => toggleFolder(folder.slug)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-neutral-800 text-white border border-neutral-600'
                        : 'bg-[#202020] text-neutral-400 hover:bg-[#252525] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span>{folder.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create New Folder Inline */}
          {!isCreatingNewFolder ? (
            <button
              type="button"
              onClick={() => setIsCreatingNewFolder(true)}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Folder (e.g. Meditation, Tech, Gym)</span>
            </button>
          ) : (
            <form onSubmit={handleCreateFolder} className="bg-[#121212] p-3 rounded-2xl border border-[#2c2c2c] space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 block">New Folder Name:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Daily Meditation"
                  className="flex-1 bg-[#202020] text-white text-xs px-3 py-2 rounded-xl border border-[#333333] focus:border-red-500 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-xl font-medium transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFolder(false)}
                  className="bg-[#222222] text-neutral-400 hover:text-white text-xs px-2.5 py-2 rounded-xl transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Notes Input */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Personal Notes / Timestamps (Optional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you saving this? (e.g. Watch chapter 3, Morning routine)..."
              className="w-full bg-[#121212] text-white text-xs px-3 py-2.5 rounded-xl border border-[#303030] focus:border-red-500 outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#141414] border-t border-[#262626] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => dispatch(closeSaveModal())}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || selectedFolderSlugs.length === 0}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Video'}
          </button>
        </div>
      </div>
    </div>
  );
}
