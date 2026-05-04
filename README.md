# 🏛 TAS System — TEXNIKA ADVANS SERVIS

CRM/ERP для управления продажами агро- и техоборудования.
Перенос монолитного HTML-прототипа на полноценный production-стек.

## 🛠 Стек

- **Frontend:** Next.js 16 (App Router, RSC, Turbopack) + TypeScript + Tailwind 4
- **UI:** shadcn/ui + кастомная тема (navy `#1a2744` / gold `#c9a227`)
- **Backend:** Supabase (Postgres 15 + Auth + Realtime + Storage)
- **Deploy:** Vercel + Supabase Cloud (Frankfurt)
- **Мониторинг:** Sentry + PostHog
- **Email:** Resend

## 📐 Архитектура

```
┌──────────────────┐      HTTPS      ┌─────────────────────┐
│  Next.js 16 SSR  │ ─────────────→  │  Supabase           │
│  (Vercel)        │                 │  ├─ Postgres + RLS  │
│                  │ ←── Realtime ── │  ├─ Auth (JWT+TOTP) │
└──────────────────┘     WebSocket   │  ├─ Storage         │
                                     │  └─ Edge Functions  │
                                     └─────────────────────┘
```

## 🚀 Запуск локально

```bash
pnpm install
cp .env.example .env.local         # заполнить Supabase ключи
pnpm dev                           # http://localhost:3000
```

## 🗺 Roadmap (9 фаз, ~8-10 недель full-time)

| Фаза | Содержание | Срок |
|---|---|---|
| **0. Foundation** | Скаффолд Next.js + Supabase + Vercel + домен | 1 нед |
| **1. Database** | SQL-схема (~18 таблиц) + RLS-политики + миграции | 1-2 нед |
| **2. Auth** | Supabase Auth + 2FA + middleware + страницы login/register | 3-5 дн |
| **3. UI Modules** | 13 модулей: Dashboard, Clients, Deals, Tasks, Contracts, etc. | 4-6 нед |
| **4. Realtime** | WebSocket-подписки, optimistic updates, presence | 1 нед |
| **5. Security** | CSP, rate limiting, audit logs, GDPR/152-ФЗ | 1 нед |
| **6. Backups** | pg_cron + R2 + drill восстановления | 3 дн |
| **7. Monitoring** | Sentry + PostHog + uptime + Telegram-алерты | 3 дн |
| **8. Testing** | Vitest + Playwright + k6 load test | 1-2 нед |
| **9. Go-Live** | Production deploy + soft launch + обучение | 3 дн |

Подробнее: [docs/ROADMAP.md](docs/ROADMAP.md) и GitHub Issues / Milestones.

## 💰 Стоимость инфраструктуры

| Сервис | Tier | Цена/мес |
|---|---|---|
| Supabase Pro | 8GB БД, daily backup, PITR | $25 |
| Vercel Pro | preview deployments, team | $20 |
| Sentry Team | 50K events | $26 |
| Email (Resend) | 3000/мес | $0 |
| Cloudflare R2 | бэкапы ~50GB | $0.75 |
| Domain `.uz` | годовой / 12 | $1.25 |
| **Итого** | | **~$73/мес** |

## 📂 Структура

```
src/
├── app/
│   ├── (auth)/          # login, register, forgot-password
│   ├── (app)/           # защищённая зона: dashboard, clients, deals, ...
│   ├── layout.tsx       # root layout с шрифтами
│   └── globals.css      # CSS-токены navy/gold
├── components/
│   ├── ui/              # shadcn/ui
│   └── layout/          # sidebar, topbar
├── lib/
│   └── supabase/        # client.ts / server.ts / middleware.ts
├── types/
│   └── database.ts      # auto-generated из Supabase
└── middleware.ts        # сессия + защита роутов

supabase/
└── migrations/
    └── 0001_init.sql    # initial schema + RLS
```

## 🔐 Безопасность

- **Row Level Security** на всех таблицах — multi-tenant изоляция на уровне БД
- **2FA TOTP** обязательно для admin-роли
- **Audit logs** для всех мутаций
- **HTTPS only** + security headers (CSP, HSTS, X-Frame-Options)
- **Rate limiting** через Vercel Edge Middleware

## 📜 Лицензия

Proprietary © 2026 TEXNIKA ADVANS SERVIS
