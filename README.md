# Aicademy · Landing page

Landing page del curso **Aicademy**: aprende a crear videos virales con IA, en español.
Se publica en **aicademy.lat**; el curso sigue aparte en **app.aicademy.lat**.

Es un sitio estático: HTML, CSS y JavaScript sin frameworks, sin paso de build y sin dependencias.
Los colores de la marca están como variables al inicio de `styles.css` (`:root`).
Este repositorio **no contiene claves ni contraseñas**.

## Estructura

```
index.html        Contenido de la landing y bloque de ajustes (window.ANW)
styles.css        Diseño: colores, tipografía, layout y animaciones
main.js           Comportamiento: animación del hero, video, contador, precios y botones de Whop
privacidad.html   Política de privacidad
terminos.html     Términos y condiciones (incluye "ventas finales, sin reembolsos")
reembolsos.html   Solo redirige a terminos.html (enlace antiguo)
assets/           Logo, favicon, imagen para compartir, video del hero, personajes e imágenes del método
```

## Verla en local

Cualquier servidor estático sirve. Con Node instalado, desde la carpeta del repo:

```
npx serve .
```

y abre la dirección que muestra (por ejemplo http://localhost:3000).
También funciona abriendo `index.html` directo en el navegador.

## Configuración (precios, Whop, contador)

Todo está en el bloque `window.ANW` al inicio de `index.html`:

| Campo | Qué hace |
|---|---|
| `whopPlanOferta` | Plan de Whop que cobran todos los botones "Empieza ahora" (hoy `plan_IjlD4sFk3o0Gs`, US$27). |
| `checkoutEmbed` | `false`: el botón lleva a `whop.com/checkout/<plan>`. `true`: el pago se abre dentro de la página. |
| `priceOffer` / `priceRegular` | Precios que se muestran: `priceRegular` aparece tachado junto a `priceOffer`. |
| `offerHours` | Contador de la barra superior: horas por visitante desde su primera visita. Al terminar solo se oculta el contador. `0` lo desactiva. |
| `offerEnd` | Opcional: fecha fija de cierre igual para todos (reemplaza `offerHours`). |

Si se cambia el plan o el precio en Whop, hay que actualizar estos valores para que la página y el checkout coincidan.

## Publicar en Vercel

1. En vercel.com: **Add New → Project → importar este repositorio**.
2. Framework Preset: **Other**. Build Command y Output Directory: **vacíos**.
3. Deploy. Cada push a `main` vuelve a publicar.

### Dominio aicademy.lat

En el proyecto de Vercel: **Settings → Domains** → agregar `aicademy.lat` y `www.aicademy.lat`.
Luego, donde se compró el dominio, crear los registros DNS que indique Vercel (normalmente `A @ → 76.76.21.21` y `CNAME www → cname.vercel-dns.com`).
**No tocar el registro `app`**, para que app.aicademy.lat siga apuntando al curso.

## Pendiente del equipo

- **Acceso después del pago:** en Whop, redirigir al comprador a app.aicademy.lat después del checkout y conectar el webhook de pagos con el curso para crear o desbloquear la cuenta. Probar una compra real de punta a punta y reembolsarla.
- **Instagram nuevo del curso:** reemplazar los enlaces a `@aint_no_way_23` (botón "Síguenos en Instagram", footer, Soporte y páginas legales).
- **Vendedor legal** en `privacidad.html` y `terminos.html` (hoy dice Ain't No Way).
- **Analítica** (opcional): ID de Google Analytics 4 y/o Meta Pixel.
- **Más videos para el hero:** copiar el bloque `.reel-card` en `index.html` con su video y poster; con 2 o más vuelve el carrusel.

## Notas

- Ain't No Way aparece solo como **caso de estudio** (prueba social), no como dueño del curso.
- El video del hero (`assets/reel-bate.mp4`) está comprimido para web (720×1280, ~11 MB). El original pesa ~81 MB y no está en el repo.
