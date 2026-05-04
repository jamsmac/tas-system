import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function SuppliersPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Поставщики" icon="🤝" subtitle="Контрагенты и заказы поставщикам" />
      <EmptyState
        title="Каталог поставщиков появится в Phase 4"
        description="Связь с purchase_orders и автоматическое поступление на склад."
        icon="🤝"
      />
    </div>
  );
}
