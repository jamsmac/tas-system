import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';
import { listDeals } from '@/lib/db/queries/deals';

import { createTaskAction } from '../actions';
import { TaskForm } from '../task-form';

export const metadata = { title: 'Новая задача — TAS System' };

export default async function NewTaskPage() {
  const user = await requireUser();
  const [clients, deals] = await Promise.all([
    listClients(user.userId),
    listDeals(user.userId),
  ]);

  return (
    <div className="p-6">
      <PageHeader title="Новая задача" icon="➕" />
      <TaskForm
        action={createTaskAction}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        deals={deals.map((d) => ({ id: d.id, name: d.title }))}
        submitLabel="Создать"
      />
    </div>
  );
}
