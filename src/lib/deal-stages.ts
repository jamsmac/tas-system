// Shared между Server и Client компонентами — НЕТ server-only.
// Источник истины — enum deal_stage из db/migrations/0001_init.sql.

import type { DealStage } from '@/lib/types';

export const STAGES: DealStage[] = [
  { code: 'lead', name: 'Лид',        color: '#6b7a99' },
  { code: 'nego', name: 'Переговоры', color: '#4a90e2' },
  { code: 'kp',   name: 'КП',         color: '#f39c12' },
  { code: 'dog',  name: 'Договор',    color: '#9b59b6' },
  { code: 'opl',  name: 'Оплата',     color: '#c9a227' },
  { code: 'won',  name: 'Выиграна',   color: '#2ecc71', isWon: true },
  { code: 'lost', name: 'Проиграна',  color: '#e74c3c', isLost: true },
];
