import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listContracts } from '@/lib/db/queries/contracts';
import { formatDate, formatMoney } from '@/lib/utils/format';
import type { Contract, ContractStatus, ContractType } from '@/lib/types';

const TYPE_NAME: Record<ContractType, string> = { sale: 'Продажа', service: 'Сервис', lease: 'Аренда' };

// contract_status enum: draft / signed / paid / shipped / closed / cancelled
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

export default async function ContractsPage() {
  const rows = await listContracts();

  const columns: Column<Contract>[] = [
    { key: 'number', header: '№', render: (r) => <span className="font-mono text-navy">{r.number}</span> },
    { key: 'clientName', header: 'Клиент' },
    { key: 'type', header: 'Тип', render: (r) => TYPE_NAME[r.type] },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_NAME[r.status]}</StatusBadge>,
    },
    { key: 'amount', header: 'Сумма', align: 'right', render: (r) => formatMoney(r.amount, r.currency) },
    { key: 'signedAt', header: 'Подписан', render: (r) => formatDate(r.signedAt) },
    { key: 'expiresAt', header: 'Действует до', render: (r) => formatDate(r.expiresAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Договоры" icon="📄" subtitle="Продажа, сервис, аренда" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Договоров нет" icon="📄" />} />
    </div>
  );
}
