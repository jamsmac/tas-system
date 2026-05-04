import { PageHeader } from '@/components/ui/page-header';
import { dealsByStage, STAGES } from '@/lib/db/queries/deals';
import { formatMoney } from '@/lib/utils/format';

export default async function DealsKanbanPage() {
  const grouped = await dealsByStage();

  return (
    <div className="p-6">
      <PageHeader title="Воронка продаж" icon="📋" subtitle="Сделки по стадиям" />

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.filter((s) => !s.isLost).map((stage) => {
          const items = grouped[stage.code] ?? [];
          const sum = items.reduce((acc, d) => acc + d.amount, 0);
          return (
            <div key={stage.code} className="min-w-[260px] flex-1">
              <div
                className="rounded-xl px-3 py-2 mb-2 flex items-center justify-between text-sm font-medium text-white"
                style={{ background: stage.color ?? '#6b7a99' }}
              >
                <span>{stage.name}</span>
                <span className="text-xs opacity-80">{items.length}</span>
              </div>
              <div className="text-xs text-text-mid mb-2 px-1">{formatMoney(sum)}</div>
              <div className="space-y-2">
                {items.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border border-bg-2 rounded-xl p-3 hover:border-gold/40 transition-colors"
                  >
                    <div className="font-medium text-navy text-sm">{d.title}</div>
                    <div className="text-xs text-text-mid mt-1">{d.clientName}</div>
                    <div className="text-xs font-mono text-navy mt-2">
                      {formatMoney(d.amount, d.currency)}
                    </div>
                  </div>
                ))}
                {items.length === 0 ? (
                  <div className="text-xs text-text-mid italic px-1">пусто</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
