import { type NextRequest, NextResponse } from 'next/server';

import { revokeSession, SESSION_COOKIE } from '@/lib/auth/session';

/**
 * Очистка stale-сессии: срабатывает, когда cookie прошла Edge-proxy,
 * но в БД сессии нет (истекла, удалена админом, повреждена).
 * Layout редиректит сюда вместо прямого cookies().delete() — в Server
 * Component модификация cookie запрещена Next.js 16.
 */
async function handler(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await revokeSession(sessionId).catch(() => {
      /* fine: уже удалена */
    });
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

export const GET = handler;
export const POST = handler;
