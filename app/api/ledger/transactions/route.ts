import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { Account } from '@/lib/models/Account';
import { Task } from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const personId = searchParams.get('personId');
    const date = searchParams.get('date');
    const dueDate = searchParams.get('dueDate');

    const query: Record<string, unknown> = {};
    if (accountId) {
      query.$or = [{ debitAccountId: accountId }, { creditAccountId: accountId }];
    }
    if (personId) {
      query.personId = personId;
    }
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
      debitAccountId,
      creditAccountId,
      amount,
      date,
      dueDate,
      narration,
    } = body;

    if (!debitAccountId || !creditAccountId || !amount || Number(amount) <= 0 || !date) {
      return NextResponse.json(
        { error: 'Debit Account, Credit Account, Amount (> 0), and Date are required' },
        { status: 400 }
      );
    }

    if (debitAccountId === creditAccountId) {
      return NextResponse.json(
        { error: 'Debit Account and Credit Account cannot be the same' },
        { status: 400 }
      );
    }

    // Look up both accounts to store denormalized names and detect personal account
    const debitAcc = await Account.findById(debitAccountId);
    const creditAcc = await Account.findById(creditAccountId);

    if (!debitAcc || !creditAcc) {
      return NextResponse.json(
        { error: 'One or both selected accounts do not exist' },
        { status: 404 }
      );
    }

    // Check if either side is a Personal account
    let linkedPersonId = null;
    let linkedPersonName = '';
    let linkedPersonMobile = '';
    let isPersonalCredit = false; // We owe money (Payable)
    let isPersonalDebit = false; // Person owes us money (Receivable)

    if (debitAcc.accountType === 'personal') {
      linkedPersonId = debitAcc.personId;
      linkedPersonName = debitAcc.name;
      linkedPersonMobile = debitAcc.personMobile || '';
      isPersonalDebit = true;
    } else if (creditAcc.accountType === 'personal') {
      linkedPersonId = creditAcc.personId;
      linkedPersonName = creditAcc.name;
      linkedPersonMobile = creditAcc.personMobile || '';
      isPersonalCredit = true;
    }

    const tx = await Transaction.create({
      debitAccountId,
      debitAccountName: debitAcc.name,
      debitAccountType: debitAcc.accountType,
      creditAccountId,
      creditAccountName: creditAcc.name,
      creditAccountType: creditAcc.accountType,
      amount: Number(amount),
      date,
      dueDate: dueDate || '',
      narration: narration || '',
      personId: linkedPersonId,
      personName: linkedPersonName,
      personMobile: linkedPersonMobile,
      isSettled: false,
    });

    // If dueDate is specified for a personal account transaction, automatically add to Daily Task Manager!
    if (dueDate && (isPersonalCredit || isPersonalDebit)) {
      const taskAction = isPersonalCredit
        ? `Payment Due: Pay ₹${Number(amount).toLocaleString('en-IN')} to ${linkedPersonName}`
        : `Payment Due: Collect ₹${Number(amount).toLocaleString('en-IN')} from ${linkedPersonName}`;

      await Task.create({
        title: taskAction,
        description: `Double-Entry Ledger Due: ${debitAcc.name} (Dr) / ${creditAcc.name} (Cr). Narration: ${
          narration || 'No description'
        } ${linkedPersonMobile ? `| Contact: ${linkedPersonMobile}` : ''}`,
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
