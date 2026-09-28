/* ============================================================
   NAIJALIFE FASHION — CORE APP
   Storage-backed cart / wishlist / auth + shared UI rendering.
   All state lives in localStorage — see README for the security note
   on why this is a frontend demo, not production auth/payments.
   ============================================================ */

const LS = {
  users: "nl_users",
  session: "nl_session",
  cart: "nl_cart",
  wishlist: "nl_wishlist",
  orders: "nl_orders",
  addresses: "nl_addresses",
  recent: "nl_recent",
  reviews: "nl_reviews",
};

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelectorAll("#installAppBtn").forEach(button => button.hidden = false);
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  document.querySelectorAll("#installAppBtn").forEach(button => button.hidden = true);
});

async function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.querySelectorAll("#installAppBtn").forEach(button => button.hidden = true);
}

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function formatNaira(n) {
  return "₦" + new Intl.NumberFormat("en-NG").format(Math.round(n));
}

function initDemoAccounts() {
  const users = readLS(LS.users, null);
  if (!users) writeLS(LS.users, DEMO_ACCOUNTS.map(a => ({ ...a, phone: "", location: "", avatar: "" })));
}
initDemoAccounts();

/* ---------------- AUTH ---------------- */
const Auth = {
  currentUser() { return readLS(LS.session, null); },
  isLoggedIn() { return !!this.currentUser(); },
  setSession(user) { writeLS(LS.session, user); },
  login(email, password) {
    const users = readLS(LS.users, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: "Incorrect email or password." };
    writeLS(LS.session, user);
    return { ok: true, user };
  },
  register({ name, email, password, phone }) {
    const users = readLS(LS.users, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const user = { name, email, password, phone: phone || "", location: "", avatar: "", role: "customer" };
    users.push(user);
    writeLS(LS.users, users);
    writeLS(LS.session, user);
    return { ok: true, user };
  },
  logout() { localStorage.removeItem(LS.session); },
  updateProfile(patch) {
    const cur = this.currentUser();
    if (!cur) return;
    const updated = { ...cur, ...patch };
    writeLS(LS.session, updated);
    const users = readLS(LS.users, []);
    const idx = users.findIndex(u => u.email === cur.email);
    if (idx > -1) { users[idx] = updated; writeLS(LS.users, users); }
  },
};

/* ---------------- CART ---------------- */
const Cart = {
  get() { return readLS(LS.cart, []); },
  set(items) { writeLS(LS.cart, items); document.dispatchEvent(new Event("cart:change")); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  add(product, size, color, qty = 1) {
    const items = this.get();
    const existing = items.find(i => i.id === product.id && i.size === size && i.color === color);
    if (existing) existing.qty += qty;
    else items.push({ id: product.id, name: product.name, price: product.price, image: product.images[0], size, color, qty, seller: product.seller });
    this.set(items);
  },
  remove(id, size, color) {
    this.set(this.get().filter(i => !(i.id === id && i.size === size && i.color === color)));
  },
  updateQty(id, size, color, qty) {
    const items = this.get();
    const item = items.find(i => i.id === id && i.size === size && i.color === color);
    if (item) { item.qty = Math.max(1, qty); this.set(items); }
  },
  subtotal() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  clear() { this.set([]); },
};

/* ---------------- WISHLIST ---------------- */
const Wishlist = {
  get() { return readLS(LS.wishlist, []); },
  set(ids) { writeLS(LS.wishlist, ids); document.dispatchEvent(new Event("wishlist:change")); },
  has(id) { return this.get().includes(id); },
  toggle(id) {
    const list = this.get();
    const idx = list.indexOf(id);
    if (idx > -1) { list.splice(idx, 1); this.set(list); return false; }
    list.push(id); this.set(list); return true;
  },
};

/* ---------------- ORDERS ---------------- */
const Orders = {
  get() { return readLS(LS.orders, []); },
  create(order) {
    const orders = this.get();
    orders.unshift(order);
    writeLS(LS.orders, orders);
  },
};

/* ---------------- RECENTLY VIEWED ---------------- */
const Recent = {
  get() { return readLS(LS.recent, []); },
  add(id) {
    let list = this.get().filter(x => x !== id);
    list.unshift(id);
    writeLS(LS.recent, list.slice(0, 10));
  },
};

/* ---------------- TOASTS ---------------- */
function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}
const ICONS = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8h.01M11 12h1v4h1"/></svg>',
};
function toast(message, type = "info") {
  const stack = ensureToastStack();
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `${ICONS[type] || ICONS.info}<span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ---------------- MODAL SYSTEM ---------------- */
function openModal(html, { onOpen } = {}) {
  closeModal();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "activeModal";
  backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <button class="btn-icon modal-close" aria-label="Close" onclick="closeModal()">${iconSvg("x")}</button>
      ${html}
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
  requestAnimationFrame(() => backdrop.classList.add("open"));
  if (onOpen) onOpen(backdrop);
}
function closeModal() {
  const m = document.getElementById("activeModal");
  if (m) { m.classList.remove("open"); setTimeout(() => m.remove(), 250); }
}

function iconSvg(name) {
  const map = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  };
  return map[name] || "";
}

/* ---------------- HEADER / FOOTER / NAV ---------------- */
function relPrefix() {
  const path = location.pathname;
  if (path.includes("/pages/") || path.includes("/seller/") || path.includes("/admin/")) return "../";
  return "";
}

function renderHeader(active = "") {
  const root = document.getElementById("site-header");
  if (!root) return;
  const p = relPrefix();
  const cartCount = Cart.count();
  const wishCount = Wishlist.get().length;
  const loggedIn = Auth.isLoggedIn();

  root.innerHTML = `
  <div class="container header-row">
    <button class="btn-icon mobile-only" id="menuBtn" aria-label="Open menu">${iconMarkup("menu")}</button>
    <a href="${p}index.html" class="logo">NAIJA<strong>LIFE</strong></a>
    <nav class="main-nav" aria-label="Primary">
      <a href="${p}index.html" class="${active === "home" ? "active" : ""}">Home</a>
      <a href="${p}shop.html" class="${active === "shop" ? "active" : ""}">Shop</a>
      <a href="${p}pages/men.html" class="${active === "men" ? "active" : ""}">Men</a>
      <a href="${p}pages/women.html" class="${active === "women" ? "active" : ""}">Women</a>
      <a href="${p}pages/kids.html" class="${active === "kids" ? "active" : ""}">Kids</a>
      <a href="${p}pages/native-wear.html" class="${active === "native" ? "active" : ""}">Native Wear</a>
      <a href="${p}designers.html" class="${active === "designers" ? "active" : ""}">Designers</a>
      <a href="${p}pages/sale.html" class="${active === "sale" ? "active" : ""}">Sale</a>
    </nav>
    <div class="header-actions">
      <button class="btn-icon desktop-only search-desktop" id="searchBtn" aria-label="Search">${iconMarkup("search")}</button>
      <button class="btn-icon mobile-only" id="searchBtnMobile" aria-label="Search">${iconMarkup("search")}</button>
      <button class="btn-icon" id="installAppBtn" aria-label="Install NaijaLife" title="Install NaijaLife" hidden>${iconMarkup("download")}</button>
      <a href="${p}wishlist.html" class="btn-icon icon-badge desktop-only" aria-label="Wishlist">${iconMarkup("heart")}${wishCount ? `<span class="count">${wishCount}</span>` : ""}</a>
      <a href="${p}cart.html" class="btn-icon icon-badge" aria-label="Cart">${iconMarkup("shopping-bag")}${cartCount ? `<span class="count">${cartCount}</span>` : ""}</a>
      <a href="${p}${loggedIn ? "profile.html" : "login.html"}" class="btn-icon desktop-only" aria-label="Account">${iconMarkup("user")}</a>
    </div>
  </div>
  <div class="search-overlay" id="searchOverlay">
    <div class="search-overlay-top">
      <div style="flex:1" class="flex items-center gap-8">
        ${iconMarkup("search")}
        <input type="text" id="overlaySearchInput" placeholder="Search for agbada, ankara, sneakers…" autocomplete="off">
      </div>
      <button class="btn-icon" onclick="toggleSearch(false)">${iconSvg("x")}</button>
    </div>
    <div class="search-suggest">
      <h4>Trending searches</h4>
      <div class="search-chip-row">
        ${["Agbada","Ankara dress","Senator wear","Sneakers","Aso-ebi","Leather bag"].map(t => `<a class="search-chip" href="${p}search.html?q=${encodeURIComponent(t)}">${t}</a>`).join("")}
      </div>
    </div>
  </div>
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="scrim" onclick="toggleDrawer(false)"></div>
    <div class="panel">
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <span class="logo">NAIJA<strong>LIFE</strong></span>
        <button class="btn-icon" onclick="toggleDrawer(false)">${iconSvg("x")}</button>
      </div>
      <a href="${p}index.html">Home</a>
      <a href="${p}shop.html">Shop</a>
      <a href="${p}pages/men.html">Men</a>
      <a href="${p}pages/women.html">Women</a>
      <a href="${p}pages/kids.html">Kids</a>
      <a href="${p}pages/shoes.html">Shoes</a>
      <a href="${p}pages/bags.html">Bags</a>
      <a href="${p}pages/native-wear.html">Native Wear</a>
      <a href="${p}pages/streetwear.html">Streetwear</a>
      <a href="${p}designers.html">Designers</a>
      <a href="${p}pages/sale.html">Sale</a>
      <a href="${p}${loggedIn ? "profile.html" : "login.html"}">${loggedIn ? "My Account" : "Login / Register"}</a>
    </div>
  </div>`;

  document.getElementById("menuBtn")?.addEventListener("click", () => toggleDrawer(true));
  document.getElementById("searchBtn")?.addEventListener("click", () => toggleSearch(true));
  document.getElementById("searchBtnMobile")?.addEventListener("click", () => toggleSearch(true));
  document.getElementById("installAppBtn")?.addEventListener("click", installApp);

  const input = document.getElementById("overlaySearchInput");
  input?.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      location.href = `${p}search.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });

  renderBottomNav(active);
  document.addEventListener("cart:change", () => renderHeader(active));
  document.addEventListener("wishlist:change", () => renderHeader(active));
}

function toggleDrawer(open) { document.getElementById("mobileDrawer")?.classList.toggle("open", open); }
function toggleSearch(open) {
  const el = document.getElementById("searchOverlay");
  el?.classList.toggle("open", open);
  if (open) setTimeout(() => document.getElementById("overlaySearchInput")?.focus(), 150);
}

function renderBottomNav(active) {
  const root = document.getElementById("bottom-nav");
  if (!root) return;
  const p = relPrefix();
  const cartCount = Cart.count();
  const loggedIn = Auth.isLoggedIn();
  root.innerHTML = `
    <a href="${p}index.html" class="${active === "home" ? "active" : ""}">${iconMarkup("home")}<span>Home</span></a>
    <a href="${p}shop.html" class="${active === "shop" ? "active" : ""}">${iconMarkup("layout-grid")}<span>Shop</span></a>
    <a href="${p}wishlist.html" class="${active === "wishlist" ? "active" : ""}">${iconMarkup("heart")}<span>Wishlist</span></a>
    <a href="${p}cart.html" class="${active === "cart" ? "active" : ""}">${iconMarkup("shopping-bag")}<span>Cart</span>${cartCount ? `<span class="count">${cartCount}</span>` : ""}</a>
    <a href="${p}${loggedIn ? "profile.html" : "login.html"}" class="${active === "account" ? "active" : ""}">${iconMarkup("user")}<span>Account</span></a>
  `;
}

function renderFooter() {
  const root = document.getElementById("site-footer");
  if (!root) return;
  const p = relPrefix();
  const year = new Date().getFullYear();
  root.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo">NAIJA<strong>LIFE</strong></span>
          <p>A marketplace for Nigerian designers, tailors and independent fashion sellers. Your style. Your Nigeria.</p>
          <div class="social-row">
            <a class="social-link" href="#" aria-label="Instagram">${iconMarkup("camera")}</a>
            <a class="social-link" href="#" aria-label="Twitter">${iconMarkup("message-circle")}</a>
            <a class="social-link" href="#" aria-label="Facebook">${iconMarkup("thumbs-up")}</a>
          </div>
        </div>
        <div>
          <h5>Shop</h5>
          <a href="${p}pages/men.html">Men</a>
          <a href="${p}pages/women.html">Women</a>
          <a href="${p}pages/kids.html">Kids</a>
          <a href="${p}pages/native-wear.html">Native Wear</a>
        </div>
        <div>
          <h5>Company</h5>
          <a href="${p}designers.html">Designers</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="${p}register.html">Sell on NaijaLife</a>
        </div>
        <div>
          <h5>Support</h5>
          <a href="#">Help Center</a>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="${p}orders.html">Track Order</a>
        </div>
        <div>
          <h5>Legal</h5>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} NaijaLife Fashion. Demo storefront — no real payments are processed.</span>
        <span>Made with pride, Lagos → the world.</span>
      </div>
    </div>`;
}

/* ---------------- LUCIDE ICON HELPER ---------------- */
function iconMarkup(name) { return `<i data-lucide="${name}"></i>`; }
function mountIcons() { if (window.lucide?.createIcons) window.lucide.createIcons(); }

/* ---------------- PRODUCT CARD ---------------- */
function productCardHTML(prod) {
  const p = relPrefix();
  const wished = Wishlist.has(prod.id);
  return `
  <div class="product-card" data-id="${prod.id}">
    <a href="${p}product.html?id=${prod.id}" class="product-media">
      <img class="img-a" src="${prod.images[0]}" alt="${prod.name}" loading="lazy">
      <img class="img-b" src="${prod.images[1]}" alt="${prod.name} alternate view" loading="lazy">
      <div class="product-badges">
        ${prod.discount ? `<span class="badge badge-sale">-${prod.discount}%</span>` : ""}
        ${prod.newArrival ? `<span class="badge badge-new">New</span>` : ""}
      </div>
    </a>
    <button class="wishlist-btn ${wished ? "active" : ""}" aria-label="Toggle wishlist" onclick="handleWishlistToggle(event, ${prod.id})">
      ${iconMarkup("heart")}
    </button>
    <div class="quick-add">
      <button onclick="handleQuickAdd(event, ${prod.id})">Quick Add</button>
    </div>
    <a href="${p}product.html?id=${prod.id}" class="product-info">
      <span class="product-seller">${prod.seller}</span>
      <span class="product-name">${prod.name}</span>
      <span class="product-rating">${iconMarkup("star")} ${prod.rating} (${prod.reviews})</span>
      <span class="product-price">
        <span class="price-now">${formatNaira(prod.price)}</span>
        ${prod.oldPrice ? `<span class="price-old">${formatNaira(prod.oldPrice)}</span>` : ""}
      </span>
    </a>
  </div>`;
}

function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = emptyStateHTML({
      icon: "search-x", title: "No products found",
      msg: "Try adjusting your filters or search for something else.",
      cta: "Clear filters", ctaAction: "clearFilters()"
    });
    mountIcons();
    return;
  }
  container.innerHTML = products.map(productCardHTML).join("");
  mountIcons();
}

function emptyStateHTML({ icon, title, msg, cta, ctaAction, ctaHref }) {
  return `<div class="empty-state">
    ${iconMarkup(icon)}
    <h3>${title}</h3>
    <p>${msg}</p>
    ${cta ? (ctaHref ? `<a href="${ctaHref}" class="btn btn-gold">${cta}</a>` : `<button class="btn btn-gold" onclick="${ctaAction}">${cta}</button>`) : ""}
  </div>`;
}

function handleWishlistToggle(e, id) {
  e.preventDefault(); e.stopPropagation();
  const btn = e.currentTarget;
  const active = Wishlist.toggle(id);
  btn.classList.toggle("active", active);
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 400);
  toast(active ? "Added to wishlist" : "Removed from wishlist", "success");
}

function handleQuickAdd(e, id) {
  e.preventDefault(); e.stopPropagation();
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  Cart.add(prod, prod.sizes[0], prod.colors[0], 1);
  toast(`${prod.name} added to cart`, "success");
}

/* ---------------- SKELETON LOADER ---------------- */
function showSkeletons(container, count = 8) {
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="product-card">
      <div class="skel skel-card"></div>
      <div style="padding:14px 16px;">
        <div class="skel" style="height:10px;width:60%;margin-bottom:8px;border-radius:6px;"></div>
        <div class="skel" style="height:14px;width:90%;margin-bottom:8px;border-radius:6px;"></div>
        <div class="skel" style="height:12px;width:40%;border-radius:6px;"></div>
      </div>
    </div>`).join("");
}

/* ---------------- IMAGE FALLBACK ----------------
  Keep a self-contained fallback for user-supplied or cached image URLs. */
function inlineFallbackSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900">
    <rect width="100%" height="100%" fill="#171717"/>
    <rect x="1" y="1" width="698" height="898" fill="none" stroke="#2a2a2a"/>
    <text x="50%" y="48%" fill="#d4af37" font-family="Georgia, serif" font-size="30" text-anchor="middle">NAIJALIFE</text>
    <text x="50%" y="55%" fill="#6b6b70" font-family="sans-serif" font-size="13" text-anchor="middle">image unavailable</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
document.addEventListener("error", function (e) {
  const img = e.target;
  if (!img || img.tagName !== "IMG") return;
  const stage = img.dataset.fbStage ? +img.dataset.fbStage : 0;
  if (stage === 0) {
    img.dataset.fbStage = "1";
    img.src = inlineFallbackSVG();
  }
}, true);

/* ---------------- GLOBAL INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  mountIcons();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      return Promise.all(registrations.map(reg => reg.unregister()));
    }).then(() => {
      return caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
    }).then(() => {
      return navigator.serviceWorker.register(`${relPrefix()}sw.js`);
    }).catch(() => {});
  }
});
