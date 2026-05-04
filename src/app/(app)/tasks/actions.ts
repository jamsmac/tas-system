'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/current-user';
import { createTask, deleteTask, setTaskStatus, updateTask } from '@/lib/db/queries/tasks';
import type { TaskStatus } from '@/lib/types';

const taskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('').transform(() => null)),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/)
    .nullable()
    .or(z.literal('').transform(() => null)),
  clientId: z.string().uuid().nullable().or(z.literal('').transform(() => null)),
  dealId: z.string().uuid().nullable().or(z.literal('').transform(() => null)),
});

export type TaskFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

const idle: TaskFormState = { status: 'idle' };

function parseTask(fd: FormData) {
  return taskSchema.safeParse({
    title: fd.get('title'),
    description: fd.get('description') || null,
    status: fd.get('status'),
    dueAt: fd.get('dueAt') || null,
    clientId: fd.get('clientId') || null,
    dealId: fd.get('dealId') || null,
  });
}

function toInput(d: z.infer<typeof taskSchema>) {
  return {
    title: d.title,
    description: d.description ?? null,
    status: d.status,
    dueAt: d.dueAt,
    clientId: d.clientId,
    dealId: d.dealId,
  };
}

export async function createTaskAction(_p: TaskFormState, fd: FormData): Promise<TaskFormState> {
  const parsed = parseTask(fd);
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  const user = await requireUser();
  await createTask(user.userId, toInput(parsed.data));
  revalidatePath('/tasks');
  redirect('/tasks');
}

export async function updateTaskAction(
  id: string,
  _p: TaskFormState,
  fd: FormData,
): Promise<TaskFormState> {
  const parsed = parseTask(fd);
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  const user = await requireUser();
  await updateTask(user.userId, id, toInput(parsed.data));
  revalidatePath('/tasks');
  revalidatePath(`/tasks/${id}`);
  return idle;
}

export async function toggleTaskAction(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  const next = String(fd.get('next') ?? '') as TaskStatus;
  if (!id || !next) return;
  const user = await requireUser();
  await setTaskStatus(user.userId, id, next);
  revalidatePath('/tasks');
}

export async function deleteTaskAction(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const user = await requireUser();
  await deleteTask(user.userId, id);
  revalidatePath('/tasks');
  redirect('/tasks');
}
