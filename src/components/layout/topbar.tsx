import { getCurrentUser } from '@/lib/auth/current-user';

const ROLE_LABEL: Record<string, string> = {
  admin: '👑 Администратор',
  manager: '👤 Менеджер',
  viewer: '👁 Наблюдатель',
};

export async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="h-[var(--topbar-h)] bg-white border-b border-bg-2 flex items-center px-5 gap-3 flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-text-mid">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          Онлайн
        </span>
        {user && (
          <>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-2 transition-colors">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: user.avatarColor }}
              >
                {user.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-navy">{user.fullName}</div>
                <div className="text-[10px] text-text-mid">{ROLE_LABEL[user.role]}</div>
              </div>
            </div>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 border-[1.5px] border-danger/25 text-danger rounded-lg text-xs font-bold hover:bg-danger/20 transition-colors cursor-pointer"
              >
                🚪 Выйти
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
