import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Аналитика" icon="📈" subtitle="KPI продаж, склад, рентабельность" />
      <EmptyState
        title="Дашборды появятся в Phase 7"
        description="Материализованные view: продажи по дням, оборачиваемость, рентабельность сделок, утилизация техников."
        icon="📈"
      />
    </div>
  );
}
