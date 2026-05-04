# 🗺 TAS System — Detailed Roadmap

## Phase 0 — Foundation (1 week)

- [x] Скаффолд Next.js 16 + TS + Tailwind 4
- [x] Установить Supabase SSR клиент
- [x] Базовая структура папок (app router groups)
- [x] CSS-токены navy/gold
- [x] Initial commit + GitHub репозиторий
- [ ] Создать Supabase проект (Frankfurt)
- [ ] Создать Vercel проект, привязать к GitHub
- [ ] Настроить env vars в Vercel
- [ ] Купить домен `tas-crm.uz`
- [ ] Настроить Cloudflare DNS
- [ ] Подключить Sentry (frontend + edge)
- [ ] Подключить PostHog

## Phase 1 — Database (1-2 weeks)

- [x] Initial schema (organizations, profiles, clients, deals, tasks, contracts, audit_logs)
- [x] RLS политики (org isolation)
- [ ] Таблицы: warehouse_items, stock_movements
- [ ] Таблицы: finance_payments, finance_invoices, exchange_rates
- [ ] Таблицы: documents, document_versions
- [ ] Таблицы: communications (звонки/письма) + history
- [ ] Триггеры: audit_log на INSERT/UPDATE/DELETE
- [ ] Сид-данные из HTML-прототипа
- [ ] `supabase gen types` → `src/types/database.ts`
- [ ] Тесты RLS через pgTAP

## Phase 2 — Auth (3-5 days)

- [ ] Supabase Auth: email + password
- [ ] Magic link
- [ ] TOTP 2FA для admin
- [ ] Страницы: /login, /register, /forgot-password, /setup-2fa
- [ ] Middleware: защита /dashboard и subroutes
- [ ] Создание profile при регистрации (trigger handle_new_user)
- [ ] Audit log для login/logout

## Phase 3 — UI Modules (4-6 weeks)

Приоритет от критичного к второстепенному:

1. [ ] Dashboard — KPI + графики Recharts (2 дня)
2. [ ] Clients — CRUD, поиск, фильтры (4 дня)
3. [ ] Deals — Kanban + drag&drop через @dnd-kit (5 дней)
4. [ ] Tasks — список + календарь + уведомления (3 дня)
5. [ ] Contracts — генерация PDF через @react-pdf/renderer (5 дней)
6. [ ] Documents — Supabase Storage + превью (3 дня)
7. [ ] Warehouse — inventory + история движений (3 дня)
8. [ ] Finance — мультивалютность, курсы ЦБ РУз (4 дня)
9. [ ] History — журнал коммуникаций (2 дня)
10. [ ] Analytics — aggregation queries + графики (3 дня)
11. [ ] Employees — управление командой (2 дня)
12. [ ] Calculator — портирование из iframe (1 день)
13. [ ] Settings — профиль, уведомления, бэкапы (2 дня)

## Phase 4 — Realtime (1 week)

- [ ] Подписки на изменения сделок (live Kanban)
- [ ] Подписки на задачи
- [ ] Optimistic updates
- [ ] Presence: индикатор "кто онлайн"
- [ ] Conflict resolution (last-write-wins по updated_at)

## Phase 5 — Security (1 week)

- [ ] CSP headers в next.config.ts
- [ ] HSTS + другие security headers
- [ ] Rate limiting (Vercel Edge Middleware, 10 req/sec)
- [ ] Триггеры audit_logs для всех мутаций
- [ ] Страница "Удалить мои данные" (GDPR/152-ФЗ)
- [ ] Политика конфиденциальности (ru + uz)
- [ ] Тест RLS из браузера: попытка получить чужие данные

## Phase 6 — Backups (3 days)

- [ ] Включить Supabase Pro: daily auto-backup + PITR
- [ ] pg_cron job: ежедневный pg_dump → Cloudflare R2
- [ ] Кнопка "Скачать мои данные" (JSON-экспорт)
- [ ] Drill: восстановление из бэкапа за ≤30 минут (документировать)

## Phase 7 — Monitoring (3 days)

- [ ] Sentry: source maps, release tracking
- [ ] PostHog: события (login, deal_created, contract_signed)
- [ ] Vercel Analytics: Web Vitals
- [ ] Better Stack uptime monitoring
- [ ] Telegram-бот для алертов
- [ ] Health check `/api/health`

## Phase 8 — Testing (1-2 weeks)

- [ ] Vitest unit-тесты для бизнес-логики
- [ ] Playwright E2E:
  - login → создание клиента → создание сделки → перенос в "оплачено"
  - восстановление пароля
  - многопользовательский сценарий (2 браузера)
- [ ] k6 load test: 50 одновременных юзеров
- [ ] OWASP ZAP сканер

## Phase 9 — Go-Live (3 days)

- [ ] Production Supabase (отдельный от dev/staging)
- [ ] Production Vercel deploy
- [ ] DNS на Cloudflare → tas-crm.uz
- [ ] Импорт реальных данных
- [ ] Видео-инструкции (5-10 коротких роликов)
- [ ] Soft launch: 2-3 пилотных юзера на 1 неделю
- [ ] Full launch + мониторинг 72ч
