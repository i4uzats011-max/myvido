export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  duration: string;
  durationSec: number;
  viewCount: string;
  publishedAt: string;
  isShortOrReel: boolean;
  categoryTag?: string;
}

// Convert ISO 8601 duration string (e.g. "PT1H2M30S" or "PT45S") to total seconds
export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds into "MM:SS" or "HH:MM:SS"
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mStr = h > 0 ? m.toString().padStart(2, '0') : m.toString();
  const sStr = s.toString().padStart(2, '0');

  return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
}

// Format view counts to human-readable (e.g., 1.5M, 240K)
export function formatViewCount(views: string | number): string {
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '0 views';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${num} views`;
}

// Format relative date (e.g. "2 days ago")
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * STRICT CONTENT WHITELIST CATEGORIES:
 * Allowed: Meditation, Law, Math, Science, Accounts, GST, Income Tax, Technology, News/Elections
 * Songs Allowed ONLY: T-Series, English Songs, Arijit Singh, Atif Aslam
 * Blocked: All Movies, Pranks, Vlogs, Gossip, Roast, and other random clutter!
 */
export const ALLOWED_CATEGORIES = [
  { id: 'all', name: 'All Focus', icon: 'sparkles' },
  { id: 'share-market', name: 'Share Market & Stocks', keywords: ['share market', 'stock market', 'nifty', 'sensex', 'trading', 'investing', 'mutual funds', 'ipo', 'stocks', 'equity', 'demat', 'intraday'] },
  { id: 'gst', name: 'GST & ITC', keywords: ['gst', 'gstr', 'gst portal', 'itc', 'input tax credit', 'pmt-10', 'pmt 10', 'gst return'] },
  { id: 'income-tax', name: 'Income Tax', keywords: ['income tax', 'itr', 'tax return', 'taxation', 'tds', 'pan card', 'tax audit', 'form 16'] },
  { id: 'accounts', name: 'Accounts', keywords: ['accounts', 'accounting', 'tally', 'balance sheet', 'bookkeeping', 'commerce', 'ledger', 'audit'] },
  { id: 'law', name: 'Law & Legal', keywords: ['law', 'legal', 'kanoon', 'advocate', 'court', 'ipc', 'crpc', 'constitution', 'act', 'section'] },
  { id: 'technology', name: 'Technologies', keywords: ['technology', 'programming', 'coding', 'software', 'ai', 'computer science', 'web development', 'python', 'javascript', 'tech'] },
  { id: 'meditation', name: 'Meditation', keywords: ['meditation', 'mindfulness', 'calm', 'dhyan', 'peaceful', 'relaxing sounds'] },
  { id: 'science', name: 'Science', keywords: ['science', 'physics', 'chemistry', 'biology', 'space', 'astronomy', 'scientific'] },
  { id: 'math', name: 'Math', keywords: ['math', 'mathematics', 'calculus', 'algebra', 'trigonometry', 'geometry', 'ganit'] },
  { id: 'news', name: 'News & Elections', keywords: ['news', 'election', 'chunav', 'breaking news', 'current affairs', 'general news', 'politics news'] },
  { id: 'songs', name: 'Curated Songs', keywords: ['t-series', 'arijit singh', 'atif aslam', 'a.r. rahman', 'ar rahman', 'english song', 'english songs'] },
];

// Blocked Junk Keywords (Movies, Pranks, Vlogs, Roast, Gossip, etc.)
const BLOCKED_JUNK_PATTERNS = [
  'full movie',
  'full hd movie',
  'south movie',
  'hindi dubbed movie',
  'cinema',
  'blockbuster movie',
  'prank',
  'pranks',
  'roast',
  'roasting',
  'daily vlog',
  'vlog',
  'vlogs',
  'gossip',
  'scandal',
  'celebrity gossip',
  'trailer',
  'teaser',
  'behind the scenes',
  'blooper',
  'bloopers',
  'funny video',
  'comedy video',
  'chutkule',
];

/**
 * Strictly validates if video content is permissible under user's rules:
 * - NO Movies, Pranks, Vlogs, Gossip, Roast
 * - If it's a song: MUST be T-Series, English song, Arijit Singh, or Atif Aslam!
 */
export function isContentAllowed(
  title: string,
  description: string,
  channelTitle: string
): { allowed: boolean; reason?: string } {
  const combined = `${title} ${description} ${channelTitle}`.toLowerCase();

  // 1. Block movies and junk patterns
  for (const junk of BLOCKED_JUNK_PATTERNS) {
    if (combined.includes(junk)) {
      return { allowed: false, reason: 'Movies and entertainment junk are blocked' };
    }
  }

  // 2. Song restriction check:
  // If the video is a song/music, verify it matches allowed artist/channel criteria
  const isSongDetected =
    combined.includes('song') ||
    combined.includes('music') ||
    combined.includes('lyrics') ||
    combined.includes('gaana') ||
    combined.includes('audio');

  if (isSongDetected) {
    const isTSeries = combined.includes('t-series') || combined.includes('tseries');
    const isArijit = combined.includes('arijit singh') || combined.includes('arijit');
    const isAtif = combined.includes('atif aslam') || combined.includes('atif');
    const isARRahman =
      combined.includes('a.r. rahman') ||
      combined.includes('ar rahman') ||
      combined.includes('a r rahman') ||
      combined.includes('rahman');
    const isEnglishSong =
      combined.includes('english song') ||
      combined.includes('english songs') ||
      combined.includes('pop song') ||
      combined.includes('billboard') ||
      /\b(english)\b/i.test(combined);

    if (!isTSeries && !isArijit && !isAtif && !isARRahman && !isEnglishSong) {
      return {
        allowed: false,
        reason: 'Only T-Series, English songs, Arijit Singh, Atif Aslam & A.R. Rahman songs are allowed',
      };
    }
  }

  return { allowed: true };
}

/**
 * STRICT Anti-Reels & Anti-Shorts Detection
 */
export function isReelOrShort(
  video: {
    durationSec: number;
    title: string;
    description: string;
  },
  minDurationSeconds: number = 70
): boolean {
  if (video.durationSec < minDurationSeconds) {
    return true;
  }

  const combined = `${video.title} ${video.description}`.toLowerCase();
  const bannedKeywords = [
    '#shorts',
    '#short',
    '#reels',
    '#reel',
    '#youtubeshorts',
    '#ytshorts',
    '#trendingshorts',
    '#shortsvideo',
    '#reelvideo',
    '#tiktok',
    'tiktok',
    'youtube shorts',
    'yt shorts',
    'insta reels',
    'instagram reels',
  ];

  for (const keyword of bannedKeywords) {
    if (combined.includes(keyword)) {
      return true;
    }
  }

  if (video.durationSec <= 180) {
    if (
      /\bshort\b/i.test(video.title) ||
      /\breel\b/i.test(video.title) ||
      /\bshorts\b/i.test(video.title) ||
      /\breels\b/i.test(video.title)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extract YouTube video ID from any standard YouTube URL, short URL, embed, or yout-ube.com URL
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already a clean 11-char video ID (e.g. -jDRvK4CCaE or dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common patterns:
  // 1. https://www.youtube.com/watch?v=...
  // 2. https://www.yout-ube.com/watch?v=...
  // 3. https://youtu.be/...
  // 4. https://www.youtube.com/embed/...
  // 5. https://www.youtube-nocookie.com/embed/...
  // 6. https://www.youtube.com/shorts/...
  const match = trimmed.match(
    /(?:youtu\.be\/|yout-ube\.com\/(?:watch\?.*v=|embed\/)|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  // Fallback URL parser for query param ?v=
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const v = url.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
      return v;
    }
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
      return lastPart;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Converts any standard YouTube link into an ad-free yout-ube.com link
 */
export function toAdFreeUrl(urlOrId: string): string {
  const id = extractYouTubeVideoId(urlOrId) || urlOrId.trim();
  return `https://www.yout-ube.com/watch?v=${id}`;
}

/**
 * Converts any standard YouTube link into an ad-free privacy embed URL
 */
export function toAdFreeEmbedUrl(urlOrId: string): string {
  const id = extractYouTubeVideoId(urlOrId) || urlOrId.trim();
  return `https://www.youtube-nocookie.com/embed/${id}?playlist=${id}&autoplay=1&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
}

