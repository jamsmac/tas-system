import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listTasks } from '@/lib/db/queries/tasks';
import { formatDateTime } from '@/lib/utils/format';
import type { Task, Priority, TaskStatus } from '@/lib/types';

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

const PRIORITY_NAME: Record<Priority, string> = {
  low: 'Низкий', normal: 'Обычный', high: 'Высокий', urgent: 'Срочный',
};
const PRIORITY_TONE: Record<Priority, 'neutral' | 'gold' | 'warning' | 'danger'> = {
  low: 'neutral', normal: 'neutral', high: 'warning', urgent: 'danger',
};

export default async function TasksPage() {
  const rows = await listTasks();

  const columns: Column<Task>[] = [
    { key: 'title', header: 'Задача', render: (r) => <span className="font-medium text-navy">{r.title}</span> },
    {
      key: 'context',
      header: 'Контекст',
      render: (r) =>
        r.context ? (
          <span className="text-xs text-text-mid">
            {r.context.kind === 'deal' ? '💼' : r.context.kind === 'ticket' ? '🛠️' : '👤'}{' '}
            {r.context.label}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'priority',
      header: 'Приоритет',
      render: (r) => (
        <StatusBadge tone={PRIORITY_TONE[r.priority]}>{PRIORITY_NAME[r.priority]}</StatusBadge>
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
      <PageHeader title="Задачи" icon="✅" subtitle="Всё, за чем нужно следить" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Задач нет" icon="✅" />} />
    </div>
  );
}
