'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import type { Currency, ContractStatus } from '@/lib/types';

import type { ContractFormState } from './actions';

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'signed', label: 'Подписан' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'shipped', label: 'Отгружен' },
  { value: 'closed', label: 'Закрыт' },
  { value: 'cancelled', label: 'Отменён' },
];

const CURRENCIES: Currency[] = ['UZS', 'USD', 'EUR', 'CNY', 'RUB'];

interface Option {
  id: string;
  name: string;
}

interface Props {
  action: (s: ContractFormState, fd: FormData) => Promise<ContractFormState>;
  initial?: {
    number: string;
    status: ContractStatus;
    amount: number;
    currency: Currency;
    clientId: string;
    dealId: string | null;
    signedAt: string | null;
  };
  clients: Option[];
  deals: Option[];
  submitLabel: string;
}

const initialState: ContractFormState = { status: 'idle' };

export function ContractForm({ action, initial, clients, deals, submitLabel }: Props) {
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
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Номер договора *
          </label>
          <input
            name="number"
            defaultValue={initial?.number ?? ''}
            required
            placeholder="TAS-2026-0001"
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white font-mono"
          />
          {fe.number?.[0] && <div className="text-[11px] text-danger mt-1">{fe.number[0]}</div>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Статус *
          </label>
          <select
            name="status"
            defaultValue={initial?.status ?? 'draft'}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Клиент *
          </label>
          <select
            name="clientId"
            defaultValue={initial?.clientId ?? ''}
            required
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            <option value="">— выберите —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Сделка
          </label>
          <select
            name="dealId"
            defaultValue={initial?.dealId ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          >
            <option value="">— не привязана —</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
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
            Дата подписания
          </label>
          <input
            name="signedAt"
            type="date"
            defaultValue={initial?.signedAt ?? ''}
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
          href="/contracts"
          className="px-5 py-2.5 bg-bg-2 text-navy rounded-lg font-medium text-sm hover:bg-bg transition-colors"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
