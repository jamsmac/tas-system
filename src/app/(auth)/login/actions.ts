'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { sql } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, SESSION_COOKIE, SESSION_TTL_DAYS } from '@/lib/auth/session';

export type LoginResult = { error: string } | undefined;

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Введите email и пароль' };

  const rows = await sql<{ id: string; password_hash: string }[]>`
    select id, password_hash from users where email = ${email} limit 1
  `;

  // Always run verify even on missing user — мешает timing-атакам.
  const fakeHash =
    '$argon2id$v=19$m=19456,t=2,p=1$ZmFrZWZha2VmYWtlZmFrZQ$ZmFrZWZha2VmYWtlZmFrZWZha2VmYWtlZmFrZWZha2U';
  const candidate = rows[0] ?? { id: '', password_hash: fakeHash };

  const ok = await verifyPassword(password, candidate.password_hash);
  if (!ok || rows.length === 0) {
    return { error: 'Неверный email или пароль' };
  }

  const hdrs = await headers();
  const session = await createSession(candidate.id, {
    ip: hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? undefined,
    userAgent: hdrs.get('user-agent') ?? undefined,
  });

  await sql`update users set last_login_at = now() where id = ${candidate.id}`;

  const store = await cookies();
  store.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });

  redirect('/dashboard');
}
