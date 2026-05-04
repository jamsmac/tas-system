-- ════════════════════════════════════════════════════════════════
--  Phase 3 — Clients module: бизнес-поля для клиентов
--    type    — enum (b2b/b2c/gov/other)
--    inn     — СТИР (9 цифр) для юр.лиц / ИНН РФ
--    pinfl   — ПИНФЛ (14 цифр) для физ.лиц Узбекистана
--    segment — Малый/Средний/Крупный (свободный текст)
-- ════════════════════════════════════════════════════════════════

-- 1) Новый enum
create type client_type as enum ('b2b', 'b2c', 'gov', 'other');

-- 2) Конвертируем существующую колонку text → enum.
--    Старые значения ('ООО','ИП','GmbH','...') приводим к 'b2b'.
alter table clients
  alter column type drop default,
  alter column type type client_type
    using case
      when type in ('b2c','retail','individual') then 'b2c'::client_type
      when type in ('gov','government')          then 'gov'::client_type
      when type is null or type = ''             then 'other'::client_type
      else 'b2b'::client_type
    end,
  alter column type set default 'b2b'::client_type,
  alter column type set not null;

-- 3) Новые колонки
alter table clients
  add column if not exists inn     text,
  add column if not exists pinfl   text,
  add column if not exists segment text;

-- 4) Constraints на формат (мягкие — только если значение задано)
alter table clients
  add constraint clients_inn_format   check (inn   is null or inn   ~ '^[0-9]{9,14}$'),
  add constraint clients_pinfl_format check (pinfl is null or pinfl ~ '^[0-9]{14}$');

-- 5) Индекс для поиска по inn (часто ищут точно)
create unique index clients_org_inn_idx on clients(organization_id, inn) where inn is not null and deleted_at is null;
