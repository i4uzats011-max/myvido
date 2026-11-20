import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Reminder } from '@/lib/models/Reminder';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const query: Record<string, unknown> = {};
    if (date) {
      query.date = date;
    }

    const reminders = await Reminder.find(query).sort({ time: 1, createdAt: -1 }).lean();

    return NextResponse.json({ reminders });
  } catch (error: unknown) {
    console.error('Reminders GET error:', error);
    return NextResponse.json({ reminders: [], error: 'Failed to fetch reminders' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, description, date, time, isRecurring, recurringType } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'title and date are required' },
        { status: 400 }
      );
    }

    const reminder = await Reminder.create({
      title,
      description: description || '',
      date,
      time: time || '',
      isRecurring: isRecurring || false,
      recurringType: recurringType || null,
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error: unknown) {
    console.error('Reminders POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reminder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
