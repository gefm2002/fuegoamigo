# 📋 Variables de Entorno para Netlify - Copiar y Pegar

## 🚀 Configuración Rápida

### Opción 1: Formato .env (Recomendado - Copiar todo de una vez)

Abre el archivo **`netlify.env.example`** y copia todo su contenido. Luego:

1. Ve a **Netlify Dashboard** → Tu sitio → **Site settings** → **Environment variables**
2. Haz clic en **"Import from file"** o **"Add multiple"**
3. Pega todo el contenido del archivo `.env`
4. Completa los valores que faltan:
   - `NETLIFY_JWT_SECRET` (generar con comando abajo)
   - `ADMIN_PASSWORD` (tu password)
5. Guarda y haz un nuevo deploy

### Opción 2: Agregar una por una

Ve a **Netlify Dashboard** → Tu sitio → **Site settings** → **Environment variables** y agrega estas variables una por una:

### Variables para Frontend (Build Time) - ⚠️ OBLIGATORIAS

```
VITE_SUPABASE_URL
https://oseeysmiwfdhpizzeota.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTU3MTAsImV4cCI6MjA4NTczMTcxMH0.nN9kPdZf_eDdcSwAbUrYloKvJY3yJF-qaqDXNngIGJY
```

### Variables para Netlify Functions

```
SUPABASE_URL
https://oseeysmiwfdhpizzeota.supabase.co
```

```
SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTU3MTAsImV4cCI6MjA4NTczMTcxMH0.nN9kPdZf_eDdcSwAbUrYloKvJY3yJF-qaqDXNngIGJY
```

```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NTcxMCwiZXhwIjoyMDg1NzMxNzEwfQ.VQE-HnKjkI5iF0XzkthUrA69EWcpxhwXG8dfIA_Btno
```

```
NETLIFY_JWT_SECRET
[GENERAR CON: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

```
WHATSAPP_NUMBER
+5491141464526
```

```
ADMIN_EMAIL
admin@fuegoamigo.com
```

```
ADMIN_PASSWORD
[TU_PASSWORD_AQUI]
```

---

## 📝 Instrucciones Paso a Paso

1. **Abre Netlify Dashboard**: https://app.netlify.com
2. **Selecciona tu sitio**: fuegoamigo
3. **Ve a Settings**: Site settings → Environment variables
4. **Agrega cada variable**:
   - Clic en "Add a variable"
   - Pega el **nombre** de la variable (primera línea)
   - Pega el **valor** de la variable (segunda línea)
   - Clic en "Save"
   - Repite para cada variable

5. **Después de agregar todas**:
   - Ve a **Deploys**
   - Clic en "Trigger deploy" → "Clear cache and deploy site"
   - Espera a que termine el build

---

## ⚠️ Importante

- **NO compartas** `SUPABASE_SERVICE_ROLE_KEY` públicamente
- **NO compartas** `NETLIFY_JWT_SECRET` públicamente
- **NO compartas** `ADMIN_PASSWORD` públicamente
- Las variables `VITE_*` se incluyen en el bundle del frontend (son públicas)

---

## 🔍 Verificar que Funcionó

Después del deploy, abre la consola del navegador (F12) y verifica que **NO** aparezca:

```
❌ Missing Supabase environment variables
```

Si no aparece ese error, ¡está todo configurado correctamente! ✅
