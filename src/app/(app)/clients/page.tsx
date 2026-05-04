import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listClients } from '@/lib/db/queries/clients';
import { formatDate } from '@/lib/utils/format';
import type { Client } from '@/lib/types';

export default async function ClientsPage() {
  const rows = await listClients();

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Клиент',
      render: (r) => (
        <Link href={`/clients/${r.id}`} className="font-medium text-navy hover:text-gold">
          {r.name}
        </Link>
      ),
    },
    {
      key: 'type',
      header: 'Тип',
      render: (r) => (
        <StatusBadge tone={r.type === 'b2b' ? 'info' : 'gold'}>
          {r.type === 'b2b' ? 'B2B' : 'B2C'}
        </StatusBadge>
      ),
    },
    { key: 'inn', header: 'ИНН/ПИНФЛ', render: (r) => r.inn ?? r.pinfl ?? '—' },
    { key: 'phone', header: 'Телефон', render: (r) => r.phone ?? '—' },
    { key: 'segment', header: 'Сегмент', render: (r) => r.segment ?? '—' },
    { key: 'ownerName', header: 'Менеджер', render: (r) => r.ownerName ?? '—' },
    { key: 'createdAt', header: 'Создан', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Клиенты"
        icon="👥"
        subtitle="База B2B и B2C клиентов TEXNIKA ADVANS"
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState title="Пока нет клиентов" icon="👥" />}
      />
    </div>
  );
}
