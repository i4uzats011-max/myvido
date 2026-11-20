import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Person } from '@/lib/models/Person';
import { Transaction } from '@/lib/models/Transaction';
import { Task } from '@/lib/models/Task';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const person: any = await Person.findById(id).lean();

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const txs: any[] = await Transaction.find({ personId: id as any }).sort({ date: -1, createdAt: -1 }).lean();
    let totalGiven = 0;
    let totalTaken = 0;

    txs.forEach((t) => {
      if (t.type === 'given') totalGiven += Number(t.amount) || 0;
      if (t.type === 'taken') totalTaken += Number(t.amount) || 0;
    });

    const netBalance = (Number(person.openingBalance) || 0) + totalGiven - totalTaken;

    return NextResponse.json({
      person: {
        ...person,
        totalGiven,
        totalTaken,
        netBalance,
        transactions: txs,
      },
    });
  } catch (error: unknown) {
    console.error('Person GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch person';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const allowedUpdates = [
      'name',
      'mobile',
      'contacts',
      'email',
      'category',
      'dob',
      'anniversary',
      'address',
      'bankAccountNo',
      'ifscCode',
      'bankName',
      'upiId',
      'notes',
      'remarksHistory',
      'openingBalance',
      'openingBalanceRemark',
      'profileEntries',
      'customFields',
    ];

    const updateFields: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateFields[key] = body[key];
      }
    }

    // If mobile is updated or contacts updated, ensure mobile has a value
    if (body.contacts && body.contacts.length > 0 && !body.mobile) {
      updateFields.mobile = body.contacts[0].number;
    }

    const updated = await Person.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Sync any new remarks with dueDate to Task Manager
    if (Array.isArray(body.remarksHistory)) {
      for (const rh of body.remarksHistory) {
        if (rh.dueDate && !rh.taskId) {
          try {
            const task = await Task.create({
              title: `Follow-up with ${updated.name}: ${rh.note}`,
              description: `Party: ${updated.name} (${updated.mobile || 'No contact'}). Remark: ${rh.note}`,
              priority: 'urgent-important',
              date: rh.dueDate,
              dueDate: rh.dueDate,
            });
            rh.taskId = String(task._id);
          } catch (e) {
            console.warn('Failed to auto-create task for remark due date:', e);
          }
        }
      }
      // Re-save with taskId references if any
      await Person.findByIdAndUpdate(id, { $set: { remarksHistory: body.remarksHistory } });
    }

    // If name or mobile updated, update denormalized fields in transactions
    if (body.name || body.mobile) {
      await Transaction.updateMany(
        { personId: id as any },
        {
          $set: {
            ...(body.name ? { personName: body.name } : {}),
            ...(body.mobile ? { personMobile: body.mobile } : {}),
          },
        }
      );
    }

    return NextResponse.json({ person: updated });
  } catch (error: unknown) {
    console.error('Person PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update person';
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

    const deleted = await Person.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Clean up related transactions
    await Transaction.deleteMany({ personId: id as any });

    return NextResponse.json({ success: true, message: 'Person and associated ledger records deleted' });
  } catch (error: unknown) {
    console.error('Person DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete person';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
