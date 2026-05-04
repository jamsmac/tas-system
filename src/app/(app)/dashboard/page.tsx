import { KpiCard } from '@/components/ui/kpi-card';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { loadDashboard } from '@/lib/db/queries/dashboard';

import { RevenueLine, StageBars } from './charts';

export const dynamic = 'force-dynamic';

function formatUzs(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} млн UZS`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)} тыс UZS`;
  return `${amount} UZS`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { kpis, byStage, byDay } = await loadDashboard(user.userId);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Дашборд"
        icon="📊"
        subtitle={`Здравствуйте, ${user.fullName.split(' ')[0]}. Сегодня обзор по организации.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Клиенты" value={kpis.clientsTotal} icon="👥" tone="navy" />
        <KpiCard label="Сделки всего" value={kpis.dealsTotal} icon="💼" tone="info" />
        <KpiCard label="В работе" value={kpis.dealsActive} icon="🔥" tone="gold" />
        <KpiCard label="Выиграно" value={kpis.dealsWon} icon="🏆" tone="success" />
        <KpiCard
          label="Выручка 30д"
          value={formatUzs(kpis.revenueUzs30d)}
          icon="💰"
          tone="success"
        />
        <KpiCard label="Открытых задач" value={kpis.tasksOpen} icon="✅" tone="info" />
        <KpiCard
          label="Просрочено"
          value={kpis.tasksOverdue}
          icon="⚠️"
          tone={kpis.tasksOverdue > 0 ? 'danger' : 'navy'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-bg-2 rounded-2xl p-5">
          <h2 className="font-display font-bold text-navy mb-4">Сделки по стадиям</h2>
          <StageBars data={byStage} />
        </section>

        <section className="bg-white border border-bg-2 rounded-2xl p-5">
          <h2 className="font-display font-bold text-navy mb-4">Выручка за 14 дней (UZS)</h2>
          <RevenueLine data={byDay} />
        </section>
      </div>
    </div>
  );
}
