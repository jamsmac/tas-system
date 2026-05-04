'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/current-user';
import {
  createDeal,
  deleteDeal,
  moveDealStage,
  updateDeal,
} from '@/lib/db/queries/deals';

const dealSchema = z.object({
  title: z.string().trim().min(2).max(200),
  clientId: z.string().uuid().nullable().or(z.literal('').transform(() => null)),
  stageCode: z.enum(['lead', 'nego', 'kp', 'dog', 'opl', 'won', 'lost']),
  amount: z.coerce.number().min(0),
  currency: z.enum(['UZS', 'USD', 'EUR', 'CNY', 'RUB']),
  expectedClose: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .or(z.literal('').transform(() => null)),
});

export type DealFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

const idle: DealFormState = { status: 'idle' };

function parseDeal(fd: FormData) {
  return dealSchema.safeParse({
    title: fd.get('title'),
    clientId: fd.get('clientId') || null,
    stageCode: fd.get('stageCode'),
    amount: fd.get('amount') || '0',
    currency: fd.get('currency'),
    expectedClose: fd.get('expectedClose') || null,
  });
}

export async function createDealAction(_p: DealFormState, fd: FormData): Promise<DealFormState> {
  const parsed = parseDeal(fd);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }
  const user = await requireUser();
  const created = await createDeal(user.userId, parsed.data);
  revalidatePath('/deals');
  redirect(`/deals/${created.id}`);
}

export async function updateDealAction(
  id: string,
  _p: DealFormState,
  fd: FormData,
): Promise<DealFormState> {
  const parsed = parseDeal(fd);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }
  const user = await requireUser();
  await updateDeal(user.userId, id, parsed.data);
  revalidatePath('/deals');
  revalidatePath(`/deals/${id}`);
  return idle;
}

export async function moveDealStageAction(id: string, stage: string): Promise<void> {
  const user = await requireUser();
  await moveDealStage(user.userId, id, stage as Parameters<typeof moveDealStage>[2]);
  revalidatePath('/deals');
}

export async function deleteDealAction(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const user = await requireUser();
  await deleteDeal(user.userId, id);
  revalidatePath('/deals');
  redirect('/deals');
}
