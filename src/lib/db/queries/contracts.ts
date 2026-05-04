import 'server-only';

import { withUser } from '@/lib/db';
import type { Contract, ContractStatus, Currency } from '@/lib/types';

type ContractRow = {
  id: string;
  number: string;
  status: ContractStatus;
  amount: string;
  currency: Currency;
  signed_at: Date | null;
  paid_at: Date | null;
  shipped_at: Date | null;
  client_id: string;
  client_name: string;
  deal_id: string | null;
};

export type ContractFull = Contract & {
  clientId: string;
  dealId: string | null;
};

function mapRow(r: ContractRow): ContractFull {
  return {
    id: r.id,
    number: r.number,
    type: 'sale',
    status: r.status,
    clientName: r.client_name,
    amount: Number(r.amount),
    currency: r.currency,
    signedAt: r.signed_at ? r.signed_at.toISOString().slice(0, 10) : null,
    expiresAt: null,
    clientId: r.client_id,
    dealId: r.deal_id,
  };
}

const SELECT = `
  k.id, k.number, k.status, k.amount, k.currency,
  k.signed_at, k.paid_at, k.shipped_at,
  k.client_id, k.deal_id,
  c.name as client_name
`;

export async function listContracts(userId: string): Promise<ContractFull[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<ContractRow[]>`
      select ${tx.unsafe(SELECT)}
      from contracts k
      join clients c on c.id = k.client_id
      order by k.created_at desc
    `;
    return rows.map(mapRow);
  });
}

export async function getContract(userId: string, id: string): Promise<ContractFull | null> {
  return withUser(userId, async (tx) => {
    const rows = await tx<ContractRow[]>`
      select ${tx.unsafe(SELECT)}
      from contracts k
      join clients c on c.id = k.client_id
      where k.id = ${id}
      limit 1
    `;
    return rows.length ? mapRow(rows[0]) : null;
  });
}

export type ContractInput = {
  number: string;
  status: ContractStatus;
  amount: number;
  currency: Currency;
  clientId: string;
  dealId: string | null;
  signedAt: string | null;
};

export async function createContract(userId: string, input: ContractInput): Promise<ContractFull> {
  return withUser(userId, async (tx) => {
    const [profile] = await tx<{ organization_id: string }[]>`
      select organization_id from profiles where id = ${userId}
    `;
    const [row] = await tx<ContractRow[]>`
      insert into contracts (organization_id, client_id, deal_id, number, status, amount, currency, signed_at, created_by)
      values (
        ${profile.organization_id}, ${input.clientId}, ${input.dealId},
        ${input.number}, ${input.status}, ${input.amount}, ${input.currency},
        ${input.signedAt}, ${userId}
      )
      returning
        id, number, status, amount, currency,
        signed_at, paid_at, shipped_at,
        client_id, deal_id,
        (select name from clients where id = ${input.clientId}) as client_name
    `;
    return mapRow(row);
  });
}

export async function updateContract(
  userId: string,
  id: string,
  input: ContractInput,
): Promise<ContractFull | null> {
  return withUser(userId, async (tx) => {
    const [row] = await tx<ContractRow[]>`
      update contracts set
        client_id = ${input.clientId},
        deal_id   = ${input.dealId},
        number    = ${input.number},
        status    = ${input.status},
        amount    = ${input.amount},
        currency  = ${input.currency},
        signed_at = ${input.signedAt},
        paid_at   = case when ${input.status} = 'paid'    and paid_at    is null then now() else paid_at end,
        shipped_at= case when ${input.status} = 'shipped' and shipped_at is null then now() else shipped_at end
      where id = ${id}
      returning
        id, number, status, amount, currency,
        signed_at, paid_at, shipped_at,
        client_id, deal_id,
        (select name from clients where id = ${input.clientId}) as client_name
    `;
    return row ? mapRow(row) : null;
  });
}

export async function deleteContract(userId: string, id: string): Promise<boolean> {
  return withUser(userId, async (tx) => {
    const result = await tx`delete from contracts where id = ${id}`;
    return result.count > 0;
  });
}
