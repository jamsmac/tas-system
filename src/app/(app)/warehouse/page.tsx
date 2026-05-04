import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';

const TILES = [
  { href: '/warehouse/products',  icon: '🏷️', title: 'Товары',     desc: 'Каталог + категории' },
  { href: '/warehouse/stock',     icon: '📦', title: 'Остатки',    desc: 'По складам и SKU' },
  { href: '/warehouse/movements', icon: '🔁', title: 'Движение',   desc: 'Приход / расход / перемещение' },
  { href: '/warehouse/suppliers', icon: '🤝', title: 'Поставщики', desc: 'Контрагенты и заказы' },
];

export default function WarehouseOverviewPage() {
  return (
    <div className="p-6">
      <PageHeader title="Склад" icon="📦" subtitle="Каталог, остатки, движение" />
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
