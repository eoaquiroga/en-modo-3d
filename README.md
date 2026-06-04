# 🖨️ En Modo 3D — Tienda Online

Tienda e-commerce de impresión 3D construida con HTML/CSS/JS puro. Sin frameworks, fácil de mantener.

## 🌐 Demo en vivo
**https://eoaquiroga.github.io/en-modo-3d/**

## 📁 Estructura

```
en-modo-3d/
├── index.html              # Página principal / tienda
├── checkout.html           # Proceso de compra
├── admin.html              # Panel de administración
├── css/
│   └── style.css           # Estilos globales
├── js/
│   ├── app.js              # Lógica principal (carrito, auth, productos)
│   └── sheets.js           # Integración Google Sheets + datos locales
├── google-apps-script.js   # Código para el backend en Google Apps Script
└── .github/workflows/
    └── deploy.yml          # Auto-deploy a GitHub Pages
```

## 🚀 Deploy en GitHub Pages

1. Subí el repo a GitHub: `git push origin main`
2. Andá a **Settings → Pages**
3. Source: **GitHub Actions**
4. El sitio se despliega automáticamente en cada push

## 📊 Conectar Google Sheets

1. Creá una nueva planilla en [Google Sheets](https://sheets.google.com)
2. Andá a **Extensiones → Apps Script**
3. Pegá el contenido de `google-apps-script.js`
4. Guardá y desplegá como **Aplicación web**:
   - Ejecutar como: **Yo**
   - Acceso: **Todos (anónimo)**
5. Copiá la URL generada
6. En el panel Admin → **Configuración**, pegá la URL y el Sheet ID

### Estructura de hojas requerida (se crean automáticamente)
- `Productos` — catálogo de productos
- `Usuarios` — clientes registrados
- `Pedidos` — órdenes de compra

## ✨ Funcionalidades

- 🛍️ Catálogo de productos con filtros por categoría y búsqueda
- 🛒 Carrito de compras persistente
- 👤 Registro e inicio de sesión
- 📦 Panel admin para gestionar productos, pedidos y usuarios
- 💳 Checkout con múltiples métodos de pago
- 📊 Dashboard con estadísticas
- 📱 Diseño responsive
- 🔄 Sincronización con Google Sheets

## 🛠️ Personalización

Editá `js/sheets.js` para cambiar los productos demo:
```js
LocalDB.defaultProducts = [
  { id: 'p1', name: 'Mi producto', category: 'Hogar', price: 2000, ... }
]
```

Para cambiar colores, editá las variables CSS en `css/style.css`:
```css
:root {
  --primary: #00E5FF;   /* Color principal */
  --accent: #FF6B35;    /* Color de acento */
}
```
