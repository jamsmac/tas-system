import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';

const TILES = [
  { href: '/settings/users',   icon: '👥', title: 'Пользователи', desc: 'Сотрудники и доступы' },
  { href: '/settings/roles',   icon: '🛡️', title: 'Роли',         desc: 'Права и политики RLS' },
  { href: '/settings/company', icon: '🏢', title: 'Компания',     desc: 'Реквизиты, валюты, нумерация' },
];

export default function SettingsOverviewPage() {
  return (
    <div className="p-6">
      <PageHeader title="Настройки" icon="⚙️" subtitle="Системные параметры" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="bg-white border border-bg-2 rounded-2xl p-5 hover:border-gold/40 transition-colors"
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-display font-bold text-navy">{t.title}</div>
            <div className="text-xs text-text-mid mt-1">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
