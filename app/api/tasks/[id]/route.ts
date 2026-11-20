import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';

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
    if (body.priority !== undefined) updateFields.priority = body.priority;
    if (body.date !== undefined) updateFields.date = body.date;
    if (body.isRoutine !== undefined) updateFields.isRoutine = body.isRoutine;
    if (body.routineFrequency !== undefined) updateFields.routineFrequency = body.routineFrequency;

    if (body.completed !== undefined) {
      updateFields.completed = body.completed;
      updateFields.completedAt = body.completed ? new Date() : null;
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (error: unknown) {
    console.error('Task PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update task';
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

    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: unknown) {
    console.error('Task DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
