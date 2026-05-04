import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/session';

const AUTH_PATHS = ['/login', '/register', '/forgot-password'];
const PUBLIC_API = ['/api/health', '/api/auth'];

/**
 * Edge-runtime gate — проверяет только наличие cookie, без обращения к БД.
 * Полная валидация сессии (SELECT FROM sessions) выполняется в (app)/layout.tsx
 * через requireUser() — это Node-runtime код.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasCookie = request.cookies.has(SESSION_COOKIE);
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!hasCookie && !isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasCookie && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
