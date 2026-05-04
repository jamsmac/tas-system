import { redirect } from 'next/navigation';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { getCurrentUser } from '@/lib/auth/current-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    // Cookie прошла Edge-proxy, но сессии в БД нет (истекла/удалена).
    // /api/auth/clear удалит cookie (Server Component не может) + редирект на /login.
    redirect('/api/auth/clear');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-bg">{children}</main>
      </div>
    </div>
  );
}
