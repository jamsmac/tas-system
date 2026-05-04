import Link from 'next/link';

import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';
import { formatDate } from '@/lib/utils/format';
import type { Client, ClientType } from '@/lib/types';

const TYPE_LABEL: Record<ClientType, string> = {
  b2b: 'B2B',
  b2c: 'B2C',
  gov: 'Гос',
  other: 'Прочее',
};

const TYPE_TONE: Record<ClientType, 'info' | 'gold' | 'success' | 'neutral'> = {
  b2b: 'info',
  b2c: 'gold',
  gov: 'success',
  other: 'neutral',
};

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const typeFilter = (['b2b', 'b2c', 'gov', 'other'].includes(params.type ?? '') ? params.type : undefined) as
    | ClientType
    | undefined;

  const user = await requireUser();
  const rows = await listClients(user.userId, { search, type: typeFilter });

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
      render: (r) => <StatusBadge tone={TYPE_TONE[r.type]}>{TYPE_LABEL[r.type]}</StatusBadge>,
    },
    {
      key: 'inn',
      header: 'ИНН/ПИНФЛ',
      render: (r) => (
        <span className="font-mono text-xs text-text-mid">{r.inn ?? r.pinfl ?? '—'}</span>
      ),
    },
    { key: 'contactPerson', header: 'Контакт', render: (r) => r.contactPerson ?? '—' },
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
        subtitle={`Всего: ${rows.length}`}
        actions={
          <Link
            href="/clients/new"
            className="px-4 py-2 bg-gold text-navy-dark rounded-lg font-bold text-sm hover:bg-gold-light transition-colors"
          >
            + Создать клиента
          </Link>
        }
      />

      <form className="flex gap-2 mb-4" method="get">
        <input
          name="q"
          defaultValue={search ?? ''}
          placeholder="Поиск по имени, ИНН, ПИНФЛ или телефону…"
          className="flex-1 px-3 py-2 bg-white border border-bg-2 rounded-lg text-sm outline-none focus:border-gold"
        />
        <select
          name="type"
          defaultValue={typeFilter ?? ''}
          className="px-3 py-2 bg-white border border-bg-2 rounded-lg text-sm outline-none focus:border-gold"
        >
          <option value="">Все типы</option>
          <option value="b2b">B2B</option>
          <option value="b2c">B2C</option>
          <option value="gov">Гос</option>
          <option value="other">Прочее</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
        >
          Найти
        </button>
      </form>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={
          <EmptyState
            title={search || typeFilter ? 'Ничего не найдено' : 'Пока нет клиентов'}
            icon="👥"
          />
        }
      />
    </div>
  );
}
