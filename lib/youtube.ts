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
 * STRICT Anti-Reels & Anti-Shorts Detection
 * 
 * Rules:
 * 1. Duration <= 70 seconds -> 100% REEL/SHORT (Exclude)
 * 2. Title or description contains #shorts, #short, #reels, #reel, #youtubeshorts, #tiktok -> Exclude
 * 3. Duration < 180 seconds (3 mins) AND contains "short" or "reel" keywords -> Exclude
 * 4. User can configure stricter minimum duration (e.g. >2 mins or >4 mins)
 */
export function isReelOrShort(
  video: {
    durationSec: number;
    title: string;
    description: string;
  },
  minDurationSeconds: number = 70
): boolean {
  // Rule 1: Minimum duration threshold
  if (video.durationSec < minDurationSeconds) {
    return true;
  }

  // Rule 2: Hashtag and keyword detection
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

  // Rule 3: For videos under 3 minutes, detect vertical / short video mentions
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
