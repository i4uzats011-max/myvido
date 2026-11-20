import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedVideo } from '@/lib/models/SavedVideo';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { folderIds, notes, isFavorite } = body;

    const updateFields: Record<string, unknown> = {};
    if (folderIds !== undefined) updateFields.folderIds = folderIds;
    if (notes !== undefined) updateFields.notes = notes;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    const updated = await SavedVideo.findOneAndUpdate(
      { $or: [{ _id: id }, { videoId: id }] },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video: updated });
  } catch (error: unknown) {
    console.error('Saved video PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await SavedVideo.findOneAndDelete({
      $or: [{ _id: id }, { videoId: id }],
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Video removed from saved list' });
  } catch (error: unknown) {
    console.error('Saved video DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
