import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { listStock } from '@/lib/db/queries/warehouse';
import type { StockRow } from '@/lib/types';

export default async function StockPage() {
  const rows = await listStock();

  const columns: Column<StockRow>[] = [
    { key: 'variantSku', header: 'SKU', render: (r) => <span className="font-mono">{r.variantSku}</span> },
    { key: 'productName', header: 'Товар' },
    { key: 'warehouseName', header: 'Склад' },
    {
      key: 'quantity',
      header: 'Остаток',
      align: 'right',
      render: (r) => <span className="font-mono">{r.quantity}</span>,
    },
    {
      key: 'reserved',
      header: 'Резерв',
      align: 'right',
      render: (r) => <span className="font-mono text-warning">{r.reserved}</span>,
    },
    {
      key: 'available',
      header: 'Доступно',
      align: 'right',
      render: (r) => <span className="font-mono text-success">{r.quantity - r.reserved}</span>,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Остатки" icon="📦" subtitle="По складам и SKU" />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => `${r.variantSku}-${r.warehouseName}`}
        empty={<EmptyState title="Остатков нет" icon="📦" />}
      />
    </div>
  );
}
