// ============================================================
// CONFIGURACIÓN GOOGLE SHEETS
// Reemplazá SHEET_ID con el ID de tu planilla de Google
// ============================================================
const SHEETS_CONFIG = {
  SHEET_ID: '1cerxisbT2XDh77nSQ35iDruXvZFOmwHKGuGQAKqRA2M',
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxgRlBx4mlQso7qSJLPkaDV8UVOYHR3R8pRLJQcSHv4b-UmhJB3UGyGP9uwDPOljdXvmg/exec',
};

// ============================================================
// SHEETS API - Usa Google Apps Script como backend
// ============================================================

async function sheetsRequest(action, data = {}) {
  try {
    const url = SHEETS_CONFIG.SCRIPT_URL;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Sheets error:', err);
    return { success: false, error: err.message };
  }
}

// --- USUARIOS ---
async function registerUser({ nombre, email, password, telefono = '' }) {
  return sheetsRequest('registerUser', { nombre, email, password: btoa(password), telefono });
}

async function loginUser({ email, password }) {
  return sheetsRequest('loginUser', { email, password: btoa(password) });
}

// --- PRODUCTOS ---
async function getProducts() {
  return sheetsRequest('getProducts');
}

async function saveProduct(product) {
  return sheetsRequest('saveProduct', { product });
}

async function deleteProduct(id) {
  return sheetsRequest('deleteProduct', { id });
}

// --- PEDIDOS ---
async function saveOrder(order) {
  return sheetsRequest('saveOrder', { order });
}

async function getOrders() {
  return sheetsRequest('getOrders');
}

async function updateOrderStatus(orderId, status) {
  return sheetsRequest('updateOrderStatus', { orderId, status });
}

// ============================================================
// LOCAL STORAGE - Para persistencia offline / demo
// ============================================================

const LocalDB = {
  // Productos demo (se reemplazan con los reales de Sheets)
  defaultProducts: [
    {
      id: 'p1', name: 'Soporte para Celular Auto', category: 'Accesorios',
      price: 1800, description: 'Soporte articulado para ventilla de aire. Compatible con todos los modelos.',
      emoji: '📱', badge: 'Más vendido', stock: 15, active: true,
      image: ''
    },
    {
      id: 'p2', name: 'Maceta Geométrica Moderna', category: 'Hogar',
      price: 2500, description: 'Maceta con diseño hexagonal. Ideal para plantas pequeñas y suculentas.',
      emoji: '🌿', badge: '', stock: 8, active: true,
      image: ''
    },
    {
      id: 'p3', name: 'Llavero Personalizado', category: 'Personalizado',
      price: 900, description: 'Llavero con tu nombre o logo. Material PLA resistente. Varios colores.',
      emoji: '🔑', badge: 'Nuevo', stock: 50, active: true,
      image: ''
    },
    {
      id: 'p4', name: 'Organizador de Escritorio', category: 'Oficina',
      price: 3200, description: 'Organizador modular para lapiceras, clips y accesorios de escritorio.',
      emoji: '✏️', badge: '', stock: 12, active: true,
      image: ''
    },
    {
      id: 'p5', name: 'Figura Personalizada', category: 'Personalizado',
      price: 5500, description: 'Figura 3D personalizada de hasta 15cm. Enviá tu diseño o elegí de nuestro catálogo.',
      emoji: '🗿', badge: 'Premium', stock: 5, active: true,
      image: ''
    },
    {
      id: 'p6', name: 'Soporte para Auriculares', category: 'Accesorios',
      price: 2200, description: 'Soporte de escritorio para auriculares. Diseño minimalista y resistente.',
      emoji: '🎧', badge: '', stock: 20, active: true,
      image: ''
    },
    {
      id: 'p7', name: 'Porta Tablet Mesa', category: 'Hogar',
      price: 2800, description: 'Soporte ajustable para tablets de 7 a 12 pulgadas. Plegable.',
      emoji: '📱', badge: '', stock: 10, active: true,
      image: ''
    },
    {
      id: 'p8', name: 'Mini Arquitectura Maqueta', category: 'Decoración',
      price: 7800, description: 'Maquetas arquitectónicas a escala. Casa moderna, edificios icónicos y más.',
      emoji: '🏠', badge: 'Edición limitada', stock: 3, active: true,
      image: ''
    },
  ],

  getProducts() {
    const stored = localStorage.getItem('em3d_products');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('em3d_products', JSON.stringify(this.defaultProducts));
    return this.defaultProducts;
  },

  saveProducts(products) {
    localStorage.setItem('em3d_products', JSON.stringify(products));
  },

  addProduct(product) {
    const products = this.getProducts();
    product.id = 'p' + Date.now();
    products.push(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(product) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    this.saveProducts(products);
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  getUsers() {
    return JSON.parse(localStorage.getItem('em3d_users') || '[]');
  },

  saveUser(user) {
    const users = this.getUsers();
    user.id = 'u' + Date.now();
    user.createdAt = new Date().toISOString();
    users.push(user);
    localStorage.setItem('em3d_users', JSON.stringify(users));
    return user;
  },

  findUser(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getOrders() {
    return JSON.parse(localStorage.getItem('em3d_orders') || '[]');
  },

  saveOrder(order) {
    const orders = this.getOrders();
    order.id = 'ORD-' + Date.now();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    orders.unshift(order);
    localStorage.setItem('em3d_orders', JSON.stringify(orders));
    return order;
  },

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) orders[idx].status = status;
    localStorage.setItem('em3d_orders', JSON.stringify(orders));
  },

  getSession() {
    return JSON.parse(localStorage.getItem('em3d_session') || 'null');
  },

  setSession(user) {
    localStorage.setItem('em3d_session', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('em3d_session');
  },
};
