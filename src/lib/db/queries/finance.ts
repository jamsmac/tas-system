import type { Invoice, Payment, Expense } from '@/lib/types';

const INVOICES: Invoice[] = [
  {
    id: 'i-7001', number: 'INV-2026-0001', clientName: 'OOO «AgroPlus»',
    status: 'paid',     total: 320_000_000, paidAmount: 320_000_000, currency: 'UZS',
    issuedAt: '2026-03-22', dueAt: '2026-04-05',
  },
  {
    id: 'i-7002', number: 'INV-2026-0002', clientName: 'ФХ «Зарафшан»',
    status: 'sent',     total: 12_000_000,  paidAmount: 0,           currency: 'UZS',
    issuedAt: '2026-04-15', dueAt: '2026-05-15',
  },
  {
    id: 'i-7003', number: 'INV-2026-0003', clientName: 'Каримов Ш. Ш.',
    status: 'overdue',  total: 365_000_000, paidAmount: 50_000_000,  currency: 'UZS',
    issuedAt: '2026-04-20', dueAt: '2026-05-01',
  },
];

const PAYMENTS: Payment[] = [
  { id: 'pay-8001', direction: 'in',  accountName: 'Расчётный счёт UZS', amount: 320_000_000, currency: 'UZS', paidAt: '2026-03-25', reference: 'PP №2401' },
  { id: 'pay-8002', direction: 'in',  accountName: 'Касса',              amount:  50_000_000, currency: 'UZS', paidAt: '2026-04-22', reference: 'Каримов аванс' },
  { id: 'pay-8003', direction: 'out', accountName: 'Расчётный счёт UZS', amount:   8_000_000, currency: 'UZS', paidAt: '2026-04-30', reference: 'AgroTech Ltd — поставка' },
];

const EXPENSES: Expense[] = [
  { id: 'e-9001', title: 'Аренда офиса',       categoryName: 'Аренда',      amount: 12_000_000, currency: 'UZS', incurredAt: '2026-05-01', status: 'paid' },
  { id: 'e-9002', title: 'Реклама Facebook',   categoryName: 'Маркетинг',   amount:  3_500_000, currency: 'UZS', incurredAt: '2026-04-28', status: 'paid' },
  { id: 'e-9003', title: 'Доставка комбайна',  categoryName: 'Логистика',   amount:  4_200_000, currency: 'UZS', incurredAt: '2026-04-30', status: 'pending' },
];

export async function listInvoices(): Promise<Invoice[]> { return INVOICES; }
export async function listPayments(): Promise<Payment[]> { return PAYMENTS; }
export async function listExpenses(): Promise<Expense[]> { return EXPENSES; }
