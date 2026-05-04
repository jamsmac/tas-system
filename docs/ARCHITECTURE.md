# Архитектура TAS System

> **TAS System** (TEXNIKA ADVANS SERVIS) — внутренняя CRM/ERP для торгово-сервисной компании, продающей агро- и спецтехнику в сегментах B2B/B2C, с полным циклом обслуживания (продажа → договор → поставка → ввод в эксплуатацию → гарантия → ТО/ремонт).
>
> Документ описывает целевую архитектуру: технологический стек, модули, доменную модель, контракты, безопасность, развёртывание и эволюционный план. Конкретный пофазный план — в [`ROADMAP.md`](./ROADMAP.md).

---

## 1. Цели системы

| Цель | Метрика успеха |
| --- | --- |
| Единая база клиентов и сделок (B2B/B2C) | < 1 источник истины, дубликаты < 1% |
| Прозрачная воронка продаж от лида до отгрузки | Time-to-close ↓ 20% YoY |
| Учёт остатков и резервов на нескольких складах | Расхождение факт/учёт ≤ 0.5% |
| Сервисный модуль: ремонты, гарантии, выезды | SLA по заявкам ≥ 95% |
| Финансовый контур: счета, оплаты, расходы | Закрытие месяца за 3 рабочих дня |
| Аналитика по продажам, рентабельности, складу | Дашборд обновляется ≤ 1 мин |

## 2. Бизнес-домены (целевая модель)

```
┌────────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   CRM      │ → │ Договоры │ → │  Склад   │ → │ Финансы  │
│ Клиенты    │   │ Контракты│   │ Поставки │   │ Счета    │
│ Сделки     │   │          │   │ Резервы  │   │ Платежи  │
│ Задачи     │   │          │   │ Движение │   │ Расходы  │
└────────────┘   └──────────┘   └──────────┘   └──────────┘
                                       ↓
                                ┌──────────┐
                                │  Сервис  │
                                │ Заявки   │
                                │ Гарантия │
                                │ Парк     │
                                └──────────┘
```

Полный граф зависимостей: [`docs/diagrams/modules.mermaid`](./diagrams/modules.mermaid).

## 3. Технологический стек

| Слой | Технология | Версия | Зачем именно она |
| --- | --- | --- | --- |
| Runtime | Node.js | ≥ 20.9 LTS | Требование Next 16 |
| Фреймворк | Next.js (App Router) | 16.2.4 | SSR + Server Components + Server Actions, Turbopack по умолчанию |
| UI | React | 19.2.4 | React Compiler включён в `next.config.ts` |
| Стили | Tailwind CSS | 4.x | `@theme inline`, CSS-переменные брендинга |
| Шрифты | next/font (Inter, Raleway, JetBrains Mono) | — | Кириллица, fallback'и |
| Язык | TypeScript | 5.x strict | Алиас `@/* → src/*` |
| БД | PostgreSQL | 15+ | Мульти-тенант, RLS, JSONB |
| Драйвер | `postgres` (postgres.js) | — | Тонкий, типизированный, без ORM-оверхеда; пул в `src/lib/db.ts` |
| Аутентификация | Собственная (email + bcrypt, TOTP-2FA) | — | Полный контроль, без зависимости от стороннего auth-провайдера |
| Email | Resend / SES (Phase 2) | — | Транзакционные письма (вход, восстановление) |
| Хранилище файлов | Cloudflare R2 / S3-совместимое | — | Документы, фото техники, аватары |
| Менеджер пакетов | pnpm (workspaces) | — | Воспроизводимый lockfile |
| Линтер | ESLint flat-config | 9.x | `eslint-config-next/core-web-vitals` + `typescript` |
| Деплой | Vercel + отдельный Postgres-провайдер | — | Edge Network, нативный Next 16; БД — Neon/Supabase Postgres/own |

> ⚠️ Next 16 переименовал middleware → **proxy** (`src/proxy.ts`, экспорт `proxy(request)`). Это уже учтено в скелете.
>
> ⚠️ В скелете подключён `@supabase/ssr` — он остаётся как опция, но **первичный путь данных** — `postgres.js` через `src/lib/db.ts`. Если в будущем перейдём полностью на Supabase, `postgres`-клиент выбрасывается и queries переписываются на `supabase.from(...)`.

## 4. Структура репозитория

```
tas-system/
├── docs/                      ← документация
│   ├── ARCHITECTURE.md        (этот файл)
│   ├── ROADMAP.md             (пофазный план)
│   └── diagrams/
│       ├── erd.mermaid
│       ├── modules.mermaid
│       ├── auth-flow.mermaid
│       ├── deal-flow.mermaid
│       └── service-flow.mermaid
├── db/
│   └── migrations/            ← plain SQL, применяются последовательно
│       ├── 0001_init.sql      (organizations, users, profiles, clients, deals,
│       │                       tasks, contracts, audit_logs, RLS, triggers)
│       └── 0002_seed_dev.sql  (dev: одна org + admin/manager + sample data)
├── public/
├── src/
│   ├── app/                   ← App Router
│   │   ├── (auth)/login/
│   │   ├── (app)/             ← защищённый раздел (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   ├── clients/{[id], page}.tsx
│   │   │   ├── deals/{[id], kanban, page}.tsx
│   │   │   ├── tasks/
│   │   │   ├── contracts/
│   │   │   ├── warehouse/{products, stock, movements, suppliers, page}.tsx
│   │   │   ├── service/{equipment, page}.tsx
│   │   │   ├── finance/{invoices, payments, expenses, accounts, page}.tsx
│   │   │   ├── analytics/
│   │   │   └── settings/{users, roles, company, page}.tsx
│   │   ├── api/health/route.ts ← liveness/DB ping
│   │   ├── layout.tsx
│   │   ├── page.tsx           ← redirect → /dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/{sidebar, topbar}.tsx
│   │   └── ui/{page-header, empty-state, status-badge, data-table}.tsx
│   ├── lib/
│   │   ├── db.ts              ← postgres pool + withUser(userId, fn) для RLS
│   │   ├── db/queries/        ← по одному файлу на домен (стабы → реальные SQL)
│   │   ├── supabase/          ← опциональный клиент, оставлен для совместимости
│   │   ├── types/             ← бизнес-типы, согласованы с enum'ами в SQL
│   │   └── utils/             ← formatters, validators
│   ├── types/database.ts      ← заполняется кодгеном (pg-to-ts/kysely-codegen)
│   └── proxy.ts               ← Next 16 proxy (auth-guard)
├── eslint.config.mjs
├── next.config.ts             ← reactCompiler: true
├── package.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
└── tsconfig.json
```

## 5. Доменная модель

### 5.1. Текущая (Phase 1 — `db/migrations/0001_init.sql`)

7 таблиц + RLS-политики:

- `organizations` — мульти-тенант якорь.
- `users` — собственная таблица: email, bcrypt-hash, TOTP-secret.
- `profiles` — расширение users в рамках organization (full_name, role enum, аватар, телефон). FK 1:1 с `users.id`.
- `clients` — клиенты (организация, контакт, тел, email, адрес).
- `deals` — сделки. `stage` enum: `lead | nego | kp | dog | opl | won | lost`.
- `tasks` — задачи (привязка к deal/client/profile, статус enum).
- `contracts` — договоры (статус enum, мультивалютность).
- `audit_logs` — журнал действий (entity, diff jsonb, IP, UA).

ENUM'ы:
- `user_role`: `admin | manager | viewer`
- `deal_stage`: `lead | nego | kp | dog | opl | won | lost`
- `currency`: `UZS | USD | EUR | CNY | RUB`
- `task_status`: `todo | in_progress | done | cancelled`
- `contract_status`: `draft | signed | paid | shipped | closed | cancelled`

### 5.2. Целевая модель (Phase 4–7)

Полная ER-схема: [`docs/diagrams/erd.mermaid`](./diagrams/erd.mermaid). Кратко:

- **Каталог + склад**: `categories`, `products`, `product_variants`, `suppliers`, `warehouses`, `stock_levels`, `stock_movements`, `purchase_orders`.
- **Сервис**: `equipment` (серийный учёт), `service_tickets`, `service_ticket_parts`, `warranties`.
- **Финансы**: `accounts`, `invoices` + `invoice_items`, `payments`, `expense_categories`, `expenses`.
- **Системные**: `attachments` (полиморфно), `notifications`.

Эти таблицы будут добавлены отдельными миграциями (`0003_warehouse.sql`, `0004_service.sql`, …) в порядке, заданном `ROADMAP.md`.

## 6. Безопасность

### 6.1. Аутентификация

Собственная: email + bcrypt + опциональный TOTP-2FA.
1. Пользователь вводит email/пароль на `/login` → server action проверяет хеш.
2. Если включён TOTP — запрашивается код, проверяется через `otplib`.
3. На успехе создаётся серверная сессия (HttpOnly + Secure + SameSite=Lax cookie с подписанным session-id, бекенд хранит сессию в Postgres-таблице `sessions`).
4. На каждый запрос `src/proxy.ts` извлекает session-id из cookie, грузит user'а, кладёт в request context. Если сессии нет / истекла → редирект на `/login`.
5. Все запросы к БД идут через `withUser(userId, fn)` — он начинает транзакцию и ставит `set_config('app.current_user_id', userId, true)`. Без этого RLS вернёт 0 строк.

Sequence-диаграмма: [`docs/diagrams/auth-flow.mermaid`](./diagrams/auth-flow.mermaid) (использует Supabase-вариант — обновится под собственный auth в Phase 2).

### 6.2. Row Level Security

Включена на всех бизнес-таблицах. Helper-функции:

```sql
current_user_id() → uuid     -- читает app.current_user_id
current_org_id()  → uuid     -- profiles.organization_id где id = current_user_id
current_user_role() → user_role
```

Политики:
- `organizations`: видна только своя.
- `profiles`: select по своей org; update только своего; admin — full access по org.
- `clients`/`deals`/`tasks`/`contracts`: «org isolation» — `organization_id = current_org_id()`.
- `audit_logs`: read-only по своей org.

**Защитное поведение**: если приложение забыло вызвать `withUser`, `current_user_id()` вернёт NULL → `current_org_id()` тоже NULL → `WHERE organization_id = NULL` всегда false → 0 строк. Никаких утечек.

## 7. Слои данных

```
┌─────────────────────────────────────────────────┐
│ Server Component / Server Action / Route Handler│
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  src/lib/db/queries/<domain>.ts                 │
│  • async listX, getX, mutateX                   │
│  • используют withUser(currentUser.id, ...)     │
│  • возвращают типизированные DTO                │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  src/lib/db.ts → postgres.js pool               │
│  withUser → SET LOCAL app.current_user_id → tx  │
│  → RLS ограничивает результат                   │
└─────────────────────────────────────────────────┘
```

Принципы:
- **Server Components читают данные напрямую через query-функции.**
- **Мутации — Server Actions** (`"use server"`). Валидируют вход (Zod), вызывают query-функцию, делают `revalidatePath`.
- **Сложная бизнес-логика — PL/pgSQL функции / транзакции в `withUser`**: резервирование товара, перевод между складами, закрытие сделки.

## 8. Сборка и развёртывание

- Локально: `pnpm dev` (Turbopack по умолчанию в Next 16).
- Прод: `pnpm build && pnpm start`.
- CI: `pnpm install --frozen-lockfile && pnpm lint && pnpm build`.
- Деплой: Vercel (auto-deploy на `main`).
- БД: внешний Postgres (Neon / Supabase Postgres / самохост). Connection string в `DATABASE_URL`.
- Миграции: применяются последовательно — `for f in db/migrations/*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done`.
- Переменные окружения: `DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

## 9. Производительность

- React Compiler — авто-мемоизация компонентов.
- Server Components везде, где не нужен интерактив.
- Стриминг: `<Suspense>` для медленных секций (например, аналитика).
- Индексы: см. SQL-миграции — везде, где есть FK + поля сортировки списков.
- Постраничная загрузка таблиц — keyset-пагинация по `created_at`.
- Тяжёлые отчёты — материализованные view (`mv_sales_daily`, `mv_stock_snapshot`), refresh по расписанию (`pg_cron`).

## 10. Эволюционный план

Подробный пофазный план — [`ROADMAP.md`](./ROADMAP.md). Сводка:

| Фаза | Содержание | Где |
| --- | --- | --- |
| Phase 0 | Foundation: Next 16, Tailwind, env, домен, мониторинг | ✅ |
| Phase 1 | DB schema + RLS (organizations → contracts) | ✅ частично |
| Phase 2 | Auth: email/password, TOTP, sessions, страницы /login и т.д. | план |
| Phase 3 | UI-модули: dashboard, CRM, contracts, documents (4–6 недель) | план |
| Phase 4 | Realtime (live kanban, presence) | план |
| Phase 5 | Security headers, rate limiting, GDPR-экспорт | план |
| Phase 6 | Backups + восстановление | план |
| Phase 7 | Monitoring (Sentry/PostHog/uptime) | план |
| Phase 8 | Тестирование (Vitest + Playwright + k6) | план |
| Phase 9 | Go-live: prod-окружение, импорт реальных данных | план |

## 11. Архитектурные решения, требующие фиксации

- **Локализация валют**: `amount NUMERIC(15,2) + currency` enum. Курсы — отдельная таблица `exchange_rates(date, from, to, rate)` (Phase 6 финансов).
- **НДС / акцизы / фискализация**: вне MVP, но колонки в `invoices` зарезервированы (`vat_rate`, `vat_amount`).
- **Multi-tenant**: внутренний (одна организация = одна компания-клиент TAS, если будет SaaS-подход). Уже учтено через `organization_id`.
- **Soft delete**: `deleted_at TIMESTAMPTZ NULL` + индекс `WHERE deleted_at IS NULL`. На триггерах не блокируем — приложение фильтрует.
- **Аудит**: пишется в `audit_logs` (Phase 1) + расширяется триггерами на ключевых таблицах (Phase 5).

---

## Приложения

- [ER-диаграмма](./diagrams/erd.mermaid) — целевая модель (Phase 4–7)
- [Граф модулей](./diagrams/modules.mermaid)
- [Auth flow](./diagrams/auth-flow.mermaid) — текущий вариант через Supabase-cookies (Phase 2 заменит на собственный)
- [Жизненный цикл сделки](./diagrams/deal-flow.mermaid)
- [Жизненный цикл сервисной заявки](./diagrams/service-flow.mermaid)
- SQL-миграции: `db/migrations/`
- Roadmap: [`ROADMAP.md`](./ROADMAP.md)
