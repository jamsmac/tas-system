// Бизнес-типы домена.
// Источник истины — db/migrations/0001_init.sql (enum'ы deal_stage, currency,
// task_status, contract_status, user_role). После добавления `pg-to-ts` или
// `kysely-codegen` можно автогенерировать; пока поддерживаем вручную.

export type Currency = 'UZS' | 'USD' | 'EUR' | 'CNY' | 'RUB';

export type ClientType = 'b2b' | 'b2c' | 'gov' | 'other';

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  inn?: string | null;
  pinfl?: string | null;
  phone?: string | null;
  email?: string | null;
  segment?: string | null;
  ownerName?: string | null;
  createdAt: string;
}

// Соответствует enum deal_stage из 0001_init.sql
export type DealStageCode = 'lead' | 'nego' | 'kp' | 'dog' | 'opl' | 'won' | 'lost';

export interface DealStage {
  code: DealStageCode;
  name: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface Deal {
  id: string;
  title: string;
  clientName: string;
  stageCode: DealStageCode;
  amount: number;
  currency: Currency;
  expectedClose: string | null;
  ownerName: string | null;
  createdAt: string;
}

// Соответствует enum task_status (todo / in_progress / done / cancelled)
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueAt: string | null;
  assigneeName: string | null;
  context: { kind: 'client' | 'deal' | 'ticket'; label: string } | null;
}

// contract_status enum: draft / signed / paid / shipped / closed / cancelled
export type ContractStatus = 'draft' | 'signed' | 'paid' | 'shipped' | 'closed' | 'cancelled';
export type ContractType = 'sale' | 'service' | 'lease';

export interface Contract {
  id: string;
  number: string;
  type: ContractType;
  status: ContractStatus;
  clientName: string;
  amount: number;
  currency: Currency;
  signedAt: string | null;
  expiresAt: string | null;
}

// Каталог / склад — таблиц пока нет в Phase 1, типы под целевую модель.
export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  categoryName: string | null;
  variantsCount: number;
  isActive: boolean;
}

export interface StockRow {
  variantSku: string;
  productName: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
}

export type ServiceStatus = 'open' | 'in_progress' | 'waiting_parts' | 'done' | 'cancelled';
export type ServiceType = 'warranty' | 'paid' | 'onsite';

export interface ServiceTicket {
  id: string;
  number: string;
  type: ServiceType;
  status: ServiceStatus;
  clientName: string;
  equipmentSerial: string | null;
  technicianName: string | null;
  openedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  status: InvoiceStatus;
  total: number;
  paidAmount: number;
  currency: Currency;
  issuedAt: string;
  dueAt: string | null;
}

export type PaymentDirection = 'in' | 'out';

export interface Payment {
  id: string;
  direction: PaymentDirection;
  accountName: string;
  amount: number;
  currency: Currency;
  paidAt: string;
  reference: string | null;
}

export interface Expense {
  id: string;
  title: string;
  categoryName: string;
  amount: number;
  currency: Currency;
  incurredAt: string;
  status: 'pending' | 'paid' | 'cancelled';
}
