import Link from 'next/link';

import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listContracts, type ContractFull } from '@/lib/db/queries/contracts';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { ContractStatus } from '@/lib/types';

const STATUS_NAME: Record<ContractStatus, string> = {
  draft: 'Черновик',
  signed: 'Подписан',
  paid: 'Оплачен',
  shipped: 'Отгружен',
  closed: 'Закрыт',
  cancelled: 'Отменён',
};
const STATUS_TONE: Record<ContractStatus, 'neutral' | 'info' | 'success' | 'gold' | 'danger'> = {
  draft: 'neutral',
  signed: 'gold',
  paid: 'success',
  shipped: 'info',
  closed: 'info',
  cancelled: 'danger',
};

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const user = await requireUser();
  const rows = await listContracts(user.userId);

  const columns: Column<ContractFull>[] = [
    {
      key: 'number',
      header: '№',
      render: (r) => (
        <Link
          href={`/contracts/${r.id}`}
          className="font-mono text-navy font-medium hover:text-gold"
        >
          {r.number}
        </Link>
      ),
    },
    { key: 'clientName', header: 'Клиент', render: (r) => r.clientName },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (
        <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_NAME[r.status]}</StatusBadge>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма',
      align: 'right',
      render: (r) => <span className="font-mono">{formatMoney(r.amount, r.currency)}</span>,
    },
    { key: 'signedAt', header: 'Подписан', render: (r) => formatDate(r.signedAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Договоры"
        icon="📄"
        subtitle={`Всего: ${rows.length}`}
        actions={
          <Link
            href="/contracts/new"
            className="px-4 py-2 bg-gold text-navy-dark rounded-lg font-bold text-sm hover:bg-gold-light transition-colors"
          >
            + Новый договор
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState title="Договоров нет" icon="📄" />}
      />
    </div>
  );
}
