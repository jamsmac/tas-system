import { PageHeader } from '@/components/ui/page-header';

const ROLES = [
  { code: 'admin',            name: 'Администратор',         desc: 'Полный доступ ко всем модулям' },
  { code: 'sales_manager',    name: 'Менеджер по продажам',  desc: 'CRM: клиенты, сделки, договоры, счета' },
  { code: 'warehouse_keeper', name: 'Кладовщик',             desc: 'Каталог, остатки, движение товаров, поставщики' },
  { code: 'technician',       name: 'Сервис-инженер',        desc: 'Сервисные заявки, парк техники, гарантии' },
  { code: 'accountant',       name: 'Бухгалтер',             desc: 'Счета, платежи, расходы, отчёты' },
  { code: 'viewer',           name: 'Наблюдатель',           desc: 'Только чтение — без редактирования' },
];

export default function RolesPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Роли" icon="🛡️" subtitle="Права доступа и RLS-политики" />
      <div className="bg-white border border-bg-2 rounded-2xl divide-y divide-bg-2">
        {ROLES.map((r) => (
          <div key={r.code} className="p-4 flex items-start gap-4">
            <div className="font-mono text-xs text-text-mid w-36 flex-shrink-0">{r.code}</div>
            <div>
              <div className="font-medium text-navy">{r.name}</div>
              <div className="text-sm text-text-mid">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
