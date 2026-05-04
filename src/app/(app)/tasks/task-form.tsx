'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import type { TaskStatus } from '@/lib/types';

import type { TaskFormState } from './actions';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Готово' },
  { value: 'cancelled', label: 'Отменена' },
];

interface Option {
  id: string;
  name: string;
}

interface Props {
  action: (s: TaskFormState, fd: FormData) => Promise<TaskFormState>;
  initial?: {
    title: string;
    description: string | null;
    status: TaskStatus;
    dueAt: string | null;
    clientId: string | null;
    dealId: string | null;
  };
  clients: Option[];
  deals: Option[];
  submitLabel: string;
}

const initialState: TaskFormState = { status: 'idle' };

export function TaskForm({ action, initial, clients, deals, submitLabel }: Props) {
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
            Что нужно сделать *
          </label>
          <input
            name="title"
            defaultValue={initial?.title ?? ''}
            required
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
          {fe.title?.[0] && <div className="text-[11px] text-danger mt-1">{fe.title[0]}</div>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Статус *
          </label>
          <select
            name="status"
            defaultValue={initial?.status ?? 'todo'}
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
            Срок
          </label>
          <input
            name="dueAt"
            type="date"
            defaultValue={initial?.dueAt?.slice(0, 10) ?? ''}
            className="w-full px-3 py-2 bg-bg border border-bg-2 rounded-lg text-sm outline-none focus:border-gold focus:bg-white"
          />
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
            <option value="">— не выбран —</option>
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
            <option value="">— не выбрана —</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-mid mb-1">
            Описание
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ''}
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
          href="/tasks"
          className="px-5 py-2.5 bg-bg-2 text-navy rounded-lg font-medium text-sm hover:bg-bg transition-colors"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
