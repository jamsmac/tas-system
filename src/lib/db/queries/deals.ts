import 'server-only';

import { withUser } from '@/lib/db';
import type { Currency, Deal, DealStage, DealStageCode } from '@/lib/types';

export const STAGES: DealStage[] = [
  { code: 'lead', name: 'Лид',        color: '#6b7a99' },
  { code: 'nego', name: 'Переговоры', color: '#4a90e2' },
  { code: 'kp',   name: 'КП',         color: '#f39c12' },
  { code: 'dog',  name: 'Договор',    color: '#9b59b6' },
  { code: 'opl',  name: 'Оплата',     color: '#c9a227' },
  { code: 'won',  name: 'Выиграна',   color: '#2ecc71', isWon: true },
  { code: 'lost', name: 'Проиграна',  color: '#e74c3c', isLost: true },
];

type DealRow = {
  id: string;
  title: string;
  client_id: string | null;
  client_name: string | null;
  stage_code: DealStageCode;
  amount: string;
  currency: Currency;
  expected_close: Date | null;
  owner_name: string | null;
  created_at: Date;
};

function mapRow(r: DealRow): Deal & { clientId: string | null } {
  return {
    id: r.id,
    title: r.title,
    clientName: r.client_name ?? '—',
    stageCode: r.stage_code,
    amount: Number(r.amount),
    currency: r.currency,
    expectedClose: r.expected_close ? r.expected_close.toISOString() : null,
    ownerName: r.owner_name,
    createdAt: r.created_at.toISOString(),
    clientId: r.client_id,
  };
}

const SELECT = `
  d.id,
  d.name as title,
  d.client_id,
  d.stage as stage_code,
  d.amount,
  d.currency,
  d.deadline as expected_close,
  d.created_at,
  c.name as client_name,
  p.full_name as owner_name
`;

export async function listDeals(userId: string): Promise<Deal[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<DealRow[]>`
      select ${tx.unsafe(SELECT)}
      from deals d
      left join clients c  on c.id = d.client_id
      left join profiles p on p.id = d.manager_id
      order by d.created_at desc
    `;
    return rows.map(mapRow);
  });
}

export async function getDeal(userId: string, id: string) {
  return withUser(userId, async (tx) => {
    const rows = await tx<DealRow[]>`
      select ${tx.unsafe(SELECT)}
      from deals d
      left join clients c  on c.id = d.client_id
      left join profiles p on p.id = d.manager_id
      where d.id = ${id}
      limit 1
    `;
    return rows.length ? mapRow(rows[0]) : null;
  });
}

export type DealInput = {
  title: string;
  clientId: string | null;
  stageCode: DealStageCode;
  amount: number;
  currency: Currency;
  expectedClose: string | null;
};

export async function createDeal(userId: string, input: DealInput): Promise<Deal> {
  return withUser(userId, async (tx) => {
    const [profile] = await tx<{ organization_id: string }[]>`
      select organization_id from profiles where id = ${userId}
    `;
    const [row] = await tx<DealRow[]>`
      insert into deals (organization_id, client_id, manager_id, name, stage, amount, currency, deadline)
      values (
        ${profile.organization_id},
        ${input.clientId},
        ${userId},
        ${input.title},
        ${input.stageCode},
        ${input.amount},
        ${input.currency},
        ${input.expectedClose}
      )
      returning
        id,
        name as title,
        client_id,
        stage as stage_code,
        amount,
        currency,
        deadline as expected_close,
        created_at,
        (select name from clients where id = ${input.clientId}) as client_name,
        (select full_name from profiles where id = ${userId}) as owner_name
    `;
    return mapRow(row);
  });
}

export async function updateDeal(userId: string, id: string, input: DealInput) {
  return withUser(userId, async (tx) => {
    const [row] = await tx<DealRow[]>`
      update deals set
        name      = ${input.title},
        client_id = ${input.clientId},
        stage     = ${input.stageCode},
        amount    = ${input.amount},
        currency  = ${input.currency},
        deadline  = ${input.expectedClose}
      where id = ${id}
      returning
        id,
        name as title,
        client_id,
        stage as stage_code,
        amount,
        currency,
        deadline as expected_close,
        created_at,
        (select name from clients where id = ${input.clientId}) as client_name,
        (select full_name from profiles where id = manager_id) as owner_name
    `;
    return row ? mapRow(row) : null;
  });
}

export async function moveDealStage(userId: string, id: string, stage: DealStageCode): Promise<void> {
  await withUser(userId, async (tx) => {
    await tx`
      update deals
      set stage = ${stage},
          closed_at = case when ${stage} in ('won','lost') then now() else null end
      where id = ${id}
    `;
  });
}

export async function deleteDeal(userId: string, id: string): Promise<boolean> {
  return withUser(userId, async (tx) => {
    const result = await tx`delete from deals where id = ${id}`;
    return result.count > 0;
  });
}
