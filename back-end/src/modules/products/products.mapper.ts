import type { CollectionType, Product } from '@prisma/client';

export type FrontProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  variant: string;
  badge?: string;
  featured?: boolean;
};

function toFront(product: Product): FrontProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    variant: product.variant,
    badge: product.badge ?? undefined,
    featured: product.featured,
  };
}

export function mapProductsForFront(products: Product[]) {
  const curated: FrontProduct[] = [];
  const more: FrontProduct[] = [];

  for (const product of products) {
    const mapped = toFront(product);
    if (product.collectionType === 'CURATED') curated.push(mapped);
    else more.push(mapped);
  }

  return { curated, more };
}

export function splitByCollection<T extends { collectionType: CollectionType }>(products: T[]) {
  return {
    curated: products.filter((p) => p.collectionType === 'CURATED'),
    more: products.filter((p) => p.collectionType === 'MORE'),
  };
}
