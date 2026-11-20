import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'focustube-secret-key-2024-secure-jwt-token'
);

export async function createToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    await connectToDatabase();
    let dbUser = await User.findOne({ username: cleanUser });

    // Seed default admin if user collection has no admin yet
    if (!dbUser && cleanUser === 'admin') {
      dbUser = await User.create({
        username: 'admin',
        passwordHash: 'admin',
        role: 'admin',
      });
    }

    if (dbUser) {
      return dbUser.passwordHash === cleanPass;
    }

    // Default fallback
    return cleanUser === 'admin' && cleanPass === 'admin';
  } catch (err) {
    console.warn('MongoDB auth lookup warning, using fallback admin/admin:', err);
    return cleanUser === 'admin' && cleanPass === 'admin';
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
