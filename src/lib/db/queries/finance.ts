import 'server-only';

import { withUser } from '@/lib/db';
import type { Currency, Invoice, InvoiceStatus, Payment } from '@/lib/types';

type InvoiceRow = {
  id: string;
  number: string;
  client_name: string;
  status: InvoiceStatus;
  amount: string;
  paid_amount: string;
  currency: Currency;
  issued_at: Date;
  due_at: Date | null;
};

export async function listInvoices(userId: string): Promise<Invoice[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<InvoiceRow[]>`
      select i.id, i.number, c.name as client_name,
             i.status, i.amount, i.paid_amount, i.currency,
             i.issued_at, i.due_at
      from invoices i
      join clients c on c.id = i.client_id
      order by i.issued_at desc
    `;
    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      clientName: r.client_name,
      status: r.status,
      total: Number(r.amount),
      paidAmount: Number(r.paid_amount),
      currency: r.currency,
      issuedAt: r.issued_at.toISOString().slice(0, 10),
      dueAt: r.due_at ? r.due_at.toISOString().slice(0, 10) : null,
    }));
  });
}

type PaymentRow = {
  id: string;
  direction: 'in' | 'out';
  account_name: string;
  amount: string;
  currency: Currency;
  paid_at: Date;
  reference: string | null;
  note: string | null;
  client_name: string | null;
};

export type PaymentExtended = Payment & { note: string | null; clientName: string | null };

export async function listPayments(userId: string): Promise<PaymentExtended[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<PaymentRow[]>`
      select p.id, p.direction, p.account_name, p.amount, p.currency,
             p.paid_at, p.reference, p.note,
             c.name as client_name
      from payments p
      left join clients c on c.id = p.client_id
      order by p.paid_at desc
    `;
    return rows.map((r) => ({
      id: r.id,
      direction: r.direction,
      accountName: r.account_name,
      amount: Number(r.amount),
      currency: r.currency,
      paidAt: r.paid_at.toISOString().slice(0, 10),
      reference: r.reference,
      note: r.note,
      clientName: r.client_name,
    }));
  });
}

export type FinanceSummary = {
  invoicesTotalUzs: number;
  invoicesPaidUzs: number;
  inflowUzs30d: number;
  outflowUzs30d: number;
  netUzs30d: number;
};

export async function loadFinanceSummary(userId: string): Promise<FinanceSummary> {
  return withUser(userId, async (tx) => {
    const [row] = await tx<
      {
        invoices_total: string;
        invoices_paid: string;
        inflow: string;
        outflow: string;
      }[]
    >`
      with rates as (
        select * from exchange_rates where date = (select max(date) from exchange_rates)
      ),
      conv as (
        select i.amount       * coalesce((select rate_uzs from rates where currency = i.currency), 1) as amount_uzs,
               i.paid_amount  * coalesce((select rate_uzs from rates where currency = i.currency), 1) as paid_uzs
        from invoices i
      ),
      pay30 as (
        select p.direction,
               sum(p.amount * coalesce((select rate_uzs from rates where currency = p.currency), 1)) as total
        from payments p
        where p.paid_at >= current_date - interval '30 days'
        group by p.direction
      )
      select
        coalesce((select sum(amount_uzs) from conv), 0)::bigint::text as invoices_total,
        coalesce((select sum(paid_uzs)  from conv), 0)::bigint::text as invoices_paid,
        coalesce((select total from pay30 where direction = 'in'),  0)::bigint::text as inflow,
        coalesce((select total from pay30 where direction = 'out'), 0)::bigint::text as outflow
    `;
    const inflow = Number(row.inflow);
    const outflow = Number(row.outflow);
    return {
      invoicesTotalUzs: Number(row.invoices_total),
      invoicesPaidUzs: Number(row.invoices_paid),
      inflowUzs30d: inflow,
      outflowUzs30d: outflow,
      netUzs30d: inflow - outflow,
    };
  });
}
