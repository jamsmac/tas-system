import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';

const TILES = [
  { href: '/finance/invoices', icon: '🧾', title: 'Счета',     desc: 'Выставленные клиентам' },
  { href: '/finance/payments', icon: '💸', title: 'Платежи',   desc: 'Приход и расход' },
  { href: '/finance/expenses', icon: '📉', title: 'Расходы',   desc: 'Затраты по категориям' },
  { href: '/finance/accounts', icon: '🏦', title: 'Счета компании', desc: 'Касса, банк, валюта' },
];

export default function FinanceOverviewPage() {
  return (
    <div className="p-6">
      <PageHeader title="Финансы" icon="💰" subtitle="Счета, платежи, расходы" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
