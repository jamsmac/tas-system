import 'server-only';

import { withUser } from '@/lib/db';
import type { Task, TaskStatus } from '@/lib/types';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: Date | null;
  assignee_name: string | null;
  client_name: string | null;
  deal_name: string | null;
  client_id: string | null;
  deal_id: string | null;
};

export type TaskWithExtras = Task & {
  description: string | null;
  clientId: string | null;
  dealId: string | null;
};

function mapRow(r: TaskRow): TaskWithExtras {
  const ctx: Task['context'] =
    r.deal_name && r.deal_id
      ? { kind: 'deal', label: r.deal_name }
      : r.client_name && r.client_id
        ? { kind: 'client', label: r.client_name }
        : null;
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    priority: 'normal',
    dueAt: r.due_date ? r.due_date.toISOString() : null,
    assigneeName: r.assignee_name,
    context: ctx,
    description: r.description,
    clientId: r.client_id,
    dealId: r.deal_id,
  };
}

const SELECT = `
  t.id, t.title, t.description, t.status, t.due_date,
  t.client_id, t.deal_id,
  p.full_name as assignee_name,
  c.name      as client_name,
  d.name      as deal_name
`;

export async function listTasks(
  userId: string,
  filters: { mine?: boolean; status?: TaskStatus; overdue?: boolean } = {},
) {
  return withUser(userId, async (tx) => {
    const rows = await tx<TaskRow[]>`
      select ${tx.unsafe(SELECT)}
      from tasks t
      left join profiles p on p.id = t.assigned_to
      left join clients  c on c.id = t.client_id
      left join deals    d on d.id = t.deal_id
      where 1=1
        ${filters.mine ? tx`and t.assigned_to = ${userId}` : tx``}
        ${filters.status ? tx`and t.status = ${filters.status}` : tx``}
        ${filters.overdue ? tx`and t.status != 'done' and t.due_date < now()` : tx``}
      order by t.due_date nulls last, t.created_at desc
    `;
    return rows.map(mapRow);
  });
}

export async function getTask(userId: string, id: string) {
  return withUser(userId, async (tx) => {
    const rows = await tx<TaskRow[]>`
      select ${tx.unsafe(SELECT)}
      from tasks t
      left join profiles p on p.id = t.assigned_to
      left join clients  c on c.id = t.client_id
      left join deals    d on d.id = t.deal_id
      where t.id = ${id}
      limit 1
    `;
    return rows.length ? mapRow(rows[0]) : null;
  });
}

export type TaskInput = {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueAt: string | null;
  clientId: string | null;
  dealId: string | null;
};

export async function createTask(userId: string, input: TaskInput): Promise<void> {
  await withUser(userId, async (tx) => {
    const [profile] = await tx<{ organization_id: string }[]>`
      select organization_id from profiles where id = ${userId}
    `;
    await tx`
      insert into tasks (organization_id, assigned_to, created_by, title, description, status, due_date, client_id, deal_id)
      values (
        ${profile.organization_id}, ${userId}, ${userId},
        ${input.title}, ${input.description},
        ${input.status}, ${input.dueAt},
        ${input.clientId}, ${input.dealId}
      )
    `;
  });
}

export async function updateTask(userId: string, id: string, input: TaskInput): Promise<void> {
  await withUser(userId, async (tx) => {
    await tx`
      update tasks set
        title       = ${input.title},
        description = ${input.description},
        status      = ${input.status},
        due_date    = ${input.dueAt},
        client_id   = ${input.clientId},
        deal_id     = ${input.dealId},
        completed_at = case when ${input.status} = 'done' then coalesce(completed_at, now()) else null end
      where id = ${id}
    `;
  });
}

export async function setTaskStatus(userId: string, id: string, status: TaskStatus): Promise<void> {
  await withUser(userId, async (tx) => {
    await tx`
      update tasks set
        status = ${status},
        completed_at = case when ${status} = 'done' then now() else null end
      where id = ${id}
    `;
  });
}

export async function deleteTask(userId: string, id: string): Promise<boolean> {
  return withUser(userId, async (tx) => {
    const result = await tx`delete from tasks where id = ${id}`;
    return result.count > 0;
  });
}
