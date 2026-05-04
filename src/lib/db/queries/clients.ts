// TODO(Phase-3): заменить мок на sql`select * from ...`).
// Пока возвращаем типизированный стаб, чтобы UI рендерился без БД.

import type { Client } from '@/lib/types';

const MOCK: Client[] = [
  {
    id: 'c-1001',
    type: 'b2b',
    name: 'OOO «AgroPlus»',
    inn: '301234567',
    phone: '+998 71 200-12-34',
    email: 'office@agroplus.uz',
    segment: 'Крупный',
    ownerName: 'Алишер К.',
    createdAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'c-1002',
    type: 'b2c',
    name: 'Каримов Ш. Ш.',
    pinfl: '12345678901234',
    phone: '+998 90 123-45-67',
    segment: 'Розница',
    ownerName: 'Дилшод М.',
    createdAt: '2026-04-20T08:30:00Z',
  },
  {
    id: 'c-1003',
    type: 'b2b',
    name: 'ФХ «Зарафшан»',
    inn: '305555555',
    phone: '+998 66 220-11-11',
    segment: 'Средний',
    ownerName: 'Алишер К.',
    createdAt: '2026-04-25T14:20:00Z',
  },
];

export async function listClients(): Promise<Client[]> {
  return MOCK;
}

export async function getClient(id: string): Promise<Client | null> {
  return MOCK.find((c) => c.id === id) ?? null;
}
