import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { Task } from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const category = searchParams.get('category');
    const accountCategory = searchParams.get('accountCategory');
    const date = searchParams.get('date');
    const dueDate = searchParams.get('dueDate');

    const query: Record<string, unknown> = {};
    if (personId) query.personId = personId;
    if (accountCategory) query.accountCategory = accountCategory;
    if (category) query.category = category;
    if (date) query.date = date;
    if (dueDate) query.dueDate = dueDate;

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ transactions: [], error: 'Failed to fetch transactions' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      accountCategory,
      type,
      amount,
      date,
      dueDate,
      personId,
      personName,
      personMobile,
      category,
      description,
      isSettled,
    } = body;

    if (!type || amount === undefined || !date) {
      return NextResponse.json(
        { error: 'type, amount, and date are required' },
        { status: 400 }
      );
    }

    const tx = await Transaction.create({
      accountCategory: accountCategory || 'personal',
      type,
      amount: Number(amount) || 0,
      date,
      dueDate: dueDate || '',
      personId: personId || null,
      personName: personName || '',
      personMobile: personMobile || '',
      category: category || 'General',
      description: description || '',
      isSettled: isSettled || false,
    });

    // If a due date is specified, auto-sync as a Task on that due date!
    if (dueDate && (type === 'given' || type === 'taken' || type === 'income')) {
      const actionText =
        type === 'given'
          ? `Collect ₹${amount} from ${personName || 'Party'}`
          : type === 'taken'
          ? `Pay ₹${amount} to ${personName || 'Party'}`
          : `Collect Income ₹${amount}: ${description || personName}`;

      await Task.create({
        title: actionText,
        description: `Ledger Due Date Alert. Description: ${description || 'N/A'}${
          personMobile ? ` | Contact: ${personMobile}` : ''
        }`,
        priority: 'urgent-important',
        date: dueDate,
        dueDate: dueDate,
      });
    }

    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch (error: unknown) {
    console.error('Transactions POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
