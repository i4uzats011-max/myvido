'use client';

import React, { useState } from 'react';
import {
  Zap,
  Play,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { playVideo } from '@/store/slices/playerSlice';
import { showToast } from '@/store/slices/uiSlice';
import { extractYouTubeVideoId, toAdFreeUrl, toAdFreeEmbedUrl } from '@/lib/youtube';

interface AdFreeConverterProps {
  initialUrl?: string;
}

export default function AdFreeConverter({ initialUrl = 'https://www.youtube.com/watch?v=-jDRvK4CCaE' }: AdFreeConverterProps) {
  const dispatch = useAppDispatch();
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [copied, setCopied] = useState(false);

  const videoId = extractYouTubeVideoId(inputUrl) || '-jDRvK4CCaE';
  const adFreeUrl = toAdFreeUrl(videoId);
  const adFreeEmbed = toAdFreeEmbedUrl(videoId);
  const normalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handlePlayAdFree = () => {
    dispatch(
      playVideo({
        id: videoId,
        title: `Ad-Free Video (${videoId})`,
        description: `Ad-free streaming via yout-ube.com / youtube-nocookie for ${inputUrl}`,
        channelTitle: 'Ad-Free Playback',
        channelId: '',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 'Ad-Free',
        durationSec: 0,
        viewCount: 'Zero Ads',
        publishedAt: new Date().toISOString(),
        isShortOrReel: false,
      })
    );
    dispatch(showToast({ message: 'Playing video in Ad-Free mode! 🛡️', type: 'success' }));
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(adFreeUrl);
      setCopied(true);
      dispatch(showToast({ message: 'Ad-Free link copied to clipboard! 📋', type: 'success' }));
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#181818] via-[#141414] to-[#101010] border border-[#2e2e2e] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Ad-Free YouTube Link Converter
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Hyphen Trick (-)
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Add a <code className="text-amber-300 font-bold bg-neutral-800 px-1 py-0.5 rounded">-</code> hyphen into <span className="text-neutral-300 font-semibold">yout-ube.com</span> to automatically strip all pre-roll and mid-roll ads!
            </p>
          </div>
        </div>

        <button
          onClick={handlePlayAdFree}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-red-900/30 transition flex-shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play Ad-Free Now</span>
        </button>
      </div>

      {/* Input URL Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <span>Paste Any YouTube Video URL:</span>
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=-jDRvK4CCaE"
              className="w-full bg-[#0d0d0d] hover:bg-[#121212] focus:bg-[#0d0d0d] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl border border-[#333333] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition font-mono"
            />
            {inputUrl && (
              <button
                onClick={() => setInputUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={handlePlayAdFree}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm whitespace-nowrap transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Watch Ad-Free</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* With Ads (Standard YouTube) */}
        <div className="bg-[#111111] p-3.5 rounded-2xl border border-red-900/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Standard Link (With Ads 📢)
            </span>
            <span className="text-[10px] text-neutral-500">Unskippable ads</span>
          </div>
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 break-all select-all">
            https://www.<span className="text-red-400 font-bold">youtube</span>.com/watch?v={videoId}
          </div>
          <p className="text-[10px] text-neutral-400 leading-tight">
            Contains pre-roll ads, mid-roll video interruptions, algorithm recommendations, and tracking cookies.
          </p>
        </div>

        {/* Without Ads (yout-ube with Hyphen) */}
        <div className="bg-gradient-to-br from-emerald-950/20 to-[#121212] p-3.5 rounded-2xl border border-emerald-700/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Ad-Free Link (Without Ads 🛡️)
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Ad-Free</span>
          </div>
          <div className="bg-black/80 p-2.5 rounded-xl border border-emerald-900/50 text-[11px] font-mono text-emerald-200 break-all select-all flex items-center justify-between gap-2">
            <span>
              https://www.<span className="text-amber-400 font-black text-xs underline decoration-amber-400">yout-ube</span>.com/watch?v={videoId}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition active:scale-95"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{copied ? 'Copied!' : 'Copy Ad-Free Link'}</span>
            </button>
            <a
              href={adFreeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-900/30"
            >
              <span>Open yout-ube.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* How It Works Explanation */}
      <div className="bg-[#0f0f0f] border border-[#242424] rounded-2xl p-3 sm:p-4 text-xs text-neutral-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Why does adding the hyphen (-) remove YouTube ads?</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          When you insert a hyphen between <strong>&quot;yout&quot;</strong> and <strong>&quot;ube&quot;</strong> (<code className="text-amber-300 font-mono">yout-ube.com</code>), the request is forwarded directly to YouTube&apos;s clean privacy embed engine (<code className="text-emerald-400 font-mono">youtube-nocookie.com</code>). Because the privacy embed does not load personalized advertising scripts or tracking cookies, the video streams cleanly without pre-roll or mid-roll ad interruptions.
        </p>
      </div>
    </div>
  );
}
