import 'server-only';

import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy .env.example → .env.local.');
}

// One pool per Node process. Reuse across HMR reloads in dev.
export const sql =
  globalThis.__sql ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__sql = sql;
}

/**
 * Запускает callback в транзакции с установленным RLS-контекстом.
 *
 * Все запросы внутри увидят только данные организации текущего юзера.
 * Без вызова — RLS-политики вернут 0 строк (защитное поведение).
 */
export async function withUser<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  const result = await sql.begin(async (tx) => {
    await tx`select set_config('app.current_user_id', ${userId}, true)`;
    return fn(tx);
  });
  return result as T;
}
