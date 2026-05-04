import { NextResponse } from 'next/server';

import { sql } from '@/lib/db';

export async function GET() {
  try {
    const [{ now, version }] = await sql<{ now: Date; version: string }[]>`
      select now(), version()
    `;
    const [{ count }] = await sql<{ count: number }[]>`
      select count(*)::int as count from clients
    `;
    return NextResponse.json({
      status: 'ok',
      now,
      postgres: version,
      clients_total: count,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : String(error) },
      { status: 503 },
    );
  }
}
