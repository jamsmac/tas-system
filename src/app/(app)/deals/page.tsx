import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listDeals, STAGES } from '@/lib/db/queries/deals';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Deal } from '@/lib/types';

const STAGE_BY_CODE = Object.fromEntries(STAGES.map((s) => [s.code, s] as const));

export default async function DealsPage() {
  const rows = await listDeals();

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
    { key: 'clientName', header: 'Клиент' },
    {
      key: 'stageCode',
      header: 'Стадия',
      render: (r) => {
        const stage = STAGE_BY_CODE[r.stageCode];
        const tone = stage?.isWon ? 'success' : stage?.isLost ? 'danger' : 'info';
        return <StatusBadge tone={tone}>{stage?.name ?? r.stageCode}</StatusBadge>;
      },
    },
    { key: 'amount', header: 'Сумма', align: 'right', render: (r) => formatMoney(r.amount, r.currency) },
    { key: 'expectedClose', header: 'Закрытие', render: (r) => formatDate(r.expectedClose) },
    { key: 'ownerName', header: 'Менеджер', render: (r) => r.ownerName ?? '—' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Сделки"
        icon="💼"
        subtitle="Воронка продаж — таблица"
        actions={
          <Link
            href="/deals/kanban"
            className="text-sm px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            Канбан →
          </Link>
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
