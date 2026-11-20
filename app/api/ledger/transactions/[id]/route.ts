import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updateFields: Record<string, unknown> = {};
    const allowed = [
      'amount',
      'type',
      'accountCategory',
      'date',
      'dueDate',
      'category',
      'description',
      'isSettled',
      'personName',
      'personMobile',
    ];

    allowed.forEach((k) => {
      if (body[k] !== undefined) updateFields[k] = body[k];
    });

    if (body.isSettled) {
      updateFields.settledAt = new Date();
    } else if (body.isSettled === false) {
      updateFields.settledAt = null;
    }

    const updated = await Transaction.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction: updated });
  } catch (error: unknown) {
    console.error('Transaction PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update transaction';
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

    const deleted = await Transaction.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error: unknown) {
    console.error('Transaction DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
