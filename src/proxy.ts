import { NextResponse, type NextRequest } from 'next/server';

// Phase 2 (auth): здесь будет проверка cookie-сессии и редирект на /login
// для защищённых роутов. Пока — пропускаем все запросы.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
