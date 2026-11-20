import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Account } from '@/lib/models/Account';
import { Transaction } from '@/lib/models/Transaction';
import { Person } from '@/lib/models/Person';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Seed default Real and Nominal accounts if none exist
    const count = await Account.countDocuments();
    if (count === 0) {
      await Account.create([
        { name: 'Cash in Hand', accountType: 'real', openingBalance: 0, description: 'Primary cash register' },
        { name: 'Bank Account', accountType: 'real', openingBalance: 0, description: 'Main business / personal bank' },
        { name: 'Sales & Service Income', accountType: 'nominal', openingBalance: 0, description: 'General revenue' },
        { name: 'Office & Travel Expenses', accountType: 'nominal', openingBalance: 0, description: 'General operational expenses' },
        { name: 'Office Rent & Utilities', accountType: 'nominal', openingBalance: 0, description: 'Fixed recurring expenses' },
      ]);
    }

    // Also ensure all existing Persons have a corresponding Personal Account
    const allPersons = await Person.find({}).lean();
    for (const p of allPersons) {
      const existing = await Account.findOne({ personId: p._id as any });
      if (!existing) {
        await Account.create({
          name: p.name,
          accountType: 'personal',
          personId: p._id as any,
          personMobile: p.mobile || '',
          openingBalance: p.openingBalance || 0,
          openingBalanceRemark: (p as any).openingBalanceRemark || '',
          description: p.notes || `Personal Account for ${p.name}`,
        });
      }
    }

    const query: Record<string, unknown> = {};
    if (type && type !== 'all') {
      query.accountType = type;
    }

    const accounts = await Account.find(query).sort({ accountType: 1, name: 1 }).lean();

    // Compute live balance for every account using Double-Entry ledger:
    // Debit side adds to debit balance; Credit side subtracts (or vice versa for credit accounts)
    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc: any) => {
        const debitTxs: any[] = await Transaction.find({ debitAccountId: acc._id }).lean();
        const creditTxs: any[] = await Transaction.find({ creditAccountId: acc._id }).lean();

        const totalDebit = debitTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalCredit = creditTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // For Real & Personal Asset: Balance = Opening + Total Debit - Total Credit
        // Positive = Debit balance (Asset / Receivable from person)
        // Negative = Credit balance (Liability / Payable to person)
        const netBalance = (Number(acc.openingBalance) || 0) + totalDebit - totalCredit;

        return {
          ...acc,
          totalDebit,
          totalCredit,
          netBalance,
        };
      })
    );

    return NextResponse.json({ accounts: accountsWithBalance });
  } catch (error: unknown) {
    console.error('Accounts GET error:', error);
    return NextResponse.json({ accounts: [], error: 'Failed to fetch accounts' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, accountType, openingBalance, openingBalanceRemark, description, personMobile } = body;

    if (!name || !accountType) {
      return NextResponse.json(
        { error: 'name and accountType (personal, real, nominal) are required' },
        { status: 400 }
      );
    }

    let linkedPersonId = null;
    if (accountType === 'personal') {
      // Create corresponding Person profile if not exists
      let p = await Person.findOne({ name: name.trim() });
      if (!p) {
        p = await Person.create({
          name: name.trim(),
          mobile: personMobile?.trim() || '',
          category: 'customer',
          openingBalance: Number(openingBalance) || 0,
          openingBalanceRemark: openingBalanceRemark || '',
          notes: description || '',
        });
      }
      linkedPersonId = p._id;
    }

    const account = await Account.create({
      name: name.trim(),
      accountType,
      personId: (linkedPersonId as any) || undefined,
      personMobile: personMobile?.trim() || '',
      openingBalance: Number(openingBalance) || 0,
      openingBalanceRemark: openingBalanceRemark || '',
      description: description || '',
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: unknown) {
    console.error('Accounts POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
