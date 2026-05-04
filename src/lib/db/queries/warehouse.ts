import 'server-only';

import { withUser } from '@/lib/db';

export type StockRow = {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  sku: string;
  productName: string;
  brand: string | null;
  category: string | null;
  unit: string;
  quantity: number;
};

export async function listStock(userId: string): Promise<StockRow[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<
      {
        warehouse_id: string;
        warehouse_name: string;
        product_id: string;
        sku: string;
        product_name: string;
        brand: string | null;
        category: string | null;
        unit: string;
        quantity: string;
      }[]
    >`
      select
        w.id   as warehouse_id,
        w.name as warehouse_name,
        p.id   as product_id,
        p.sku,
        p.name as product_name,
        p.brand,
        p.category,
        p.unit,
        coalesce(sb.quantity, 0) as quantity
      from products p
      cross join warehouses w
      left join stock_balances sb on sb.product_id = p.id and sb.warehouse_id = w.id
      where p.is_active = true
      order by w.name, p.sku
    `;
    return rows.map((r) => ({
      warehouseId: r.warehouse_id,
      warehouseName: r.warehouse_name,
      productId: r.product_id,
      sku: r.sku,
      productName: r.product_name,
      brand: r.brand,
      category: r.category,
      unit: r.unit,
      quantity: Number(r.quantity),
    }));
  });
}

export type MovementRow = {
  id: string;
  warehouseName: string;
  productSku: string;
  productName: string;
  kind: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'reserve';
  qty: number;
  reference: string | null;
  note: string | null;
  authorName: string | null;
  createdAt: string;
};

export async function listMovements(userId: string, limit = 50): Promise<MovementRow[]> {
  return withUser(userId, async (tx) => {
    const rows = await tx<
      {
        id: string;
        warehouse_name: string;
        sku: string;
        product_name: string;
        kind: MovementRow['kind'];
        qty: string;
        reference: string | null;
        note: string | null;
        author_name: string | null;
        created_at: Date;
      }[]
    >`
      select sm.id::text, w.name as warehouse_name, p.sku, p.name as product_name,
             sm.kind, sm.qty, sm.reference, sm.note,
             pr.full_name as author_name, sm.created_at
      from stock_movements sm
      join warehouses w  on w.id = sm.warehouse_id
      join products   p  on p.id = sm.product_id
      left join profiles pr on pr.id = sm.created_by
      order by sm.created_at desc
      limit ${limit}
    `;
    return rows.map((r) => ({
      id: r.id,
      warehouseName: r.warehouse_name,
      productSku: r.sku,
      productName: r.product_name,
      kind: r.kind,
      qty: Number(r.qty),
      reference: r.reference,
      note: r.note,
      authorName: r.author_name,
      createdAt: r.created_at.toISOString(),
    }));
  });
}
