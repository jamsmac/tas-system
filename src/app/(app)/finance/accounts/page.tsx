import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function AccountsPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Счета компании" icon="🏦" subtitle="Касса, банк, валютные счета" />
      <EmptyState
        title="Счета появятся в Phase 6"
        description="accounts: касса/банк/карта, валюты UZS/USD/EUR, актуальные балансы."
        icon="🏦"
      />
    </div>
  );
}
