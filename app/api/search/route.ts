import { NextRequest, NextResponse } from 'next/server';
import {
  parseDurationToSeconds,
  formatDuration,
  formatViewCount,
  isReelOrShort,
  extractYouTubeVideoId,
  YouTubeVideoItem,
} from '@/lib/youtube';

// In-Memory Fast Cache for Instant Results (<20ms response time)
interface CacheEntry {
  timestamp: number;
  data: {
    items: YouTubeVideoItem[];
    videos: YouTubeVideoItem[];
    nextPageToken: string | null;
    filteredCount: number;
    filteredReelsCount: number;
    totalReceived: number;
  };
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Clean up expired entries periodically
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      memoryCache.delete(key);
    }
  }
}

const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyCVEsCgQOAyyCpxvQ_O_cRBElQ1fXN-mSg';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const query = rawQuery.trim();
    const pageToken = searchParams.get('pageToken') || '';
    const minDurationSec = parseInt(searchParams.get('minDuration') || '135', 10);
    const apiKey =
      process.env.YOUTUBE_API_KEY ||
      searchParams.get('apiKey') ||
      DEFAULT_YOUTUBE_API_KEY;

    if (!query) {
      return NextResponse.json({
        items: [],
        videos: [],
        nextPageToken: null,
        filteredCount: 0,
        filteredReelsCount: 0,
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key is missing. Please check .env.local or settings.' },
        { status: 400 }
      );
    }

    // Check in-memory fast cache first
    const cacheKey = `${query.toLowerCase()}_${pageToken}_${minDurationSec}`;
    const cached = memoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
      }, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60',
        },
      });
    }

    const directVideoId = extractYouTubeVideoId(query);
    let videoIds = '';
    let nextPageTokenResponse: string | null = null;

    if (directVideoId) {
      // Direct YouTube or yout-ube URL/ID entered: skip search step and fetch video directly
      videoIds = directVideoId;
    } else {
      // Step 1: Query YouTube Search API (Optimized payload with fields filter for speed)
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'id');
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('maxResults', '40'); // Fast batch with buffer for anti-reels filtering
      searchUrl.searchParams.set('fields', 'nextPageToken,items(id/videoId)');
      if (pageToken) {
        searchUrl.searchParams.set('pageToken', pageToken);
      }
      searchUrl.searchParams.set('key', apiKey);

      const searchRes = await fetch(searchUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 600 },
      });

      if (!searchRes.ok) {
        const errData = await searchRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData.error?.message || 'YouTube search failed' },
          { status: searchRes.status }
        );
      }

      const searchData = await searchRes.json();
      nextPageTokenResponse = searchData.nextPageToken || null;
      const rawItems = searchData.items || [];
      videoIds = rawItems
        .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
        .filter(Boolean)
        .join(',');
    }

    if (!videoIds) {
      const emptyResult = {
        items: [],
        videos: [],
        nextPageToken: nextPageTokenResponse,
        filteredCount: 0,
        filteredReelsCount: 0,
        totalReceived: 0,
      };
      memoryCache.set(cacheKey, { timestamp: now, data: emptyResult });
      return NextResponse.json(emptyResult);
    }

    // Step 2: Fetch video details with optimized fields for speed
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,contentDetails,statistics');
    videosUrl.searchParams.set('id', videoIds);
    videosUrl.searchParams.set(
      'fields',
      'items(id,snippet(title,description,channelTitle,channelId,thumbnails,publishedAt),contentDetails/duration,statistics/viewCount)'
    );
    videosUrl.searchParams.set('key', apiKey);

    const videosRes = await fetch(videosUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 900 },
    });

    if (!videosRes.ok) {
      const errData = await videosRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error?.message || 'Failed to fetch video details' },
        { status: videosRes.status }
      );
    }

    const videosData = await videosRes.json();
    const videoDetailsList = videosData.items || [];

    // Step 3: Strictly filter out all Reels / Shorts!
    let filteredCount = 0;
    const cleanVideos: YouTubeVideoItem[] = [];

    for (const item of videoDetailsList) {
      const snippet = item.snippet || {};
      const contentDetails = item.contentDetails || {};
      const statistics = item.statistics || {};

      const rawDuration = contentDetails.duration || '';
      const durationSec = parseDurationToSeconds(rawDuration);
      const title = snippet.title || '';
      const description = snippet.description || '';

      // Check if it's a short/reel
      const isReel = isReelOrShort(
        {
          durationSec,
          title,
          description,
        },
        minDurationSec
      );

      if (isReel) {
        filteredCount++;
        continue; // REEL / SHORT BLOCKED!
      }

      // High quality thumbnail resolution selector
      const thumbs = snippet.thumbnails || {};
      const bestThumbnail =
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        thumbs.standard?.url ||
        thumbs.maxres?.url ||
        '';

      cleanVideos.push({
        id: item.id,
        title,
        description,
        channelTitle: snippet.channelTitle || '',
        channelId: snippet.channelId || '',
        thumbnailUrl: bestThumbnail,
        duration: formatDuration(durationSec),
        durationSec,
        viewCount: formatViewCount(statistics.viewCount || '0'),
        publishedAt: snippet.publishedAt || '',
        isShortOrReel: false,
      });
    }

    // If directVideoId was entered and not returned (e.g. strict filtering or API quota), fallback to direct item
    if (directVideoId && cleanVideos.length === 0) {
      cleanVideos.push({
        id: directVideoId,
        title: `YouTube Video (${directVideoId})`,
        description: `Ad-free direct playback for YouTube link: ${query}`,
        channelTitle: 'YouTube',
        channelId: '',
        thumbnailUrl: `https://i.ytimg.com/vi/${directVideoId}/hqdefault.jpg`,
        duration: 'Direct Stream',
        durationSec: 300,
        viewCount: 'Ad-Free Play',
        publishedAt: new Date().toISOString(),
        isShortOrReel: false,
      });
    }

    const responseData = {
      items: cleanVideos,
      videos: cleanVideos,
      nextPageToken: nextPageTokenResponse,
      filteredCount,
      filteredReelsCount: filteredCount,
      totalReceived: directVideoId ? 1 : videoDetailsList.length,
    };

    // Store in memory cache
    memoryCache.set(cacheKey, { timestamp: now, data: responseData });
    cleanExpiredCache();

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60',
      },
    });
  } catch (error: unknown) {
    console.error('Search API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
