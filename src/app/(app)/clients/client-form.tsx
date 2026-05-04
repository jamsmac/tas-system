'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import type { Client, ClientType } from '@/lib/types';

import type { ClientFormState } from './actions';

const TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  { value: 'b2b', label: 'B2B (Юр. лицо)' },
  { value: 'b2c', label: 'B2C (Физ. лицо)' },
  { value: 'gov', label: 'Гос. сектор' },
  { value: 'other', label: 'Прочее' },
];

interface Props {
  action: (state: ClientFormState, fd: FormData) => Promise<ClientFormState>;
  initial?: Client;
  submitLabel: string;
  cancelHref: string;
}

const initialState: ClientFormState = { status: 'idle' };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <div className="text-[11px] text-danger mt-1">{errors[0]}</div>;
}

export function ClientForm({ action, initial, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fe = state.status === 'error' ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      {state.status === 'error' && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg px-3.5 py-2.5 text-sm text-danger">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-bg-2 rounded-2xl p-5">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Название *
          </label>
          <input
            name="name"
            defaultValue={initial?.name ?? ''}
            required
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
          <FieldError errors={fe.name} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Тип *
          </label>
          <select
            name="type"
            defaultValue={initial?.type ?? 'b2b'}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError errors={fe.type} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Сегмент
          </label>
          <input
            name="segment"
            defaultValue={initial?.segment ?? ''}
            placeholder="Крупный / Средний / Малый"
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            ИНН / СТИР (юр. лицо)
          </label>
          <input
            name="inn"
            defaultValue={initial?.inn ?? ''}
            placeholder="9-14 цифр"
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white font-mono"
          />
          <FieldError errors={fe.inn} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            ПИНФЛ (физ. лицо)
          </label>
          <input
            name="pinfl"
            defaultValue={initial?.pinfl ?? ''}
            placeholder="14 цифр"
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white font-mono"
          />
          <FieldError errors={fe.pinfl} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Контактное лицо
          </label>
          <input
            name="contactPerson"
            defaultValue={initial?.contactPerson ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Телефон
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={initial?.phone ?? ''}
            placeholder="+998 90 123-45-67"
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
          <FieldError errors={fe.email} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Адрес
          </label>
          <input
            name="address"
            defaultValue={initial?.address ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Заметки
          </label>
          <textarea
            name="notes"
            defaultValue={initial?.notes ?? ''}
            rows={4}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-gold text-navy-dark rounded-lg font-bold text-sm hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {pending ? 'Сохраняем…' : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="px-5 py-2.5 bg-bg-2 text-navy rounded-lg font-medium text-sm hover:bg-bg transition-colors"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
