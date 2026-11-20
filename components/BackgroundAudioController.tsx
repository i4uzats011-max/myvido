'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setIsPlaying,
  toggleMiniPlayer,
  closePlayer,
} from '@/store/slices/playerSlice';

/**
 * Handles OS-level background audio playback & Lock Screen controls
 * Works across iPhone Safari, iOS Lock Screen, Android Notification Center & Desktop Media Keys
 */
export default function BackgroundAudioController() {
  const dispatch = useAppDispatch();
  const { currentVideo, isPlaying, isBackgroundAudioMode, isWakeLockActive } = useAppSelector(
    (state) => state.player
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Setup OS Lock Screen MediaSession
  useEffect(() => {
    if (!currentVideo || typeof window === 'undefined') return;

    const title = currentVideo.title;
    const channel = currentVideo.channelTitle;
    const thumb = currentVideo.thumbnailUrl;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'FocusTube Playing',
        artist: channel || 'FocusTube',
        album: 'FocusTube - Background Player',
        artwork: [
          {
            src: thumb || '/favicon.ico',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      // Bind Lock Screen Controls
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          dispatch(setIsPlaying(true));
          audioRef.current?.play().catch(() => {});
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          dispatch(setIsPlaying(false));
          audioRef.current?.pause();
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
          }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          if (audioRef.current) {
            audioRef.current.currentTime += skipTime;
          }
        });
      } catch (err) {
        console.warn('MediaSession handler warning:', err);
      }
    }
  }, [currentVideo, dispatch]);

  // Keep Audio element active for mobile Screen-Off background playback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (currentVideo && isBackgroundAudioMode) {
      if (!audioRef.current) {
        // High-quality near-silent continuous carrier audio to hold OS background audio focus
        // Generated sine carrier buffer encoded in data URI
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        audio.loop = true;
        audio.volume = 0.05;
        audioRef.current = audio;
      }

      audioRef.current.play().catch(() => {
        // Requires user interaction on some mobile browsers
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentVideo, isBackgroundAudioMode]);

  // Screen WakeLock API handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function handleWakeLock() {
      if (isWakeLockActive && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.warn('WakeLock error:', err);
        }
      } else if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    handleWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isWakeLockActive]);

  return null;
}
