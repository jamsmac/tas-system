import 'server-only';

import { sql } from '@/lib/db';

export const SESSION_COOKIE = 'tas_session';
export const SESSION_TTL_DAYS = 30;

export type SessionRow = {
  id: string;
  user_id: string;
  expires_at: Date;
};

export type SessionWithUser = {
  session: SessionRow;
  userId: string;
  email: string;
  profileId: string;
  organizationId: string;
  fullName: string;
  role: 'admin' | 'manager' | 'viewer';
  avatarColor: string;
};

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string } = {},
): Promise<SessionRow> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const [row] = await sql<SessionRow[]>`
    insert into sessions (user_id, expires_at, ip, user_agent)
    values (${userId}, ${expiresAt}, ${meta.ip ?? null}, ${meta.userAgent ?? null})
    returning id, user_id, expires_at
  `;
  return row;
}

export async function findSession(sessionId: string): Promise<SessionWithUser | null> {
  const rows = await sql<
    {
      session_id: string;
      user_id: string;
      expires_at: Date;
      email: string;
      profile_id: string;
      organization_id: string;
      full_name: string;
      role: SessionWithUser['role'];
      avatar_color: string;
    }[]
  >`
    select
      s.id            as session_id,
      s.user_id,
      s.expires_at,
      u.email,
      p.id            as profile_id,
      p.organization_id,
      p.full_name,
      p.role,
      p.avatar_color
    from sessions s
    join users    u on u.id = s.user_id
    join profiles p on p.id = u.id
    where s.id = ${sessionId}
      and s.expires_at > now()
    limit 1
  `;

  if (rows.length === 0) return null;
  const r = rows[0];

  // Touch last_used_at без блокировки запроса (best-effort).
  void sql`update sessions set last_used_at = now() where id = ${r.session_id}`;

  return {
    session: { id: r.session_id, user_id: r.user_id, expires_at: r.expires_at },
    userId: r.user_id,
    email: r.email,
    profileId: r.profile_id,
    organizationId: r.organization_id,
    fullName: r.full_name,
    role: r.role,
    avatarColor: r.avatar_color,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await sql`delete from sessions where id = ${sessionId}`;
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await sql`delete from sessions where user_id = ${userId}`;
}
