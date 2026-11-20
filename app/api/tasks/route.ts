import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const query: Record<string, unknown> = {};
    if (date) {
      query.date = date;
    }

    const tasks = await Task.find(query).sort({ completed: 1, createdAt: -1 }).lean();

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ tasks: [], error: 'Failed to fetch tasks' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, description, priority, date, isRoutine, routineFrequency } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'title and date are required' },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'important',
      date,
      isRoutine: isRoutine || false,
      routineFrequency: routineFrequency || null,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: unknown) {
    console.error('Tasks POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
