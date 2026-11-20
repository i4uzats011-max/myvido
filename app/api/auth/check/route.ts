import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, username: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false, username: null });
    }

    return NextResponse.json({
      authenticated: true,
      username: payload.username as string,
    });
  } catch {
    return NextResponse.json({ authenticated: false, username: null });
  }
}
