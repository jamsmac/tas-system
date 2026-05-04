import { PageHeader } from '@/components/ui/page-header';

import { createClientAction } from '../actions';
import { ClientForm } from '../client-form';

export const metadata = { title: 'Новый клиент — TAS System' };

export default function NewClientPage() {
  return (
    <div className="p-6">
      <PageHeader title="Новый клиент" icon="➕" subtitle="Добавление в базу TEXNIKA ADVANS" />
      <ClientForm action={createClientAction} submitLabel="Создать" cancelHref="/clients" />
    </div>
  );
}
