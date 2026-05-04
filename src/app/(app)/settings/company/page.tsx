import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function CompanyPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Компания" icon="🏢" subtitle="Реквизиты TEXNIKA ADVANS" />
      <EmptyState
        title="Реквизиты компании появятся в Phase 2"
        description="Название, ИНН, юр.адрес, валюта по умолчанию, схемы нумерации документов (счета, договоры, заявки)."
        icon="🏢"
      />
    </div>
  );
}
