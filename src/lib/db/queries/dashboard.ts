import 'server-only';

import { withUser } from '@/lib/db';

export type DashboardKpis = {
  clientsTotal: number;
  dealsTotal: number;
  dealsActive: number;
  dealsWon: number;
  revenueUzs30d: number;
  tasksOpen: number;
  tasksOverdue: number;
};

export type DealsByStage = { stage: string; count: number }[];
export type RevenueByDay = { day: string; amount: number }[];

export async function loadDashboard(userId: string): Promise<{
  kpis: DashboardKpis;
  byStage: DealsByStage;
  byDay: RevenueByDay;
}> {
  return withUser(userId, async (tx) => {
    const [kpisRow] = await tx<DashboardKpis[]>`
      select
        (select count(*)::int from clients where deleted_at is null) as "clientsTotal",
        (select count(*)::int from deals)                            as "dealsTotal",
        (select count(*)::int from deals where stage not in ('won','lost')) as "dealsActive",
        (select count(*)::int from deals where stage = 'won')        as "dealsWon",
        coalesce((
          select sum(amount)::bigint
          from deals
          where stage = 'won' and closed_at >= now() - interval '30 days'
        ), 0)::bigint                                                as "revenueUzs30d",
        (select count(*)::int from tasks where status != 'done')     as "tasksOpen",
        (select count(*)::int from tasks where status != 'done' and due_date < now()) as "tasksOverdue"
    `;

    const byStage = await tx<DealsByStage>`
      select stage, count(*)::int as count
      from deals
      group by stage
      order by stage
    `;

    const byDay = await tx<RevenueByDay>`
      select to_char(d::date, 'YYYY-MM-DD') as day,
             coalesce(sum(deals.amount)::bigint, 0) as amount
      from generate_series(now() - interval '13 days', now(), interval '1 day') d
      left join deals on deals.closed_at::date = d::date and deals.stage = 'won'
      group by d::date
      order by d::date
    `;

    return { kpis: kpisRow, byStage, byDay };
  });
}
