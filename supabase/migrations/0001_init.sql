-- ════════════════════════════════════════════════════════════════
--  TAS System — initial schema
--  Phase 1: organizations, profiles, clients, deals, tasks,
--           contracts, audit_logs + RLS policies
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── ENUMS ──────────────────────────────────────────────────────
create type user_role as enum ('admin', 'manager', 'viewer');
create type deal_stage as enum ('lead', 'nego', 'kp', 'dog', 'opl', 'won', 'lost');
create type currency as enum ('UZS', 'USD', 'EUR', 'CNY', 'RUB');
create type task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type contract_status as enum ('draft', 'signed', 'paid', 'shipped', 'closed', 'cancelled');

-- ─── ORGANIZATIONS ──────────────────────────────────────────────
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── PROFILES (extends auth.users) ──────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete restrict,
  full_name text not null,
  role user_role not null default 'manager',
  avatar_color text default '#c9a227',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_org_idx on profiles(organization_id);

-- ─── CLIENTS ────────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index clients_org_idx on clients(organization_id) where deleted_at is null;

-- ─── DEALS ──────────────────────────────────────────────────────
create table deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  manager_id uuid references profiles(id) on delete set null,
  name text not null,
  stage deal_stage not null default 'lead',
  amount numeric(15, 2),
  currency currency not null default 'UZS',
  probability int check (probability between 0 and 100) default 20,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index deals_org_stage_idx on deals(organization_id, stage);
create index deals_manager_idx on deals(manager_id);

-- ─── TASKS ──────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  due_date timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index tasks_assignee_idx on tasks(assigned_to) where status != 'done';

-- ─── CONTRACTS ──────────────────────────────────────────────────
create table contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  client_id uuid not null references clients(id),
  number text not null,
  status contract_status not null default 'draft',
  amount numeric(15, 2) not null,
  currency currency not null default 'UZS',
  signed_at date,
  paid_at date,
  shipped_at date,
  data jsonb default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index contracts_org_number_idx on contracts(organization_id, number);

-- ─── AUDIT LOGS ─────────────────────────────────────────────────
create table audit_logs (
  id bigserial primary key,
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_org_created_idx on audit_logs(organization_id, created_at desc);

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table deals enable row level security;
alter table tasks enable row level security;
alter table contracts enable row level security;
alter table audit_logs enable row level security;

-- Helper: текущая организация юзера
create or replace function current_org_id() returns uuid
  language sql stable security definer
as $$
  select organization_id from profiles where id = auth.uid()
$$;

create or replace function current_user_role() returns user_role
  language sql stable security definer
as $$
  select role from profiles where id = auth.uid()
$$;

-- ─── ORGANIZATIONS ──────────────────────────────────────────────
create policy "users see own org" on organizations
  for select using (id = current_org_id());

-- ─── PROFILES ───────────────────────────────────────────────────
create policy "users see profiles in own org" on profiles
  for select using (organization_id = current_org_id());

create policy "users update own profile" on profiles
  for update using (id = auth.uid());

create policy "admin manages profiles" on profiles
  for all using (organization_id = current_org_id() and current_user_role() = 'admin');

-- ─── CLIENTS / DEALS / TASKS / CONTRACTS ────────────────────────
create policy "org isolation: clients" on clients
  for all using (organization_id = current_org_id());

create policy "org isolation: deals" on deals
  for all using (organization_id = current_org_id());

create policy "org isolation: tasks" on tasks
  for all using (organization_id = current_org_id());

create policy "org isolation: contracts" on contracts
  for all using (organization_id = current_org_id());

create policy "audit logs read in own org" on audit_logs
  for select using (organization_id = current_org_id());

-- ════════════════════════════════════════════════════════════════
--  TRIGGERS: updated_at автообновление
-- ════════════════════════════════════════════════════════════════

create or replace function set_updated_at() returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger clients_updated before update on clients
  for each row execute function set_updated_at();
create trigger deals_updated before update on deals
  for each row execute function set_updated_at();
create trigger contracts_updated before update on contracts
  for each row execute function set_updated_at();
