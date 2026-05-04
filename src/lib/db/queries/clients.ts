import 'server-only';

import { withUser } from '@/lib/db';
import type { Client, ClientInput } from '@/lib/types';

type ClientRow = {
  id: string;
  type: Client['type'];
  name: string;
  inn: string | null;
  pinfl: string | null;
  phone: string | null;
  email: string | null;
  segment: string | null;
  contact_person: string | null;
  address: string | null;
  notes: string | null;
  owner_name: string | null;
  created_at: Date;
};

function mapRow(r: ClientRow): Client {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    inn: r.inn,
    pinfl: r.pinfl,
    phone: r.phone,
    email: r.email,
    segment: r.segment,
    contactPerson: r.contact_person,
    address: r.address,
    notes: r.notes,
    ownerName: r.owner_name,
    createdAt: r.created_at.toISOString(),
  };
}

const SELECT = `
  c.id, c.type, c.name, c.inn, c.pinfl, c.phone, c.email, c.segment,
  c.contact_person, c.address, c.notes, c.created_at,
  p.full_name as owner_name
`;

export async function listClients(
  userId: string,
  filters: { search?: string; type?: Client['type'] } = {},
): Promise<Client[]> {
  return withUser(userId, async (tx) => {
    const search = filters.search?.trim();
    const rows = await tx<ClientRow[]>`
      select ${tx.unsafe(SELECT)}
      from clients c
      left join profiles p on p.id = c.created_by
      where c.deleted_at is null
        ${search ? tx`and (c.name ilike ${'%' + search + '%'} or c.inn = ${search} or c.pinfl = ${search} or c.phone ilike ${'%' + search + '%'})` : tx``}
        ${filters.type ? tx`and c.type = ${filters.type}` : tx``}
      order by c.created_at desc
    `;
    return rows.map(mapRow);
  });
}

export async function getClient(userId: string, id: string): Promise<Client | null> {
  return withUser(userId, async (tx) => {
    const rows = await tx<ClientRow[]>`
      select ${tx.unsafe(SELECT)}
      from clients c
      left join profiles p on p.id = c.created_by
      where c.id = ${id} and c.deleted_at is null
      limit 1
    `;
    return rows.length ? mapRow(rows[0]) : null;
  });
}

export async function createClient(userId: string, input: ClientInput): Promise<Client> {
  return withUser(userId, async (tx) => {
    const [profile] = await tx<{ organization_id: string }[]>`
      select organization_id from profiles where id = ${userId}
    `;
    const [row] = await tx<ClientRow[]>`
      insert into clients (
        organization_id, name, type, inn, pinfl, phone, email,
        segment, contact_person, address, notes, created_by
      ) values (
        ${profile.organization_id}, ${input.name}, ${input.type},
        ${input.inn ?? null}, ${input.pinfl ?? null},
        ${input.phone ?? null}, ${input.email ?? null},
        ${input.segment ?? null}, ${input.contactPerson ?? null},
        ${input.address ?? null}, ${input.notes ?? null},
        ${userId}
      )
      returning
        id, type, name, inn, pinfl, phone, email, segment,
        contact_person, address, notes, created_at,
        (select full_name from profiles where id = ${userId}) as owner_name
    `;
    return mapRow(row);
  });
}

export async function updateClient(
  userId: string,
  id: string,
  input: ClientInput,
): Promise<Client | null> {
  return withUser(userId, async (tx) => {
    const [row] = await tx<ClientRow[]>`
      update clients set
        name           = ${input.name},
        type           = ${input.type},
        inn            = ${input.inn ?? null},
        pinfl          = ${input.pinfl ?? null},
        phone          = ${input.phone ?? null},
        email          = ${input.email ?? null},
        segment        = ${input.segment ?? null},
        contact_person = ${input.contactPerson ?? null},
        address        = ${input.address ?? null},
        notes          = ${input.notes ?? null}
      where id = ${id} and deleted_at is null
      returning
        id, type, name, inn, pinfl, phone, email, segment,
        contact_person, address, notes, created_at,
        (select full_name from profiles where id = clients.created_by) as owner_name
    `;
    return row ? mapRow(row) : null;
  });
}

export async function deleteClient(userId: string, id: string): Promise<boolean> {
  return withUser(userId, async (tx) => {
    const result = await tx`
      update clients set deleted_at = now()
      where id = ${id} and deleted_at is null
    `;
    return result.count > 0;
  });
}
