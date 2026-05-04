import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getDeal, STAGES } from '@/lib/db/queries/deals';
import { formatDate, formatMoney } from '@/lib/utils/format';

interface Props { params: Promise<{ id: string }>; }

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const stage = STAGES.find((s) => s.code === deal.stageCode);
  const tone = stage?.isWon ? 'success' : stage?.isLost ? 'danger' : 'info';

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={deal.title}
        icon="💼"
        subtitle={`ID ${deal.id} · клиент: ${deal.clientName}`}
      />

      <section className="bg-white border border-bg-2 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <Field label="Стадия">
            <StatusBadge tone={tone}>{stage?.name ?? deal.stageCode}</StatusBadge>
          </Field>
          <Field label="Сумма">{formatMoney(deal.amount, deal.currency)}</Field>
          <Field label="Ожидаемое закрытие">{formatDate(deal.expectedClose)}</Field>
          <Field label="Менеджер">{deal.ownerName ?? '—'}</Field>
        </div>
      </section>

      <section className="bg-white border border-bg-2 rounded-2xl p-6 text-sm text-text-mid">
        В Phase 3 здесь появятся: позиции сделки (товары), активность (звонки/письма),
        связанные задачи и договор-источник.
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
