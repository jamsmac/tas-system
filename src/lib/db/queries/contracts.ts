// TODO(Phase-3): заменить мок на sql`select * from contracts where ...`.

import type { Contract } from '@/lib/types';

const MOCK: Contract[] = [
  {
    id: 'k-4001',
    number: 'TAS-2026-0001',
    type: 'sale',
    status: 'paid',
    clientName: 'OOO «AgroPlus»',
    amount: 320_000_000,
    currency: 'UZS',
    signedAt: '2026-03-20',
    expiresAt: null,
  },
  {
    id: 'k-4002',
    number: 'TAS-2026-0002',
    type: 'service',
    status: 'signed',
    clientName: 'ФХ «Зарафшан»',
    amount: 12_000_000,
    currency: 'UZS',
    signedAt: '2026-04-12',
    expiresAt: '2027-04-12',
  },
];

export async function listContracts(): Promise<Contract[]> {
  return MOCK;
}
