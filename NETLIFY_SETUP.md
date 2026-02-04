# 🚀 Guía Rápida: Configuración de Variables en Netlify

Esta guía te ayudará a configurar todas las variables de entorno necesarias en Netlify para que el sitio funcione correctamente.

## ⚠️ Error Común

Si ves este error en la consola del navegador:
```
❌ Missing Supabase environment variables
VITE_SUPABASE_URL: ❌
VITE_SUPABASE_ANON_KEY: ❌
```

Significa que **faltan las variables de entorno con prefijo `VITE_`** en Netlify.

## 📋 Variables Requeridas

### Variables para Frontend (Build Time)

Estas variables son **CRÍTICAS** y deben estar configuradas para que el build funcione:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Anon key de Supabase (pública) |

### Variables para Netlify Functions

Estas variables son necesarias para que las funciones serverless funcionen:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Service role key (SECRETO) |
| `NETLIFY_JWT_SECRET` | `generar_abajo` | Secret para JWT tokens |
| `WHATSAPP_NUMBER` | `+5491141464526` | Número de WhatsApp |
| `ADMIN_EMAIL` | `admin@fuegoamigo.com` | Email del admin |
| `ADMIN_PASSWORD` | `password_seguro` | Password del admin |

## 🔧 Pasos para Configurar

### 1. Obtener Credenciales de Supabase

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto
3. Ir a **Settings** → **API**
4. Copiar:
   - **Project URL** → `SUPABASE_URL` y `VITE_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` y `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ mantener secreto)

### 2. Generar NETLIFY_JWT_SECRET

Ejecutar en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado (será algo como: `a1b2c3d4e5f6...`)

### 3. Configurar en Netlify

1. Ir a tu sitio en [Netlify Dashboard](https://app.netlify.com)
2. Ir a **Site settings** → **Environment variables**
3. Hacer clic en **Add a variable**
4. Agregar **TODAS** las variables de la tabla de arriba, una por una

**IMPORTANTE:**
- ✅ Asegúrate de agregar **AMBAS** versiones:
  - `VITE_SUPABASE_URL` (para frontend)
  - `SUPABASE_URL` (para functions)
- ✅ Asegúrate de agregar **AMBAS** versiones:
  - `VITE_SUPABASE_ANON_KEY` (para frontend)
  - `SUPABASE_ANON_KEY` (para functions)

### 4. Verificar Configuración

Después de agregar todas las variables:

1. Ir a **Deploys**
2. Hacer clic en **Trigger deploy** → **Clear cache and deploy site**
3. Esperar a que el build termine
4. Verificar que no hay errores en los logs
5. Abrir el sitio y verificar que no aparezcan errores en la consola

## ✅ Checklist

Antes de considerar que está todo configurado, verifica:

- [ ] `VITE_SUPABASE_URL` está configurada
- [ ] `VITE_SUPABASE_ANON_KEY` está configurada
- [ ] `SUPABASE_URL` está configurada
- [ ] `SUPABASE_ANON_KEY` está configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está configurada
- [ ] `NETLIFY_JWT_SECRET` está configurada
- [ ] `WHATSAPP_NUMBER` está configurada
- [ ] `ADMIN_EMAIL` está configurada
- [ ] `ADMIN_PASSWORD` está configurada
- [ ] Se hizo un nuevo deploy después de agregar las variables
- [ ] El sitio carga sin errores en la consola

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Causa:** Faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`

**Solución:**
1. Verificar que las variables estén en Netlify Dashboard
2. Verificar que tengan el prefijo `VITE_`
3. Hacer un nuevo deploy (las variables se aplican en el build)

### Error: "Unauthorized" en las funciones

**Causa:** Faltan variables para las functions o están mal configuradas

**Solución:**
1. Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
2. Verificar que el valor sea correcto (copiar desde Supabase Dashboard)
3. Hacer un nuevo deploy

### El sitio carga pero no muestra productos

**Causa:** Variables de frontend incorrectas o RLS bloqueando

**Solución:**
1. Verificar que `VITE_SUPABASE_ANON_KEY` sea la anon key (no service_role)
2. Verificar políticas RLS en Supabase
3. Verificar que las migraciones estén aplicadas

## 📝 Notas Importantes

1. **Las variables `VITE_*` son públicas** - Se incluyen en el bundle del frontend
2. **NUNCA uses `SUPABASE_SERVICE_ROLE_KEY` en variables `VITE_*`** - Es un secreto
3. **Siempre haz un nuevo deploy** después de agregar/modificar variables
4. **Las variables se aplican en el build** - No se pueden cambiar sin redeploy

## 🔗 Enlaces Útiles

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Dashboard](https://supabase.com/dashboard)
