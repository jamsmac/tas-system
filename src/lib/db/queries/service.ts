import type { ServiceTicket } from '@/lib/types';

const MOCK: ServiceTicket[] = [
  {
    id: 's-6001',
    number: 'SVC-2026-0042',
    type: 'warranty',
    status: 'in_progress',
    clientName: 'OOO «AgroPlus»',
    equipmentSerial: 'SN-998123',
    technicianName: 'Тимур О.',
    openedAt: '2026-05-02T08:30:00Z',
  },
  {
    id: 's-6002',
    number: 'SVC-2026-0043',
    type: 'paid',
    status: 'waiting_parts',
    clientName: 'ФХ «Зарафшан»',
    equipmentSerial: 'SN-998101',
    technicianName: 'Бахтиёр Н.',
    openedAt: '2026-05-03T11:15:00Z',
  },
  {
    id: 's-6003',
    number: 'SVC-2026-0044',
    type: 'onsite',
    status: 'open',
    clientName: 'Каримов Ш. Ш.',
    equipmentSerial: null,
    technicianName: null,
    openedAt: '2026-05-04T07:00:00Z',
  },
];

export async function listTickets(): Promise<ServiceTicket[]> {
  return MOCK;
}
