-- ════════════════════════════════════════════════════════════════
--  Dev seed: одна организация, admin + manager, тестовые данные
--  Эта миграция запускается ТОЛЬКО локально (через docker-entrypoint)
-- ════════════════════════════════════════════════════════════════

-- Organization
insert into organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'TEXNIKA ADVANS SERVIS', 'tas')
on conflict (slug) do nothing;

-- Users (пароли — argon2id хеши от 'admin123' и 'manager123')
-- Сгенерировано: node -e "require('@node-rs/argon2').hash(...)"
insert into users (id, email, password_hash, email_verified_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@tas.dev',
   '$argon2id$v=19$m=19456,t=2,p=1$p1f1B6BFKJgLN6sBAHmLEQ$gwcuLJOy2L5Agz5VE4ruCKTdRL5f9v3tMaU1H1IKsIQ',
   now()),
  ('00000000-0000-0000-0000-0000000000a2', 'manager@tas.dev',
   '$argon2id$v=19$m=19456,t=2,p=1$PFj4DOCuB67Zmp6mCvt3mw$ESLI33BarGeOKSWJahzaUr2pslyvIi0sahEkFHspA8g',
   now())
on conflict (email) do nothing;

-- Profiles
insert into profiles (id, organization_id, full_name, role, avatar_color)
values
  ('00000000-0000-0000-0000-0000000000a1',
   '00000000-0000-0000-0000-000000000001',
   'Мираюбов М.М.', 'admin', '#c9a227'),
  ('00000000-0000-0000-0000-0000000000a2',
   '00000000-0000-0000-0000-000000000001',
   'Иванов А.', 'manager', '#4a90e2')
on conflict (id) do nothing;

-- Sample clients (после миграции 0004 — с inn/pinfl/segment)
insert into clients (organization_id, name, type, inn, pinfl, contact_person, phone, email, segment, address, created_by)
values
  ('00000000-0000-0000-0000-000000000001', 'ООО АгроТех',                    'b2b', '301234567', null, 'Каримов Б.',   '+998901234567', null,                          'Крупный',   'г. Ташкент, ул. Амира Темура 15', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'TechnoImport',                   'b2b', '305566778', null, 'Ли Вэй',       '+998907654321', null,                          'Средний',   'г. Ташкент, Чиланзар-7',          '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'ИП Рашидов',                     'b2c', null, '30505198512345', 'Рашидов Р.',   '+998931112233', null,                          'Малый',     'г. Самарканд, ул. Регистан 5',    '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-000000000001', 'EuroTrade GmbH',                 'b2b', '311223344', null, 'Smirnova E.',  '+49301234567',  null,                          'Крупный',   'Berlin, Friedrichstr. 43',        '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-000000000001', 'ООО ТехСервис',                  'b2b', '302345678', null, 'Юлдашев А.',   '+998901112233', 'info@techservice.uz',         'Средний',   'г. Ташкент, Юнусабад-12',         '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'Хокимият Самаркандской области', 'gov', '300000123', null, 'Каримов Б.Б.', '+998662223344', 'office@samarkand.gov.uz',     'Госсектор', 'г. Самарканд, ул. Регистан 1',    '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'Silk Road Trading',              'b2b', '309988776', null, 'Ли Чжан',      '+998935554433', 'silk@road.uz',                'Крупный',   'г. Ташкент, Сергели',             '00000000-0000-0000-0000-0000000000a2');

-- Sample deals (12 сделок из HTML-прототипа, упрощённо)
insert into deals (organization_id, client_id, manager_id, name, stage, amount, currency, probability, deadline)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  '00000000-0000-0000-0000-0000000000a2'::uuid,
  d.name, d.stage::deal_stage, d.amount, d.curr::currency, d.prob, d.dl::date
from clients c
cross join lateral (values
  ('Поставка агротехники — Партия №3', 'kp',   8200,    'USD', 70, '2026-05-15'),
  ('Сервисный контракт 2026',          'nego', 5000,    'USD', 45, '2026-05-20'),
  ('Оборудование — Линия А',           'nego', 180000,  'CNY', 55, '2026-05-25'),
  ('Запчасти — Ежемесячная поставка',  'dog',  8500000, 'UZS', 85, '2026-05-10')
) as d(name, stage, amount, curr, prob, dl)
where c.organization_id = '00000000-0000-0000-0000-000000000001'
limit 12;

-- Sample tasks
insert into tasks (organization_id, assigned_to, title, status, due_date, created_by)
values
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a2',
   'Перезвонить клиенту АгроТех',
   'todo', now() + interval '2 days',
   '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a2',
   'Подготовить КП для TechnoImport',
   'in_progress', now() + interval '5 days',
   '00000000-0000-0000-0000-0000000000a1');
