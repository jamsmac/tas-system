import { type NextRequest, NextResponse } from 'next/server';

import { revokeSession, SESSION_COOKIE } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await revokeSession(sessionId);
  }

  const response = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
