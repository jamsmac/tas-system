import Link from 'next/link';

import { KpiCard } from '@/components/ui/kpi-card';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { loadFinanceSummary } from '@/lib/db/queries/finance';

export const dynamic = 'force-dynamic';

function fmtUzs(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн UZS`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} тыс UZS`;
  return `${n.toLocaleString('ru-RU')} UZS`;
}

export default async function FinanceOverviewPage() {
  const user = await requireUser();
  const s = await loadFinanceSummary(user.userId);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Финансы"
        icon="💰"
        subtitle="Счета, платежи, остатки. Пересчёт в UZS по курсу ЦБ РУз"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Счета всего" value={fmtUzs(s.invoicesTotalUzs)} icon="🧾" tone="info" />
        <KpiCard label="Оплачено" value={fmtUzs(s.invoicesPaidUzs)} icon="✅" tone="success" />
        <KpiCard label="Поступления 30д" value={fmtUzs(s.inflowUzs30d)} icon="📈" tone="success" />
        <KpiCard label="Расходы 30д" value={fmtUzs(s.outflowUzs30d)} icon="📉" tone="danger" />
        <KpiCard
          label="Чистый поток"
          value={fmtUzs(s.netUzs30d)}
          icon={s.netUzs30d >= 0 ? '🟢' : '🔴'}
          tone={s.netUzs30d >= 0 ? 'success' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/finance/invoices"
          className="bg-white border border-bg-2 rounded-2xl p-5 hover:border-gold/40 transition-colors"
        >
          <div className="text-2xl mb-2">🧾</div>
          <div className="font-display font-bold text-navy">Счета</div>
          <div className="text-xs text-text-mid mt-1">Выставленные клиентам</div>
        </Link>
        <Link
          href="/finance/payments"
          className="bg-white border border-bg-2 rounded-2xl p-5 hover:border-gold/40 transition-colors"
        >
          <div className="text-2xl mb-2">💸</div>
          <div className="font-display font-bold text-navy">Платежи</div>
          <div className="text-xs text-text-mid mt-1">Приход и расход</div>
        </Link>
      </div>
    </div>
  );
}
