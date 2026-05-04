import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/auth/current-user';
import {
  listMovements,
  listStock,
  type MovementRow,
  type StockRow,
} from '@/lib/db/queries/warehouse';
import { formatDateTime } from '@/lib/utils/format';

const KIND_LABEL: Record<MovementRow['kind'], string> = {
  receipt: 'Приход',
  issue: 'Расход',
  transfer: 'Перемещение',
  adjustment: 'Корректировка',
  reserve: 'Резерв',
};
const KIND_TONE: Record<MovementRow['kind'], 'success' | 'danger' | 'info' | 'warning' | 'gold'> = {
  receipt: 'success',
  issue: 'danger',
  transfer: 'info',
  adjustment: 'warning',
  reserve: 'gold',
};

export const dynamic = 'force-dynamic';

export default async function WarehousePage() {
  const user = await requireUser();
  const [stock, movements] = await Promise.all([
    listStock(user.userId),
    listMovements(user.userId, 20),
  ]);

  const stockCols: Column<StockRow>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: 'productName', header: 'Товар', render: (r) => r.productName },
    { key: 'brand', header: 'Бренд', render: (r) => r.brand ?? '—' },
    { key: 'category', header: 'Категория', render: (r) => r.category ?? '—' },
    { key: 'warehouseName', header: 'Склад' },
    {
      key: 'quantity',
      header: 'Остаток',
      align: 'right',
      render: (r) => (
        <span
          className={`font-mono ${r.quantity === 0 ? 'text-text-light' : r.quantity < 5 ? 'text-warning font-bold' : 'text-navy'}`}
        >
          {r.quantity.toLocaleString('ru-RU')} {r.unit}
        </span>
      ),
    },
  ];

  const movCols: Column<MovementRow>[] = [
    { key: 'createdAt', header: 'Когда', render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'kind',
      header: 'Операция',
      render: (r) => <StatusBadge tone={KIND_TONE[r.kind]}>{KIND_LABEL[r.kind]}</StatusBadge>,
    },
    { key: 'productSku', header: 'SKU', render: (r) => <span className="font-mono text-xs">{r.productSku}</span> },
    { key: 'productName', header: 'Товар' },
    { key: 'warehouseName', header: 'Склад' },
    {
      key: 'qty',
      header: 'Кол-во',
      align: 'right',
      render: (r) => (
        <span className={`font-mono font-bold ${r.qty > 0 ? 'text-success' : 'text-danger'}`}>
          {r.qty > 0 ? '+' : ''}
          {r.qty}
        </span>
      ),
    },
    { key: 'authorName', header: 'Автор', render: (r) => r.authorName ?? '—' },
    { key: 'note', header: 'Комментарий', render: (r) => r.note ?? '—' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Склад"
        icon="📦"
        subtitle={`${stock.filter((s) => s.quantity > 0).length} позиций с остатком`}
      />

      <section>
        <h2 className="font-display font-bold text-navy mb-3">Остатки по складам</h2>
        <DataTable
          columns={stockCols}
          rows={stock}
          rowKey={(r) => `${r.warehouseId}-${r.productId}`}
          empty={<EmptyState title="Нет товаров" icon="📦" />}
        />
      </section>

      <section>
        <h2 className="font-display font-bold text-navy mb-3">Последние движения</h2>
        <DataTable
          columns={movCols}
          rows={movements}
          rowKey={(r) => r.id}
          empty={<EmptyState title="Движений нет" icon="🔁" />}
        />
      </section>
    </div>
  );
}
