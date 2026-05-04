import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getClient } from '@/lib/db/queries/clients';
import { formatDate } from '@/lib/utils/format';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={client.name}
        icon="👤"
        subtitle={`ID ${client.id} · создан ${formatDate(client.createdAt)}`}
      />

      <section className="bg-white border border-bg-2 rounded-2xl p-6">
        <h2 className="font-display font-bold text-navy mb-4">Реквизиты</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <Field label="Тип">
            <StatusBadge tone={client.type === 'b2b' ? 'info' : 'gold'}>
              {client.type === 'b2b' ? 'B2B' : 'B2C'}
            </StatusBadge>
          </Field>
          <Field label="ИНН">{client.inn ?? '—'}</Field>
          <Field label="ПИНФЛ">{client.pinfl ?? '—'}</Field>
          <Field label="Телефон">{client.phone ?? '—'}</Field>
          <Field label="Email">{client.email ?? '—'}</Field>
          <Field label="Сегмент">{client.segment ?? '—'}</Field>
          <Field label="Менеджер">{client.ownerName ?? '—'}</Field>
        </dl>
      </section>

      <section className="bg-white border border-bg-2 rounded-2xl p-6">
        <h2 className="font-display font-bold text-navy mb-2">Активность</h2>
        <p className="text-sm text-text-mid">
          В Phase 3 здесь появятся вкладки: сделки, договоры, задачи, заявки на сервис, документы.
        </p>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-text-mid">{label}</dt>
      <dd className="font-medium text-navy">{children}</dd>
    </div>
  );
}
