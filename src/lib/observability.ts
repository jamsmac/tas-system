import 'server-only';

/**
 * Phase 7 stubs: пока без реальных Sentry/PostHog SDK.
 * Когда появятся ключи — инициализация добавится в instrumentation.ts.
 *
 * Эти helpers безопасно вызывать из любого Server Component / Action —
 * они no-op если env vars не заданы.
 */

export function captureError(err: unknown, ctx?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.error('[obs:error]', err, ctx ?? {});
  if (process.env.SENTRY_DSN) {
    // TODO: Sentry.captureException(err, { extra: ctx });
  }
}

export function captureEvent(name: string, props?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[obs:event]', name, props ?? {});
  }
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // TODO: posthog.capture(name, props);
  }
}
