# Handoff: El Fabulario — sitio público

## Overview
"El Fabulario" es una antología digital de fábulas clásicas en español (de Esopo a fabulistas contemporáneos), con ilustración original por fábula y narración en audio publicada como pódcast en Spotify. **La acción principal del sitio es LEER**; escuchar es complementario y siempre ocurre dentro del embed de Spotify.

Este paquete cubre cinco vistas del sitio público: portada, listado de fábulas, fábula individual, listado de autores y ficha de autor.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML**: prototipos que muestran el aspecto y el comportamiento previstos, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno del codebase de destino** (React, Vue, Astro, Rails, etc.) usando sus patrones y librerías establecidos. Si todavía no hay entorno, elige el framework más apropiado para el proyecto e impleméntalos allí.

`El Fabulario - Sitio.dc.html` es un componente de diseño con estilos en línea; `support.js` es solo el runtime que lo hace visible en el navegador. **Nada de `support.js` debe llegar a producción.** Del mismo modo, la barra negra superior con las pestañas *Portada / Fábulas / Fábula / Autores / Autor* es andamiaje de la maqueta para navegar entre vistas: en el sitio real cada vista es una URL distinta.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografías, escalas y espaciados son definitivos y deben reproducirse con precisión. Todo el layout es responsive por `clamp()` y `flex-wrap`/`grid auto-fill`; no hay breakpoints con media queries.

## Design Tokens

### Color
| Token | Hex | Uso |
|---|---|---|
| Marfil | `#F0E5CE` | Fondo primario de todo el sitio |
| Negro | `#1A1714` | Texto principal; fondo invertido (bloque pódcast, cabecera de autor) |
| Oro decorativo | `#C9A14A` | Filetes, bordes, numerales romanos, texto ≥24px sobre negro |
| Oro legible | `#7A5F1F` | Eyebrows y metadatos en mayúsculas sobre marfil |
| Esmeralda | `#0A5F3E` | Autoría; color de `a:hover` |
| Coral | `#D45B3C` | Solo CTAs (fondo de botón). **Nunca en texto pequeño** |
| Zafiro | `#1C3A7A` | Enlaces primarios y citas |
| Texto auxiliar | `#4A413A` | Resúmenes, glosas, texto secundario sobre marfil |
| Hover de ficha | `#EBDDBF` | Fondo de tarjeta de autor en hover |

Reglas de contraste (WCAG AA, obligatorias): sobre marfil el cuerpo va en negro; el oro decorativo `#C9A14A` **solo** como línea/ornamento o texto ≥24px; el coral **solo** como fondo de CTA o texto ≥24px. Para metadatos pequeños en mayúsculas usar `#7A5F1F`.

**No hay modo noche.** El sitio es siempre de día.

### Tipografía (Google Fonts)
```
Cinzel: 400,500,600,700          — display: titulares, eyebrows, nav, metadatos, numerales
Cormorant Garamond: 300–600 + itálicas reales — cuerpo, resúmenes, glosas, citas
```
Cinzel va **siempre en mayúsculas** (`text-transform:uppercase`) con `letter-spacing` de `0.09em` a `0.30em` según el tamaño: cuanto más pequeño, más abierto.

| Rol | Familia | Tamaño | Peso | Tracking |
|---|---|---|---|---|
| H1 hero portada | Cinzel | `clamp(40px,4.6vw,64px)` | 600 | `0.05em` |
| H1 de página | Cinzel | `clamp(38px,4.6vw,64px)` | 600 | `0.12em` |
| H2 de sección | Cinzel | `clamp(28px,3.4vw,42px)` | 600 | `0.14em` |
| Título de fila/ficha | Cinzel | `clamp(22px,2.4vw,32px)` / 19px | 500 | `0.09–0.10em` |
| Eyebrow | Cinzel | 11–12px | 400 | `0.26–0.30em` |
| Metadatos | Cinzel | 11px | 400 | `0.16–0.18em` |
| Nav | Cinzel | 12px | 400 | `0.20em` |
| Wordmark | Cinzel | `clamp(15px,1.5vw,19px)` | 600 | `0.30em` |
| Cuerpo largo | Cormorant Garamond | 20px / `line-height:1.75` | 400 | — |
| Cuerpo base | Cormorant Garamond | 18px / `1.55` | 400 | — |
| Resumen / glosa | Cormorant Garamond *itálica* | 18–21px / `1.5` | 400 | — |
| Cita | Cormorant Garamond *itálica* | `clamp(24px,2.6vw,32px)` / `1.4` | 400 | — |
| Capitular | Cinzel | 76px, `line-height:.82`, `float:left`, `margin:6px 14px 0 0`, color `#7A5F1F` | 400 | — |

### Geometría y espaciado
- **Radio de esquina: 0 en todo el sitio.** Única excepción: el embed de Spotify (12px), que es chrome de terceros.
- **Sin sombras difusas.** La jerarquía se construye con filetes dorados de 0.5–1.5px.
- Filete simple: `1px solid #C9A14A`. Filete atenuado (separadores internos de lista): `1px solid rgba(201,161,74,0.55)`.
- Filete doble (bajo el hero): `<div style="height:5px;border-top:1.5px solid #C9A14A;border-bottom:0.5px solid #C9A14A;background:#F0E5CE">`.
- Doble encuadre de cartela: `border:1px solid #C9A14A` + `outline:1px solid rgba(201,161,74,0.35); outline-offset:7–9px`.
- Ancho de contenido: `max-width:1240px; margin:0 auto`.
- Gutter horizontal: `clamp(20px,5vw,48px)`.
- Ritmo vertical de sección: `clamp(40px,5vw,72px)` arriba, `clamp(56px,7vw,100px)` abajo.
- Gaps de lista/rejilla: `clamp(20px,3vw,40px)` … `clamp(24px,3.5vw,56px)`.

### Enlaces
`a { color:#1C3A7A; text-decoration:none }` · `a:hover { color:#0A5F3E; text-decoration:underline; text-underline-offset:0.25em }`. Definir ambos estados desde el principio.

---

## Screens / Views

### 0 · Cabecera y pie (compartidos por todas las vistas)

**Cabecera.** Fondo marfil, `border-bottom:1px solid #C9A14A`, padding `clamp(18px,2.4vw,28px)` × gutter, contenido en flex `space-between` con `flex-wrap` y `gap:16px 28px`.
- Izquierda: logo rombo (`Logo_Fabulario_ROMBO_Final_TRANSPARENTE.png`, 44×44, `object-fit:contain`) + wordmark "EL FABULARIO"; ambos dentro de un mismo `<a>` con `gap:16px`.
- Derecha: `Fábulas · Autores · Bitácora · Buscar` en Cinzel 12px `0.20em`, color zafiro, separados por puntos medios en oro `#C9A14A`.
- **La cabecera nunca se superpone a una ilustración.** Fue una decisión explícita: el menú no debe usar la ilustración como fondo.

**Pie.** `border-top:1px solid #C9A14A`, logo 34px al 85% de opacidad + "EL FABULARIO" en oro legible, y a la derecha "Antología digital de fábulas clásicas en español · MMXXVI" en cursiva `#4A413A`.

**Nav pendiente de diseñar:** el estado activo de la sección actual en la nav (hoy todos los enlaces se ven igual). Sugerencia coherente con el sistema: subrayado en filete dorado bajo el enlace activo.

---

### 1 · Portada

Orden: cabecera → hero → filete doble → banda de título → bloque Spotify → Últimas fábulas → Explorar → pie.

**Hero.** Ilustración a sangre en franja `aspect-ratio:8/3`, `min-height:520px`, `overflow:hidden`, imagen en `object-fit:cover`. Fondo de respaldo mientras carga: `radial-gradient(60% 80% at 28% 38%, #E8D3A0 0%, transparent 60%), linear-gradient(135deg,#F0E5CE 0%,#C9A14A 65%,#7A5F1F 100%)`.

**Punto focal (implementar en el CMS).** La ilustración original es 3:2 y el hero la recorta a 8:3, así que cada fábula necesita un campo `foco` (0–100, % desde arriba) que se traduce a `object-position: 50% <foco>%`. Sin ese campo los recortes decapitan a los personajes. Valor por defecto usado en la maqueta: `0`.

**Banda de título** (bajo el filete doble, fondo marfil, padding `clamp(30px,4vw,52px)` × gutter): flex con `align-items:flex-end`, `justify-content:space-between`, `gap:clamp(20px,4vw,56px)`.
- Columna izquierda `flex:1 1 520px; max-width:820px`: eyebrow "FÁBULA DEL MES" (Cinzel 12px `0.30em` `#7A5F1F`), H1, byline en cursiva 21px esmeralda "por Jean de La Fontaine · versión de Samaniego".
- Columna derecha `flex:1 1 280px; max-width:400px`: lede 18px `#4A413A` con `border-left:1px solid #C9A14A` y `padding-left:clamp(18px,2vw,28px)`.

> Se evaluaron tres tratamientos del título sobre la ilustración (velo degradado, cartela marfil semiopaca, banda inferior). **Se eligió la banda inferior**: mantiene la ilustración intacta y garantiza AA sin apagar la imagen. Las otras dos quedan documentadas en `El Fabulario - Comparativa hero.dc.html` del proyecto, fuera de este paquete.

**Bloque Spotify.** Fondo negro `#1A1714`, `border:1px solid #C9A14A`, padding `clamp(26px,3.2vw,44px)` × `clamp(24px,3.2vw,48px)`, flex `space-between`. Eyebrow "PÓDCAST · SPOTIFY" en oro; frase en Cormorant `clamp(21px,2.2vw,28px)` marfil; CTA coral a la derecha: fondo `#D45B3C`, texto marfil, Cinzel 15px `0.20em`, padding `18px 34px`, sin radio. Hover: fondo negro, texto coral, borde coral.

**Últimas fábulas.** Cuatro filas ilustradas (no rejilla), separadas por filete atenuado, imagen `flex:1 1 340px` con `aspect-ratio:4/3` **alternando lado** (`flex-direction: row` / `row-reverse`). Texto: eyebrow con autor en esmeralda, título Cinzel, resumen en cursiva, filete corto de 120px y metadatos "Tradición · Forma · N min".

**Explorar.** `grid-template-columns:repeat(auto-fit,minmax(220px,1fr))`, `gap:clamp(24px,3vw,44px)`, `border-top:1px solid #C9A14A`. Cuatro columnas: numeral romano I–IV en Cinzel 38px oro `#C9A14A`, título 17px `0.18em`, glosa en cursiva 18px.

---

### 2 · Listado de fábulas

Eyebrow "CATÁLOGO" → H1 "FÁBULAS" → párrafo introductorio en cursiva 21px (`max-width:640px`).

**Barra de filtros.** `border-top:1px solid #C9A14A`, `border-bottom:1px solid rgba(201,161,74,0.55)`, padding `24px 0`, flex `align-items:flex-end`. **Solo dos criterios: Tema y Autor** (no hay otros). Cada uno en su fila, con etiqueta Cinzel 11px `0.22em` `#7A5F1F` de `min-width:64px` y sus pastillas.
- Pastilla activa: fondo `#1A1714`, texto marfil.
- Pastilla inactiva: `border:1px solid rgba(201,161,74,0.7)`, texto zafiro, fondo transparente.
- Ambas: Cinzel 11px `0.16em`, padding `8px 15px`, radio 0.
- Los temas llevan recuento ("Avaricia · 24"); los autores no.
- A la derecha de la barra, el criterio de orden en cursiva: "Ordenadas por publicación".

**Filas.** Cada fila es un `<a>` completo (`display:flex`, `gap:clamp(20px,3vw,40px)`, `align-items:center`, `padding:clamp(22px,2.6vw,34px) 0`, `border-bottom:1px solid rgba(201,161,74,0.55)`). Hover: `background:rgba(201,161,74,0.10)`, sin subrayado.
1. Miniatura `width:clamp(150px,19vw,240px)`, **`aspect-ratio:3/2`** — la proporción nativa de las ilustraciones, no recortar a 4:3.
2. Bloque de texto `flex:1 1 300px; min-width:240px`: eyebrow con autor (esmeralda), título Cinzel `clamp(22px,2.2vw,29px)`, resumen en cursiva 19px.
3. Columna de metadatos `min-width:150px`, Cinzel 11px `0.16em` `#7A5F1F`, `line-height:2`: tradición / forma / **"Lectura · N min"** (nunca "Audio": la referencia del sitio es leer).

**Paginación.** Numerales romanos en Cinzel 13px `0.18em`; el activo en negro con `border-bottom:1px solid #C9A14A` y `padding-bottom:4px`, el resto en zafiro; elipsis en `#4A413A`; a la derecha "SIGUIENTE PÁGINA →".

---

### 3 · Fábula individual

1. **Ilustración a sangre** 8:3, `min-height:420px`, mismo mecanismo de `foco`. Sin texto encima.
2. **Filete doble.**
3. **Encabezado.** Migas ("Fábulas · La Fontaine · <título>", Cinzel 11px `0.20em`, la actual en `#4A413A`), H1, byline en cursiva 22px esmeralda, y una línea de metadatos con separadores `·` en oro: origen · forma · "Lectura 4 min" · crédito de ilustración.
4. **Embed de Spotify.** Eyebrow "NARRACIÓN · SPOTIFY" en oro legible y debajo **el embed estándar de Spotify**: `max-width:640px`, alto fijo `152px`, `border-radius:12px`, tipografía sans del sistema, cromática propia de Spotify. En producción es un `<iframe src="https://open.spotify.com/embed/episode/<id>" height="152" frameborder="0" allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">`. **No maquetar un reproductor propio**: el de la maqueta es solo un facsímil visual para mostrar el hueco y sus dimensiones.
5. **Cuerpo a dos columnas** (`flex-wrap`, `gap:clamp(32px,5vw,72px)`):
   - **Artículo** `flex:1 1 520px; max-width:720px`: párrafos de 20px/1.75 con capitular en el primero; cita destacada con `border-top`/`border-bottom` dorados, cursiva `clamp(24px,2.6vw,32px)` en zafiro, `padding:26px clamp(22px,3vw,36px)`, `margin:34px 0`; caja de **moraleja** con `border:1px solid #C9A14A` y padding `clamp(24px,3vw,36px)`, eyebrow "MORALEJA" + frase en cursiva `clamp(22px,2.3vw,28px)`; al final, chips de temas con el mismo estilo que las pastillas inactivas del listado.
   - **Aside** `flex:1 1 280px; max-width:340px`, `position:sticky; top:120px` (en producción, `top` = alto de la cabecera + holgura): ficha del autor (miniatura 3:2 de 84px con filete, nombre, fechas, glosa, enlace "VER SUS N FÁBULAS →") y bloque "SEGUIR LEYENDO" con tres fábulas (título Cinzel 14px + "Autor · Forma" en cursiva).

---

### 4 · Listado de autores

Diseñado para **menos de 20–30 autores**: se muestran todos, sin paginación ni filtros. Hoy son 10.

Eyebrow "ÍNDICE" → H1 "AUTORES" → párrafo introductorio (**el número que cita debe coincidir con el número real de fichas**).

**Rejilla.** `grid-template-columns:repeat(auto-fill,minmax(300px,1fr))`, `gap:clamp(22px,2.6vw,34px)`. Se usa gap real (no el truco de fondo dorado con `gap:1px`) para que una fila incompleta no deje celdas rellenas a la vista.

**Ficha** (`<a>` en `flex-direction:column`, `border:1px solid #C9A14A`, fondo marfil; hover `#EBDDBF`):
- Retrato `aspect-ratio:3/2`, `object-fit:cover`, fondo `#1A1714`, `border-bottom:1px solid #C9A14A`.
- Cuerpo con padding `clamp(20px,2.4vw,28px)`: nombre en Cinzel 19px `0.10em`, línea "fechas · N fábulas" en Cinzel 11px `0.16em` oro legible, glosa en cursiva 18px `#4A413A`.

**Cierre.** `border-top:1px solid #C9A14A` y una fila con una frase en cursiva ("¿Falta un fabulista? …") y el CTA coral "PROPONER UN AUTOR".

---

### 5 · Ficha de autor

1. **Cabecera invertida.** Fondo `#1A1714`, padding `clamp(40px,5vw,76px)` × gutter, flex `align-items:center`, `gap:clamp(28px,4vw,64px)`.
   - Retrato `flex:1 1 340px; max-width:520px`, `aspect-ratio:3/2`, con doble encuadre (`border` + `outline` con `outline-offset:8px` y `margin:8px` para que el outline no se corte).
   - Bloque de texto `flex:1 1 380px`: eyebrow "FABULISTA · <PAÍS>" en oro, H1 marfil `clamp(34px,4.2vw,58px)`, línea de vida en cursiva 23px ("Château-Thierry, 1621 — París, 1695") y una fila de datos en Cinzel 11px oro.
2. **Semblanza + ficha lateral.** Artículo `flex:1 1 520px; max-width:720px` con eyebrow "SEMBLANZA", párrafos de 20px/1.75 (con `<em>` para títulos de obra) y una cita del autor con el mismo tratamiento que en la fábula. Aside `flex:1 1 260px; max-width:330px`, caja con filete: eyebrow "FICHA" y cuatro pares etiqueta/valor separados por filete atenuado (el último sin borde), más el CTA coral **"LEER SUS FÁBULAS"** a ancho completo.
3. **"Sus fábulas".** H2 + enlace "VER LAS N →". Rejilla `repeat(auto-fill,minmax(280px,1fr))` con `gap:0 clamp(28px,4vw,56px)` y `border-top:1px solid #C9A14A`; cada entrada es una fila con numeral romano en oro (`min-width:34px`), título Cinzel 16px `0.09em` y "Libro · N min" en cursiva. Hover: todo el texto a zafiro.

---

## Interactions & Behavior
- **Navegación:** cada vista es una URL propia. Rutas sugeridas: `/`, `/fabulas`, `/fabulas/<slug>`, `/autores`, `/autores/<slug>`. El conmutador de la maqueta no se implementa.
- **Hover:** filas del listado → velo dorado al 10%; fichas de autor → `#EBDDBF`; CTAs coral → inversión a fondo negro con texto y borde coral; enlaces de texto → esmeralda subrayado con `text-underline-offset:0.25em`. Transiciones cortas o ninguna: el tono es editorial, no animado.
- **Sticky:** solo el aside de la fábula individual.
- **Responsive** (sin media queries, por `flex-wrap` + `clamp`): el hero mantiene 8:3 hasta su `min-height`; las filas del listado pasan a una columna cuando el texto baja de 300px; la rejilla de autores va de 3 → 2 → 1 columna; "Explorar" de 4 → 2 → 1.
- **Foco de teclado:** pendiente. Definir un anillo de foco visible que respete el sistema (sugerencia: `outline:2px solid #1C3A7A; outline-offset:3px`), ya que no se usan radios ni sombras.

## State Management
Vistas estáticas, renderizables en servidor. Lo único con estado en producción:
- Filtros del listado (tema, autor) y página actual → estado en la URL (`?tema=avaricia&autor=esopo&pagina=2`), no en cliente.
- El embed de Spotify gestiona su propia reproducción; no compartir estado con la página.
- Campo `foco` por ilustración, editable desde el CMS y usado en hero de portada y de fábula.

## Assets
Todos en `uploads/` dentro de este paquete.

**Marca**
- `Logo_Fabulario_ROMBO_Final_TRANSPARENTE.png` — rombo con "F" radiada, PNG transparente. Se usa a 44px (cabecera) y 34px (pie).

**Ilustraciones de fábulas** (3:2, cálidas, provistas por el cliente)
- `El amor y la locura.png` — hero de portada y de la fábula individual.
- `ChatGPT Image 31 jul 2026, 23_56_56.png` — El viejo y los higos.
- `ChatGPT Image 31 jul 2026, 11_28_02.png` — El bufón y el aldeano.
- `ChatGPT Image 31 jul 2026, 11_25_12.png` — El hombre y la comadreja.
- `batalla-de-las-comadrejas-y-los-ratones.png` — Las comadrejas y los ratones.

**Retratos de autores** (3:2, mismo estilo Art-Déco con orla dorada; el nombre del archivo es el del autor)
`Esopo.png`, `Leonardo Da Vinci.png`, `Jean de La Fontaine.png`, `Tomás de Iriarte.png`, `Félix María de Samaniego.png`, `Eugenio Hartzenbusch.png`, `Miguel Agustín Príncipe.png`, `Aquiles Nazoa.png`, `Alejandro Morales Loaiza.png`, `Anónimo.png`.

Los nombres llevan acentos y espacios: **codificar en URL** al referenciarlos (`uploads/Tom%C3%A1s%20de%20Iriarte.png`) o renombrar a slugs al importarlos al codebase.

**Tipografías:** Cinzel y Cormorant Garamond desde Google Fonts, con `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com`. Conviene autoalojarlas para evitar el FOUT en un sitio tan dependiente de la voz tipográfica.

## Content
Los textos de la maqueta son **contenido de muestra verosímil**, no definitivo — salvo los nombres de los autores, que son reales y los provistos por el cliente. Antes de publicar hay que revisar recuentos ("212 fábulas", "38 fábulas"), fechas y glosas. Dato pendiente confirmado como hueco: **las fechas de Alejandro Morales Loaiza** (la maqueta pone "Contemporáneo").

## Files
- `El Fabulario - Sitio.dc.html` — las cinco vistas. Ábrelo en un navegador; usa la barra negra superior para recorrerlas.
- `support.js` — runtime necesario solo para previsualizar el archivo anterior. No es parte del diseño.
- `uploads/` — logo, ilustraciones y retratos.
