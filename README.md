# Fuego Amigo - Webapp

SPA desarrollada con Vite + React + TypeScript + TailwindCSS para Fuego Amigo Catering.

## 🚀 Cómo correr

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Build para producción

```bash
npm run build
```

Los archivos estáticos se generan en la carpeta `dist/`.

## 🌐 Deploy en Netlify

1. Conectá tu repositorio a Netlify
2. Configurá el build command: `npm run build`
3. Configurá el publish directory: `dist`
4. Netlify automáticamente usará el `netlify.toml` para las redirecciones SPA

O podés hacer deploy manual:
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📝 Editar contenido

Todo el contenido está en archivos JSON en `src/data/`:

- **products.json**: Productos de la tienda
- **events.json**: Eventos realizados
- **promos.json**: Promociones bancarias
- **faqs.json**: Preguntas frecuentes

Para agregar o modificar productos, eventos, etc., editá estos archivos directamente.

## 🛒 Carrito a WhatsApp

El carrito funciona completamente en el frontend:

1. Los productos se agregan al carrito (persistido en localStorage)
2. En checkout, el usuario completa sus datos
3. Al enviar, se genera un mensaje de WhatsApp con todo el pedido
4. Se abre WhatsApp Web/App con el mensaje listo para enviar

## 🎨 Estilos

Los tokens de color están en `src/styles/tokens.css` y se usan con TailwindCSS.

## 📱 Responsive

La aplicación es mobile-first y está optimizada para todos los dispositivos.

## 🔧 Stack

- Vite 7
- React 19
- TypeScript
- TailwindCSS 4
- React Router DOM

## 📄 Licencia

Proyecto desarrollado por Structura para Fuego Amigo.
