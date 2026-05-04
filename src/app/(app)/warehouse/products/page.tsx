import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { listProducts } from '@/lib/db/queries/products';
import type { Product } from '@/lib/types';

export default async function ProductsPage() {
  const rows = await listProducts();

  const columns: Column<Product>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono">{r.sku}</span> },
    { key: 'name', header: 'Наименование', render: (r) => <span className="font-medium text-navy">{r.name}</span> },
    { key: 'brand', header: 'Бренд', render: (r) => r.brand ?? '—' },
    { key: 'categoryName', header: 'Категория', render: (r) => r.categoryName ?? '—' },
    { key: 'variantsCount', header: 'Варианты', align: 'right' },
    {
      key: 'isActive',
      header: 'Статус',
      render: (r) => (
        <StatusBadge tone={r.isActive ? 'success' : 'neutral'}>
          {r.isActive ? 'Активен' : 'Архив'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Товары" icon="🏷️" subtitle="Каталог моделей и SKU" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Каталог пуст" icon="🏷️" />} />
    </div>
  );
}
