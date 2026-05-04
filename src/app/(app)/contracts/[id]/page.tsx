import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';
import { getContract } from '@/lib/db/queries/contracts';
import { listDeals } from '@/lib/db/queries/deals';

import { deleteContractAction, updateContractAction } from '../actions';
import { ContractForm } from '../contract-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const [contract, clients, deals] = await Promise.all([
    getContract(user.userId, id),
    listClients(user.userId),
    listDeals(user.userId),
  ]);
  if (!contract) notFound();

  const updateBound = updateContractAction.bind(null, id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Договор ${contract.number}`}
        icon="📄"
        subtitle={`Клиент: ${contract.clientName}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/contracts"
              className="px-3 py-2 bg-bg-2 text-navy rounded-lg text-sm font-medium hover:bg-bg transition-colors"
            >
              ← К списку
            </Link>
            <form action={deleteContractAction}>
              <input type="hidden" name="id" value={contract.id} />
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

      <ContractForm
        action={updateBound}
        initial={contract}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        deals={deals.map((d) => ({ id: d.id, name: d.title }))}
        submitLabel="Сохранить"
      />
    </div>
  );
}
