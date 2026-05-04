import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listTickets } from '@/lib/db/queries/service';
import { formatDateTime } from '@/lib/utils/format';
import type { ServiceStatus, ServiceTicket, ServiceType } from '@/lib/types';

const TYPE_NAME: Record<ServiceType, string> = {
  warranty: 'Гарантия', paid: 'Платный', onsite: 'Выезд',
};

const STATUS_NAME: Record<ServiceStatus, string> = {
  open: 'Открыта',
  in_progress: 'В работе',
  waiting_parts: 'Ждёт запчасти',
  done: 'Готово',
  cancelled: 'Отменена',
};
const STATUS_TONE: Record<ServiceStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  open: 'info',
  in_progress: 'info',
  waiting_parts: 'warning',
  done: 'success',
  cancelled: 'danger',
};

export default async function ServicePage() {
  const rows = await listTickets();

  const columns: Column<ServiceTicket>[] = [
    { key: 'number', header: '№', render: (r) => <span className="font-mono text-navy">{r.number}</span> },
    { key: 'clientName', header: 'Клиент' },
    { key: 'equipmentSerial', header: 'Серийный №', render: (r) => r.equipmentSerial ?? '—' },
    { key: 'type', header: 'Тип', render: (r) => TYPE_NAME[r.type] },
    {
      key: 'status', header: 'Статус',
      render: (r) => <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_NAME[r.status]}</StatusBadge>,
    },
    { key: 'technicianName', header: 'Техник', render: (r) => r.technicianName ?? '—' },
    { key: 'openedAt', header: 'Открыта', render: (r) => formatDateTime(r.openedAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Сервисные заявки" icon="🛠️" subtitle="Гарантия, ремонт, выездное обслуживание" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Заявок нет" icon="🛠️" />} />
    </div>
  );
}
