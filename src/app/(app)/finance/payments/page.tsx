import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listPayments, type PaymentExtended } from '@/lib/db/queries/finance';
import { formatDate, formatMoney } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const user = await requireUser();
  const rows = await listPayments(user.userId);

  const columns: Column<PaymentExtended>[] = [
    {
      key: 'direction',
      header: 'Тип',
      render: (r) => (
        <StatusBadge tone={r.direction === 'in' ? 'success' : 'danger'}>
          {r.direction === 'in' ? '↓ Приход' : '↑ Расход'}
        </StatusBadge>
      ),
    },
    { key: 'paidAt', header: 'Дата', render: (r) => formatDate(r.paidAt) },
    { key: 'accountName', header: 'Счёт' },
    { key: 'clientName', header: 'Клиент', render: (r) => r.clientName ?? '—' },
    {
      key: 'amount',
      header: 'Сумма',
      align: 'right',
      render: (r) => (
        <span className={`font-mono ${r.direction === 'in' ? 'text-success' : 'text-danger'}`}>
          {r.direction === 'in' ? '+' : '−'}
          {formatMoney(r.amount, r.currency)}
        </span>
      ),
    },
    { key: 'reference', header: 'Реквизит', render: (r) => r.reference ?? '—' },
    { key: 'note', header: 'Назначение', render: (r) => r.note ?? '—' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Платежи"
        icon="💸"
        subtitle={`Всего операций: ${rows.length}`}
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState title="Платежей нет" icon="💸" />}
      />
    </div>
  );
}
