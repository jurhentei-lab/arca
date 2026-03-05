export type AppView = 'auth' | 'landing';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  variant: string;
  badge?: string;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName?: string | null;
  note?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export type CartItem = Product & {
  qty: number;
};
