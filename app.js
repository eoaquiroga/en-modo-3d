// ============================================================
// EN MODO 3D - App Principal
// ============================================================

const App = {
  cart: [],
  products: [],
  currentFilter: 'all',
  searchQuery: '',
  session: null,

  init() {
    this.session = LocalDB.getSession();
    this.cart = JSON.parse(localStorage.getItem('em3d_cart') || '[]');
    this.products = LocalDB.getProducts();
    this.renderNav();
    this.updateCartBadge();
    this.bindEvents();
  },

  renderNav() {
    const loginBtn = document.getElementById('nav-login');
    const userMenu = document.getElementById('nav-user');
    if (!loginBtn || !userMenu) return;
    if (this.session) {
      loginBtn.style.display = 'none';
      userMenu.style.display = 'flex';
      const nameEl = document.getElementById('nav-username');
      if (nameEl) nameEl.textContent = this.session.nombre.split(' ')[0];
    } else {
      loginBtn.style.display = 'block';
      userMenu.style.display = 'none';
    }
  },

  saveCart() {
    localStorage.setItem('em3d_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  },

  updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    const total = this.cart.reduce((a, i) => a + i.qty, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  },

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const existing = this.cart.find(i => i.id === productId);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
    this.saveCart();
    this.renderCartItems();
    Toast.show(`¡${product.name} agregado al carrito!`, 'success');
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.saveCart();
    this.renderCartItems();
  },

  changeQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.saveCart();
    this.renderCartItems();
  },

  getCartTotal() {
    return this.cart.reduce((a, i) => a + i.price * i.qty, 0);
  },

  renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '<div class="cart-empty"><div style="font-size:3rem;margin-bottom:1rem">🛒</div><p style="color:var(--text2)">Tu carrito está vacío</p></div>';
    } else {
      container.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : item.emoji || '📦'}
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-AR')}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="App.changeQty('${item.id}', -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="App.changeQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="App.removeFromCart('${item.id}')" title="Eliminar">✕</button>
        </div>`).join('');
    }

    if (totalEl) {
      totalEl.textContent = '$' + this.getCartTotal().toLocaleString('es-AR');
    }
  },

  openCart() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
    this.renderCartItems();
  },

  closeCart() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-drawer').classList.remove('open');
  },

  openCheckout() {
    if (this.cart.length === 0) { Toast.show('Tu carrito está vacío', 'error'); return; }
    if (!this.session) {
      this.closeCart();
      Auth.openModal('login');
      Toast.show('Iniciá sesión para continuar con el pedido', 'error');
      return;
    }
    window.location.href = 'checkout.html';
  },

  renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const filtered = this.products.filter(p => {
      if (!p.active) return false;
      const matchCat = this.currentFilter === 'all' || p.category === this.currentFilter;
      const matchSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.category.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><h3>Sin resultados</h3><p>Probá con otra búsqueda o categoría</p></div>';
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="product-card" onclick="App.openProductDetail('${p.id}')">
        <div class="product-img">
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<span style="font-size:3.5rem">${p.emoji || '📦'}</span>`}
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        </div>
        <div class="product-body">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.description}</div>
        </div>
        <div class="product-footer">
          <div class="product-price"><span class="currency">ARS </span>$${Number(p.price).toLocaleString('es-AR')}</div>
          <button class="btn-add" onclick="event.stopPropagation(); App.addToCart('${p.id}')">+ Agregar</button>
        </div>
      </div>`).join('');
  },

  openProductDetail(productId) {
    const p = this.products.find(pr => pr.id === productId);
    if (!p) return;
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    document.getElementById('pm-emoji').textContent = p.image ? '' : (p.emoji || '📦');
    const img = document.getElementById('pm-img');
    img.src = p.image || '';
    img.style.display = p.image ? 'block' : 'none';
    document.getElementById('pm-name').textContent = p.name;
    document.getElementById('pm-category').textContent = p.category;
    document.getElementById('pm-desc').textContent = p.description;
    document.getElementById('pm-price').textContent = '$' + Number(p.price).toLocaleString('es-AR');
    document.getElementById('pm-stock').textContent = p.stock > 0 ? `Stock: ${p.stock} unidades` : 'Sin stock';
    document.getElementById('pm-add-btn').onclick = () => { App.addToCart(p.id); modal.classList.remove('open'); };
    modal.classList.add('open');
  },

  filterByCategory(cat) {
    this.currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    this.renderProducts();
  },

  search(query) {
    this.searchQuery = query.toLowerCase();
    this.renderProducts();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', e => this.search(e.target.value));
    document.querySelectorAll('.cat-btn').forEach(btn => btn.addEventListener('click', () => this.filterByCategory(btn.dataset.cat)));
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());
    const pmModal = document.getElementById('product-modal');
    if (pmModal) pmModal.addEventListener('click', e => { if (e.target === pmModal) pmModal.classList.remove('open'); });
  },
};

// ============================================================
// AUTH
// ============================================================
const Auth = {
  openModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('open');
    this.switchTab(tab);
  },

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
  },

  switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    const form = document.getElementById(`form-${tab}`);
    if (form) form.style.display = 'block';
  },

  async login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');
    const btn = document.getElementById('login-btn');
    if (!email || !password) { this.showMsg(msg, 'error', 'Completá todos los campos'); return; }
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Ingresando...';
    const user = LocalDB.findUser(email);
    if (!user || user.passwordHash !== btoa(password)) {
      this.showMsg(msg, 'error', 'Email o contraseña incorrectos');
      btn.disabled = false; btn.innerHTML = 'Ingresar'; return;
    }
    LocalDB.setSession(user);
    App.session = user;
    App.renderNav();
    this.closeModal();
    Toast.show(`¡Bienvenido/a, ${user.nombre.split(' ')[0]}!`, 'success');
    btn.disabled = false; btn.innerHTML = 'Ingresar';
  },

  async register(e) {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value;
    const password2 = document.getElementById('reg-pass2').value;
    const telefono = document.getElementById('reg-tel').value.trim();
    const msg = document.getElementById('reg-msg');
    const btn = document.getElementById('reg-btn');
    if (!nombre || !email || !password) { this.showMsg(msg, 'error', 'Completá todos los campos'); return; }
    if (password !== password2) { this.showMsg(msg, 'error', 'Las contraseñas no coinciden'); return; }
    if (password.length < 6) { this.showMsg(msg, 'error', 'La contraseña debe tener mínimo 6 caracteres'); return; }
    if (LocalDB.findUser(email)) { this.showMsg(msg, 'error', 'Este email ya está registrado'); return; }
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Registrando...';
    const user = LocalDB.saveUser({ nombre, email, passwordHash: btoa(password), telefono });
    LocalDB.setSession(user);
    App.session = user;
    App.renderNav();
    this.closeModal();
    Toast.show(`¡Cuenta creada! Bienvenido/a, ${nombre.split(' ')[0]}`, 'success');
    btn.disabled = false; btn.innerHTML = 'Crear cuenta';
  },

  logout() {
    LocalDB.clearSession();
    App.session = null;
    App.renderNav();
    Toast.show('Sesión cerrada', 'success');
  },

  showMsg(el, type, text) {
    if (!el) return;
    el.className = `form-msg ${type}`;
    el.textContent = text;
  },
};

// ============================================================
// TOAST
// ============================================================
const Toast = {
  show(msg, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (document.getElementById('products-grid')) App.renderProducts();
});
