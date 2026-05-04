import 'server-only';

import { cookies } from 'next/headers';

import { findSession, SESSION_COOKIE, type SessionWithUser } from './session';

/**
 * Возвращает текущего юзера (со всем контекстом профиля и организации)
 * или null, если cookie нет / сессия истекла / удалена.
 *
 * Безопасно использовать в Server Components, Server Actions, route handlers.
 */
export async function getCurrentUser(): Promise<SessionWithUser | null> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return findSession(sessionId);
}

/**
 * Same as getCurrentUser, but throws if not authenticated.
 * Используй в защищённых страницах после того, как proxy.ts уже сделал гейт —
 * это лишь страховка от рассинхрона.
 */
export async function requireUser(): Promise<SessionWithUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized: no active session');
  return user;
}
