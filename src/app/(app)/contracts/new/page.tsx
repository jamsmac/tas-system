import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';
import { listDeals } from '@/lib/db/queries/deals';

import { createContractAction } from '../actions';
import { ContractForm } from '../contract-form';

export const metadata = { title: 'Новый договор — TAS System' };

export default async function NewContractPage() {
  const user = await requireUser();
  const [clients, deals] = await Promise.all([
    listClients(user.userId),
    listDeals(user.userId),
  ]);
  return (
    <div className="p-6">
      <PageHeader title="Новый договор" icon="➕" />
      <ContractForm
        action={createContractAction}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        deals={deals.map((d) => ({ id: d.id, name: d.title }))}
        submitLabel="Создать"
      />
    </div>
  );
}
