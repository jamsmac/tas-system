'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/current-user';
import {
  createContract,
  deleteContract,
  updateContract,
} from '@/lib/db/queries/contracts';

const contractSchema = z.object({
  number: z.string().trim().min(1).max(60),
  status: z.enum(['draft', 'signed', 'paid', 'shipped', 'closed', 'cancelled']),
  amount: z.coerce.number().min(0),
  currency: z.enum(['UZS', 'USD', 'EUR', 'CNY', 'RUB']),
  clientId: z.string().uuid(),
  dealId: z.string().uuid().nullable().or(z.literal('').transform(() => null)),
  signedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .or(z.literal('').transform(() => null)),
});

export type ContractFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

const idle: ContractFormState = { status: 'idle' };

function parseContract(fd: FormData) {
  return contractSchema.safeParse({
    number: fd.get('number'),
    status: fd.get('status'),
    amount: fd.get('amount') || '0',
    currency: fd.get('currency'),
    clientId: fd.get('clientId'),
    dealId: fd.get('dealId') || null,
    signedAt: fd.get('signedAt') || null,
  });
}

export async function createContractAction(
  _p: ContractFormState,
  fd: FormData,
): Promise<ContractFormState> {
  const parsed = parseContract(fd);
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  const user = await requireUser();
  const created = await createContract(user.userId, parsed.data);
  revalidatePath('/contracts');
  redirect(`/contracts/${created.id}`);
}

export async function updateContractAction(
  id: string,
  _p: ContractFormState,
  fd: FormData,
): Promise<ContractFormState> {
  const parsed = parseContract(fd);
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Проверьте поля',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  const user = await requireUser();
  await updateContract(user.userId, id, parsed.data);
  revalidatePath('/contracts');
  revalidatePath(`/contracts/${id}`);
  return idle;
}

export async function deleteContractAction(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const user = await requireUser();
  await deleteContract(user.userId, id);
  revalidatePath('/contracts');
  redirect('/contracts');
}
