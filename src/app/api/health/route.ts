import { NextResponse } from 'next/server';

import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; ms?: number; details?: string }> = {};

  // Postgres ping
  try {
    const t0 = Date.now();
    const [{ now }] = await sql<{ now: Date }[]>`select now()`;
    checks.postgres = { ok: true, ms: Date.now() - t0, details: now.toISOString() };
  } catch (e) {
    checks.postgres = { ok: false, details: e instanceof Error ? e.message : String(e) };
  }

  // Counts (proof-of-life домена)
  try {
    const [stats] = await sql<
      {
        clients: number;
        deals: number;
        tasks: number;
        contracts: number;
        sessions: number;
      }[]
    >`
      select
        (select count(*)::int from clients where deleted_at is null) as clients,
        (select count(*)::int from deals)                            as deals,
        (select count(*)::int from tasks)                            as tasks,
        (select count(*)::int from contracts)                        as contracts,
        (select count(*)::int from sessions where expires_at > now()) as sessions
    `;
    checks.domain = { ok: true, details: JSON.stringify(stats) };
  } catch (e) {
    checks.domain = { ok: false, details: e instanceof Error ? e.message : String(e) };
  }

  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      version: process.env.GIT_SHA ?? 'dev',
      env: process.env.NODE_ENV,
      latencyMs: Date.now() - startedAt,
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
