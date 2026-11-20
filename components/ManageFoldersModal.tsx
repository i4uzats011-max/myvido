'use client';

import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Trash2,
  Plus,
  BookOpen,
  Sparkles,
  Code,
  Headphones,
  Heart,
  Folder,
  Tag,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setManageFoldersOpen, showToast } from '@/store/slices/uiSlice';
import { createFolder, deleteFolder } from '@/store/slices/foldersSlice';

const AVAILABLE_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

const AVAILABLE_ICONS = [
  { name: 'folder', label: 'Folder' },
  { name: 'book-open', label: 'Education' },
  { name: 'sparkles', label: 'Meditation' },
  { name: 'code', label: 'Coding' },
  { name: 'headphones', label: 'Music' },
  { name: 'heart', label: 'Favorites' },
];

export default function ManageFoldersModal() {
  const dispatch = useAppDispatch();
  const { isManageFoldersOpen } = useAppSelector((state) => state.ui);
  const { items: folders } = useAppSelector((state) => state.folders);
  const { items: savedVideos } = useAppSelector((state) => state.savedVideos);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isManageFoldersOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createFolder({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        })
      ).unwrap();

      setName('');
      dispatch(showToast({ message: 'New folder created!', type: 'success' }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating folder';
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (folderId?: string, folderName?: string) => {
    if (!folderId) return;
    if (confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
      try {
        await dispatch(deleteFolder(folderId)).unwrap();
        dispatch(showToast({ message: 'Folder deleted', type: 'info' }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error deleting folder';
        dispatch(showToast({ message: msg, type: 'error' }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-white text-base">Manage Profile Folders</h2>
          </div>
          <button
            onClick={() => dispatch(setManageFoldersOpen(false))}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form to create new folder */}
        <form onSubmit={handleCreate} className="p-5 border-b border-[#262626] bg-[#141414] space-y-3">
          <span className="text-xs font-semibold text-neutral-300 block">Create New Custom Folder:</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Yoga, AI Tools, Math..."
              className="flex-1 bg-[#1e1e1e] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#303030] focus:border-red-500 outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Color & Icon Picker */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-400 mr-1">Color:</span>
              {AVAILABLE_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-5 h-5 rounded-full transition transform ${
                    selectedColor === col ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#141414]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Existing Folders List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2">
          <span className="text-xs font-semibold text-neutral-400 block mb-2 uppercase tracking-wider">
            Your Folders ({folders.length}):
          </span>

          {folders.map((folder) => {
            const videoCount = savedVideos.filter((v) => v.folderIds.includes(folder.slug)).length;
            const isDefault = ['education', 'meditation', 'coding', 'focus-calm'].includes(folder.slug);

            return (
              <div
                key={folder.slug}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#1e1e1e] border border-[#2b2b2b] hover:border-[#383838] transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{folder.name}</h4>
                    <p className="text-[10px] text-neutral-400">
                      {videoCount} {videoCount === 1 ? 'video' : 'videos'} saved
                    </p>
                  </div>
                </div>

                {!isDefault && folder._id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(folder._id, folder.name)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#141414] border-t border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={() => dispatch(setManageFoldersOpen(false))}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
