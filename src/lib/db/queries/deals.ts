// TODO(Phase-3): заменить мок на sql`select * from deals where ...`.

import type { Deal, DealStage } from '@/lib/types';

// Соответствует enum deal_stage в db/migrations/0001_init.sql
export const STAGES: DealStage[] = [
  { code: 'lead', name: 'Лид',         color: '#6b7a99' },
  { code: 'nego', name: 'Переговоры',  color: '#4a90e2' },
  { code: 'kp',   name: 'КП',          color: '#4a90e2' },
  { code: 'dog',  name: 'Договор',     color: '#f39c12' },
  { code: 'opl',  name: 'Оплата',      color: '#c9a227' },
  { code: 'won',  name: 'Выиграна',    color: '#2ecc71', isWon: true },
  { code: 'lost', name: 'Проиграна',   color: '#e74c3c', isLost: true },
];

const MOCK: Deal[] = [
  {
    id: 'd-2001',
    title: 'МТЗ-892 для AgroPlus',
    clientName: 'OOO «AgroPlus»',
    stageCode: 'nego',
    amount: 320_000_000,
    currency: 'UZS',
    expectedClose: '2026-05-30',
    ownerName: 'Алишер К.',
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'd-2002',
    title: 'Запчасти ФХ «Зарафшан»',
    clientName: 'ФХ «Зарафшан»',
    stageCode: 'kp',
    amount: 18_500_000,
    currency: 'UZS',
    expectedClose: '2026-05-12',
    ownerName: 'Алишер К.',
    createdAt: '2026-04-22T11:00:00Z',
  },
  {
    id: 'd-2003',
    title: 'Розничный контракт Каримов',
    clientName: 'Каримов Ш. Ш.',
    stageCode: 'dog',
    amount: 365_000_000,
    currency: 'UZS',
    expectedClose: '2026-05-20',
    ownerName: 'Дилшод М.',
    createdAt: '2026-04-25T15:00:00Z',
  },
];

export async function listDeals(): Promise<Deal[]> {
  return MOCK;
}

export async function getDeal(id: string): Promise<Deal | null> {
  return MOCK.find((d) => d.id === id) ?? null;
}

export async function dealsByStage(): Promise<Record<string, Deal[]>> {
  return MOCK.reduce<Record<string, Deal[]>>((acc, d) => {
    (acc[d.stageCode] ??= []).push(d);
    return acc;
  }, {});
}
