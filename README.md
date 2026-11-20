# FocusTube - Distraction-Free YouTube Platform 🛡️🧘📚

A Zen-mode YouTube web application built with **Next.js 16**, **React 19**, **Redux Toolkit**, **MongoDB (Mongoose)**, and **Tailwind CSS**.

---

## ✨ Key Features

1. **🚫 100% Zero Reels & Shorts Guarantee**
   - Automatically filters out all vertical videos and shorts (< 70s threshold + `#shorts` / `#reels` tag blocking).
   - Shows a live badge displaying how many reels were blocked during each search.

2. **🛡️ Built-in Ad-Block Playback Mode & Hyphen Link Converter (`yout-ube.com`)**
   - **Mode A: Zero-Ads Stream (Piped / Invidious)**: Directly streams YouTube videos with Zero Pre-roll Ads, Zero Mid-rolls, and built-in SponsorBlock.
   - **Mode B: YouTube Privacy Embed (`youtube-nocookie.com`)**: Clutter-free embed with zero tracking cookies and clean playback.
   - **Mode C: yout-ube.com Mode**: 1-click conversion from `youtube.com` to `yout-ube.com` using the hyphen trick to bypass ads.
   - **⚡ Instant Link Converter**: Paste any normal YouTube link (`youtube.com/watch?v=...`) or short link to instantly play ad-free or copy the converted ad-free link.

3. **🧘 Distraction-Free Zen Homepage**
   - When opened: **NO algorithmic rabbit-hole feed, NO trending clickbait**.
   - Only displays your curated profiles & saved video folders (e.g. Education, Meditation, Tech).

4. **📁 Profiles & Custom Folder Management**
   - Organize videos into folders like:
     - 📚 Education
     - 🧘 Meditation
     - 💻 Coding & Tech
     - 🎵 Focus & Calm
     - Custom folders created on the fly with custom colors & icons.
   - Direct playback inside the platform on click.
   - Attach personal study notes & timestamps to any video.

5. **⏱️ Live Screen Time & Focus Monitor**
   - Live watch time tracker in the top bar.
   - Category breakdown: see exactly how much time you spent on Education vs. Meditation.
   - Gentle Mindful Break reminders (e.g. every 20m, 30m, 45m).
   - Daily focus targets with a visual progress bar.

6. **📱 iPhone & Safari Mobile Optimized**
   - Mobile-first responsive design.
   - Dynamic viewport height (`100dvh`) for Safari iOS.
   - Safe-area insets for iPhone notch & home indicator bar (`env(safe-area-inset-top)` / `bottom`).
   - 16px minimum input font to prevent iOS Safari auto-zoom.
   - One-thumb bottom navigation bar.

7. **⚡ Lightning Fast Search**
   - Server-side in-memory cache (< 20ms response for cached queries).
   - Minimalist YouTube API payload field selection.
   - Search autocomplete & recent history suggestions.

8. **🔄 1-Click Reset All History & Preferences**
   - Dedicated 1-click reset action: deletes watch history, search history, and restores filter preferences instantly.
   - Optional 1-click clear of saved videos in MongoDB.

---

## 🚀 Environment Variables (`.env.local`)

```env
# YouTube Data API v3 Key
YOUTUBE_API_KEY=AIzaSyCVEsCgQOAyyCpxvQ_O_cRBElQ1fXN-mSg

# MongoDB Connection
MONGODB_URI=mongodb+srv://i4uzats011_db_user:K7X5BETnFdTgTgTE@cluster0.2gn7lxt.mongodb.net/focustube?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=focustube
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In Vercel, click **"Add New Project"** and select the repository.
3. In **Environment Variables**, add:
   - `YOUTUBE_API_KEY`: Your YouTube API Key
   - `MONGODB_URI`: Your MongoDB Connection URI
4. Click **Deploy**. Vercel will automatically build the Next.js App Router project!
