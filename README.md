# 🔥 Fuego Amigo - Sistema de Catering y E-commerce

SPA completa desarrollada con **Vite + React + TypeScript + TailwindCSS** para Fuego Amigo Catering, con backend en **Supabase PostgreSQL** y **Netlify Functions**.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Features Principales](#features-principales)
   - [1. Tienda y Catálogo de Productos](#1-tienda-y-catálogo-de-productos)
   - [2. Carrito de Compras](#2-carrito-de-compras)
   - [3. Checkout y Creación de Órdenes](#3-checkout-y-creación-de-órdenes)
   - [4. Panel de Administración](#4-panel-de-administración)
   - [5. Gestión de Órdenes](#5-gestión-de-órdenes)
   - [6. Gestión de Productos](#6-gestión-de-productos)
   - [7. Gestión de Categorías](#7-gestión-de-categorías)
   - [8. Gestión de Eventos](#8-gestión-de-eventos)
   - [9. Gestión de Promociones](#9-gestión-de-promociones)
   - [10. Gestión de FAQs](#10-gestión-de-faqs)
   - [11. Configuración del Sitio](#11-configuración-del-sitio)
3. [Flujos Completos](#flujos-completos)
   - [Flujo de Compra (Cliente)](#flujo-de-compra-cliente)
   - [Flujo de Gestión de Órdenes (Admin)](#flujo-de-gestión-de-órdenes-admin)
   - [Flujo de Gestión de Productos (Admin)](#flujo-de-gestión-de-productos-admin)
4. [Setup y Configuración](#setup-y-configuración)
5. [Endpoints API](#endpoints-api)
6. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🏗️ Arquitectura General

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Backend**: Netlify Functions (Node.js)
- **Base de Datos**: Supabase PostgreSQL con Row Level Security (RLS)
- **Storage**: Supabase Storage (bucket privado)
- **Autenticación**: JWT custom (sin Supabase Auth)
- **Deploy**: Netlify

### Principios de Diseño

- **Separación de responsabilidades**: Frontend público (anon key) vs Backend admin (service role)
- **Seguridad**: RLS policies para proteger datos sensibles
- **Escalabilidad**: Arquitectura serverless con Netlify Functions
- **UX/UI**: Diseño moderno y responsive con TailwindCSS

---

## ✨ Features Principales

### 1. Tienda y Catálogo de Productos

#### ¿Qué permite hacer?

- **Navegar productos** organizados por categorías
- **Ver detalles** de cada producto (imágenes, descripción, precio, variantes)
- **Filtrar productos** por categoría, destacados, ofertas
- **Buscar productos** (si está implementado)
- **Ver promociones** y descuentos aplicados

#### Funcionalidades

**Categorías disponibles:**
- Boxes y Regalos
- Picadas y Tablas
- Ahumados
- Salsas y Aderezos
- Sandwiches y Burgers
- Finger Food
- Postres
- Combos

**Tipos de productos:**
- **Standard**: Producto simple con precio fijo
- **Weighted**: Producto por peso (precio por kg)
- **Apparel**: Producto con variantes (tallas, colores)
- **Combo**: Producto combinado
- **Service**: Servicio (catering, eventos)

**Características:**
- Hasta 5 imágenes por producto
- Sistema de descuentos (porcentaje o monto fijo)
- Marcado como "oferta" o "destacado"
- Control de stock
- Tags para búsqueda y filtrado

#### Flujo de uso

1. Cliente entra a `/tienda`
2. Ve productos organizados por categorías
3. Puede filtrar por categoría usando los botones
4. Hace clic en un producto para ver detalles
5. En la página de producto puede:
   - Ver todas las imágenes
   - Seleccionar variantes (si aplica)
   - Agregar al carrito con cantidad
   - Agregar notas especiales al producto

---

### 2. Carrito de Compras

#### ¿Qué permite hacer?

- **Agregar productos** al carrito desde cualquier página
- **Ver resumen** del carrito en tiempo real
- **Modificar cantidades** de productos
- **Eliminar productos** del carrito
- **Agregar notas** a productos individuales
- **Ver total** calculado automáticamente

#### Funcionalidades

**Carrito persistente:**
- Los productos se guardan en `localStorage`
- Persisten entre sesiones del navegador
- Se mantienen al navegar entre páginas

**Cálculos automáticos:**
- Subtotal por producto (precio × cantidad)
- Total general del carrito
- Aplicación de descuentos si existen

**Interfaz:**
- Drawer lateral que se abre desde el icono del carrito
- Muestra badge con cantidad de items
- Botón flotante de WhatsApp siempre visible

#### Flujo de uso

1. Cliente agrega productos al carrito
2. El badge del carrito muestra la cantidad
3. Al hacer clic en el icono, se abre el drawer
4. Puede modificar cantidades o eliminar items
5. Al hacer clic en "Ir al checkout", se redirige a `/checkout`

---

### 3. Checkout y Creación de Órdenes

#### ¿Qué permite hacer?

- **Completar información** del cliente (nombre, teléfono)
- **Seleccionar tipo de entrega** (entrega a domicilio o retiro)
- **Especificar zona** (si es entrega)
- **Elegir método de pago**
- **Agregar notas** adicionales al pedido
- **Crear la orden** en la base de datos
- **Enviar mensaje** automático por WhatsApp

#### Funcionalidades

**Validación:**
- Nombre y teléfono obligatorios
- Zona obligatoria si es entrega
- Validación en tiempo real del formulario

**Creación de orden:**
1. Se calculan los totales
2. Se genera mensaje de WhatsApp formateado
3. Se crea la orden en `fuegoamigo_orders` con:
   - Número de orden único (incremental desde 1000)
   - Datos del cliente
   - Items del carrito
   - Totales calculados
   - Estado inicial: `pending`
4. Se crea evento inicial en `fuegoamigo_order_events`
5. Se abre WhatsApp con el mensaje pre-formateado

**Mensaje de WhatsApp:**
```
*Pedido #1019*

Hola soy [Nombre], quiero hacer un pedido.

*Tipo de entrega:* Entrega/Retiro
*Zona/Barrio:* [Zona] (si aplica)

*Productos:*
2x Bondiola Braseada - $15.000
1x Costillas BBQ - $9.000

*Total estimado: $24.000*

*Medio de pago:* Efectivo

*Notas:* [Notas del cliente]

Importante: Los pedidos serán mediante transferencia de seña a coordinar en el próximo paso.

Gracias por tu pedido! 🔥
```

#### Flujo completo

1. Cliente completa el formulario de checkout
2. Hace clic en "Crear pedido"
3. Sistema valida los datos
4. Se crea la orden en la base de datos
5. Se genera el número de orden único
6. Se abre WhatsApp con el mensaje pre-formateado
7. Se limpia el carrito
8. Se redirige a `/tienda` con mensaje de confirmación

**Seguridad:**
- Las órdenes se crean usando función RPC que bypass RLS
- Validación de datos en el servidor
- Protección contra inyección SQL

---

### 4. Panel de Administración

#### ¿Qué permite hacer?

- **Acceder** a todas las funcionalidades de gestión
- **Ver dashboard** con estadísticas en tiempo real
- **Gestionar productos**, categorías, eventos, promociones, FAQs
- **Gestionar órdenes** completas
- **Configurar** el sitio

#### Autenticación

**Credenciales por defecto:**
- Email: `admin@fuegoamigo.com`
- Password: `fuegoamigo2024`

**Sistema de autenticación:**
- JWT tokens generados en el servidor
- Tokens almacenados en `localStorage`
- Verificación en cada request a endpoints admin
- Fallback para desarrollo local

#### Dashboard

**Estadísticas mostradas:**
- Productos activos
- Eventos activos
- Total de órdenes
- Órdenes del mes actual
- Órdenes por estado (pending, confirmed, preparing, ready, delivered, cancelled)

**Actualización:**
- Se actualiza automáticamente al entrar al dashboard
- Datos en tiempo real desde Supabase

---

### 5. Gestión de Órdenes

#### ¿Qué permite hacer?

- **Ver todas las órdenes** con filtros por estado
- **Ver detalle completo** de cada orden
- **Cambiar el estado** de las órdenes
- **Agregar notas incrementales** a las órdenes
- **Enviar notas al cliente** por WhatsApp
- **Ver historial** de cambios de estado
- **Ver todas las notas** agregadas

#### Estados de Orden

1. **Pending** (Pendiente): Orden recién creada, esperando confirmación
2. **Confirmed** (Confirmada): Orden confirmada por el negocio
3. **Preparing** (Preparando): Orden en preparación
4. **Ready** (Lista): Orden lista para entrega/retiro
5. **Delivered** (Entregada): Orden completada
6. **Cancelled** (Cancelada): Orden cancelada

#### Funcionalidades Detalladas

**Lista de órdenes:**
- Vista de tarjetas con información resumida
- Filtros por estado (all, pending, confirmed, etc.)
- Ordenadas por fecha (más recientes primero)
- Muestra: número de orden, cliente, total, estado, fecha

**Detalle de orden:**
- Información completa del cliente
- Lista de productos con cantidades y precios
- Total calculado
- Historial de estados (eventos)
- Notas agregadas con timestamps
- Campo para agregar nueva nota

**Cambio de estado:**
1. Admin selecciona nuevo estado del dropdown
2. Sistema actualiza la orden
3. Se crea evento automático en `fuegoamigo_order_events`
4. Se actualiza `updated_at` de la orden
5. La lista se refresca automáticamente

**Agregar nota:**
1. Admin escribe nota en el campo
2. Hace clic en "Agregar"
3. Sistema guarda la nota en `fuegoamigo_order_notes`
4. Se genera mensaje de WhatsApp con:
   - Número de orden
   - Texto de la nota
5. Aparece modal personalizado preguntando si enviar por WhatsApp
6. Si acepta, se abre WhatsApp con el mensaje pre-formateado
7. La nota queda guardada en el historial

**Modal de WhatsApp:**
- Diseño personalizado (no usa `confirm()` nativo)
- Icono de WhatsApp verde
- Botones estilizados (Cancelar / Enviar)
- Backdrop blur para mejor UX

#### Flujo Completo de Gestión

**Escenario: Nueva orden llega**

1. Cliente completa checkout → Orden creada con estado `pending`
2. Admin ve la orden en el dashboard (contador aumenta)
3. Admin va a sección "Órdenes" → Filtra por "pending"
4. Hace clic en la orden para ver detalles
5. Verifica datos del cliente y productos
6. Cambia estado a "confirmed" → Se crea evento automático
7. Agrega nota: "Orden confirmada, se coordinará pago"
8. Envía nota por WhatsApp al cliente
9. Cuando empieza a preparar, cambia a "preparing"
10. Cuando está lista, cambia a "ready"
11. Cliente retira/recibe → Cambia a "delivered"

**Historial completo:**
- Cada cambio de estado se registra en `fuegoamigo_order_events`
- Cada nota se guarda en `fuegoamigo_order_notes`
- Todo queda auditado con timestamps

---

### 6. Gestión de Productos

#### ¿Qué permite hacer?

- **Crear nuevos productos**
- **Editar productos existentes**
- **Eliminar productos**
- **Subir imágenes** (hasta 5 por producto)
- **Configurar precios** y descuentos
- **Asignar categorías**
- **Controlar stock**
- **Marcar como destacado** o en oferta

#### Funcionalidades Detalladas

**Crear/Editar Producto:**

**Campos básicos:**
- Nombre (obligatorio)
- Slug (generado automáticamente desde nombre)
- Descripción
- Precio (obligatorio)
- Categoría (dropdown)
- Tipo de producto (standard, weighted, apparel, combo, service)

**Campos avanzados:**
- Precio por kg (para productos weighted)
- Peso mínimo/máximo (para productos weighted)
- Variantes JSON (para productos apparel)
- Stock disponible
- Tags (array de strings)

**Imágenes:**
- Hasta 5 imágenes por producto
- Upload a Supabase Storage
- Conversión automática a WebP
- Preview antes de guardar
- Eliminación individual

**Descuentos:**
- Descuento por porcentaje (0-100%)
- Descuento fijo (monto en pesos)
- Marcar como "oferta" para destacar

**Estado:**
- Activo/Inactivo (controla visibilidad)
- Destacado (aparece en sección especial)

#### Flujo de Creación

1. Admin hace clic en "Nuevo Producto"
2. Completa formulario con datos básicos
3. Selecciona categoría
4. Sube imágenes (opcional)
5. Configura precio y descuentos
6. Guarda → Producto creado en Supabase
7. Aparece en la lista de productos
8. Visible en la tienda si está activo

#### Flujo de Edición

1. Admin hace clic en "Editar" en un producto
2. Se carga formulario con datos actuales
3. Modifica los campos necesarios
4. Puede agregar/eliminar imágenes
5. Guarda → Producto actualizado
6. Cambios se reflejan inmediatamente en la tienda

---

### 7. Gestión de Categorías

#### ¿Qué permite hacer?

- **Crear nuevas categorías**
- **Editar categorías existentes**
- **Eliminar categorías**
- **Subir imagen** de categoría
- **Controlar orden** de visualización
- **Activar/desactivar** categorías

#### Funcionalidades

**Campos:**
- Nombre (obligatorio)
- Slug (generado automáticamente)
- Descripción
- Imagen
- Orden (número para ordenar visualmente)
- Estado activo/inactivo

**Uso:**
- Las categorías organizan los productos en la tienda
- Aparecen como filtros en la página de tienda
- Cada producto debe tener una categoría asignada

---

### 8. Gestión de Eventos

#### ¿Qué permite hacer?

- **Crear eventos** de catering
- **Editar eventos existentes**
- **Eliminar eventos**
- **Subir múltiples imágenes** (hasta 5)
- **Configurar tipo de evento** (Social, Corporativo, etc.)
- **Agregar información** detallada (ubicación, rango de invitados, menú destacado)

#### Funcionalidades

**Campos:**
- Título (obligatorio)
- Tipo de evento (obligatorio)
- Ubicación
- Rango de invitados (ej: "50-100 personas")
- Menú destacado
- Descripción completa
- Imágenes (hasta 5)
- Estado activo/inactivo

**Tipos de eventos:**
- Social (cumpleaños, casamientos, etc.)
- Corporativo (eventos empresariales)
- Otros

**Visualización:**
- Los eventos aparecen en `/eventos`
- Se pueden filtrar por tipo
- Cada evento muestra imágenes y descripción completa

---

### 9. Gestión de Promociones

#### ¿Qué permite hacer?

- **Crear promociones** bancarias
- **Editar promociones existentes**
- **Eliminar promociones**
- **Configurar reintegros** por banco y día
- **Especificar medios de pago** aplicables
- **Definir vigencia** de la promoción

#### Funcionalidades

**Campos:**
- Banco (obligatorio)
- Día (obligatorio)
- Tope de reintegro (monto máximo)
- Porcentaje de reintegro (0-100%)
- Medios de pago aplicables (array)
- Vigencia (texto descriptivo)
- Estado activo/inactivo

**Uso:**
- Las promociones se muestran en la página principal
- Informan a los clientes sobre descuentos bancarios
- Se pueden filtrar por banco o día

---

### 10. Gestión de FAQs

#### ¿Qué permite hacer?

- **Crear preguntas frecuentes**
- **Editar FAQs existentes**
- **Eliminar FAQs**
- **Controlar orden** de visualización
- **Activar/desactivar** FAQs

#### Funcionalidades

**Campos:**
- Pregunta (obligatorio)
- Respuesta (obligatorio)
- Orden (para ordenar visualmente)
- Estado activo/inactivo

**Visualización:**
- Las FAQs aparecen en `/faqs`
- Se muestran en formato acordeón
- Solo se muestran las activas

---

### 11. Configuración del Sitio

#### ¿Qué permite hacer?

- **Configurar información** básica del negocio
- **Actualizar datos de contacto** (WhatsApp, email, dirección)
- **Configurar zonas** de entrega
- **Definir horarios** de atención
- **Configurar métodos de pago** disponibles
- **Personalizar templates** de WhatsApp

#### Campos Configurables

**Información básica:**
- Nombre de la marca
- Número de WhatsApp
- Email de contacto
- Dirección física
- Zonas de entrega

**Configuración avanzada:**
- Horarios (JSON con días y horarios)
- Métodos de pago (array)
- Opciones de entrega (array)
- Templates de WhatsApp (JSON)

---

## 🔄 Flujos Completos

### Flujo de Compra (Cliente)

```
1. Cliente entra a la tienda (/tienda)
   ↓
2. Navega productos por categorías
   ↓
3. Hace clic en un producto
   ↓
4. Ve detalles del producto (/producto/:slug)
   ↓
5. Selecciona variantes (si aplica)
   ↓
6. Agrega cantidad y notas
   ↓
7. Hace clic en "Agregar al carrito"
   ↓
8. Producto se agrega al carrito (localStorage)
   ↓
9. Repite pasos 2-8 para más productos
   ↓
10. Hace clic en icono del carrito
    ↓
11. Ve resumen del carrito en drawer
    ↓
12. Hace clic en "Ir al checkout"
    ↓
13. Llega a página de checkout (/checkout)
    ↓
14. Completa formulario:
    - Nombre y apellido
    - Teléfono
    - Tipo de entrega (entrega/retiro)
    - Zona (si es entrega)
    - Método de pago
    - Notas opcionales
    ↓
15. Hace clic en "Crear pedido"
    ↓
16. Sistema valida datos
    ↓
17. Se crea orden en base de datos:
    - Se genera número de orden único
    - Se calculan totales
    - Se genera mensaje WhatsApp
    ↓
18. Se abre WhatsApp con mensaje pre-formateado
    ↓
19. Se limpia el carrito
    ↓
20. Redirección a /tienda con mensaje de confirmación
```

### Flujo de Gestión de Órdenes (Admin)

```
1. Admin inicia sesión (/admin)
   ↓
2. Ve dashboard con estadísticas
   - Nota: Nueva orden aparece en contador
   ↓
3. Va a sección "Órdenes"
   ↓
4. Filtra por "pending" (nuevas órdenes)
   ↓
5. Ve lista de órdenes pendientes
   ↓
6. Hace clic en una orden
   ↓
7. Ve detalle completo:
   - Datos del cliente
   - Productos pedidos
   - Total
   - Estado actual
   ↓
8. Verifica que todo esté correcto
   ↓
9. Cambia estado a "confirmed" desde dropdown
   ↓
10. Sistema actualiza orden y crea evento
    ↓
11. Agrega nota: "Orden confirmada, coordinaremos pago"
    ↓
12. Aparece modal preguntando si enviar por WhatsApp
    ↓
13. Hace clic en "Enviar"
    ↓
14. Se abre WhatsApp con mensaje al cliente
    ↓
15. Cuando empieza preparación:
    - Cambia estado a "preparing"
    ↓
16. Cuando está lista:
    - Cambia estado a "ready"
    - Agrega nota: "Tu pedido está listo para retiro/entrega"
    - Envía por WhatsApp
    ↓
17. Cuando se entrega:
    - Cambia estado a "delivered"
    - Orden completada
```

### Flujo de Gestión de Productos (Admin)

```
1. Admin va a sección "Productos"
   ↓
2. Ve lista de todos los productos
   ↓
3. Para crear nuevo:
   - Hace clic en "Nuevo Producto"
   - Completa formulario
   - Sube imágenes
   - Guarda
   ↓
4. Para editar:
   - Hace clic en "Editar" en un producto
   - Modifica campos necesarios
   - Puede cambiar imágenes
   - Guarda cambios
   ↓
5. Para eliminar:
   - Hace clic en "Eliminar"
   - Confirma eliminación
   - Producto se marca como inactivo o se elimina
   ↓
6. Cambios se reflejan inmediatamente en la tienda
```

---

## ⚙️ Setup y Configuración

### Requisitos Previos

- Node.js 20+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Netlify
- Git

### 1. Clonar Repositorio

```bash
git clone https://github.com/gefm2002/fuegoamigo.git
cd fuegoamigo
npm install
```

### 2. Configurar Variables de Entorno

**Archivo `.env.local` (para Netlify Functions):**

```bash
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Netlify Functions
NETLIFY_JWT_SECRET=generar_con_comando_abajo

# Admin inicial
ADMIN_EMAIL=admin@fuegoamigo.com
ADMIN_PASSWORD=password_seguro

# WhatsApp
WHATSAPP_NUMBER=+5491141464526
```

**Archivo `.env` (para frontend Vite):**

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

**Generar NETLIFY_JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar Supabase

**Aplicar Migraciones:**

1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar en orden:
   - `001_init.sql` - Tablas y estructura inicial
   - `002_storage.sql` - Configuración de storage
   - `003_add_product_fields.sql` - Campos adicionales de productos
   - `004_fix_orders_rls.sql` - Políticas RLS para órdenes
   - `005_verify_and_fix_orders_rls.sql` - Verificación de políticas
   - `006_fix_orders_rls_explicit_role.sql` - Políticas explícitas
   - `007_fix_orders_rls_final.sql` - Políticas finales
   - `008_fix_orders_rls_complete.sql` - Limpieza completa
   - `009_fix_orders_rls_remove_all_restrictive.sql` - Eliminar restrictivas
   - `010_create_insert_order_function.sql` - Función RPC para crear órdenes

**Crear Bucket de Storage:**

1. Ir a Storage → Buckets
2. Crear bucket: `fuegoamigo_assets`
3. Configurar como **privado**
4. Límite: 1.5MB (1572864 bytes)
5. Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`

### 4. Migrar Datos Iniciales

```bash
npm run migrate
```

Este script migra:
- Productos desde `src/data/products.json`
- Eventos desde `src/data/events.json`
- Promociones desde `src/data/promos.json`
- FAQs desde `src/data/faqs.json`
- Crea usuario admin inicial

### 5. Desarrollo Local

**Frontend:**
```bash
npm run dev
```
Aplicación en `http://localhost:40001`

**Netlify Functions (opcional):**
```bash
npm install -g netlify-cli
netlify dev
```
Frontend en `http://localhost:8888` con proxy de functions

### 6. Build y Deploy

**Build local:**
```bash
npm run build
```

**Deploy en Netlify:**

1. Conectar repositorio a Netlify
2. **Configurar variables de entorno en Netlify Dashboard:**

   **⚠️ IMPORTANTE:** Las variables con prefijo `VITE_` son necesarias para el frontend durante el build.

   **Variables para Frontend (Build Time):**
   - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `tu_anon_key_aqui`

   **Variables para Netlify Functions:**
   - `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `SUPABASE_ANON_KEY` = `tu_anon_key_aqui`
   - `SUPABASE_SERVICE_ROLE_KEY` = `tu_service_role_key_aqui`
   - `NETLIFY_JWT_SECRET` = `generar_con_comando_abajo`
   - `WHATSAPP_NUMBER` = `+5491141464526`
   - `ADMIN_EMAIL` = `admin@fuegoamigo.com`
   - `ADMIN_PASSWORD` = `password_seguro`

   **Cómo configurar:**
   1. Ir a **Site settings** → **Environment variables**
   2. Agregar cada variable una por una
   3. **Asegurarse de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas**
   4. Guardar cambios
   5. Hacer un nuevo deploy (o esperar al siguiente push)

   **📖 Ver guía detallada:** [NETLIFY_SETUP.md](./NETLIFY_SETUP.md)

3. Netlify detecta automáticamente `netlify.toml`
4. Deploy automático en cada push a `main`

---

## 🔌 Endpoints API

### Públicos (Read-Only)

#### `GET /api/public-config`
Obtiene configuración del sitio.

**Respuesta:**
```json
{
  "brand_name": "Fuego Amigo",
  "whatsapp": "+5491141464526",
  "email": "fuegoamigo.resto@gmail.com",
  "zone": "CABA y GBA",
  "hours": {},
  "payment_methods": [],
  "delivery_options": []
}
```

#### `GET /api/public-content?key=hero`
Obtiene bloque de contenido CMS.

**Parámetros:**
- `key`: Clave del bloque (hero, about, services, etc.)

#### `GET /api/public-catalog`
Obtiene catálogo de productos.

**Parámetros:**
- `category`: Filtrar por categoría (opcional)
- `featured`: Solo destacados (opcional)

#### `GET /api/public-categories`
Lista todas las categorías activas.

#### `GET /api/public-events`
Lista eventos.

**Parámetros:**
- `eventType`: Filtrar por tipo (opcional)

#### `GET /api/public-promos`
Lista promociones activas.

#### `GET /api/public-faqs`
Lista FAQs activas.

#### `GET /api/public-signed-url?path=...`
Obtiene URL firmada temporal para imagen privada.

### Admin (Requieren JWT)

#### `POST /api/admin-login`
Autenticación de admin.

**Body:**
```json
{
  "email": "admin@fuegoamigo.com",
  "password": "password"
}
```

**Respuesta:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "email": "admin@fuegoamigo.com",
    "role": "admin"
  }
}
```

#### `GET /api/admin-me`
Obtiene información del admin actual (verifica token).

#### `GET /api/admin-dashboard`
Obtiene estadísticas del dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

#### `POST /api/admin-products-upsert`
Crea o actualiza producto.

**Body:**
```json
{
  "id": "uuid", // Opcional, si existe actualiza
  "name": "Producto",
  "slug": "producto",
  "description": "Descripción",
  "price": 10000,
  "category_id": "uuid",
  "product_type": "standard",
  "images": ["path1", "path2"],
  "tags": ["tag1", "tag2"],
  "stock": 10,
  "is_active": true,
  "featured": false,
  "discount_percentage": 10,
  "discount_fixed": 0,
  "is_offer": false
}
```

#### `DELETE /api/admin-products-delete?id=...`
Elimina producto.

#### `GET /api/admin-orders-list`
Lista órdenes.

**Parámetros:**
- `status`: Filtrar por estado (opcional)
- `limit`: Límite de resultados (default: 50)
- `offset`: Offset para paginación (default: 0)

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /api/admin-orders-get?id=...`
Obtiene detalle completo de una orden (incluye eventos y notas).

#### `PUT /api/admin-orders-update`
Actualiza orden.

**Body:**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "customer_name": "Nuevo nombre",
  // ... otros campos opcionales
}
```

#### `POST /api/admin-orders-send-note`
Agrega nota a orden y genera URL de WhatsApp.

**Body:**
```json
{
  "order_id": "uuid",
  "note": "Texto de la nota"
}
```

**Respuesta:**
```json
{
  "note": { /* nota creada */ },
  "whatsapp_url": "https://wa.me/..."
}
```

#### `POST /api/admin-assets-sign-upload`
Obtiene URL firmada para subir imagen.

**Body:**
```json
{
  "path": "fuegoamigo/product-id/image.webp"
}
```

### Órdenes

#### `POST /api/orders-create`
Crea nueva orden (público, validado en servidor).

**Body:**
```json
{
  "customer_name": "Juan Pérez",
  "customer_phone": "1234567890",
  "customer_email": "juan@example.com",
  "delivery_type": "entrega",
  "zone": "Palermo",
  "payment_method": "efectivo",
  "items": [
    {
      "product_id": "uuid",
      "name": "Producto",
      "variant": "Variante",
      "price": 10000,
      "qty": 2,
      "notes": "Notas especiales"
    }
  ],
  "notes": "Notas del pedido"
}
```

**Respuesta:**
```json
{
  "id": "uuid",
  "order_number": 1019,
  "whatsapp_message": "Mensaje formateado..."
}
```

---

## 📁 Estructura del Proyecto

```
fuegoamigo/
├── netlify/
│   └── functions/
│       ├── _shared/                    # Helpers compartidos
│       │   ├── auth.ts                  # Autenticación JWT
│       │   ├── supabaseServer.ts      # Cliente Supabase (service role)
│       │   ├── supabasePublic.ts      # Cliente Supabase (anon)
│       │   ├── validate.ts            # Validación de datos
│       │   └── images.ts              # Helpers de imágenes
│       ├── public-*.ts                 # Endpoints públicos (read-only)
│       ├── admin-*.ts                  # Endpoints admin (requieren JWT)
│       └── orders-create.ts            # Crear órdenes
│
├── supabase/
│   └── migrations/                     # Migraciones SQL
│       ├── 001_init.sql                # Estructura inicial
│       ├── 002_storage.sql             # Configuración storage
│       ├── 003_add_product_fields.sql  # Campos adicionales
│       ├── 004-010_*.sql               # Correcciones RLS
│
├── src/
│   ├── pages/
│   │   ├── Home.tsx                    # Página principal
│   │   ├── Tienda.tsx                  # Catálogo de productos
│   │   ├── Producto.tsx                # Detalle de producto
│   │   ├── Checkout.tsx                # Proceso de checkout
│   │   ├── Eventos.tsx                 # Lista de eventos
│   │   ├── Admin.tsx                   # Panel de administración
│   │   └── ...
│   ├── components/
│   │   ├── ProductCard.tsx             # Tarjeta de producto
│   │   ├── CartDrawer.tsx              # Drawer del carrito
│   │   └── ...
│   ├── lib/
│   │   ├── supabasePublic.ts          # Cliente Supabase público
│   │   ├── api.ts                     # Helper para llamadas API
│   │   ├── ordersDev.ts                # Helpers de órdenes (dev)
│   │   ├── dashboardDev.ts            # Helpers de dashboard (dev)
│   │   └── imageUrl.ts                # Helpers de imágenes
│   ├── hooks/
│   │   └── useSupabaseData.ts         # Hooks para datos
│   ├── cart/
│   │   ├── CartContext.tsx            # Context del carrito
│   │   └── useCart.ts                 # Hook del carrito
│   └── utils/
│       ├── whatsapp.ts                # Helpers de WhatsApp
│       ├── cartWhatsApp.ts            # Mensajes de carrito
│       └── slugify.ts                 # Generar slugs
│
├── scripts/
│   ├── migrate-with-images.ts         # Migración con imágenes
│   ├── apply-migrations.ts            # Aplicar migraciones
│   └── check-env.js                   # Verificar variables de entorno
│
├── netlify.toml                        # Configuración Netlify
├── package.json                        # Dependencias
└── vite.config.ts                     # Configuración Vite
```

---

## 🔒 Seguridad

### Row Level Security (RLS)

**Políticas implementadas:**

- **Productos, Categorías, Eventos, Promos, FAQs**: Lectura pública, escritura solo admin
- **Órdenes**: 
  - INSERT permitido para usuarios anónimos (checkout)
  - SELECT, UPDATE, DELETE solo para service role (admin)
- **Order Events**: 
  - INSERT permitido para usuarios anónimos (al crear orden)
  - SELECT solo para service role
- **Order Notes**: Solo service role

### Autenticación

- JWT tokens generados en servidor
- Tokens incluyen email y role
- Verificación en cada request admin
- Tokens expiran (configurable)

### Validación

- Validación de datos en cliente y servidor
- Sanitización de inputs
- Protección contra SQL injection (usando Supabase client)

---

## 🚀 Deploy en Netlify

### Configuración Requerida

**Variables de entorno en Netlify:**

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NETLIFY_JWT_SECRET=tu_jwt_secret
WHATSAPP_NUMBER=+5491141464526
ADMIN_EMAIL=admin@fuegoamigo.com
ADMIN_PASSWORD=password_seguro
```

**Build settings (automático desde netlify.toml):**

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

### Proceso de Deploy

1. Push a `main` → Netlify detecta cambios
2. Instala dependencias
3. Ejecuta build (`npm run build`)
4. Compila Netlify Functions
5. Deploya frontend y functions
6. Sitio disponible en URL de Netlify

---

## 🐛 Troubleshooting

### Build falla en Netlify

- Verificar que todas las variables de entorno estén configuradas
- Revisar logs de build para errores específicos
- Verificar que TypeScript compile sin errores localmente

### Órdenes no se crean

- Verificar que las migraciones RLS estén aplicadas
- Verificar función RPC `fuegoamigo_insert_order` existe
- Revisar políticas RLS en Supabase Dashboard

### Imágenes no se muestran

- Verificar que el bucket `fuegoamigo_assets` existe
- Verificar políticas de storage en Supabase
- Usar endpoint `public-signed-url` para obtener URLs temporales

### Admin no puede acceder

- Verificar credenciales en `.env.local`
- Verificar que el usuario admin existe en `fuegoamigo_admin_users`
- Verificar que `NETLIFY_JWT_SECRET` está configurado

---

## 📝 Notas Adicionales

### Desarrollo vs Producción

**En desarrollo:**
- Si Netlify Functions no están disponibles, se usan fallbacks
- Funciones en `ordersDev.ts` y `dashboardDev.ts` usan service_role key directamente
- Permite desarrollo sin necesidad de `netlify dev`

**En producción:**
- Todas las operaciones pasan por Netlify Functions
- Mayor seguridad y control
- Mejor logging y monitoreo

### Migraciones

- Ejecutar migraciones en orden (001, 002, 003, etc.)
- Verificar que cada migración se ejecute correctamente
- No re-ejecutar migraciones ya aplicadas (usar `IF NOT EXISTS`)

### Performance

- Imágenes optimizadas a WebP
- Lazy loading de componentes
- Caché de datos en cliente cuando es posible

---

## 📄 Licencia

Proyecto desarrollado por **Structura** para **Fuego Amigo**.

---

## 🤝 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
