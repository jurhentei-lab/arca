import { useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem, Product } from '../types';

type LandingPageProps = {
  curatedProducts: Product[];
  moreProducts: Product[];
  adminHref?: string;
};

type DotsProps = {
  total: number;
  current: number;
  onGo: (index: number) => void;
};

type ProgressProps = {
  total: number;
  current: number;
};

type CartDrawerProps = {
  cart: CartItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onSetQty: (id: string, qty: number) => void;
  onClear: () => void;
  onCheckout: () => void;
  open: boolean;
};

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  large?: boolean;
};

type SearchableProduct = Product & {
  source: 'curated' | 'more';
};

function Loader() {
  return (
    <div id="loader">
      <div className="lw">
        <span>A R C A</span>
      </div>
      <div className="ll" />
    </div>
  );
}

function Cursor() {
  const curRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = `${mx}px`;
        curRef.current.style.top = `${my}px`;
      }
    };

    const loop = () => {
      tx += (mx - tx) * 0.09;
      ty += (my - ty) * 0.09;
      if (ringRef.current) {
        ringRef.current.style.left = `${tx}px`;
        ringRef.current.style.top = `${ty}px`;
      }
      rafId = requestAnimationFrame(loop);
    };

    document.addEventListener('mousemove', onMove);
    loop();

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cur" ref={curRef} />
      <div className="cur-r" ref={ringRef} />
    </>
  );
}

function Dots({ total, current, onGo }: DotsProps) {
  return (
    <div className="dots">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`dot-btn${i === current ? ' active' : ''}`}
          onClick={() => onGo(i)}
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </div>
  );
}

function Progress({ total, current }: ProgressProps) {
  const fill = (current / (total - 1)) * 100;

  return (
    <div className="progress">
      <div className="prog-num">{String(current + 1).padStart(2, '0')}</div>
      <div className="prog-line">
        <div className="prog-fill" style={{ height: `${fill}%` }} />
      </div>
      <div className="prog-total">{String(total).padStart(2, '0')}</div>
    </div>
  );
}

function CartDrawer({
  cart,
  onClose,
  onDelete,
  onIncrease,
  onDecrease,
  onSetQty,
  onClear,
  onCheckout,
  open,
}: CartDrawerProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const freeShippingThreshold = 500;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 24;
  const estimatedTax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + estimatedTax;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <>
      <div className={`c-bg${open ? ' on' : ''}`} onClick={onClose} />
      <div className={`c-pan${open ? ' on' : ''}`}>
        <div className="c-h">
          <h2>Selection</h2>
          <button className="c-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="c-body">
          <div className="c-micro">
            <div className="c-micro-row">
              <span>{remaining > 0 ? `$${remaining.toLocaleString()} away from free shipping` : 'Free shipping unlocked'}</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className="c-micro-bar">
              <div className="c-micro-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {!cart.length ? (
            <div className="c-empty">
              <p>Your cart is empty</p>
              <span>Discover our collection</span>
            </div>
          ) : (
            cart.map((item) => (
              <div className="c-item" key={item.id}>
                <div className="c-thumb" />
                <div className="c-det">
                  <div>
                    <div className="c-cat">{item.category}</div>
                    <div className="c-name">
                      {item.name}
                    </div>
                    <div className="c-price">${(item.price * item.qty).toLocaleString()}</div>
                    <div className="c-qty">
                      <button onClick={() => onDecrease(item.id)} aria-label={`Decrease ${item.name}`}>
                        -
                      </button>
                      <input
                        value={item.qty}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next)) onSetQty(item.id, next);
                        }}
                        inputMode="numeric"
                      />
                      <button onClick={() => onIncrease(item.id)} aria-label={`Increase ${item.name}`}>
                        +
                      </button>
                    </div>
                  </div>
                  <span className="c-del" onClick={() => onDelete(item.id)}>
                    Remove
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="c-foot">
          <div className="c-break">
            <div className="c-row">
              <span>Subtotal ({totalItems} items)</span>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>
            <div className="c-row">
              <span>Shipping</span>
              <strong>{shipping === 0 ? 'Free' : `$${shipping.toLocaleString()}`}</strong>
            </div>
            <div className="c-row">
              <span>Estimated Tax</span>
              <strong>${estimatedTax.toLocaleString()}</strong>
            </div>
          </div>
          <div className="c-tot">
            <span>Total</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
          <button className="c-clear" onClick={onClear} disabled={!cart.length}>
            Clear Selection
          </button>
          <button className="c-btn" disabled={!cart.length} onClick={onCheckout}>
            {cart.length ? 'Checkout Securely →' : 'Select Items to Checkout'}
          </button>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAdd, large = false }: ProductCardProps) {
  return (
    <div className="pc" onClick={() => onAdd(product)}>
      <div className="pc-img">
        <div className={`pc-v ${product.variant}`} />
      </div>
      {product.badge ? <div className={`pc-bdg${product.badge === 'New' ? ' g' : ''}`}>{product.badge}</div> : null}
      <div className="pc-info">
        <div className="pc-cat">{product.category}</div>
        <div className="pc-name" style={large ? { fontSize: '20px' } : undefined}>
          {product.name}
        </div>
        <div className="pc-row">
          <div className="pc-price">${product.price.toLocaleString()}</div>
          <button
            className="pc-add"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function MoreCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="hc" onClick={() => onAdd(product)}>
      <div className="hc-img">
        <div className={`hc-v ${product.variant}`} />
      </div>
      <div className="hc-info">
        <div className="hc-cat">{product.category}</div>
        <div className="hc-name">{product.name}</div>
        <div className="hc-price">${product.price.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default function LandingPage({ curatedProducts, moreProducts, adminHref = '/admin' }: LandingPageProps) {
  const TOTAL = 5;
  const AUTO_INTERVAL = 6000;

  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [timerProgress, setTimerProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fpRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef(0);
  const autoTimerRef = useRef<number | null>(null);
  const timerRafRef = useRef<number | null>(null);
  const timerStartRef = useRef(0);
  const wheelLockRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchLockRef = useRef(0);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const searchableProducts = useMemo<SearchableProduct[]>(
    () => [
      ...curatedProducts.map((item) => ({ ...item, source: 'curated' as const })),
      ...moreProducts.map((item) => ({ ...item, source: 'more' as const })),
    ],
    [curatedProducts, moreProducts]
  );
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return searchableProducts
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [searchQuery, searchableProducts]);

  const startTimerAnimation = () => {
    if (timerRafRef.current !== null) {
      cancelAnimationFrame(timerRafRef.current);
    }

    timerStartRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - timerStartRef.current;
      const pct = Math.min((elapsed / AUTO_INTERVAL) * 100, 100);
      setTimerProgress(pct);
      if (pct < 100) {
        timerRafRef.current = requestAnimationFrame(tick);
      }
    };

    setTimerProgress(0);
    timerRafRef.current = requestAnimationFrame(tick);
  };

  const goTo = (idx: number, instant = false) => {
    if (!instant && isAnimating) return;
    if (idx < 0 || idx >= TOTAL) return;

    setIsAnimating(true);
    setCurrent(idx);

    const fp = fpRef.current;
    if (!fp) return;

    fp.style.transition = instant ? 'none' : 'transform 1s cubic-bezier(.77,0,.175,1)';
    fp.style.transform = `translateY(${-idx * 100}vh)`;

    window.setTimeout(() => setIsAnimating(false), instant ? 0 : 1050);
  };

  const resetAutoTimer = () => {
    if (autoTimerRef.current !== null) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (currentRef.current !== 0) {
      if (timerRafRef.current !== null) {
        cancelAnimationFrame(timerRafRef.current);
      }
      setTimerProgress(0);
      return;
    }

    startTimerAnimation();
    autoTimerRef.current = window.setTimeout(() => {
      if (currentRef.current === 0) {
        goTo(1);
      }
      setTimerProgress(0);
    }, AUTO_INTERVAL);
  };

  useEffect(() => {
    const loadTimeout = window.setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('gone');
      setLoaded(true);
      goTo(0, true);
      resetAutoTimer();
    }, 1600);

    return () => clearTimeout(loadTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLockRef.current < 900) return;
      wheelLockRef.current = now;
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
      resetAutoTimer();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - touchLockRef.current < 900) return;
      touchLockRef.current = now;
      const dy = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) {
        if (dy > 0) goTo(current + 1);
        else goTo(current - 1);
        resetAutoTimer();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        goTo(current + 1);
        resetAutoTimer();
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        goTo(current - 1);
        resetAutoTimer();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isAnimating, searchOpen]);

  useEffect(() => {
    currentRef.current = current;
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('sc', current > 0);
    document.querySelectorAll('.fp-sec').forEach((el, i) => el.classList.toggle('active', i === current));
    resetAutoTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const selectors = 'a,button,.pc,.hc,.va,.ci';
    const nodes = document.querySelectorAll(selectors);

    const onEnter = () => document.body.classList.add('hov');
    const onLeave = () => document.body.classList.remove('hov');

    nodes.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      nodes.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, [loaded, current]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current !== null) {
        clearTimeout(autoTimerRef.current);
      }
      if (timerRafRef.current !== null) {
        cancelAnimationFrame(timerRafRef.current);
      }
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setToast(`${product.name} added`);
  };

  const deleteFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
  const increaseCartQty = (id: string) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  };
  const decreaseCartQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };
  const clearCart = () => {
    setCart([]);
  };
  const setCartQty = (id: string, qty: number) => {
    const safeQty = Math.max(0, Math.min(99, Math.floor(qty || 0)));
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: safeQty } : item))
        .filter((item) => item.qty > 0)
    );
  };
  const goToCheckout = () => {
    if (!cart.length) return;
    localStorage.setItem('arca_checkout_cart', JSON.stringify(cart));
    window.location.href = '/checkout';
  };
  const openSearch = () => {
    setSearchOpen(true);
    resetAutoTimer();
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };
  const addFromSearch = (product: SearchableProduct) => {
    addToCart(product);
    if (product.source === 'curated') goTo(1);
    else goTo(3);
    closeSearch();
  };

  return (
    <>
      <Loader />
      <Cursor />

      <div className="timer-bar" style={{ width: `${timerProgress}%` }} />
      <Dots
        total={TOTAL}
        current={current}
        onGo={(i) => {
          goTo(i);
          resetAutoTimer();
        }}
      />
      <Progress total={TOTAL} current={current} />

      <nav id="nav">
        <a href="#" className="n-logo" onClick={(e) => e.preventDefault()}>
          Arca
        </a>

        <div className="n-c">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goTo(0);
            }}
          >
            Home
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goTo(1);
            }}
          >
            Collection
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goTo(2);
            }}
          >
            About
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goTo(3);
            }}
          >
            More
          </a>
          <a href={adminHref}>Admin</a>
        </div>

        <div className="n-r">
          <span className="search-trigger" onClick={openSearch}>
            Search
          </span>
          <div style={{ position: 'relative' }}>
            <div
              className="ci"
              onClick={() => {
                setCartOpen(true);
                resetAutoTimer();
              }}
            >
              ◯
              <div className={`bdg${cartCount > 0 ? ' on' : ''}`}>{cartCount}</div>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen ? (
        <div className="s-bg" onClick={closeSearch}>
          <div className="s-pan" onClick={(e) => e.stopPropagation()}>
            <div className="s-h">
              <h2>Search Objects</h2>
              <button className="c-x" onClick={closeSearch}>
                ✕
              </button>
            </div>
            <div className="s-body">
              <input
                autoFocus
                className="s-in"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="s-list">
                {!searchQuery.trim() ? (
                  <p className="s-empty">Type to search products.</p>
                ) : searchResults.length ? (
                  searchResults.map((item) => (
                    <button key={item.id} className="s-item" onClick={() => addFromSearch(item)}>
                      <div>
                        <div className="s-cat">{item.category}</div>
                        <div className="s-name">{item.name}</div>
                      </div>
                      <div className="s-meta">
                        <span>{item.source === 'curated' ? 'Collection' : 'More'}</span>
                        <strong>${item.price.toLocaleString()}</strong>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="s-empty">No results found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <CartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onDelete={deleteFromCart}
        onIncrease={increaseCartQty}
        onDecrease={decreaseCartQty}
        onSetQty={setCartQty}
        onClear={clearCart}
        onCheckout={goToCheckout}
      />
      <div className={`toast${toast ? ' on' : ''}`}>{toast}</div>

      <div id="fp" ref={fpRef}>
        <div className="fp-sec sec-hero" style={{ top: '0vh' }}>
          <div className="hero-grid">
            <div className="h-left">
              <div className="h-chip anim-up">
                <div className="blink-dot" />
                New Arrivals 2026
              </div>
              <h1 className="h-t anim-up">
                Objects
                <br />
                of <em>Rare</em>
                <br />
                Beauty
              </h1>
              <p className="h-s anim-up">
                Handcrafted pieces that bridge the space between function and sculpture. Chosen for honesty of
                material and mastery of form.
              </p>
              <div className="h-b anim-up">
                <button className="bp" onClick={() => goTo(1)}>
                  <span>Explore Collection</span>
                </button>
                <button className="bg-btn" onClick={() => goTo(2)}>
                  Our Story
                </button>
              </div>
            </div>

            <div className="h-right">
              <div className="h-vis">
                <div className="h-grid-lines" />
              </div>
              <div className="h-ol" />
            </div>
          </div>
          <div className="h-side anim-up anim-d5">
            <div className="h-ln" />
            Collection 01
          </div>
        </div>

        <div className="fp-sec sec-products" style={{ top: '100vh' }}>
          <div className="ticker">
            <div className="t-i">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  <span className="ti">
                    Handcrafted Objects<span className="tm">✦</span>
                  </span>
                  <span className="ti">
                    Studio Collection 2026<span className="tm">✦</span>
                  </span>
                  <span className="ti">
                    Free Shipping Over $500<span className="tm">✦</span>
                  </span>
                  <span className="ti">
                    Limited Editions<span className="tm">✦</span>
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="prod-wrap">
            <div className="pr-head">
              <div>
                <div className="ey anim-up">Curated Pieces</div>
                <h2 className="pr-title anim-up anim-d1">
                  The <em>Collection</em>
                </h2>
              </div>
              <div className="va anim-up anim-d2">View all {curatedProducts.length} pieces →</div>
            </div>

            <div className="pg">
              {curatedProducts.length ? (
                curatedProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} large={idx === 0} />
                ))
              ) : (
                <div className="empty-slot">
                  No products yet. Add products from <a href={adminHref}>Admin</a>.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fp-sec sec-about" style={{ top: '200vh' }}>
          <div className="about-inner">
            <div className="a-vis-wrap">
              <div className="a-frame">
                <div className="a-grid" />
                <div className="a-border" />
                <div className="a-obj" />
                <div className="a-num">01</div>
              </div>
            </div>
            <div className="a-content">
              <div className="ey anim-up">Our Philosophy</div>
              <h2 className="a-title anim-up anim-d1">
                Made to <em>Last</em>
                <br />a Lifetime
              </h2>
              <p className="a-body anim-up anim-d2">
                We collaborate with master artisans across three continents. Each piece is chosen not for trend,
                but for truth of material and purposeful form.
              </p>
              <div className="stats anim-up anim-d3">
                <div className="st">
                  <div className="sn">48+</div>
                  <div className="sl">Unique Pieces</div>
                </div>
                <div className="st">
                  <div className="sn">12</div>
                  <div className="sl">Artisan Studios</div>
                </div>
                <div className="st">
                  <div className="sn">3</div>
                  <div className="sl">Continents</div>
                </div>
                <div className="st">
                  <div className="sn">∞</div>
                  <div className="sl">Year Guarantee</div>
                </div>
              </div>
              <button className="bp anim-up anim-d4">
                <span>Read Our Story →</span>
              </button>
            </div>
          </div>
        </div>

        <div className="fp-sec sec-more" style={{ top: '300vh' }}>
          <div className="more-inner">
            <div className="more-head">
              <div>
                <div className="ey anim-up">Also Available</div>
                <h2 className="more-title anim-up anim-d1">
                  More <em>Discoveries</em>
                </h2>
              </div>
              <div className="sh anim-up anim-d2">{moreProducts.length} pieces</div>
            </div>

            <div className="ht">
              {moreProducts.length ? (
                moreProducts.map((product) => <MoreCard key={product.id} product={product} onAdd={addToCart} />)
              ) : (
                <div className="empty-slot empty-slot-more">
                  No more discoveries yet. Add products from <a href={adminHref}>Admin</a>.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fp-sec sec-end" style={{ top: '400vh', position: 'relative' }}>
          <div className="end-inner">
            <div className="end-quote">
              <div className="qm anim-up">"</div>
              <p className="qt anim-up anim-d1">
                ARCA doesn't sell objects. They sell a way of seeing, a daily reminder that beauty is essential.
              </p>
              <div className="qa anim-up anim-d2">- Hana Karim, Interior Architect, Tokyo</div>
            </div>
            <div className="end-nl">
              <div className="ey anim-up">Stay in Touch</div>
              <h2 className="nl-t anim-up anim-d1">
                Early Access &
                <br />
                <em>Rare Finds</em>
              </h2>
              <p className="nl-s anim-up anim-d2">
                First access to limited editions and occasional essays on material culture.
              </p>
              <div className="nl-f anim-up anim-d3">
                <input className="nl-in" type="email" placeholder="your@email.com" />
                <button className="nl-btn">Subscribe</button>
              </div>
              <p className="nl-note anim-up anim-d4">By subscribing you agree to our privacy policy.</p>
            </div>
          </div>

          <div className="end-foot">
            <span>© 2026 ARCA Studio. All rights reserved.</span>
            <div className="ef-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
