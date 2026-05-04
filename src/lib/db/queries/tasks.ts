// TODO(Phase-3): заменить мок на sql`select * from tasks where ...`.

import type { Task } from '@/lib/types';

const MOCK: Task[] = [
  {
    id: 't-3001',
    title: 'Связаться с AgroPlus по поводу КП',
    status: 'todo',
    priority: 'high',
    dueAt: '2026-05-05T15:00:00Z',
    assigneeName: 'Алишер К.',
    context: { kind: 'deal', label: 'МТЗ-892 для AgroPlus' },
  },
  {
    id: 't-3002',
    title: 'Выезд на ТО (трактор #SN-998123)',
    status: 'in_progress',
    priority: 'urgent',
    dueAt: '2026-05-04T10:00:00Z',
    assigneeName: 'Тимур О.',
    context: { kind: 'ticket', label: 'SVC-2026-0042' },
  },
  {
    id: 't-3003',
    title: 'Подписать договор с Каримов Ш. Ш.',
    status: 'todo',
    priority: 'normal',
    dueAt: '2026-05-08T12:00:00Z',
    assigneeName: 'Дилшод М.',
    context: { kind: 'deal', label: 'Розничный контракт Каримов' },
  },
];

export async function listTasks(): Promise<Task[]> {
  return MOCK;
}
