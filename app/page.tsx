'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ZenHomeView from '@/components/ZenHomeView';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import SaveToFolderModal from '@/components/SaveToFolderModal';
import ClearHistoryModal from '@/components/ClearHistoryModal';
import ManageFoldersModal from '@/components/ManageFoldersModal';
import ScreenTimeModal from '@/components/ScreenTimeModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import MiniFloatingPlayer from '@/components/MiniFloatingPlayer';
import BackgroundAudioController from '@/components/BackgroundAudioController';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearToast } from '@/store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Home() {
  const dispatch = useAppDispatch();
  const { toast } = useAppSelector((state) => state.ui);

  // Auto clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f] text-[#f1f1f1]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Layout with Responsive Sidebar */}
      <div className="flex flex-1 w-full relative">
        <Sidebar />

        <main className="flex-1 pb-20 md:pb-8 overflow-y-auto">
          <ZenHomeView />
        </main>
      </div>

      {/* Mobile Bottom Navigation for iPhone & Safari Mobile */}
      <MobileBottomNav />

      {/* Interactive Modals & Mini Player */}
      <VideoPlayerModal />
      <MiniFloatingPlayer />
      <BackgroundAudioController />
      <SaveToFolderModal />
      <ClearHistoryModal />
      <ManageFoldersModal />
      <ScreenTimeModal />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/60'
                : toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-800/60'
                : 'bg-neutral-900/90 text-neutral-200 border-neutral-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}

            <span>{toast.message}</span>

            <button
              onClick={() => dispatch(clearToast())}
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
