# Guía rápida de setup - Fuego Amigo

## ⚠️ IMPORTANTE: Proyecto correcto en Supabase

Debes trabajar en el proyecto **"juancito-mercado-boutique"**.

## Pasos rápidos

### 1. Verificar proyecto en Supabase

1. Ir a https://supabase.com/dashboard
2. **Seleccionar proyecto "juancito-mercado-boutique"**
3. Verificar que el proyecto esté `ACTIVE_HEALTHY`

### 2. Obtener credenciales

Desde Settings > API del proyecto "juancito-mercado-boutique":
- `SUPABASE_URL` → Copiar Project URL
- `SUPABASE_ANON_KEY` → Copiar anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → Copiar service_role key (mantener secreto)

### 3. Crear archivo .env.local

```bash
cp .env.local.example .env.local
```

Editar `.env.local` y pegar las credenciales del proyecto "juancito-mercado-boutique".

### 4. Crear archivo .env (para Vite)

```bash
cp .env.example .env
```

Editar `.env` y pegar las credenciales del proyecto "juancito-mercado-boutique".

### 5. Aplicar migrations

1. En Supabase Dashboard, proyecto "juancito-mercado-boutique"
2. Ir a SQL Editor
3. Ejecutar `supabase/migrations/001_init.sql`
4. Verificar que no haya errores

### 6. Verificar bucket de storage

1. En Supabase Dashboard, proyecto "juancito-mercado-boutique"
2. Ir a Storage > Buckets
3. Verificar que existe el bucket `fuegoamigo_assets`
4. Si no existe, crearlo con:
   - Nombre: `fuegoamigo_assets`
   - **Privado** (no público)
   - File size limit: `1572864` (1.5MB)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### 7. Migrar datos

```bash
npm install
npm run migrate
```

### 8. Desarrollo local

```bash
npm run dev
```

La app estará en `http://localhost:40001`

## Verificación

- ✅ Proyecto "juancito-mercado-boutique" seleccionado en Supabase
- ✅ Bucket `fuegoamigo_assets` creado en "juancito-mercado-boutique"
- ✅ Migrations aplicadas sin errores
- ✅ Datos migrados correctamente
- ✅ `.env.local` y `.env` configurados con credenciales de "juancito-mercado-boutique"
