'use client';

import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPasswordModalOpen, showToast } from '@/store/slices/uiSlice';

export default function PasswordChangeModal() {
  const dispatch = useAppDispatch();
  const { isPasswordModalOpen } = useAppSelector((state) => state.ui);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPasswordModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change password');
      } else {
        dispatch(showToast({ message: 'Password updated successfully! 🔐', type: 'success' }));
        dispatch(setPasswordModalOpen(false));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to reset password to default (admin / admin)?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        dispatch(
          showToast({
            message: 'Credentials reset to default: admin / admin',
            type: 'info',
          })
        );
        dispatch(setPasswordModalOpen(false));
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch {
      setError('Network error during reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <KeyRound className="w-5 h-5 text-red-500" />
            <span>Change Admin Password</span>
          </div>
          <button
            onClick={() => dispatch(setPasswordModalOpen(false))}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#252525] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password (default: admin)"
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#333333] rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#333333] rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#333333] rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-amber-400 hover:bg-[#252525] rounded-xl transition"
              title="Reset credentials back to admin / admin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 text-white font-medium text-xs rounded-xl shadow-lg transition active:scale-95"
            >
              {isLoading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
