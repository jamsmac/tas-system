import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listInvoices } from '@/lib/db/queries/finance';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Invoice, InvoiceStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUS_NAME: Record<InvoiceStatus, string> = {
  draft: 'Черновик', sent: 'Отправлен', paid: 'Оплачен', overdue: 'Просрочен', cancelled: 'Отменён',
};
const STATUS_TONE: Record<InvoiceStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  draft: 'neutral', sent: 'info', paid: 'success', overdue: 'danger', cancelled: 'neutral',
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const rows = await listInvoices(user.userId);

  const columns: Column<Invoice>[] = [
    { key: 'number', header: '№', render: (r) => <span className="font-mono text-navy">{r.number}</span> },
    { key: 'clientName', header: 'Клиент' },
    {
      key: 'status', header: 'Статус',
      render: (r) => <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_NAME[r.status]}</StatusBadge>,
    },
    { key: 'total', header: 'Сумма', align: 'right', render: (r) => formatMoney(r.total, r.currency) },
    {
      key: 'paidAmount',
      header: 'Оплачено',
      align: 'right',
      render: (r) => (
        <span className={r.paidAmount >= r.total ? 'text-success' : 'text-text-mid'}>
          {formatMoney(r.paidAmount, r.currency)}
        </span>
      ),
    },
    { key: 'issuedAt', header: 'Выставлен', render: (r) => formatDate(r.issuedAt) },
    { key: 'dueAt', header: 'Срок', render: (r) => formatDate(r.dueAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Счета" icon="🧾" subtitle="Выставленные клиентам" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Счетов нет" icon="🧾" />} />
    </div>
  );
}
