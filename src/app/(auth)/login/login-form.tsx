'use client';

import { useActionState } from 'react';

import { loginAction, type LoginResult } from './actions';

const initialState: LoginResult = undefined;

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">
          Email
        </label>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          placeholder="admin@tas.dev"
          className="w-full px-3.5 py-2.5 bg-white/5 border-[1.5px] border-white/10 rounded-[10px] text-white text-sm outline-none focus:border-gold focus:bg-white/10 transition-colors placeholder:text-white/25"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">
          Пароль
        </label>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 bg-white/5 border-[1.5px] border-white/10 rounded-[10px] text-white text-sm outline-none focus:border-gold focus:bg-white/10 transition-colors placeholder:text-white/25"
        />
      </div>

      {state?.error && (
        <div
          role="alert"
          className="bg-danger/10 border border-danger/30 rounded-lg px-3.5 py-2.5 text-[13px] text-[#ff8a80] text-center"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-gradient-to-br from-gold to-gold-light text-navy-dark border-none rounded-[10px] text-sm font-extrabold font-display cursor-pointer shadow-lg shadow-gold/40 disabled:opacity-60 disabled:cursor-wait transition-opacity"
      >
        {pending ? 'Проверяем…' : '🔐 Войти в систему'}
      </button>
    </form>
  );
}
