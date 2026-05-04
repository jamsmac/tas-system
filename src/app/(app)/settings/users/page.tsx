import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function UsersPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Пользователи" icon="👥" subtitle="Сотрудники TAS" />
      <EmptyState
        title="Список пользователей появится в Phase 2"
        description="profiles + user_roles. Добавление пользователей — через Supabase Admin или приглашение по email."
        icon="👥"
      />
    </div>
  );
}
