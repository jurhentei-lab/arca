import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { CartItem } from '../types';

const CART_STORAGE_KEY = 'arca_checkout_cart';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setCart(parsed.filter((item) => item.qty > 0));
      }
    } catch {
      setCart([]);
    }
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 24;
  const estimatedTax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + estimatedTax;

  const submitPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!cart.length) {
      setError('Your selection is empty.');
      return;
    }

    if (!name.trim() || !email.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim() || !address.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    setProcessing(true);

    await new Promise((resolve) => window.setTimeout(resolve, 1400));

    localStorage.removeItem(CART_STORAGE_KEY);
    setCart([]);
    setProcessing(false);
    setSuccess(true);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-wrap">
        <a className="checkout-back" href="/">
          ← Back to Collection
        </a>

        <div className="checkout-grid">
          <section className="checkout-form-card">
            <p className="ey">Secure Payment</p>
            <h1>Checkout</h1>

            {success ? (
              <div className="checkout-success">
                <h2>Payment Complete</h2>
                <p>Your order has been received. A confirmation email will be sent shortly.</p>
                <a className="bp" href="/">
                  <span>Return Home</span>
                </a>
              </div>
            ) : (
              <form className="checkout-form" onSubmit={submitPayment}>
                <label>
                  <span>Full Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hana Karim" />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </label>
                <label>
                  <span>Card Number</span>
                  <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                </label>
                <div className="checkout-row">
                  <label>
                    <span>Expiry</span>
                    <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                  </label>
                  <label>
                    <span>CVV</span>
                    <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
                  </label>
                </div>
                <label>
                  <span>Billing Address</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, Country" />
                </label>

                {error ? <p className="checkout-error">{error}</p> : null}

                <button className="c-btn" type="submit" disabled={processing || !cart.length}>
                  {processing ? 'Processing...' : `Pay $${total.toLocaleString()}`}
                </button>
              </form>
            )}
          </section>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            {!cart.length ? (
              <p className="checkout-empty">No items selected yet.</p>
            ) : (
              <div className="checkout-items">
                {cart.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div>
                      <p>{item.name}</p>
                      <span>
                        {item.category} • x{item.qty}
                      </span>
                    </div>
                    <strong>${(item.price * item.qty).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="checkout-totals">
              <div>
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString()}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{shipping === 0 ? 'Free' : `$${shipping.toLocaleString()}`}</strong>
              </div>
              <div>
                <span>Estimated Tax</span>
                <strong>${estimatedTax.toLocaleString()}</strong>
              </div>
              <div className="checkout-grand">
                <span>Total</span>
                <strong>${total.toLocaleString()}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
