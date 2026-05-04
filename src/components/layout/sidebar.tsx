'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { section: 'Главное', items: [{ href: '/dashboard', icon: '📊', label: 'Дашборд' }] },
  {
    section: 'CRM',
    items: [
      { href: '/clients', icon: '👥', label: 'Клиенты' },
      { href: '/deals', icon: '💼', label: 'Сделки' },
      { href: '/tasks', icon: '✅', label: 'Задачи' },
      { href: '/contracts', icon: '📄', label: 'Договоры' },
    ],
  },
  {
    section: 'Операции',
    items: [
      { href: '/warehouse', icon: '📦', label: 'Склад' },
      { href: '/finance', icon: '💰', label: 'Финансы' },
      { href: '/analytics', icon: '📈', label: 'Аналитика' },
    ],
  },
  { section: 'Система', items: [{ href: '/settings', icon: '⚙️', label: 'Настройки' }] },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[var(--sidebar-w)] h-screen bg-navy-dark flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="px-4 py-4 border-b border-gold/20">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gold rounded-[9px] flex items-center justify-center font-display font-black text-[13px] text-navy-dark">
            TAS
          </div>
          <div>
            <div className="font-display font-extrabold text-[13px] text-white leading-tight">
              TAS System
            </div>
            <div className="text-[10px] text-gold mt-px">TEXNIKA ADVANS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-2.5">
        {NAV.map((sec) => (
          <div key={sec.section} className="mb-1">
            <div className="px-4 py-1 text-[9.5px] font-bold uppercase tracking-[1.2px] text-text-light">
              {sec.section}
            </div>
            {sec.items.map((it) => {
              const active = pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-2.5 mx-2 my-px px-3 py-2 rounded-lg text-[13px] transition-all ${
                    active
                      ? 'bg-gradient-to-r from-gold/20 to-gold/5 text-gold border-l-[3px] border-gold pl-[10px]'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
