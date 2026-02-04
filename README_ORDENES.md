# Sistema de Órdenes - Documentación Técnica

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Creación de Órdenes](#flujo-de-creación-de-órdenes)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [Seguridad y Row-Level Security (RLS)](#seguridad-y-row-level-security-rls)
5. [Funciones PostgreSQL (RPC)](#funciones-postgresql-rpc)
6. [Backend: Netlify Functions](#backend-netlify-functions)
7. [Frontend: Checkout y Admin](#frontend-checkout-y-admin)
8. [Helpers de Desarrollo](#helpers-de-desarrollo)
9. [Gestión de Órdenes desde Admin](#gestión-de-órdenes-desde-admin)
10. [Implementación Técnica Detallada](#implementación-técnica-detallada)

---

## Arquitectura General

El sistema de órdenes está diseñado con una arquitectura de **frontend/backend separados**:

```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│ Netlify         │  │ Supabase        │
│ Functions       │  │ (Directo)       │
│ (Producción)    │  │ (Desarrollo)    │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    ▼
         ┌──────────────────┐
         │  Supabase        │
         │  PostgreSQL     │
         │  (RLS Enabled)   │
         └──────────────────┘
```

### Componentes Principales

1. **Frontend (Checkout)**: Formulario de checkout que recopila datos del cliente
2. **Backend API**: Netlify Functions (producción) o Supabase directo (desarrollo)
3. **Base de Datos**: PostgreSQL en Supabase con RLS habilitado
4. **Admin Panel**: Panel de administración para gestionar órdenes

---

## Flujo de Creación de Órdenes

### 1. Frontend: Checkout (`src/pages/Checkout.tsx`)

El usuario completa el formulario de checkout con:
- Datos del cliente (nombre, teléfono, email opcional)
- Tipo de entrega (entrega/retiro)
- Zona/barrio (si es entrega)
- Método de pago
- Notas adicionales

**Código clave:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const orderData = {
    customer_name: formData.name,
    customer_phone: formData.phone,
    delivery_type: formData.deliveryType,
    zone: formData.deliveryType === 'entrega' ? formData.zone : null,
    payment_method: formData.paymentMethod,
    items: items.map((item) => ({
      product_id: item.id,
      name: item.name,
      variant: item.variant,
      price: item.price,
      qty: item.qty,
      notes: item.notes,
    })),
    notes: formData.notes,
  };

  // Intentar con Netlify Function primero
  try {
    response = await apiFetch('orders-create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  } catch (netlifyError) {
    // Fallback a Supabase directo en desarrollo
    if (import.meta.env.DEV) {
      response = await createOrderDev(orderData);
    } else {
      throw netlifyError;
    }
  }
};
```

### 2. Backend: Creación de Orden

#### Opción A: Netlify Function (Producción)

**Archivo:** `netlify/functions/orders-create.ts`

```typescript
export const handler: Handler = async (event) => {
  // Validar campos requeridos
  const { valid, missing } = validateRequired(body, [
    'customer_name',
    'customer_phone',
    'delivery_type',
    'payment_method',
    'items',
  ]);

  // Calcular totales
  let subtotal = 0;
  for (const item of body.items) {
    subtotal += (item.price || 0) * (item.qty || 1);
  }
  const total = subtotal;

  // Generar mensaje WhatsApp
  const whatsappMessage = buildWhatsAppMessage(body, total);

  // Insertar orden usando service_role (bypass RLS)
  const { data: order, error } = await supabaseServer
    .from('fuegoamigo_orders')
    .insert({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      delivery_type: body.delivery_type,
      zone: body.zone,
      payment_method: body.payment_method,
      items: body.items,
      subtotal,
      total,
      notes: body.notes,
      whatsapp_message: whatsappMessage,
      status: 'pending',
    })
    .select()
    .single();

  // Crear evento inicial
  await supabaseServer.from('fuegoamigo_order_events').insert({
    order_id: order.id,
    status: 'pending',
    notes: 'Orden creada',
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      order_number: order.order_number,
      whatsapp_message: whatsappMessage,
    }),
  };
};
```

#### Opción B: Supabase Directo (Desarrollo)

**Archivo:** `src/lib/ordersDev.ts`

```typescript
export async function createOrderDev(orderData: {...}): Promise<{...}> {
  // Calcular totales
  let subtotal = 0;
  for (const item of orderData.items) {
    subtotal += (item.price || 0) * (item.qty || 1);
  }
  const total = subtotal;

  // Generar mensaje WhatsApp
  const whatsappMessage = buildWhatsAppMessage(orderData, total);

  // Intentar INSERT directo con anon key
  const insertResult = await supabasePublic
    .from('fuegoamigo_orders')
    .insert(orderPayload)
    .select()
    .single();

  // Si falla por RLS, usar función RPC como fallback
  if (error && error.code === '42501') {
    const rpcResult = await supabasePublic.rpc('fuegoamigo_insert_order', {
      p_customer_name: orderData.customer_name,
      p_customer_phone: orderData.customer_phone,
      p_delivery_type: orderData.delivery_type,
      p_payment_method: orderData.payment_method,
      p_items: orderData.items,
      p_subtotal: subtotal,
      p_total: total,
      p_customer_email: null,
      p_zone: orderData.zone,
      p_notes: orderData.notes,
      p_whatsapp_message: whatsappMessage,
    });
  }

  return {
    order_number: order.order_number,
    whatsapp_message: whatsappMessage,
  };
}
```

### 3. Respuesta y Redirección

Después de crear la orden:
1. Se genera un mensaje de WhatsApp con el número de orden
2. Se abre WhatsApp Web/App con el mensaje prellenado
3. Se limpia el carrito
4. Se redirige a la tienda con confirmación

---

## Estructura de Base de Datos

### Tabla: `fuegoamigo_orders`

```sql
CREATE TABLE fuegoamigo_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER UNIQUE NOT NULL DEFAULT nextval('fuegoamigo_order_number_seq'),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_type fuegoamigo_delivery_type NOT NULL,
  zone TEXT,
  payment_method fuegoamigo_payment_method NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  whatsapp_message TEXT,
  status fuegoamigo_order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos clave:**
- `order_number`: Número secuencial único (inicia en 1000)
- `items`: JSONB con array de productos `[{product_id, name, variant, price, qty, notes}]`
- `status`: Enum `('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')`
- `whatsapp_message`: Mensaje formateado para WhatsApp

### Tabla: `fuegoamigo_order_events`

Historial de cambios de estado:

```sql
CREATE TABLE fuegoamigo_order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES fuegoamigo_orders(id) ON DELETE CASCADE,
  status fuegoamigo_order_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `fuegoamigo_order_notes`

Notas internas del admin:

```sql
CREATE TABLE fuegoamigo_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES fuegoamigo_orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE fuegoamigo_order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
);

CREATE TYPE fuegoamigo_delivery_type AS ENUM ('entrega', 'retiro');

CREATE TYPE fuegoamigo_payment_method AS ENUM (
  'efectivo', 'tarjeta', 'transferencia', 'modo', 'mercado', 'billeteras-qr'
);
```

### Sequence

```sql
CREATE SEQUENCE fuegoamigo_order_number_seq START 1000;
```

---

## Seguridad y Row-Level Security (RLS)

### Problema: RLS Bloqueando Inserts

Inicialmente, las políticas RLS bloqueaban todos los accesos:

```sql
CREATE POLICY "Deny all orders" ON fuegoamigo_orders FOR ALL USING (false);
```

### Solución: Políticas RLS Permisivas para INSERT

**Archivo:** `supabase/migrations/009_fix_orders_rls_remove_all_restrictive.sql`

```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE fuegoamigo_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_events DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
    ) LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Re-habilitar RLS
ALTER TABLE fuegoamigo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_events ENABLE ROW LEVEL SECURITY;

-- Crear políticas simples para INSERT
CREATE POLICY "orders_insert_anon" ON fuegoamigo_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "order_events_insert_anon" ON fuegoamigo_order_events
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

**Nota importante:** Las políticas solo permiten `INSERT`. Los `SELECT` están bloqueados para usuarios anónimos, por lo que el admin debe usar `service_role` key.

### Clientes Supabase

#### 1. `supabasePublic` (anon key)

**Archivo:** `src/lib/supabasePublic.ts`

```typescript
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
});
```

**Uso:** Frontend público, creación de órdenes (con RLS policies que permiten INSERT).

#### 2. `supabaseServer` (service_role key)

**Archivo:** `netlify/functions/_shared/supabaseServer.ts`

```typescript
export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**Uso:** Backend (Netlify Functions), bypass completo de RLS.

---

## Funciones PostgreSQL (RPC)

### Función: `fuegoamigo_insert_order`

**Archivo:** `supabase/migrations/010_create_insert_order_function.sql`

Función `SECURITY DEFINER` que bypassa RLS:

```sql
CREATE OR REPLACE FUNCTION fuegoamigo_insert_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_type fuegoamigo_delivery_type,
  p_payment_method fuegoamigo_payment_method,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_total NUMERIC,
  p_customer_email TEXT DEFAULT NULL,
  p_zone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_whatsapp_message TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  order_number INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_type fuegoamigo_delivery_type,
  payment_method fuegoamigo_payment_method,
  total NUMERIC,
  status fuegoamigo_order_status,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number INTEGER;
BEGIN
  -- Insertar orden
  INSERT INTO fuegoamigo_orders (
    customer_name,
    customer_email,
    customer_phone,
    delivery_type,
    zone,
    payment_method,
    items,
    subtotal,
    total,
    notes,
    whatsapp_message,
    status
  ) VALUES (
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_type,
    p_zone,
    p_payment_method,
    p_items,
    p_subtotal,
    p_total,
    p_notes,
    p_whatsapp_message,
    'pending'
  )
  RETURNING fuegoamigo_orders.id, fuegoamigo_orders.order_number 
    INTO v_order_id, v_order_number;
  
  -- Crear evento inicial
  INSERT INTO fuegoamigo_order_events (order_id, status, notes)
  VALUES (v_order_id, 'pending', 'Orden creada');
  
  -- Retornar datos de la orden
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.delivery_type,
    o.payment_method,
    o.total,
    o.status,
    o.created_at
  FROM fuegoamigo_orders o
  WHERE o.id = v_order_id;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION fuegoamigo_insert_order TO anon;
GRANT EXECUTE ON FUNCTION fuegoamigo_insert_order TO authenticated;
```

**Ventajas:**
- Bypassa RLS completamente (`SECURITY DEFINER`)
- Transacción atómica (orden + evento)
- Fallback robusto si el INSERT directo falla

**Uso desde frontend:**

```typescript
const rpcResult = await supabasePublic.rpc('fuegoamigo_insert_order', {
  p_customer_name: orderData.customer_name,
  p_customer_phone: orderData.customer_phone,
  // ... otros parámetros
});
```

---

## Backend: Netlify Functions

### 1. Crear Orden

**Archivo:** `netlify/functions/orders-create.ts`

- **Método:** POST
- **Autenticación:** No requerida (público)
- **Validación:** Campos requeridos
- **Cálculo:** Subtotal y total automáticos
- **Generación:** Mensaje WhatsApp formateado
- **Uso:** `supabaseServer` (service_role) para bypass RLS

### 2. Listar Órdenes (Admin)

**Archivo:** `netlify/functions/admin-orders-list.ts`

- **Método:** GET
- **Autenticación:** JWT token requerido
- **Filtros:** `status`, `limit`, `offset`
- **Uso:** `supabaseServer` para leer todas las órdenes

```typescript
const { data, error } = await supabaseServer
  .from('fuegoamigo_orders')
  .select('*')
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

### 3. Actualizar Orden (Admin)

**Archivo:** `netlify/functions/admin-orders-update.ts`

- **Método:** PUT
- **Autenticación:** JWT token requerido
- **Campos actualizables:** `status`, `items`, `customer_*`, `delivery_type`, `zone`, `payment_method`, `notes`
- **Eventos:** Crea automáticamente un evento en `fuegoamigo_order_events` cuando cambia el estado

```typescript
if (body.status !== undefined) {
  updateData.status = body.status;
  // Crear evento de cambio de estado
  await supabaseServer.from('fuegoamigo_order_events').insert({
    order_id: body.id,
    status: body.status,
    notes: body.status_notes || '',
  });
}
```

### 4. Agregar Nota (Admin)

**Archivo:** `netlify/functions/admin-orders-send-note.ts`

- **Método:** POST
- **Autenticación:** JWT token requerido
- **Acción:** Inserta nota en `fuegoamigo_order_notes`
- **Retorno:** URL de WhatsApp para enviar la nota al cliente

```typescript
// Generar mensaje WhatsApp
const whatsappMessage = `*Actualización Pedido #${order.order_number}*\n\n${body.note}`;
const phone = order.customer_phone?.replace(/\D/g, '') || '';
const whatsappUrl = phone
  ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
  : null;
```

### 5. Obtener Detalle de Orden (Admin)

**Archivo:** `netlify/functions/admin-orders-get.ts`

- **Método:** GET
- **Autenticación:** JWT token requerido
- **Retorno:** Orden completa con eventos y notas

---

## Frontend: Checkout y Admin

### Checkout (`src/pages/Checkout.tsx`)

**Flujo:**
1. Validación de formulario
2. Preparación de datos de orden
3. Llamada a API (Netlify Function o fallback dev)
4. Generación de link WhatsApp
5. Redirección con confirmación

**Validación:**

```typescript
const isValid =
  formData.name.trim().length > 0 &&
  formData.phone.trim().length > 0 &&
  (formData.deliveryType === 'retiro' || formData.zone.trim().length > 0);
```

**Mensaje WhatsApp:**

```typescript
const finalMessage = `*Pedido #${response.order_number}*\n\n${response.whatsapp_message}`;
const link = buildWhatsAppLink(WHATSAPP_NUMBER, finalMessage);
window.open(link, '_blank');
```

### Admin Panel (`src/pages/Admin.tsx`)

**Sección de Órdenes:**

1. **Listado de órdenes:**
   - Filtro por estado
   - Vista de tarjetas con información resumida
   - Selección de orden para ver detalle

2. **Detalle de orden:**
   - Información del cliente
   - Lista de productos
   - Historial de estados
   - Notas internas
   - Cambio de estado
   - Agregar notas

3. **Cambio de estado:**

```typescript
const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    await apiFetch('admin-orders-update', {
      method: 'PUT',
      token,
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    onUpdateOrder();
  } catch (error) {
    // Fallback a desarrollo
    if (import.meta.env.DEV) {
      const { updateOrderStatusDev } = await import('../lib/ordersDev');
      await updateOrderStatusDev(orderId, newStatus);
    }
  }
};
```

4. **Agregar nota:**

```typescript
const handleAddNote = async () => {
  const result = await apiFetch('admin-orders-send-note', {
    method: 'POST',
    token,
    body: JSON.stringify({
      order_id: selectedOrder.id,
      note: newNote,
    }),
  });
  
  // Mostrar modal de confirmación WhatsApp
  if (result.whatsapp_url) {
    setPendingWhatsAppUrl(result.whatsapp_url);
    setShowWhatsAppModal(true);
  }
};
```

**Modal de WhatsApp (UX mejorado):**

```typescript
{showWhatsAppModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
      <h3>Enviar por WhatsApp</h3>
      <p>¿Deseas enviar esta nota al cliente?</p>
      <div className="flex gap-3">
        <button onClick={handleWhatsAppCancel}>Cancelar</button>
        <button onClick={handleWhatsAppConfirm}>Enviar</button>
      </div>
    </div>
  </div>
)}
```

---

## Helpers de Desarrollo

### `src/lib/ordersDev.ts`

Funciones helper para desarrollo cuando Netlify Functions no están disponibles:

#### `createOrderDev`

Crea orden directamente desde Supabase:
1. Intenta INSERT directo con `supabasePublic`
2. Si falla (error 42501 RLS), usa función RPC
3. Genera mensaje WhatsApp
4. Retorna número de orden y mensaje

#### `getOrdersDev`

Obtiene todas las órdenes usando `service_role` key:

```typescript
export async function getOrdersDev(): Promise<any[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []).map(mapOrderFromSupabase);
}
```

#### `getOrderDetailDev`

Obtiene detalle completo de una orden (con eventos y notas):

```typescript
export async function getOrderDetailDev(orderId: string): Promise<any> {
  const supabaseServer = getSupabaseServer();
  
  // Orden
  const { data: order } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  // Eventos
  const { data: events } = await supabaseServer
    .from('fuegoamigo_order_events')
    .select('*')
    .eq('order_id', orderId);
  
  // Notas
  const { data: notes } = await supabaseServer
    .from('fuegoamigo_order_notes')
    .select('*')
    .eq('order_id', orderId);
  
  return {
    ...mapOrderFromSupabase(order),
    events: events || [],
    notes: (notes || []).map(mapNoteFromSupabase),
  };
}
```

#### `updateOrderStatusDev`

Actualiza estado y crea evento:

```typescript
export async function updateOrderStatusDev(
  orderId: string, 
  status: string
): Promise<any> {
  const supabaseServer = getSupabaseServer();
  
  // Actualizar orden
  const { data: order } = await supabaseServer
    .from('fuegoamigo_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  
  // Crear evento
  await supabaseServer.from('fuegoamigo_order_events').insert({
    order_id: orderId,
    status,
    notes: '',
  });
  
  return mapOrderFromSupabase(order);
}
```

#### `addOrderNoteDev`

Agrega nota y genera URL de WhatsApp:

```typescript
export async function addOrderNoteDev(
  orderId: string, 
  note: string, 
  createdBy: string = 'admin'
): Promise<{ note: any; whatsapp_url: string | null }> {
  const supabaseServer = getSupabaseServer();
  
  // Obtener orden
  const { data: order } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('order_number, customer_phone')
    .eq('id', orderId)
    .single();
  
  // Agregar nota
  const { data: noteData } = await supabaseServer
    .from('fuegoamigo_order_notes')
    .insert({
      order_id: orderId,
      note,
      created_by: createdBy,
    })
    .select()
    .single();
  
  // Generar URL WhatsApp
  const whatsappMessage = `*Actualización Pedido #${order.order_number}*\n\n${note}`;
  const phone = order.customer_phone?.replace(/\D/g, '') || '';
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
    : null;
  
  return { note: noteData, whatsapp_url: whatsappUrl };
}
```

### `src/lib/dashboardDev.ts`

Helper para estadísticas del dashboard:

```typescript
export async function getDashboardStatsDev(): Promise<{
  products: { active: number };
  events: { active: number };
  orders: {
    total: number;
    thisMonth: number;
    byStatus: Record<string, number>;
  };
}> {
  // Usar service_role si está disponible
  const ordersClient = supabaseServer || supabasePublic;
  
  // Contar órdenes por estado
  const { data: ordersByStatus } = await ordersClient
    .from('fuegoamigo_orders')
    .select('status');
  
  // Procesar conteos
  const statusCounts = { /* ... */ };
  
  return {
    products: { active: productsCount || 0 },
    events: { active: eventsCount || 0 },
    orders: {
      total: totalOrders,
      thisMonth: ordersThisMonth || 0,
      byStatus: statusCounts,
    },
  };
}
```

---

## Gestión de Órdenes desde Admin

### Dashboard

**Archivo:** `src/pages/Admin.tsx` (función `DashboardSection`)

Muestra:
- Total de órdenes
- Órdenes del mes actual
- Órdenes por estado (pending, confirmed, preparing, ready, delivered, cancelled)

**Carga de datos:**

```typescript
const loadDashboardStats = async () => {
  try {
    const stats = await apiFetch('admin-dashboard', {
      method: 'GET',
      token: token!,
    });
    setDashboardStats(stats);
  } catch (netlifyError) {
    if (import.meta.env.DEV) {
      const stats = await getDashboardStatsDev();
      setDashboardStats(stats);
    }
  }
};
```

### Listado de Órdenes

**Filtros:**
- Todas
- Por estado (pending, confirmed, preparing, ready, delivered, cancelled)

**Vista:**
- Tarjetas con información resumida
- Número de orden
- Nombre del cliente
- Estado (badge con color)
- Total
- Fecha de creación

**Carga:**

```typescript
const loadOrders = async () => {
  try {
    const ordersData = await apiFetch<Order[]>('admin-orders-list', {
      method: 'GET',
      token: token!,
    });
    setOrders(ordersData || []);
  } catch (netlifyError) {
    if (import.meta.env.DEV) {
      const { getOrdersDev } = await import('../lib/ordersDev');
      const ordersData = await getOrdersDev();
      setOrders(ordersData || []);
    }
  }
};
```

### Detalle de Orden

**Información mostrada:**
1. **Cliente:**
   - Nombre
   - Teléfono
   - Email (si existe)

2. **Entrega:**
   - Tipo (entrega/retiro)
   - Zona (si es entrega)

3. **Pago:**
   - Método de pago

4. **Estado:**
   - Selector para cambiar estado
   - Historial de cambios (eventos)

5. **Productos:**
   - Lista de items con cantidad y precio
   - Subtotal por item
   - Total general

6. **Notas:**
   - Historial de notas internas
   - Formulario para agregar nueva nota
   - Botón para enviar nota por WhatsApp

7. **Acciones:**
   - Botón para abrir WhatsApp con mensaje original

### Cambio de Estado

**Flujo:**
1. Admin selecciona nuevo estado en el select
2. Se llama a `admin-orders-update` (o `updateOrderStatusDev` en dev)
3. Se crea automáticamente un evento en `fuegoamigo_order_events`
4. Se actualiza la UI

**Código:**

```typescript
<select
  value={selectedOrder.status}
  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
>
  <option value="pending">Pendiente</option>
  <option value="confirmed">Confirmado</option>
  <option value="preparing">Preparando</option>
  <option value="ready">Listo</option>
  <option value="delivered">Entregado</option>
  <option value="cancelled">Cancelado</option>
</select>
```

### Agregar Nota

**Flujo:**
1. Admin escribe nota en el input
2. Click en "Agregar"
3. Se llama a `admin-orders-send-note` (o `addOrderNoteDev` en dev)
4. Se inserta nota en `fuegoamigo_order_notes`
5. Se genera URL de WhatsApp
6. Se muestra modal de confirmación
7. Si confirma, se abre WhatsApp con mensaje prellenado

**Código:**

```typescript
<div className="flex gap-2">
  <input
    type="text"
    value={newNote}
    onChange={(e) => setNewNote(e.target.value)}
    placeholder="Nueva nota..."
  />
  <button onClick={handleAddNote}>Agregar</button>
</div>
```

---

## Implementación Técnica Detallada

### Mapeo de Datos

**Snake_case (Supabase) ↔ CamelCase (Frontend)**

```typescript
function mapOrderFromSupabase(order: any): any {
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    deliveryType: order.delivery_type,
    zone: order.zone,
    paymentMethod: order.payment_method,
    items: order.items || [],
    subtotal: parseFloat(order.subtotal || 0),
    total: parseFloat(order.total || 0),
    notes: order.notes,
    whatsappMessage: order.whatsapp_message,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}
```

### Generación de Mensaje WhatsApp

**Función:** `buildWhatsAppMessage`

```typescript
function buildWhatsAppMessage(body: any, total: number): string {
  const lines = [`Hola soy ${body.customer_name}, quiero hacer un pedido.`, ''];

  lines.push(`*Tipo de entrega:* ${body.delivery_type === 'entrega' ? 'Entrega' : 'Retiro'}`);
  lines.push('');

  if (body.delivery_type === 'entrega' && body.zone) {
    lines.push(`*Zona/Barrio:* ${body.zone}`);
    lines.push('');
  }

  lines.push('*Productos:*');
  body.items.forEach((item: any) => {
    const variant = item.variant ? ` (${item.variant})` : '';
    const subtotal = (item.price || 0) * (item.qty || 1);
    lines.push(`${item.qty}x ${item.name}${variant} - $${subtotal.toLocaleString('es-AR')}`);
  });

  lines.push('');
  lines.push(`*Total estimado: $${total.toLocaleString('es-AR')}*`);
  lines.push('');
  lines.push(`*Medio de pago:* ${body.payment_method}`);

  if (body.notes) {
    lines.push('');
    lines.push(`*Notas:* ${body.notes}`);
  }

  lines.push('');
  lines.push('Importante: Los pedidos serán mediante transferencia de seña a coordinar en el próximo paso.');
  lines.push('');
  lines.push('Gracias por tu pedido! 🔥');

  return lines.join('\n');
}
```

### Manejo de Errores

**Estrategia de fallback:**

```typescript
try {
  // Intentar con Netlify Function
  response = await apiFetch('orders-create', {...});
} catch (netlifyError) {
  // Si falla y estamos en desarrollo, usar Supabase directo
  if (import.meta.env.DEV) {
    console.warn('Netlify Functions no disponibles, usando Supabase directo');
    response = await createOrderDev(orderData);
  } else {
    throw netlifyError;
  }
}
```

### Variables de Entorno

**Frontend (.env):**
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=... (solo desarrollo)
```

**Backend (Netlify):**
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
NETLIFY_JWT_SECRET=...
ADMIN_EMAIL=admin@...
ADMIN_PASSWORD=...
```

### Autenticación Admin

**JWT Token:**
- Generado en `admin-login`
- Almacenado en `localStorage` como `fuegoamigo_admin_token`
- Enviado en header `Authorization: Bearer <token>`
- Verificado en cada Netlify Function admin

**Desarrollo:**
- Token dev: `btoa(JSON.stringify({ email, dev: true }))`
- Permite acceso sin Netlify Functions

---

## Resumen de Flujo Completo

### Creación de Orden

```
1. Usuario completa checkout
   ↓
2. Frontend valida datos
   ↓
3. Frontend llama a Netlify Function (o fallback dev)
   ↓
4. Backend valida y calcula totales
   ↓
5. Backend genera mensaje WhatsApp
   ↓
6. Backend inserta orden en Supabase (service_role o RPC)
   ↓
7. Backend crea evento inicial
   ↓
8. Backend retorna order_number y whatsapp_message
   ↓
9. Frontend abre WhatsApp con mensaje
   ↓
10. Frontend limpia carrito y redirige
```

### Gestión desde Admin

```
1. Admin inicia sesión
   ↓
2. Admin accede a sección Órdenes
   ↓
3. Frontend carga órdenes (Netlify Function o dev)
   ↓
4. Admin selecciona orden
   ↓
5. Frontend carga detalle completo
   ↓
6. Admin cambia estado o agrega nota
   ↓
7. Backend actualiza orden y crea evento/nota
   ↓
8. Frontend actualiza UI
```

---

## Consideraciones para Otros Proyectos

### 1. RLS Policies

- **Permitir INSERT** para usuarios anónimos en tablas de órdenes
- **Denegar SELECT** para usuarios anónimos (solo admin con service_role)
- Usar `SECURITY DEFINER` en funciones RPC para bypass RLS cuando sea necesario

### 2. Fallback de Desarrollo

- Implementar helpers de desarrollo que usen `service_role` key
- Detectar ambiente con `import.meta.env.DEV`
- Proporcionar fallback robusto cuando Netlify Functions no estén disponibles

### 3. Generación de Números de Orden

- Usar `SEQUENCE` de PostgreSQL para números únicos
- Iniciar en un número alto (ej: 1000) para evitar números pequeños
- Usar `DEFAULT nextval('sequence_name')` en la columna

### 4. Historial de Estados

- Crear tabla de eventos para rastrear cambios de estado
- Insertar evento automáticamente cuando cambia el estado
- Incluir notas opcionales en cada evento

### 5. Notas Internas

- Separar notas internas del admin de los eventos de estado
- Generar URLs de WhatsApp para comunicación con clientes
- Implementar modal de confirmación antes de enviar por WhatsApp

### 6. Mapeo de Datos

- Convertir entre snake_case (DB) y camelCase (frontend)
- Crear funciones helper para mapeo consistente
- Manejar valores nulos y defaults apropiadamente

### 7. Manejo de Errores

- Implementar estrategia de fallback para desarrollo
- Logging detallado para debugging
- Mensajes de error claros para el usuario

---

## Archivos Clave

### Frontend
- `src/pages/Checkout.tsx` - Formulario de checkout
- `src/pages/Admin.tsx` - Panel de administración
- `src/lib/ordersDev.ts` - Helpers de desarrollo
- `src/lib/dashboardDev.ts` - Estadísticas de desarrollo
- `src/lib/supabasePublic.ts` - Cliente Supabase público

### Backend
- `netlify/functions/orders-create.ts` - Crear orden
- `netlify/functions/admin-orders-list.ts` - Listar órdenes
- `netlify/functions/admin-orders-update.ts` - Actualizar orden
- `netlify/functions/admin-orders-send-note.ts` - Agregar nota
- `netlify/functions/admin-orders-get.ts` - Obtener detalle

### Base de Datos
- `supabase/migrations/001_init.sql` - Schema inicial
- `supabase/migrations/009_fix_orders_rls_remove_all_restrictive.sql` - Políticas RLS
- `supabase/migrations/010_create_insert_order_function.sql` - Función RPC

---

**Fin del documento**
