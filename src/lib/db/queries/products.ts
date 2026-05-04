import type { Product } from '@/lib/types';

const MOCK: Product[] = [
  { id: 'p-5001', sku: 'TRC-MTZ-892', name: 'Трактор МТЗ-892', brand: 'МТЗ', categoryName: 'Тракторы', variantsCount: 2, isActive: true },
  { id: 'p-5002', sku: 'OIL-15W40-5L', name: 'Масло моторное 15W-40 5л', brand: 'Lukoil', categoryName: 'Запчасти', variantsCount: 1, isActive: true },
  { id: 'p-5003', sku: 'PLW-3F-30', name: 'Плуг 3-х корпусный', brand: 'TashAgro', categoryName: 'Навесное', variantsCount: 1, isActive: true },
];

export async function listProducts(): Promise<Product[]> {
  return MOCK;
}
