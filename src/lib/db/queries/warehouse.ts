import type { StockRow } from '@/lib/types';

const MOCK: StockRow[] = [
  { variantSku: 'TRC-MTZ-892-STD',  productName: 'Трактор МТЗ-892 (Стандарт)', warehouseName: 'Центральный',     quantity: 4, reserved: 1 },
  { variantSku: 'TRC-MTZ-892-PREM', productName: 'Трактор МТЗ-892 (Премиум)',  warehouseName: 'Центральный',     quantity: 2, reserved: 0 },
  { variantSku: 'OIL-15W40-5L-1',   productName: 'Масло 15W-40 5л',            warehouseName: 'Центральный',     quantity: 120, reserved: 8 },
  { variantSku: 'OIL-15W40-5L-1',   productName: 'Масло 15W-40 5л',            warehouseName: 'Сервис Фергана',  quantity: 24, reserved: 0 },
];

export async function listStock(): Promise<StockRow[]> {
  return MOCK;
}
