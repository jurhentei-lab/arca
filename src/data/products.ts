import type { Product } from '../types';

export const curatedProducts: Product[] = [];

export const moreProducts: Product[] = [];

export const allProducts: Product[] = [...curatedProducts, ...moreProducts];
