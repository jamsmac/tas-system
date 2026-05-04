import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function EquipmentPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Парк техники" icon="🚜" subtitle="Серийный учёт оборудования клиентов" />
      <EmptyState
        title="Реестр оборудования появится в Phase 5"
        description="equipment.serial_number, статус (in_use/in_service/retired), история ремонтов и гарантия."
        icon="🚜"
      />
    </div>
  );
}
