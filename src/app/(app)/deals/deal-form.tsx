'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import type { Currency, Deal, DealStageCode } from '@/lib/types';
import { STAGES } from '@/lib/deal-stages';

import type { DealFormState } from './actions';

const CURRENCIES: Currency[] = ['UZS', 'USD', 'EUR', 'CNY', 'RUB'];

interface ClientOption {
  id: string;
  name: string;
}

interface Props {
  action: (state: DealFormState, fd: FormData) => Promise<DealFormState>;
  initial?: Deal & { clientId: string | null };
  clients: ClientOption[];
  submitLabel: string;
}

const initialState: DealFormState = { status: 'idle' };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <div className="text-[11px] text-danger mt-1">{errors[0]}</div>;
}

export function DealForm({ action, initial, clients, submitLabel }: Props) {
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
            name="title"
            defaultValue={initial?.title ?? ''}
            required
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
          <FieldError errors={fe.title} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Клиент
          </label>
          <select
            name="clientId"
            defaultValue={initial?.clientId ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            <option value="">— не выбрано —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Стадия *
          </label>
          <select
            name="stageCode"
            defaultValue={(initial?.stageCode as DealStageCode | undefined) ?? 'lead'}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            {STAGES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Сумма *
          </label>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.amount ?? 0}
            required
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white font-mono"
          />
          <FieldError errors={fe.amount} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Валюта *
          </label>
          <select
            name="currency"
            defaultValue={initial?.currency ?? 'UZS'}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Ожидаемая дата закрытия
          </label>
          <input
            name="expectedClose"
            type="date"
            defaultValue={initial?.expectedClose?.slice(0, 10) ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
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
          href="/deals"
          className="px-5 py-2.5 bg-bg-2 text-navy rounded-lg font-medium text-sm hover:bg-bg transition-colors"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
