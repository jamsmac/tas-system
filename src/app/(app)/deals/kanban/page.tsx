import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listDeals, STAGES } from '@/lib/db/queries/deals';

import { KanbanBoard } from './kanban-board';

export const dynamic = 'force-dynamic';

export default async function DealsKanbanPage() {
  const user = await requireUser();
  const deals = await listDeals(user.userId);

  // Без 'lost' — спрятан в табличный вид; won остаётся как успешный финал
  const stages = STAGES.filter((s) => !s.isLost).map((s) => ({
    code: s.code,
    name: s.name,
    color: s.color ?? '#6b7a99',
  }));

  return (
    <div className="p-6">
      <PageHeader
        title="Воронка продаж"
        icon="📋"
        subtitle="Drag & drop карточки между колонками"
        actions={
          <Link
            href="/deals"
            className="px-3 py-2 bg-bg-2 text-navy rounded-lg text-sm font-medium hover:bg-bg transition-colors"
          >
            Таблица
          </Link>
        }
      />
      <KanbanBoard stages={stages} deals={deals} />
    </div>
  );
}
