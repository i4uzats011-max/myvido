'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setIsPlaying,
  toggleMiniPlayer,
  closePlayer,
} from '@/store/slices/playerSlice';

/**
 * BackgroundAudioController:
 * 1. Overcomes mobile browser background suspension:
 *    When phone screen locks or browser minimizes, YouTube embeds automatically receive
 *    a "visibilitychange" and "blur" pause. This controller auto-resumes playback via
 *    the YouTube postMessage IFrame API.
 * 2. Sustains continuous Web Audio pipeline so iOS Safari and Android Chrome
 *    do not suspend the audio hardware when the screen turns off.
 * 3. Registers Lock Screen controls & metadata via the Navigator MediaSession API.
 */
export default function BackgroundAudioController() {
  const dispatch = useAppDispatch();
  const { currentVideo, isPlaying, isBackgroundAudioMode, isWakeLockActive } = useAppSelector(
    (state) => state.player
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Resume all YouTube iframes via postMessage command
  const sendIframeCommand = (command: 'playVideo' | 'pauseVideo') => {
    try {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: command, args: [] }),
          '*'
        );
      });
    } catch (e) {
      console.warn('IFrame postMessage error:', e);
    }
  };

  // 1. Anti-pause on Screen-Off and App Switching
  useEffect(() => {
    const handleResume = () => {
      // Whenever phone screen turns off, locks, or tab is hidden, send playVideo
      sendIframeCommand('playVideo');
      setTimeout(() => sendIframeCommand('playVideo'), 150);
      setTimeout(() => sendIframeCommand('playVideo'), 500);
      setTimeout(() => sendIframeCommand('playVideo'), 1200);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleResume();
      }
    };

    const handleWindowBlur = () => {
      handleResume();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pageshow', handleResume);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pageshow', handleResume);
    };
  }, []);

  // 2. Lock Screen MediaSession Controls
  useEffect(() => {
    if (!currentVideo || typeof window === 'undefined') return;

    const title = currentVideo.title;
    const channel = currentVideo.channelTitle;
    const thumb = currentVideo.thumbnailUrl;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'FocusTube Background Audio',
        artist: channel || 'FocusTube',
        album: 'Distraction-Free YouTube',
        artwork: [
          {
            src: thumb || '/favicon.ico',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      try {
        navigator.mediaSession.setActionHandler('play', () => {
          dispatch(setIsPlaying(true));
          sendIframeCommand('playVideo');
          audioElemRef.current?.play().catch(() => {});
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          dispatch(setIsPlaying(false));
          sendIframeCommand('pauseVideo');
          audioElemRef.current?.pause();
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
          try {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach((iframe) => {
              iframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
                '*'
              );
            });
          } catch {}
        });
      } catch (err) {
        console.warn('MediaSession handler setup:', err);
      }
    }
  }, [currentVideo, isPlaying, dispatch]);

  // 3. Audio hardware carrier for mobile screen-off keepalive
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (currentVideo) {
      try {
        // Create an unobtrusive inaudible carrier audio element
        if (!audioElemRef.current) {
          const audio = new Audio();
          // Valid inaudible low-frequency carrier wave that locks mobile audio daemon
          audio.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA';
          audio.loop = true;
          audio.volume = 0.01;
          audioElemRef.current = audio;
        }

        audioElemRef.current.play().catch(() => {});

        // Also initiate AudioContext on user interaction
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(20, ctx.currentTime); // Inaudible 20Hz sub-bass
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            audioContextRef.current = ctx;
            oscillatorRef.current = osc;
          }
        } else if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      } catch (e) {
        console.warn('Background audio keepalive setup:', e);
      }
    } else {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    }

    return () => {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
    };
  }, [currentVideo]);

  // 4. WakeLock handler
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
