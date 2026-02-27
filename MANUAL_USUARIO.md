# Manual de Usuario — Fuego Amigo (Storefront + Admin)

Este manual está pensado para **cualquier persona** (sin perfil técnico) que necesite **operar el sitio** y el **panel Admin**.

---

## Acceso al sitio (Storefront)

### Entrar al sitio cuando hay “Acceso restringido”
1. Abrí la web.
2. En la pantalla “Acceso al sitio”, ingresá el **código de acceso**.
3. Tocá **Ingresar**.

> Si el código es incorrecto, verás el mensaje “Código incorrecto”.

---

## Navegación del Storefront (lo que ve el cliente)

En la barra superior vas a ver:
- **Inicio**
- **Servicios**
- **Eventos**
- **Tienda**
- **FAQs**
- **Contacto**

### Botón flotante de WhatsApp
En la esquina inferior (según dispositivo) hay un botón de WhatsApp para contactar rápidamente.

---

## Inicio (Home)

### Hero (imagen principal, títulos y botones)
En la parte superior (hero) se muestra:
- **Imagen de fondo**
- **Título**
- **Subtítulo**
- **Botón principal**: abre la **cotización** (modal “Pedir presupuesto”)
- **Botón secundario**: abre **WhatsApp** con un mensaje prearmado
- **Chips** (etiquetas) debajo del texto

> Todo esto se configura desde Admin → Configuración (ver sección de Admin).

### Pedir presupuesto (cotización)
Al tocar **“Pedir presupuesto”** se abre un formulario para consultas de catering/servicios.

Campos principales:
- Tipo de evento
- Fecha
- Cantidad de personas
- Zona
- Estilo de servicio
- Comentarios

Al enviar, el sitio arma un mensaje y abre WhatsApp para continuar la conversación.

---

## Servicios

### Ver servicios
Los servicios se muestran como tarjetas con:
- Imagen
- Título
- Descripción corta
- Botón para ver detalle

### Ver detalle del servicio
Al tocar “Ver detalles”, se abre un modal con el contenido completo (descripción larga si existe).

---

## Eventos (`/eventos`)

### Hero de Eventos (configurable)
Arriba de la página de eventos hay un hero con:
- **Imagen de fondo (configurable)**
- **Título (configurable)**
- **Subtítulo (configurable)**
- **Botón principal (configurable)**: hace scroll al listado de eventos
- **Botón secundario (configurable)**: abre WhatsApp con mensaje configurado

> Si un texto de botón se deja vacío en Admin, ese botón no se muestra.

### Filtros por tipo de evento
Debajo del hero hay chips/botones para filtrar:
- Todas
- Social
- Corporativo
- Boda
- Cumple
- Producción
- Feria
- Foodtruck

Tocá un filtro para ver solo los eventos de ese tipo.

### Ver galería de un evento
En cada tarjeta de evento tocá **“Ver galería”**:
- Se abre un modal con fotos (hasta 5), descripción, ubicación, rango de invitados, menú destacado.

---

## Tienda

### Ver productos
La tienda lista productos con:
- Foto
- Nombre
- Precio (o “A Cotizar”)
- Botón de acción

### Productos “A Cotizar” (sin precio)
Si un producto no tiene precio:
- Se muestra **“A Cotizar”** en rojo.
- El botón principal no suma al carrito; en su lugar abre **WhatsApp** para cotizar ese producto.

### Carrito
Al sumar productos al carrito:
- Podés ajustar cantidad.
- El total se calcula automáticamente.

---

## Producto (detalle)

En la página de un producto:
- Si tiene precio: podés elegir cantidad y sumar al carrito.
- Si está “A Cotizar”: se muestra el texto **A Cotizar** y el botón principal abre WhatsApp.

---

## Checkout / Pedido

Al confirmar un pedido (cuando aplica):
- Se completan datos del cliente (nombre, teléfono, zona, entrega/retiro, fecha, franja horaria, observaciones).
- Se arma un mensaje y se abre WhatsApp para enviar el pedido.

---

## Admin (Backoffice)

### Entrar al Admin
1. Ir a **Admin** (link en el footer o `/admin`).
2. Ingresar credenciales.

> Las credenciales son privadas. Si no las tenés, pedilas al administrador del sitio.

---

## Admin → Productos

### Crear / editar producto
Campos típicos:
- Nombre
- Slug (identificador en URL)
- Descripción
- Categoría
- Imagen
- Tags
- Stock
- Activo / destacado

### Precio opcional: “A cotizar (sin precio)”
En el formulario de producto:
- Podés marcar el check **“A cotizar (sin precio)”**.
- En ese caso, el producto se publica sin precio y el storefront lo muestra como **A Cotizar**.

### Subir imágenes de producto
Al subir una imagen:
- Se aceptan **JPG / PNG / WebP**.
- Tamaño máximo: **12MB**.
- Si el archivo es grande, el sistema puede **comprimirlo** automáticamente para optimizarlo.

---

## Admin → Categorías

Permite:
- Crear, editar, eliminar categorías.
- Definir orden y estado activo.

---

## Admin → Servicios (CRUD)

Permite administrar la sección Servicios del sitio:
- Crear / editar servicios
- Activar/desactivar
- Ordenar (campo “order”)
- Cargar imagen (opcional)
- Definir descripción corta y larga

> Lo que está “Activo” y con mejor orden aparece primero en el storefront.

---

## Admin → Eventos (CRUD)

Permite:
- Crear / editar eventos
- Activar/desactivar
- Cargar hasta 5 imágenes
- Definir tipo de evento, ubicación, rango de invitados, descripción y menú destacado

En el storefront:
- Solo se muestran eventos activos.

---

## Admin → FAQs

Permite:
- Crear/editar preguntas frecuentes
- Orden y estado activo

---

## Admin → Órdenes

Permite:
- Ver listado de órdenes
- Abrir detalle
- Cambiar estado (según implementación del panel)
- Agregar notas internas
- Abrir WhatsApp con el mensaje de la orden (si está disponible)

---

## Admin → Configuración (lo más importante para el contenido visible)

### Datos generales
Podés editar:
- Nombre de marca
- WhatsApp
- Email
- Dirección
- Zona

### Hero (Home) — imagen
En “Hero (Home)” podés:
- Pegar una URL o path del bucket, o
- Subir una imagen desde tu compu

**Importante**: al subir imagen, queda guardada automáticamente.

### Hero (Home) — textos y botones
Podés editar:
- Título
- Subtítulo
- Texto botón principal (abre cotización)
- Texto botón secundario (WhatsApp)
- Mensaje de WhatsApp del botón secundario
- Chips (separados por coma)

Para aplicar cambios de texto:
1. Editá los campos.
2. Tocá **Guardar Configuración**.

### Hero (Eventos) — imagen
En “Hero (Eventos)” podés subir imagen (igual que Home).

**Importante**: al subir imagen, queda guardada automáticamente.

### Hero (Eventos) — textos y botones
Podés editar:
- Título
- Subtítulo
- Texto botón principal (hace scroll al listado)
- Texto botón secundario (WhatsApp)
- Mensaje de WhatsApp del botón secundario

Para aplicar cambios:
1. Editá los campos.
2. Tocá **Guardar Configuración**.

> Si dejás vacío un label de botón, el botón no se muestra en el hero.

---

## Guía rápida de “qué tocar” según lo que quieras cambiar

- **Cambiar hero Home (imagen)**: Admin → Configuración → Hero (Home) → subir imagen.
- **Cambiar hero Home (textos/botones/chips)**: Admin → Configuración → Hero (Home) – textos y botones → Guardar Configuración.
- **Cambiar hero Eventos (imagen)**: Admin → Configuración → Hero (Eventos) → subir imagen.
- **Cambiar hero Eventos (textos/botones)**: Admin → Configuración → Hero (Eventos) – textos y botones → Guardar Configuración.
- **Publicar un producto sin precio (“A Cotizar”)**: Admin → Productos → marcar “A cotizar (sin precio)”.
- **Editar servicios del sitio**: Admin → Servicios.
- **Editar eventos / galería**: Admin → Eventos.
- **Editar FAQs**: Admin → FAQs.

---

## Solución de problemas (rápido)

### “Subí una imagen pero no se ve en el sitio”
Checklist:
1. Esperá el deploy (si el sitio está en hosting con build/deploy).
2. Actualizá la página con recarga dura (Ctrl+F5 / Cmd+Shift+R).
3. Verificá que la imagen esté cargada en Admin (previsualización).
4. Si cambiaste textos: confirmá que tocaste **Guardar Configuración**.

### “No puedo subir imágenes”
Revisá:
- Formato permitido: JPG/PNG/WebP
- Tamaño máximo: 12MB
- Probá con otra imagen o una más liviana

### “Un producto no se puede comprar”
Si aparece **A Cotizar**:
- Es correcto: ese producto se cotiza por WhatsApp y no entra al carrito.

