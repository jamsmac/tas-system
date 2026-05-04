-- ════════════════════════════════════════════════════════════════
--  Dev seed: одна организация, admin + manager, тестовые данные
--  Эта миграция запускается ТОЛЬКО локально (через docker-entrypoint)
-- ════════════════════════════════════════════════════════════════

-- Organization
insert into organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'TEXNIKA ADVANS SERVIS', 'tas')
on conflict (slug) do nothing;

-- Users (пароли — bcrypt хеши от 'admin123' и 'manager123')
-- $2a$10$... сгенерировано: htpasswd -bnBC 10 "" admin123 | tr -d ':\n'
insert into users (id, email, password_hash, email_verified_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@tas.local',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now()),
  ('00000000-0000-0000-0000-0000000000a2', 'manager@tas.local',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now())
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

-- Sample clients
insert into clients (organization_id, name, type, contact_person, phone, created_by)
values
  ('00000000-0000-0000-0000-000000000001', 'ООО АгроТех', 'ООО', 'Каримов Б.', '+998901234567', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'TechnoImport', 'GmbH', 'Ли Вэй', '+998907654321', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-000000000001', 'ИП Рашидов', 'ИП', 'Рашидов Р.', '+998931112233', '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-000000000001', 'EuroTrade GmbH', 'GmbH', 'Smirnova E.', '+49301234567', '00000000-0000-0000-0000-0000000000a2');

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
