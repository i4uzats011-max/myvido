import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedVideo } from '@/lib/models/SavedVideo';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder');
    const isFavorite = searchParams.get('favorite');

    // Build query filter
    const query: Record<string, unknown> = {};

    if (folderId && folderId !== 'all') {
      query.folderIds = folderId;
    }

    if (isFavorite === 'true') {
      query.isFavorite = true;
    }

    const videos = await SavedVideo.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ videos });
  } catch (error: unknown) {
    console.error('Saved videos GET error:', error);
    return NextResponse.json({ videos: [], error: 'Failed to fetch saved videos' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      videoId,
      title,
      description,
      channelTitle,
      channelId,
      thumbnailUrl,
      duration,
      durationSec,
      viewCount,
      publishedAt,
      folderIds,
      notes,
      isFavorite,
    } = body;

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required' }, { status: 400 });
    }

    // Upsert: If video already exists, update folderIds and notes, else create
    const updated = await SavedVideo.findOneAndUpdate(
      { videoId },
      {
        $set: {
          title,
          description: description || '',
          channelTitle: channelTitle || '',
          channelId: channelId || '',
          thumbnailUrl: thumbnailUrl || '',
          duration: duration || '0:00',
          durationSec: durationSec || 0,
          viewCount: viewCount || '0',
          publishedAt: publishedAt || '',
          notes: notes !== undefined ? notes : '',
          isFavorite: isFavorite !== undefined ? isFavorite : true,
        },
        $addToSet: {
          folderIds: { $each: folderIds && folderIds.length > 0 ? folderIds : ['education'] },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ video: updated }, { status: 201 });
  } catch (error: unknown) {
    console.error('Saved videos POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
