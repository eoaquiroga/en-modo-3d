// ============================================================
// EN MODO 3D - Google Apps Script Backend
// Instrucciones:
// 1. Abrí tu Google Sheet
// 2. Extensiones → Apps Script
// 3. Pegá TODO este código
// 4. Guardar → Implementar → Nueva implementación
//    - Tipo: Aplicación web
//    - Ejecutar como: Yo
//    - Acceso: Todos (anónimo)
// 5. Copiá la URL y pegala en Admin → Configuración
// ============================================================

const SHEET_NAMES = {
  PRODUCTS: 'Productos',
  USERS: 'Usuarios',
  ORDERS: 'Pedidos',
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let result;
    switch (data.action) {
      case 'registerUser':   result = registerUser(data); break;
      case 'loginUser':      result = loginUser(data); break;
      case 'getProducts':    result = getProducts(); break;
      case 'saveProduct':    result = saveProduct(data.product); break;
      case 'deleteProduct':  result = deleteProduct(data.id); break;
      case 'saveOrder':      result = saveOrder(data.order); break;
      case 'getOrders':      result = getOrders(); break;
      case 'updateOrderStatus': result = updateOrderStatus(data.orderId, data.status); break;
      default: result = { success: false, error: 'Acción desconocida' };
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'En Modo 3D API activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Init headers
    if (name === SHEET_NAMES.PRODUCTS) {
      sheet.appendRow(['ID','Nombre','Categoría','Precio','Stock','Descripción','Emoji','Badge','Imagen','Activo','Creado']);
    } else if (name === SHEET_NAMES.USERS) {
      sheet.appendRow(['ID','Nombre','Email','PasswordHash','Teléfono','Creado']);
    } else if (name === SHEET_NAMES.ORDERS) {
      sheet.appendRow(['ID','UsuarioID','Nombre','Email','Teléfono','Dirección','Notas','MetodoPago','Items','Total','Estado','Creado']);
    }
  }
  return sheet;
}

// ---------- USERS ----------
function registerUser(data) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();
  const existing = rows.find(r => r[2] === data.email);
  if (existing) return { success: false, error: 'Email ya registrado' };
  const id = 'u' + Date.now();
  sheet.appendRow([id, data.nombre, data.email, data.password, data.telefono || '', new Date().toISOString()]);
  return { success: true, id };
}

function loginUser(data) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();
  const user = rows.find(r => r[2] === data.email && r[3] === data.password);
  if (!user) return { success: false, error: 'Credenciales incorrectas' };
  return { success: true, user: { id: user[0], nombre: user[1], email: user[2] } };
}

// ---------- PRODUCTS ----------
function getProducts() {
  const sheet = getSheet(SHEET_NAMES.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, products: [] };
  const products = rows.slice(1).map(r => ({
    id: r[0], name: r[1], category: r[2], price: r[3], stock: r[4],
    description: r[5], emoji: r[6], badge: r[7], image: r[8],
    active: r[9] === true || r[9] === 'TRUE' || r[9] === 1,
    createdAt: r[10],
  }));
  return { success: true, products };
}

function saveProduct(product) {
  const sheet = getSheet(SHEET_NAMES.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  const rowIdx = rows.findIndex(r => r[0] === product.id);
  const row = [
    product.id || ('p' + Date.now()), product.name, product.category,
    product.price, product.stock, product.description,
    product.emoji, product.badge, product.image,
    product.active ? 'TRUE' : 'FALSE', new Date().toISOString()
  ];
  if (rowIdx > 0) {
    sheet.getRange(rowIdx + 1, 1, 1, row.length).setValues([row]);
  } else {
    row[0] = 'p' + Date.now();
    sheet.appendRow(row);
  }
  return { success: true };
}

function deleteProduct(id) {
  const sheet = getSheet(SHEET_NAMES.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  const rowIdx = rows.findIndex(r => r[0] === id);
  if (rowIdx > 0) sheet.deleteRow(rowIdx + 1);
  return { success: true };
}

// ---------- ORDERS ----------
function saveOrder(order) {
  const sheet = getSheet(SHEET_NAMES.ORDERS);
  sheet.appendRow([
    order.id, order.usuario || '', order.nombre, order.email, order.telefono || '',
    order.direccion || '', order.notas || '', order.metodoPago || '',
    JSON.stringify(order.items || []), order.total, 'pending', order.createdAt || new Date().toISOString()
  ]);
  return { success: true };
}

function getOrders() {
  const sheet = getSheet(SHEET_NAMES.ORDERS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, orders: [] };
  const orders = rows.slice(1).map(r => ({
    id: r[0], usuario: r[1], nombre: r[2], email: r[3], telefono: r[4],
    direccion: r[5], notas: r[6], metodoPago: r[7],
    items: JSON.parse(r[8] || '[]'), total: r[9], status: r[10], createdAt: r[11],
  }));
  return { success: true, orders };
}

function updateOrderStatus(orderId, status) {
  const sheet = getSheet(SHEET_NAMES.ORDERS);
  const rows = sheet.getDataRange().getValues();
  const rowIdx = rows.findIndex(r => r[0] === orderId);
  if (rowIdx > 0) sheet.getRange(rowIdx + 1, 11).setValue(status);
  return { success: true };
}
