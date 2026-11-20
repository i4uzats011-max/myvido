'use client';

import React from 'react';
import {
  X,
  Timer,
  Clock,
  RotateCcw,
  Coffee,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setScreenTimeModalOpen,
  resetScreenTime,
  setDailyGoalMinutes,
  setBreakReminderMinutes,
  dismissBreakAlert,
} from '@/store/slices/screenTimeSlice';
import { showToast } from '@/store/slices/uiSlice';

export default function ScreenTimeModal() {
  const dispatch = useAppDispatch();
  const {
    totalSecondsToday,
    folderSeconds,
    dailyGoalMinutes,
    breakReminderMinutes,
    isModalOpen,
    showBreakAlert,
  } = useAppSelector((state) => state.screenTime);
  const { items: folders } = useAppSelector((state) => state.folders);

  if (!isModalOpen && !showBreakAlert) return null;

  const hours = Math.floor(totalSecondsToday / 3600);
  const minutes = Math.floor((totalSecondsToday % 3600) / 60);
  const seconds = totalSecondsToday % 60;

  const goalSec = dailyGoalMinutes * 60;
  const progressPercent = Math.min(Math.round((totalSecondsToday / (goalSec || 1)) * 100), 100);

  const handleReset = () => {
    dispatch(resetScreenTime());
    dispatch(showToast({ message: "Today's screen time reset to 0!", type: 'info' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-white text-base">Screen Time &amp; Focus Monitor</h2>
          </div>
          <button
            onClick={() => {
              dispatch(setScreenTimeModalOpen(false));
              dispatch(dismissBreakAlert());
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Break Alert Banner if triggered */}
        {showBreakAlert && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-amber-300">Take a Mindful Break!</h4>
              <p className="text-[11px] text-neutral-300">
                You have been watching videos for {breakReminderMinutes} minutes. Rest your eyes for 5 minutes.
              </p>
            </div>
            <button
              onClick={() => dispatch(dismissBreakAlert())}
              className="text-xs font-semibold px-2.5 py-1 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition"
            >
              Got it
            </button>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Main Time Counter Card */}
          <div className="bg-[#121212] rounded-2xl p-4 border border-[#262626] flex flex-col items-center justify-center text-center">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
              Today&apos;s Active Watch Time
            </span>
            <div className="text-3xl font-extrabold text-white my-1 font-mono tracking-tight">
              {hours > 0 ? `${hours}h ` : ''}
              {minutes}m {seconds.toString().padStart(2, '0')}s
            </div>
            <span className="text-xs text-neutral-400">
              Target: {dailyGoalMinutes} mins / day ({progressPercent}% used)
            </span>

            {/* Progress Bar */}
            <div className="w-full bg-[#222222] h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progressPercent >= 100
                    ? 'bg-red-500'
                    : progressPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Folder Breakdown */}
          <div>
            <span className="text-xs font-semibold text-neutral-300 block mb-2">
              Focus Breakdown by Folder:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {folders.map((f) => {
                const sec = folderSeconds[f.slug] || 0;
                const m = Math.floor(sec / 60);
                return (
                  <div
                    key={f.slug}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-neutral-200">{f.name}</span>
                    </div>
                    <span className="text-neutral-400 font-mono">
                      {m}m {sec % 60}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls: Daily Goal & Break Reminder */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#141414] p-3 rounded-2xl border border-[#262626]">
              <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                Daily Goal:
              </label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => dispatch(setDailyGoalMinutes(parseInt(e.target.value, 10)))}
                className="w-full bg-[#1f1f1f] text-white text-xs p-1.5 rounded-lg border border-[#333333] outline-none"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="bg-[#141414] p-3 rounded-2xl border border-[#262626]">
              <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                Break Reminder:
              </label>
              <select
                value={breakReminderMinutes}
                onChange={(e) => dispatch(setBreakReminderMinutes(parseInt(e.target.value, 10)))}
                className="w-full bg-[#1f1f1f] text-white text-xs p-1.5 rounded-lg border border-[#333333] outline-none"
              >
                <option value={20}>Every 20 mins</option>
                <option value={30}>Every 30 mins</option>
                <option value={45}>Every 45 mins</option>
                <option value={60}>Every 60 mins</option>
                <option value={0}>Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#141414] border-t border-[#262626] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Today</span>
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(setScreenTimeModalOpen(false));
              dispatch(dismissBreakAlert());
            }}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
