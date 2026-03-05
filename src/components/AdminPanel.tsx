import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Order, Product, User } from '../types';

type ProductCollection = 'CURATED' | 'MORE';
type AdminProduct = Product & { collectionType: ProductCollection };

type OrderDraftItem = {
  productId: string;
  quantity: number;
};

type AdminPanelProps = {
  user: User;
  curatedProducts: Product[];
  moreProducts: Product[];
  orders: Order[];
  onSaveProducts: (input: { curatedProducts: Product[]; moreProducts: Product[] }) => Promise<void>;
  onCreateOrder: (input: { customerName?: string; note?: string; items: Array<{ productId: string; quantity: number }> }) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onReloadOrders: () => Promise<void>;
  onLogout: () => void;
};

export default function AdminPanel({
  user,
  curatedProducts,
  moreProducts,
  orders,
  onSaveProducts,
  onCreateOrder,
  onDeleteOrder,
  onReloadOrders,
  onLogout,
}: AdminPanelProps) {
  const allProducts = useMemo(() => [...curatedProducts, ...moreProducts], [curatedProducts, moreProducts]);
  const [draft, setDraft] = useState<AdminProduct[]>([
    ...curatedProducts.map((product) => ({ ...product, collectionType: 'CURATED' as const })),
    ...moreProducts.map((product) => ({ ...product, collectionType: 'MORE' as const })),
  ]);
  const [query, setQuery] = useState('');
  const [savingProducts, setSavingProducts] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [newProductCollection, setNewProductCollection] = useState<ProductCollection>('CURATED');

  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState<OrderDraftItem[]>([{ productId: allProducts[0]?.id ?? '', quantity: 1 }]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return draft;

    return draft.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [draft, query]);

  const productStats = useMemo(() => {
    const total = draft.length;
    const featured = draft.filter((p) => p.featured).length;
    const avg = Math.round(draft.reduce((sum, p) => sum + p.price, 0) / Math.max(total, 1));
    return { total, featured, avg };
  }, [draft]);

  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((x, item) => x + item.quantity, 0), 0);
    return { totalOrders, totalItems };
  }, [orders]);

  const updateField = <K extends keyof AdminProduct>(id: string, key: K, value: AdminProduct[K]) => {
    setDraft((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addNewProduct = () => {
    const id = `new-${Date.now()}`;
    setDraft((prev) => [
      {
        id,
        name: 'New Product',
        category: 'Category',
        price: 100,
        variant: 'v1',
        featured: false,
        collectionType: newProductCollection,
      },
      ...prev,
    ]);
  };

  const removeProduct = (id: string) => {
    setDraft((prev) => prev.filter((item) => item.id !== id));
  };

  const saveProducts = async () => {
    setSavingProducts(true);
    try {
      const curated = draft
        .filter((item) => item.collectionType === 'CURATED')
        .map(({ collectionType: _collectionType, ...product }) => product);
      const more = draft
        .filter((item) => item.collectionType === 'MORE')
        .map(({ collectionType: _collectionType, ...product }) => product);

      await onSaveProducts({ curatedProducts: curated, moreProducts: more });
    } finally {
      setSavingProducts(false);
    }
  };

  const addOrderItemRow = () => {
    setOrderItems((prev) => [...prev, { productId: allProducts[0]?.id ?? '', quantity: 1 }]);
  };

  const removeOrderItemRow = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, patch: Partial<OrderDraftItem>) => {
    setOrderItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const submitOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleaned = orderItems
      .filter((item) => item.productId)
      .map((item) => ({ productId: item.productId, quantity: Math.max(1, Math.floor(item.quantity || 1)) }));

    if (!cleaned.length) return;

    setCreatingOrder(true);
    try {
      await onCreateOrder({
        customerName: customerName.trim() || undefined,
        note: note.trim() || undefined,
        items: cleaned,
      });

      setCustomerName('');
      setNote('');
      setOrderItems([{ productId: allProducts[0]?.id ?? '', quantity: 1 }]);
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-top">
        <div>
          <p className="admin-kicker">ARCA Control</p>
          <h1>Admin Dashboard</h1>
          <p className="admin-welcome">Signed in as {user.email}</p>
        </div>
        <div className="admin-actions">
          <a className="admin-btn ghost" href="/">
            Back to Landing
          </a>
          <button className="admin-btn ghost" onClick={onReloadOrders}>
            Refresh Orders
          </button>
          <button className="admin-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <div className="admin-stat">
          <span>Total Products</span>
          <strong>{productStats.total}</strong>
        </div>
        <div className="admin-stat">
          <span>Featured</span>
          <strong>{productStats.featured}</strong>
        </div>
        <div className="admin-stat">
          <span>Average Price</span>
          <strong>${productStats.avg}</strong>
        </div>
      </section>

      <section className="admin-controls">
        <input
          className="admin-search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="admin-input"
          style={{ maxWidth: '220px' }}
          value={newProductCollection}
          onChange={(e) => setNewProductCollection(e.target.value as ProductCollection)}
        >
          <option value="CURATED">Add To Collection</option>
          <option value="MORE">Add To Discoveries</option>
        </select>
        <button className="admin-btn" onClick={addNewProduct}>
          + Add Product
        </button>
        <button className="admin-btn" onClick={saveProducts} disabled={savingProducts}>
          {savingProducts ? 'Saving...' : 'Save Products'}
        </button>
      </section>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Placement</th>
              <th>Featured</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => updateField(item.id, 'name', e.target.value)}
                    className="admin-input"
                  />
                </td>
                <td>
                  <input
                    value={item.category}
                    onChange={(e) => updateField(item.id, 'category', e.target.value)}
                    className="admin-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateField(item.id, 'price', Number(e.target.value))}
                    className="admin-input"
                  />
                </td>
                <td>
                  <select
                    className="admin-input"
                    value={item.collectionType}
                    onChange={(e) => updateField(item.id, 'collectionType', e.target.value as ProductCollection)}
                  >
                    <option value="CURATED">Collection</option>
                    <option value="MORE">Discoveries</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={Boolean(item.featured)}
                    onChange={(e) => updateField(item.id, 'featured', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="admin-del" onClick={() => removeProduct(item.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-orders">
        <div className="admin-orders-head">
          <h2>Orders</h2>
          <div className="admin-orders-stats">
            <span>{orderStats.totalOrders} orders</span>
            <span>{orderStats.totalItems} items</span>
          </div>
        </div>

        <form className="admin-order-form" onSubmit={submitOrder}>
          <div className="admin-order-grid">
            <input
              className="admin-input"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              className="admin-input"
              placeholder="Order note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {orderItems.map((row, index) => (
            <div className="admin-order-item" key={`order-item-${index}`}>
              <select
                className="admin-input"
                value={row.productId}
                onChange={(e) => updateOrderItem(index, { productId: e.target.value })}
              >
                {allProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price})
                  </option>
                ))}
              </select>

              <input
                className="admin-input"
                type="number"
                min="1"
                value={row.quantity}
                onChange={(e) => updateOrderItem(index, { quantity: Number(e.target.value) })}
              />

              <button type="button" className="admin-btn ghost" onClick={() => removeOrderItemRow(index)}>
                Remove Row
              </button>
            </div>
          ))}

          <div className="admin-order-actions">
            <button type="button" className="admin-btn ghost" onClick={addOrderItemRow}>
              + Add Item
            </button>
            <button className="admin-btn" type="submit" disabled={creatingOrder}>
              {creatingOrder ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>

        <div className="admin-order-list">
          {orders.map((order) => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div className="admin-order-card" key={order.id}>
                <div className="admin-order-card-head">
                  <div>
                    <h3>{order.customerName || 'Walk-in Customer'}</h3>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <strong>${total.toLocaleString()}</strong>
                    <button className="admin-del" onClick={() => onDeleteOrder(order.id)}>
                      Delete Order
                    </button>
                  </div>
                </div>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span>{item.productName}</span>
                      <span>
                        x{item.quantity} • ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.note ? <p className="admin-order-note">Note: {order.note}</p> : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
