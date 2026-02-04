# Fuego Amigo - Webapp con Supabase

SPA desarrollada con Vite + React + TypeScript + TailwindCSS para Fuego Amigo Catering, migrada a Supabase con Netlify Functions.

## Arquitectura

- **Frontend**: React SPA con lectura pública desde Supabase (anon key)
- **Backend**: Netlify Functions con Supabase Service Role Key
- **Base de datos**: Supabase PostgreSQL con RLS habilitado
- **Storage**: Supabase Storage (bucket privado `fuegoamigo_assets`)
- **Autenticación**: JWT custom (sin Supabase Auth)

## Configuración inicial

### 1. Variables de entorno

Crear archivo `.env.local` basado en `.env.local.example`:

```bash
# Supabase
SUPABASE_URL=https://gopntmzxqonsqbsykbup.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Netlify Functions
NETLIFY_JWT_SECRET=generar_secret_aleatorio_aqui

# Admin inicial
ADMIN_EMAIL=admin@fuegoamigo.com
ADMIN_PASSWORD=password_seguro_aqui

# WhatsApp
WHATSAPP_NUMBER=+5491141464526
```

Para desarrollo local, también crear `.env` con las variables `VITE_*`:

```bash
VITE_SUPABASE_URL=https://gopntmzxqonsqbsykbup.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 2. Seleccionar proyecto correcto en Supabase

**IMPORTANTE**: Debes trabajar en el proyecto **"juancito-mercado-boutique"**.

1. Ir a https://supabase.com/dashboard
2. Seleccionar el proyecto **"juancito-mercado-boutique"** de la organización `gopntmzxqonsqbsykbup`
3. Verificar que el proyecto esté `ACTIVE_HEALTHY`
4. Copiar las credenciales desde Settings > API:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - mantener secreto)

### 3. Aplicar migrations

Ejecutar las migrations SQL desde el dashboard de Supabase o con Supabase CLI:

```bash
# Opción 1: Desde dashboard
# Ir a SQL Editor y ejecutar supabase/migrations/001_init.sql

# Opción 2: Con Supabase CLI
supabase db push
```

### 4. Crear storage bucket

**IMPORTANTE**: Asegúrate de estar en el proyecto **"juancito-mercado-boutique"**.

Desde el dashboard de Supabase:

1. Verificar que estás en el proyecto **"juancito-mercado-boutique"**
2. Ir a Storage > Buckets
3. Crear nuevo bucket: `fuegoamigo_assets`
4. Configurar como **privado** (no público)
5. Límite de tamaño: **1.5MB** (1572864 bytes)
6. Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`

El bucket ya debería estar creado en "juancito-mercado-boutique". Si no existe, créalo con estas configuraciones.

O ejecutar manualmente:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fuegoamigo_assets',
  'fuegoamigo_assets',
  false,
  1572864,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### 5. Migrar datos existentes

Ejecutar el script de migración:

```bash
npm run migrate
```

Este script:
- Migra productos desde `src/data/products.json`
- Migra eventos desde `src/data/events.json`
- Migra promociones desde `src/data/promos.json`
- Migra FAQs desde `src/data/faqs.json`
- Crea usuario admin inicial

### 6. Generar NETLIFY_JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado a `.env.local` como `NETLIFY_JWT_SECRET`.

## Desarrollo local

### Frontend

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:40001`

### Netlify Functions (local)

Para probar las funciones localmente, usar Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Esto iniciará:
- Frontend en `http://localhost:8888`
- Functions proxy en `/api/*`

## Estructura del proyecto

```
fuegoamigo/
├── netlify/
│   └── functions/
│       ├── _shared/          # Helpers compartidos
│       ├── public-*.ts        # Endpoints públicos (read-only)
│       ├── admin-*.ts         # Endpoints admin (requieren JWT)
│       └── orders-*.ts        # Endpoints de órdenes
├── supabase/
│   └── migrations/            # SQL migrations
├── src/
│   ├── lib/
│   │   ├── supabasePublic.ts  # Cliente Supabase público
│   │   └── api.ts             # Helper para llamadas API
│   ├── hooks/
│   │   └── useSupabaseData.ts # Hooks para datos desde Supabase
│   └── ...
└── scripts/
    └── migrate-from-json.ts   # Script de migración
```

## Endpoints disponibles

### Públicos (read-only)

- `GET /api/public-config` - Configuración del sitio
- `GET /api/public-content?key=hero` - Bloques de contenido CMS
- `GET /api/public-catalog?category=boxes-y-regalos&featured=true` - Catálogo de productos
- `GET /api/public-categories` - Categorías
- `GET /api/public-events?eventType=Social` - Eventos
- `GET /api/public-promos` - Promociones
- `GET /api/public-faqs` - FAQs
- `GET /api/public-signed-url?path=...` - URL firmada para imágenes

### Admin (requieren JWT)

- `POST /api/admin-login` - Login admin
- `GET /api/admin-me` - Info del admin actual
- `POST /api/admin-products-upsert` - Crear/actualizar producto
- `DELETE /api/admin-products-delete?id=...` - Eliminar producto
- `GET /api/admin-orders-list?status=pending` - Listar órdenes
- `GET /api/admin-orders-get?id=...` - Obtener orden
- `PUT /api/admin-orders-update` - Actualizar orden
- `POST /api/admin-orders-add-note` - Agregar nota a orden
- `POST /api/admin-assets-sign-upload` - Obtener URL firmada para upload

### Órdenes

- `POST /api/orders-create` - Crear nueva orden (público, pero protegido por validación)

## Sistema de órdenes

Cuando un cliente completa el checkout:

1. Se crea una orden en `fuegoamigo_orders` con `order_number` incremental
2. Se genera mensaje de WhatsApp con el formato especificado
3. Se guarda el mensaje en `whatsapp_message`
4. Se crea evento inicial en `fuegoamigo_order_events`
5. Se abre WhatsApp con el mensaje pre-formateado

## CMS de contenido

Los textos editables están en `fuegoamigo_content_blocks`:

- `hero` - Contenido del hero
- `about` - Sección sobre nosotros
- `services` - Descripción de servicios
- `contact` - Información de contacto
- `wa_template_order` - Template de mensaje WhatsApp para pedidos

Para usar en el frontend:

```typescript
const { data } = await fetch(apiUrl('public-content?key=hero'));
const content = await data.json();
```

## Imágenes

- Máximo 5 imágenes por producto/evento
- Máximo 1.5MB por archivo
- Conversión a WebP recomendada en el cliente
- Storage path: `fuegoamigo/{entityId}/{uuid}.webp`

## Build y deploy

### Build

```bash
npm run build
```

### Deploy en Netlify

1. Conectar repositorio a Netlify
2. Configurar variables de entorno en Netlify Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NETLIFY_JWT_SECRET`
   - `WHATSAPP_NUMBER`
3. Netlify detectará automáticamente `netlify.toml`
4. Deploy automático en cada push a `main`

## Problemas comunes

### Project activation delay

Supabase puede tardar varios minutos en activar el proyecto. Esperar hasta que el estado sea `ACTIVE_HEALTHY` antes de ejecutar migrations.

### Functions planas

Las funciones deben estar directamente en `netlify/functions/`, no en subdirectorios. Solo `_shared/` es permitido.

### Rutas en prod vs dev

- Dev: `/api/*` (proxy de Vite)
- Prod: `/.netlify/functions/*`

El helper `apiUrl()` maneja esto automáticamente.

### Storage privado vs public URL

Las imágenes en storage son privadas. Usar `public-signed-url` para obtener URLs temporales firmadas.

### Google Maps embed sin API key

Los embeds de Google Maps funcionan sin API key para mapas estáticos simples.

## Lecciones aprendidas

### Activación Supabase

- Los proyectos pueden tardar 2-5 minutos en activarse
- Usar polling para verificar estado antes de ejecutar migrations
- No intentar ejecutar migrations hasta que el proyecto esté `ACTIVE_HEALTHY`

### Migrations statement by statement

- Ejecutar migrations una por una si hay errores
- Verificar que cada statement se ejecute correctamente
- Usar `IF NOT EXISTS` para evitar errores en re-ejecución

### RPC fallback

- Si las queries directas fallan, considerar usar RPC functions en Supabase
- Útil para lógica compleja o validaciones

### Functions planas

- Netlify Functions deben estar en la raíz de `netlify/functions/`
- Solo `_shared/` puede ser subdirectorio
- Los nombres con guiones funcionan mejor que camelCase

## Scripts útiles

```bash
# Migrar datos
npm run migrate

# Desarrollo frontend
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Licencia

Proyecto desarrollado por Structura para Fuego Amigo.
