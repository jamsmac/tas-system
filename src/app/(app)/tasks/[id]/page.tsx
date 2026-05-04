import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';
import { listDeals } from '@/lib/db/queries/deals';
import { getTask } from '@/lib/db/queries/tasks';

import { deleteTaskAction, updateTaskAction } from '../actions';
import { TaskForm } from '../task-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const [task, clients, deals] = await Promise.all([
    getTask(user.userId, id),
    listClients(user.userId),
    listDeals(user.userId),
  ]);
  if (!task) notFound();

  const updateBound = updateTaskAction.bind(null, id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={task.title}
        icon="✅"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/tasks"
              className="px-3 py-2 bg-bg-2 text-navy rounded-lg text-sm font-medium hover:bg-bg transition-colors"
            >
              ← К списку
            </Link>
            <form action={deleteTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className="px-3 py-2 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm font-bold hover:bg-danger/20 transition-colors cursor-pointer"
              >
                🗑 Удалить
              </button>
            </form>
          </div>
        }
      />

      <TaskForm
        action={updateBound}
        initial={task}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        deals={deals.map((d) => ({ id: d.id, name: d.title }))}
        submitLabel="Сохранить"
      />
    </div>
  );
}
