import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function MovementsPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Движение товаров" icon="🔁" subtitle="Приход, расход, перемещения, корректировки" />
      <EmptyState
        title="История движения появится в Phase 4"
        description="Журнал stock_movements: тип, документ-основание, исполнитель."
        icon="🔁"
      />
    </div>
  );
}
