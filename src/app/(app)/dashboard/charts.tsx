'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DealsByStage, RevenueByDay } from '@/lib/db/queries/dashboard';

const STAGE_LABEL: Record<string, string> = {
  lead: 'Лид',
  nego: 'Переговоры',
  kp: 'КП',
  dog: 'Договор',
  opl: 'Оплата',
  won: 'Выигран',
  lost: 'Проигран',
};

export function StageBars({ data }: { data: DealsByStage }) {
  const chartData = data.map((d) => ({ stage: STAGE_LABEL[d.stage] ?? d.stage, count: d.count }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
        <XAxis dataKey="stage" stroke="#6b7a99" fontSize={11} />
        <YAxis allowDecimals={false} stroke="#6b7a99" fontSize={11} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e8e4de', fontSize: 12 }}
        />
        <Bar dataKey="count" fill="#c9a227" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLine({ data }: { data: RevenueByDay }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
        <XAxis dataKey="day" stroke="#6b7a99" fontSize={11} tickFormatter={(d) => d.slice(5)} />
        <YAxis stroke="#6b7a99" fontSize={11} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e8e4de', fontSize: 12 }}
          formatter={(v) => [`${Number(v).toLocaleString('ru-RU')} UZS`, 'Выручка']}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#1a2744"
          strokeWidth={2.5}
          dot={{ fill: '#c9a227', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
