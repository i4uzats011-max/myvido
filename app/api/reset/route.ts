import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedVideo } from '@/lib/models/SavedVideo';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json().catch(() => ({}));
    const { scope, folderSlug } = body;

    if (scope === 'all_saved') {
      // Delete all saved videos
      await SavedVideo.deleteMany({});
      return NextResponse.json({ success: true, message: 'All saved videos deleted' });
    } else if (scope === 'folder' && folderSlug) {
      // Remove videos belonging to this folder
      await SavedVideo.updateMany(
        { folderIds: folderSlug },
        { $pull: { folderIds: folderSlug } }
      );
      // Delete any videos that have no folder left
      await SavedVideo.deleteMany({ folderIds: { $size: 0 } });
      return NextResponse.json({ success: true, message: `Videos in ${folderSlug} cleared` });
    }

    return NextResponse.json({ success: true, message: 'Reset performed' });
  } catch (error: unknown) {
    console.error('Reset API error:', error);
    const message = error instanceof Error ? error.message : 'Reset failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
