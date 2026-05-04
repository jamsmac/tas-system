import Link from 'next/link';

import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listDeals, STAGES } from '@/lib/db/queries/deals';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Deal } from '@/lib/types';

const STAGE_TONE: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'gold'> = {
  lead: 'neutral',
  nego: 'info',
  kp: 'warning',
  dog: 'gold',
  opl: 'gold',
  won: 'success',
  lost: 'danger',
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const user = await requireUser();
  const rows = await listDeals(user.userId);

  const stageName = Object.fromEntries(STAGES.map((s) => [s.code, s.name]));

  const columns: Column<Deal>[] = [
    {
      key: 'title',
      header: 'Сделка',
      render: (r) => (
        <Link href={`/deals/${r.id}`} className="font-medium text-navy hover:text-gold">
          {r.title}
        </Link>
      ),
    },
    { key: 'clientName', header: 'Клиент', render: (r) => r.clientName },
    {
      key: 'stageCode',
      header: 'Стадия',
      render: (r) => (
        <StatusBadge tone={STAGE_TONE[r.stageCode] ?? 'neutral'}>
          {stageName[r.stageCode]}
        </StatusBadge>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма',
      align: 'right',
      render: (r) => <span className="font-mono">{formatMoney(r.amount, r.currency)}</span>,
    },
    { key: 'ownerName', header: 'Менеджер', render: (r) => r.ownerName ?? '—' },
    { key: 'expectedClose', header: 'Дедлайн', render: (r) => formatDate(r.expectedClose) },
    { key: 'createdAt', header: 'Создан', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Сделки"
        icon="💼"
        subtitle={`Всего: ${rows.length}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/deals/kanban"
              className="px-3 py-2 bg-bg-2 text-navy rounded-lg text-sm font-medium hover:bg-bg transition-colors"
            >
              📋 Kanban
            </Link>
            <Link
              href="/deals/new"
              className="px-4 py-2 bg-gold text-navy-dark rounded-lg font-bold text-sm hover:bg-gold-light transition-colors"
            >
              + Создать сделку
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState title="Сделок пока нет" icon="💼" />}
      />
    </div>
  );
}
