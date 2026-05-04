import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { getClient } from '@/lib/db/queries/clients';
import { formatDate } from '@/lib/utils/format';

import { deleteClientAction, updateClientAction } from '../actions';
import { ClientForm } from '../client-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const client = await getClient(user.userId, id);
  if (!client) notFound();

  const updateBound = updateClientAction.bind(null, id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={client.name}
        icon="👤"
        subtitle={`Создан ${formatDate(client.createdAt)} · ${client.ownerName ?? '—'}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/clients"
              className="px-3 py-2 bg-bg-2 text-navy rounded-lg text-sm font-medium hover:bg-bg transition-colors"
            >
              ← К списку
            </Link>
            {/* Delete — отдельный <form>, ВНЕ ClientForm чтобы избежать nested-form */}
            <form action={deleteClientAction}>
              <input type="hidden" name="id" value={client.id} />
              <button
                type="submit"
                className="px-3 py-2 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm font-bold hover:bg-danger/20 transition-colors cursor-pointer"
              >
                🗑 Удалить
              </button>
            </form>
          </div>
        }
      />

      <ClientForm
        action={updateBound}
        initial={client}
        submitLabel="Сохранить"
        cancelHref="/clients"
      />
    </div>
  );
}
