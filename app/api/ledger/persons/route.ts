import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Person } from '@/lib/models/Person';
import { Transaction } from '@/lib/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q');
    const category = searchParams.get('category');

    const query: Record<string, unknown> = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const persons = await Person.find(query).sort({ name: 1 }).lean();

    // Compute live balance for each person from transactions
    const personsWithBalance = await Promise.all(
      persons.map(async (p: any) => {
        const txs: any[] = await Transaction.find({ personId: p._id as any }).lean();
        let totalGiven = 0; // Money we gave them (Receivable)
        let totalTaken = 0; // Money they gave us (Payable)

        txs.forEach((t) => {
          if (t.type === 'given') totalGiven += Number(t.amount) || 0;
          if (t.type === 'taken') totalTaken += Number(t.amount) || 0;
        });

        const netBalance = (Number(p.openingBalance) || 0) + totalGiven - totalTaken;

        return {
          ...p,
          totalGiven,
          totalTaken,
          netBalance,
          transactionCount: txs.length,
        };
      })
    );

    return NextResponse.json({ persons: personsWithBalance });
  } catch (error: unknown) {
    console.error('Persons GET error:', error);
    return NextResponse.json({ persons: [], error: 'Failed to fetch persons' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      name,
      mobile,
      email,
      category,
      dob,
      anniversary,
      address,
      bankAccountNo,
      ifscCode,
      bankName,
      upiId,
      notes,
      remarksHistory,
      openingBalance,
      customFields,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const person = await Person.create({
      name: name.trim(),
      mobile: mobile?.trim() || '',
      email: email?.trim() || '',
      category: category || 'customer',
      dob: dob || '',
      anniversary: anniversary || '',
      address: address || '',
      bankAccountNo: bankAccountNo?.trim() || '',
      ifscCode: ifscCode?.trim() || '',
      bankName: bankName || '',
      upiId: upiId?.trim() || '',
      notes: notes || '',
      remarksHistory: remarksHistory || [],
      openingBalance: Number(openingBalance) || 0,
      customFields: customFields || [],
    });

    return NextResponse.json({ person }, { status: 201 });
  } catch (error: unknown) {
    console.error('Persons POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create person';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
