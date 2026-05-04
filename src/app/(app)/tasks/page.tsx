import Link from 'next/link';

import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import { listTasks, type TaskWithExtras } from '@/lib/db/queries/tasks';
import { formatDateTime } from '@/lib/utils/format';
import type { TaskStatus } from '@/lib/types';

import { toggleTaskAction } from './actions';

const STATUS_NAME: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
  cancelled: 'Отменена',
};
const STATUS_TONE: Record<TaskStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  todo: 'info',
  in_progress: 'info',
  done: 'success',
  cancelled: 'danger',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter ?? 'all';
  const user = await requireUser();

  const rows = await listTasks(user.userId, {
    mine: filter === 'mine',
    overdue: filter === 'overdue',
  });

  const tabs = [
    { key: 'all', label: 'Все' },
    { key: 'mine', label: 'Мои' },
    { key: 'overdue', label: 'Просрочено' },
  ];

  const columns: Column<TaskWithExtras>[] = [
    {
      key: 'check',
      header: '',
      width: '40px',
      render: (r) => (
        <form action={toggleTaskAction}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="next" value={r.status === 'done' ? 'todo' : 'done'} />
          <button
            type="submit"
            aria-label="Toggle done"
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              r.status === 'done'
                ? 'bg-success border-success text-white'
                : 'border-text-light hover:border-success'
            }`}
          >
            {r.status === 'done' ? '✓' : ''}
          </button>
        </form>
      ),
    },
    {
      key: 'title',
      header: 'Задача',
      render: (r) => (
        <Link
          href={`/tasks/${r.id}`}
          className={`font-medium hover:text-gold ${
            r.status === 'done' ? 'text-text-light line-through' : 'text-navy'
          }`}
        >
          {r.title}
        </Link>
      ),
    },
    {
      key: 'context',
      header: 'Контекст',
      render: (r) =>
        r.context ? (
          <span className="text-xs text-text-mid">
            {r.context.kind === 'deal' ? '💼' : '👤'} {r.context.label}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_NAME[r.status]}</StatusBadge>,
    },
    { key: 'dueAt', header: 'Дедлайн', render: (r) => formatDateTime(r.dueAt) },
    { key: 'assigneeName', header: 'Исполнитель', render: (r) => r.assigneeName ?? '—' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Задачи"
        icon="✅"
        subtitle={`${rows.length}`}
        actions={
          <Link
            href="/tasks/new"
            className="px-4 py-2 bg-gold text-navy-dark rounded-lg font-bold text-sm hover:bg-gold-light transition-colors"
          >
            + Создать задачу
          </Link>
        }
      />

      <div className="flex gap-1 mb-4 bg-white border border-bg-2 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === 'all' ? '/tasks' : `/tasks?filter=${t.key}`}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === t.key ? 'bg-navy text-white' : 'text-text-mid hover:bg-bg'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState title="Задач нет" icon="✅" />}
      />
    </div>
  );
}
