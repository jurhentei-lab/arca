import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import CheckoutPage from './components/CheckoutPage';
import { curatedProducts as initialCurated, moreProducts as initialMore } from './data/products';
import { api } from './lib/api';
import type { Order, Product, User } from './types';

const TOKEN_KEY = 'arca_token';
const PATH_HOME = '/';
const PATH_ADMIN = '/admin';
const PATH_CHECKOUT = '/checkout';

export default function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [curatedProducts, setCuratedProducts] = useState<Product[]>(initialCurated);
  const [moreProducts, setMoreProducts] = useState<Product[]>(initialMore);
  const [orders, setOrders] = useState<Order[]>([]);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : PATH_HOME;
  const isAdminPath = pathname.startsWith(PATH_ADMIN);
  const isCheckoutPath = pathname.startsWith(PATH_CHECKOUT);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const knownPath = pathname === PATH_HOME || isAdminPath || isCheckoutPath;
    if (!knownPath) {
      window.history.replaceState(null, '', PATH_HOME);
    }
  }, [isAdminPath, isCheckoutPath, pathname]);

  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        if (data.curated.length) setCuratedProducts(data.curated);
        if (data.more.length) setMoreProducts(data.more);
      })
      .catch(() => {
        // Front uses local fallback when backend has no seeded data yet.
      });
  }, []);

  const loadOrders = async (authToken: string) => {
    const data = await api.getOrders(authToken);
    setOrders(data.orders);
  };

  useEffect(() => {
    if (!isAdminPath || !token) return;

    api
      .me(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setUser(null);
      });

    loadOrders(token).catch(() => {
      setOrders([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminPath, token]);

  const handleSignUp = async (input: { name: string; email: string; password: string }) => {
    const data = await api.signUp(input);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.user.role === 'ADMIN') {
      window.location.href = PATH_ADMIN;
      return;
    }
    if (isAdminPath) {
      window.location.href = PATH_HOME;
    }
  };

  const handleLogin = async (input: { email: string; password: string }) => {
    const data = await api.login(input);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.user.role === 'ADMIN') {
      window.location.href = PATH_ADMIN;
      return;
    }
    if (isAdminPath) {
      window.location.href = PATH_HOME;
    }
  };

  const handleSaveProducts = async (input: { curatedProducts: Product[]; moreProducts: Product[] }) => {
    if (!token) return;

    const saved = await api.saveProducts({
      curatedProducts: input.curatedProducts,
      moreProducts: input.moreProducts,
      token,
    });

    setCuratedProducts(saved.curated);
    setMoreProducts(saved.more);
  };

  const handleCreateOrder = async (input: {
    customerName?: string;
    note?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) => {
    if (!token) return;
    await api.createOrder({ token, ...input });
    await loadOrders(token);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!token) return;
    await api.deleteOrder(token, orderId);
    await loadOrders(token);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
  };

  if (isAdminPath) {
    if (!token || !user) {
      return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
    }
    if (user.role !== 'ADMIN') {
      if (typeof window !== 'undefined') {
        window.location.replace(PATH_HOME);
      }
      return null;
    }

    return (
      <AdminPanel
        user={user}
        curatedProducts={curatedProducts}
        moreProducts={moreProducts}
        orders={orders}
        onSaveProducts={handleSaveProducts}
        onCreateOrder={handleCreateOrder}
        onDeleteOrder={handleDeleteOrder}
        onReloadOrders={() => loadOrders(token)}
        onLogout={handleLogout}
      />
    );
  }

  if (isCheckoutPath) {
    return <CheckoutPage />;
  }

  return <LandingPage curatedProducts={curatedProducts} moreProducts={moreProducts} adminHref={PATH_ADMIN} />;
}
