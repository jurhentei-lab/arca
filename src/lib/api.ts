import type { Order, Product, User } from '../types';

const API_BASE = (() => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:4000/api';
  }

  return '/api';
})();

type AuthResponse = {
  token: string;
  user: User;
};

type ProductsResponse = {
  curated: Product[];
  more: Product[];
};

type OrdersResponse = {
  orders: Order[];
};

type ProductPayload = Product & {
  collectionType: 'CURATED' | 'MORE';
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // Non-JSON error body is already handled.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  signUp(input: { name: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getProducts() {
    return request<ProductsResponse>('/products');
  },

  me(token: string) {
    return request<{ user: User }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  saveProducts(input: { curatedProducts: Product[]; moreProducts: Product[]; token: string }) {
    const products: ProductPayload[] = [
      ...input.curatedProducts.map((product) => ({ ...product, collectionType: 'CURATED' as const })),
      ...input.moreProducts.map((product) => ({ ...product, collectionType: 'MORE' as const })),
    ];

    return request<ProductsResponse>('/products/bulk', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({ products }),
    });
  },

  getOrders(token: string) {
    return request<OrdersResponse>('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createOrder(input: {
    token: string;
    customerName?: string;
    note?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    return request<{ order: Order }>('/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        customerName: input.customerName,
        note: input.note,
        items: input.items,
      }),
    });
  },

  deleteOrder(token: string, orderId: string) {
    return request<void>(`/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
