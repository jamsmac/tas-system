import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/auth/current-user';
import { listClients } from '@/lib/db/queries/clients';

import { createDealAction } from '../actions';
import { DealForm } from '../deal-form';

export const metadata = { title: 'Новая сделка — TAS System' };

export default async function NewDealPage() {
  const user = await requireUser();
  const clients = await listClients(user.userId);

  return (
    <div className="p-6">
      <PageHeader title="Новая сделка" icon="➕" />
      <DealForm
        action={createDealAction}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        submitLabel="Создать"
      />
    </div>
  );
}
