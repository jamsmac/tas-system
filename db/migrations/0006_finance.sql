-- ════════════════════════════════════════════════════════════════
--  Phase 3.7 — Finance: счета, оплаты, курсы валют
-- ════════════════════════════════════════════════════════════════

create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type payment_direction as enum ('in', 'out');

-- ─── INVOICES ───────────────────────────────────────────────────
create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  contract_id uuid references contracts(id) on delete set null,
  number text not null,
  status invoice_status not null default 'draft',
  amount numeric(15, 2) not null,
  paid_amount numeric(15, 2) not null default 0,
  currency currency not null default 'UZS',
  issued_at date not null default current_date,
  due_at date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index invoices_org_number_idx on invoices(organization_id, number);
create index invoices_client_idx on invoices(client_id);
create trigger invoices_updated before update on invoices
  for each row execute function set_updated_at();

-- ─── PAYMENTS ───────────────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  direction payment_direction not null,
  account_name text not null,           -- "Сум-счёт UZSBANK", "USD-счёт KAPITAL"
  amount numeric(15, 2) not null,
  currency currency not null default 'UZS',
  paid_at date not null default current_date,
  reference text,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index payments_org_paid_idx on payments(organization_id, paid_at desc);
create index payments_invoice_idx on payments(invoice_id);

-- ─── EXCHANGE RATES (ЦБ РУз, дневные) ───────────────────────────
create table exchange_rates (
  date date not null,
  currency currency not null,
  rate_uzs numeric(15, 4) not null,
  primary key (date, currency)
);

-- ─── RLS ────────────────────────────────────────────────────────
alter table invoices       enable row level security;
alter table payments       enable row level security;
alter table exchange_rates enable row level security;

create policy "org isolation: invoices" on invoices
  for all using (organization_id = current_org_id());
create policy "org isolation: payments" on payments
  for all using (organization_id = current_org_id());
-- exchange_rates — публичный справочник (нет org-привязки)
create policy "rates readable to all authed" on exchange_rates
  for select using (current_user_id() is not null);

-- ─── SEED ───────────────────────────────────────────────────────
insert into invoices (organization_id, client_id, number, status, amount, paid_amount, currency, issued_at, due_at, created_by)
select '00000000-0000-0000-0000-000000000001'::uuid,
       c.id, 'INV-2026-' || lpad((row_number() over ())::text, 4, '0'),
       (array['draft','sent','paid','overdue']::invoice_status[])[1 + (row_number() over () % 4)],
       (random() * 50_000_000 + 5_000_000)::numeric(15,2),
       0::numeric(15,2),
       'UZS'::currency,
       current_date - (row_number() over () || ' days')::interval,
       current_date + ((10 - (row_number() over ())) || ' days')::interval,
       '00000000-0000-0000-0000-0000000000a1'::uuid
from clients c
where c.organization_id = '00000000-0000-0000-0000-000000000001'
  and c.deleted_at is null
limit 5;

insert into payments (organization_id, client_id, direction, account_name, amount, currency, paid_at, reference, note, created_by)
values
  ('00000000-0000-0000-0000-000000000001', (select id from clients where name='ООО АгроТех'),  'in',  'Сум-счёт UZSBANK', 25_000_000, 'UZS', current_date - 3, 'PP-1234', 'Аванс по договору', '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-000000000001', (select id from clients where name='TechnoImport'), 'in',  'USD-счёт KAPITAL', 8_200,      'USD', current_date - 5, 'SWIFT-7799', 'Оплата за партию', '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-000000000001', null,                                                 'out', 'Сум-счёт UZSBANK', 4_200_000,  'UZS', current_date - 1, 'PAY-9001', 'Аренда офиса 04/2026', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', null,                                                 'out', 'Сум-счёт UZSBANK', 1_800_000,  'UZS', current_date,     'SAL-04',   'ЗП техник Турсунов',  '00000000-0000-0000-0000-0000000000a1');

-- Заглушка курсов (актуальные пусть подтягивает Edge Function от cbu.uz)
insert into exchange_rates (date, currency, rate_uzs) values
  (current_date, 'USD', 12_500),
  (current_date, 'EUR', 13_400),
  (current_date, 'CNY',  1_720),
  (current_date, 'RUB',    134),
  (current_date, 'UZS',      1)
on conflict do nothing;
