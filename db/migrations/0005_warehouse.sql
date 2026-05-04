-- ════════════════════════════════════════════════════════════════
--  Phase 3.6 — Warehouse: товары, склады, остатки, движение
-- ════════════════════════════════════════════════════════════════

create type stock_movement_kind as enum ('receipt', 'issue', 'transfer', 'adjustment', 'reserve');

-- ─── WAREHOUSES ─────────────────────────────────────────────────
create table warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index warehouses_org_idx on warehouses(organization_id);

-- ─── PRODUCTS (catalog) ─────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sku text not null,
  name text not null,
  brand text,
  category text,
  unit text not null default 'шт',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index products_org_sku_idx on products(organization_id, sku);
create trigger products_updated before update on products
  for each row execute function set_updated_at();

-- ─── STOCK MOVEMENTS (event sourcing) ───────────────────────────
create table stock_movements (
  id bigserial primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  warehouse_id uuid not null references warehouses(id) on delete restrict,
  product_id uuid not null references products(id) on delete restrict,
  kind stock_movement_kind not null,
  qty numeric(15, 3) not null,    -- positive = приход, negative = расход
  reference text,                  -- ссылка на сделку/договор/инвентаризацию
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index stock_movements_org_idx on stock_movements(organization_id, created_at desc);
create index stock_movements_product_idx on stock_movements(product_id, created_at desc);

-- ─── VIEW: текущие остатки ──────────────────────────────────────
create view stock_balances as
  select
    sm.organization_id,
    sm.warehouse_id,
    sm.product_id,
    sum(sm.qty) as quantity
  from stock_movements sm
  group by sm.organization_id, sm.warehouse_id, sm.product_id;

-- ─── RLS ────────────────────────────────────────────────────────
alter table warehouses      enable row level security;
alter table products        enable row level security;
alter table stock_movements enable row level security;

create policy "org isolation: warehouses"      on warehouses
  for all using (organization_id = current_org_id());
create policy "org isolation: products"        on products
  for all using (organization_id = current_org_id());
create policy "org isolation: stock_movements" on stock_movements
  for all using (organization_id = current_org_id());

-- ─── SEED ───────────────────────────────────────────────────────
insert into warehouses (id, organization_id, name, address, is_default)
values
  ('00000000-0000-0000-0000-0000000000b1'::uuid,
   '00000000-0000-0000-0000-000000000001'::uuid,
   'Главный склад (Ташкент)',
   'г. Ташкент, ул. Богишамол 12', true),
  ('00000000-0000-0000-0000-0000000000b2'::uuid,
   '00000000-0000-0000-0000-000000000001'::uuid,
   'Самаркандский филиал',
   'г. Самарканд, ул. Дагбитская 7', false);

insert into products (id, organization_id, sku, name, brand, category, unit)
values
  ('00000000-0000-0000-0000-0000000000c1'::uuid,
   '00000000-0000-0000-0000-000000000001'::uuid,
   'MTZ-892', 'Трактор МТЗ-892', 'Беларус', 'Тракторы', 'шт'),
  ('00000000-0000-0000-0000-0000000000c2'::uuid,
   '00000000-0000-0000-0000-000000000001'::uuid,
   'OIL-15W40', 'Масло моторное 15W-40 (20л)', 'Lukoil', 'Масла', 'канистра'),
  ('00000000-0000-0000-0000-0000000000c3'::uuid,
   '00000000-0000-0000-0000-000000000001'::uuid,
   'TIRE-18-4-30', 'Шина 18.4-30', 'BKT', 'Шины', 'шт');

-- Стартовые остатки
insert into stock_movements (organization_id, warehouse_id, product_id, kind, qty, note, created_by)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1', 'receipt', 5,    'Стартовый остаток', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c2', 'receipt', 120,  'Стартовый остаток', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c3', 'receipt', 40,   'Стартовый остаток', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000c2', 'receipt', 35,   'Стартовый остаток (Самарканд)', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c2', 'issue',  -8,   'Расход на сделку #003', '00000000-0000-0000-0000-0000000000a2');
