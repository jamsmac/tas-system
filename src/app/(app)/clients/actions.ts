'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/current-user';
import {
  createClient,
  deleteClient,
  updateClient,
} from '@/lib/db/queries/clients';

// ─── Schema ─────────────────────────────────────────────────────
const clientSchema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(200),
  type: z.enum(['b2b', 'b2c', 'gov', 'other']),
  inn: z
    .string()
    .trim()
    .regex(/^[0-9]{9,14}$/, 'ИНН/СТИР должен быть 9-14 цифр')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  pinfl: z
    .string()
    .trim()
    .regex(/^[0-9]{14}$/, 'ПИНФЛ должен быть 14 цифр')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  phone: z.string().trim().max(40).optional().or(z.literal('').transform(() => undefined)),
  email: z
    .email('Неверный email')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  segment: z.string().trim().max(80).optional().or(z.literal('').transform(() => undefined)),
  contactPerson: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  address: z.string().trim().max(300).optional().or(z.literal('').transform(() => undefined)),
  notes: z.string().trim().max(2000).optional().or(z.literal('').transform(() => undefined)),
});

export type ClientFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

const idle: ClientFormState = { status: 'idle' };

function parseFormData(fd: FormData) {
  const data = Object.fromEntries(fd.entries()) as Record<string, string>;
  return clientSchema.safeParse({
    name: data.name,
    type: data.type,
    inn: data.inn,
    pinfl: data.pinfl,
    phone: data.phone,
    email: data.email,
    segment: data.segment,
    contactPerson: data.contactPerson,
    address: data.address,
    notes: data.notes,
  });
}

// ─── Actions ────────────────────────────────────────────────────

export async function createClientAction(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Проверьте поля формы',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const user = await requireUser();
  const created = await createClient(user.userId, parsed.data);

  revalidatePath('/clients');
  redirect(`/clients/${created.id}`);
}

export async function updateClientAction(
  id: string,
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Проверьте поля формы',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const user = await requireUser();
  await updateClient(user.userId, id, parsed.data);

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return idle;
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const user = await requireUser();
  await deleteClient(user.userId, id);

  revalidatePath('/clients');
  redirect('/clients');
}
