import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json(
        { error: 'New password must be at least 3 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const username = String(session.username).toLowerCase();
    let dbUser = await User.findOne({ username });

    if (!dbUser) {
      // Seed if missing
      dbUser = await User.create({
        username,
        passwordHash: 'admin',
        role: 'admin',
      });
    }

    if (currentPassword !== undefined && dbUser.passwordHash !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password does not match' },
        { status: 400 }
      );
    }

    dbUser.passwordHash = newPassword;
    dbUser.updatedAt = new Date();
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: unknown) {
    console.error('Password change error:', error);
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
