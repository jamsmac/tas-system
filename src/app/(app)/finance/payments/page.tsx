import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listPayments } from '@/lib/db/queries/finance';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Payment } from '@/lib/types';

export default async function PaymentsPage() {
  const rows = await listPayments();

  const columns: Column<Payment>[] = [
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
    {
      key: 'amount',
      header: 'Сумма',
      align: 'right',
      render: (r) => (
        <span className={`font-mono ${r.direction === 'in' ? 'text-success' : 'text-danger'}`}>
          {formatMoney(r.amount, r.currency)}
        </span>
      ),
    },
    { key: 'reference', header: 'Назначение', render: (r) => r.reference ?? '—' },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Платежи" icon="💸" subtitle="Приход и расход средств" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Платежей нет" icon="💸" />} />
    </div>
  );
}
