import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Reminder } from '@/lib/models/Reminder';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updateFields: Record<string, unknown> = {};
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.date !== undefined) updateFields.date = body.date;
    if (body.time !== undefined) updateFields.time = body.time;
    if (body.isRecurring !== undefined) updateFields.isRecurring = body.isRecurring;
    if (body.recurringType !== undefined) updateFields.recurringType = body.recurringType;
    if (body.completed !== undefined) updateFields.completed = body.completed;

    const updated = await Reminder.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder: updated });
  } catch (error: unknown) {
    console.error('Reminder PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update reminder';
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

    const deleted = await Reminder.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error: unknown) {
    console.error('Reminder DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete reminder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
