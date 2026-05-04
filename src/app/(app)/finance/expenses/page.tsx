import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listExpenses } from '@/lib/db/queries/finance';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Expense } from '@/lib/types';

export default async function ExpensesPage() {
  const rows = await listExpenses();

  const columns: Column<Expense>[] = [
    { key: 'title', header: 'Расход', render: (r) => <span className="font-medium text-navy">{r.title}</span> },
    { key: 'categoryName', header: 'Категория' },
    { key: 'amount', header: 'Сумма', align: 'right', render: (r) => formatMoney(r.amount, r.currency) },
    { key: 'incurredAt', header: 'Дата', render: (r) => formatDate(r.incurredAt) },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (
        <StatusBadge tone={r.status === 'paid' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'}>
          {r.status === 'paid' ? 'Оплачен' : r.status === 'pending' ? 'Ожидает' : 'Отменён'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Расходы" icon="📉" subtitle="По категориям" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Расходов нет" icon="📉" />} />
    </div>
  );
}
