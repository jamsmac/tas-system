-- ════════════════════════════════════════════════════════════════
--  Phase 2 — server-side sessions
--  Один user может иметь множество сессий (разные браузеры/устройства).
--  Cookie хранит только session.id (opaque uuid) — без content.
-- ════════════════════════════════════════════════════════════════

create table sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  expires_at   timestamptz not null,
  last_used_at timestamptz not null default now(),
  ip           inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index sessions_user_idx    on sessions(user_id);
create index sessions_expires_idx on sessions(expires_at);

-- Cron-задача очистки истёкших сессий (Phase 6 настроит pg_cron).
-- А пока — функцию можно дёргать руками или из приложения.
create or replace function purge_expired_sessions() returns int
  language sql
as $$
  with deleted as (
    delete from sessions where expires_at < now() returning 1
  )
  select count(*)::int from deleted;
$$;
