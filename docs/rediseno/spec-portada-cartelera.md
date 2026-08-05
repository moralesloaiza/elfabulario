# Handoff: Portada «El Fabulario» — dirección Cartelera

## Overview

Rediseño de la portada de **El Fabulario**, una antología digital de fábulas clásicas en español (de Esopo a fabulistas contemporáneos) con una ilustración original por fábula y narración en audio como complemento. **La acción principal del sitio es leer**; el audio es secundario y se resuelve con un enlace a Spotify, nunca con un reproductor propio.

El rediseño resuelve dos problemas de la portada anterior:

1. **Ritmo vertical flojo / exceso de aire.** Se comprimen la banda de título y la banda de pódcast, y el hero se recorta a 300 px de alto fijo.
2. **La lista «Últimas fábulas» era monótona.** Las filas ilustradas que alternaban lado se sustituyen por una **rejilla uniforme de fichas encuadradas** — la «cartelera» que da nombre a la dirección.

Resultado: cinco fábulas más una cartela de acceso al archivo, visibles en aproximadamente la mitad del scroll anterior.

## About the Design Files

Los archivos de este paquete son **referencias de diseño creadas en HTML** — prototipos que muestran el aspecto y el comportamiento previstos, **no código de producción para copiar tal cual**.

La tarea es **recrear este diseño en el entorno del proyecto destino** (React, Vue, Astro, SwiftUI, nativo…) usando sus patrones y librerías establecidos. Si todavía no existe entorno, elige el framework más adecuado al proyecto e impleméntalo allí.

El HTML usa estilos en línea por una restricción de la herramienta de prototipado. **No los reproduzcas en línea**: extrae los valores a los tokens/clases/variables del proyecto destino según sus convenciones. Los valores exactos están tabulados más abajo en «Design Tokens».

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografías, tamaños, espaciados y filetes son definitivos y deben reproducirse con exactitud. El sistema es deliberadamente estricto: revisa «Reglas del sistema visual» antes de improvisar cualquier valor.

---

## Reglas del sistema visual (Art-Déco marfil)

Innegociables. Dos de ellas ya provocaron correcciones durante el diseño:

1. **Sin modo noche.** El sitio es siempre de día. No implementes `prefers-color-scheme: dark`.
2. **Geometría radio-0.** Esquinas rectas en todo: fichas, botones, imágenes, campos. `border-radius: 0` sin excepciones.
3. **Sin sombras difusas.** La jerarquía se construye exclusivamente con **filetes dorados** de 0.5–1.5 px. No hay `box-shadow` en ninguna parte del diseño.
4. **Regla del oro.** `#C9A14A` (oro decorativo) solo como **línea/filete**, o como **texto de 24 px o más**. Para texto pequeño sobre marfil —metadatos, numerales, eyebrows— se usa `#7A5F1F` (oro legible, ≈5.4:1 sobre marfil). Los numerales romanos del bloque EXPLORAR van a 26 px precisamente para poder ir en oro decorativo.
5. **Coral solo como fondo de botón.** `#D45B3C` nunca es color de texto. El rótulo del CTA sobre coral va en **negro `#1A1714`** (4.58:1, cumple AA); en marfil no cumpliría (3.13:1).
6. **Contraste WCAG AA obligatorio** en todo el sitio.
7. **La cabecera nunca se superpone a una ilustración.** Va encima, en banda propia con filete inferior.
8. **Metadatos siempre en clave de lectura**, nunca de audio: «3 MIN» significa tiempo de lectura, no duración del audio.

---

## Screens / Views

### Portada (única vista de este handoff)

**Purpose:** entrada al sitio. El lector reconoce la marca, encuentra la fábula destacada de la semana, escanea las últimas publicadas y accede al archivo por cuatro ejes.

**Layout general:** columna vertical. Ancho de contenido máximo **1200 px centrado**, con padding lateral `clamp(20px, 3vw, 40px)`. El hero va **a sangre** (ancho completo de la ventana, fuera del contenedor de 1200). Responsive por `clamp()` + `flex-wrap` + `grid auto-fit`, **sin media queries**.

Orden de bloques (respétalo):

```
cabecera → hero a sangre → filete doble → banda de título →
banda pódcast (negra) → últimas fábulas → explorar → pie
```

#### 1. Cabecera

- Fila flex, `justify-content: space-between`, `align-items: center`, `gap: 24px`.
- Padding `16px clamp(20px,3vw,40px)`. Borde inferior `1px solid rgba(201,161,74,0.55)`.
- **Izquierda:** logo rombo `img/logo-rombo.png` a 38×38 px, `object-fit: contain`; `gap: 14px`; wordmark «EL FABULARIO» en Cinzel 16 px, `letter-spacing: 0.26em`, color `#1A1714`.
- **Derecha:** enlaces en Cinzel 11 px, `letter-spacing: 0.2em`, mayúsculas: FÁBULAS · AUTORES · TRADICIONES · BUSCAR. Los tres primeros en `#1A1714`; BUSCAR en `#7A5F1F`. `gap: clamp(16px, 2vw, 30px)`, con `flex-wrap`.
- No es sticky en el prototipo. Si el codebase la fija, mantén el filete inferior y el fondo marfil opaco.

#### 2. Hero a sangre

- `width: 100%`, **`height: 300px` fijo** (recorte bajo deliberado: es lo que densifica la parte alta frente a la portada anterior en 8:3).
- `overflow: hidden`, fondo de reserva `#1A1714`.
- `<img>` de `img/amor-locura.png` a `width:100%; height:100%; object-fit: cover; object-position: 50% 34%`.
- Borde inferior `1.5px solid #C9A14A`.
- **Sin texto encima.** El titular vive en la banda siguiente.
- `alt`: «El Amor y la Locura ante el consejo de los dioses».

#### 3. Filete doble

Debajo del borde de 1.5 px del hero, un `div` de altura 0 con `border-top: 0.5px solid rgba(201,161,74,0.55)` y `margin-top: 4px`. Es el filete doble del sistema (1.5 px + 0.5 px separados 4 px). No lo simplifiques a una línea sola.

#### 4. Banda de título del destacado

- Contenedor 1200 px, padding `clamp(20px,2.4vw,28px) clamp(20px,3vw,40px)`.
- Flex con `wrap`, `gap: clamp(24px,3vw,44px)`, `align-items: flex-start`.
- **Columna izquierda** (`flex: 1 1 420px`, `gap: 8px`):
  - Eyebrow: «FÁBULA DE LA SEMANA · CLÁSICA · VERSO · 3 MIN» — Cinzel 11 px, `letter-spacing: 0.28em`, `#7A5F1F`.
  - H1: «El Amor y la Locura» — Cinzel 600, `clamp(28px, 3vw, 40px)`, `line-height: 1.1`, `letter-spacing: 0.05em`, `#1A1714`.
  - Byline: «Jean de La Fontaine» — Cormorant Garamond **itálica real** 20 px, `#0A5F3E`.
- **Columna derecha** (`flex: 1 1 300px`): `border-left: 1px solid #C9A14A`, `padding-left: clamp(16px,2vw,24px)`. Lede en Cormorant 19 px, `line-height: 1.5`, `#4A413A`, `text-wrap: pretty`: «La Locura deja ciego al Amor en una disputa de juego, y los dioses la condenan a servirle de guía para siempre.»

#### 5. Banda pódcast

- Fondo `#1A1714`, borde superior e inferior `1px solid #C9A14A`.
- Interior 1200 px, padding `14px clamp(20px,3vw,40px)`, flex `space-between`, `align-items: center`, `gap: 18px`, con `wrap`.
- Frase: «Cada fábula, también narrada en voz alta.» — Cormorant itálica 21 px, `#F0E5CE`.
- **CTA:** fondo `#D45B3C`, **texto `#1A1714`**, Cinzel 11 px, `letter-spacing: 0.2em`, padding `10px 20px`, radio 0. Rótulo: «ESCUCHAR EN SPOTIFY». Enlaza al perfil del pódcast, `target="_blank"`.

#### 6. Últimas fábulas — el bloque clave

- Contenedor 1200 px, padding `clamp(26px,3vw,38px) clamp(20px,3vw,40px)`.
- **Encabezado de sección:** fila flex `space-between`, `align-items: baseline`, `border-bottom: 1px solid #C9A14A`, `padding-bottom: 10px`, `margin-bottom: 24px`.
  - H2 «ÚLTIMAS FÁBULAS» — Cinzel 500, `clamp(17px,1.7vw,22px)`, `letter-spacing: 0.2em`.
  - «VER TODAS» — Cinzel 10 px, `letter-spacing: 0.2em`, `#7A5F1F`.
- **Rejilla:** `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: clamp(20px,2.4vw,30px)`. A 1200 px de ancho resuelve **3 columnas × 2 filas**; a anchos intermedios cae a 2 y luego a 1 sin media queries.

**Ficha de fábula** (5 iguales):

- `border: 1px solid #C9A14A`, `padding: 14px`, columna flex, `gap: 10px`, radio 0.
- Hover: fondo `#EBDDBF`. Sin transform, sin sombra. Transición `background 120ms ease` (el prototipo no la declara; añádela si el codebase la usa por convención).
- Imagen: contenedor `aspect-ratio: 3/2` (proporción nativa de las ilustraciones), `overflow: hidden`, fondo `#1A1714`; `<img>` `object-fit: cover` con `object-position` por pieza (ver «Assets»).
- Metadatos: Cinzel 9 px, `letter-spacing: 0.2em`, `#7A5F1F`, mayúsculas. Formato: `TRADICIÓN · FORMA · N MIN`.
- Título: Cinzel 600, 21 px, `letter-spacing: 0.05em`, `line-height: 1.18`, `#1A1714`.
- Autor: Cormorant itálica 18 px, `#0A5F3E`.
- Resumen: Cormorant 18 px, `line-height: 1.45`, `#4A413A`, `text-wrap: pretty`. Una frase.
- La ficha entera es enlazable (`<a>` que envuelve todo, `text-decoration: none`, `color: inherit`).

**Sexta celda — cartela de archivo** (no es una fábula):

- `border: 1px solid #C9A14A` **más** `outline: 1px solid rgba(201,161,74,0.45)` con `outline-offset: -9px` → el doble encuadre de cartela del sistema.
- Fondo `#EBDDBF`, padding `clamp(22px,2.4vw,30px)`, columna flex centrada verticalmente, `gap: 14px`.
- Eyebrow «ARCHIVO COMPLETO» — Cinzel 10 px, `letter-spacing: 0.26em`, `#7A5F1F`.
- Cifra «Doscientas doce fábulas» — Cinzel `clamp(24px,2.4vw,30px)`, `letter-spacing: 0.06em`, `line-height: 1.2`. **Sustituye el número por el real del backend, escrito con letra**, no en cifras.
- Glosa — Cormorant 18 px, `line-height: 1.5`, `#4A413A`.
- Enlace «ENTRAR AL ÍNDICE» — Cinzel 11 px, `letter-spacing: 0.2em`, `#1C3A7A`, con `border-top: 1px solid #C9A14A` y `padding-top: 12px`.

> **Por qué existe esta celda:** el archivo de ilustraciones reales tiene **cinco** piezas, no seis. La cartela cierra la rejilla sin inventar una imagen. Si en producción hay seis o más fábulas ilustradas, conviértela en una sexta ficha normal y mueve el acceso al índice al enlace «VER TODAS» de la cabecera de sección.

#### 7. Explorar

- Fondo `#EBDDBF`, borde superior `1.5px solid #C9A14A`.
- Interior 1200 px, padding `clamp(20px,2.4vw,28px) clamp(20px,3vw,40px)`.
- `display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: clamp(16px,2vw,26px)`.
- Cada acceso: fila flex, `gap: 14px`, `align-items: baseline`.
  - Numeral romano — Cinzel **26 px**, `#C9A14A`. El tamaño no es estético: por debajo de 24 px este color incumple la regla del oro.
  - Título — Cinzel 13 px, `letter-spacing: 0.16em`, `#1A1714`.
  - Glosa — Cormorant 17 px, `#4A413A`.
- Contenido: I POR TRADICIÓN / «Clásica, hispánica, oriental» · II POR AUTOR / «Diez fabulistas» · III POR FORMA / «Verso o prosa» · IV POR MORALEJA / «Índice temático».

#### 8. Pie

- `border-top: 1px solid #C9A14A`, padding `18px clamp(20px,3vw,40px)`, flex `space-between` con `wrap`, `gap: 16px`.
- Cinzel 10 px, `letter-spacing: 0.2em`, `#7A5F1F`: «EL FABULARIO · ANTOLOGÍA DIGITAL» y «MMXXVI» (año en numerales romanos).

---

## Interactions & Behavior

- **Fichas de fábula:** toda la tarjeta navega a la fábula. Hover → fondo `#EBDDBF`. Focus visible obligatorio: `outline: 1px solid #1C3A7A; outline-offset: 2px` (radio 0, coherente con el sistema).
- **Enlaces de texto:** color por defecto `#1C3A7A`; hover `#0A5F3E`. Sin subrayado por defecto.
- **CTA Spotify:** abre el pódcast en pestaña nueva. Sin cambio de fondo en hover (el coral es plano); si se quiere respuesta, oscurecer el coral un 6 % manteniendo el rótulo negro.
- **Sin animaciones de entrada, sin parallax, sin scroll-reveal.** El sistema es impreso y estático a propósito.
- **Responsive:** todo por `clamp()` + `flex-wrap` + `grid auto-fit`. La rejilla pasa de 3 a 2 a 1 columna sola. Verifica que a 360 px de ancho el hero de 300 px de alto sigue leyéndose: si el recorte pierde la escena, es aceptable ajustar `object-position` por breakpoint, pero **no** cambiar la altura.
- **Estados de carga:** las imágenes cargan sobre fondo `#1A1714`; no uses skeletons grises. Reserva el espacio con `aspect-ratio` para evitar saltos de layout.

## State Management

La portada es **estática**. No hay estado de cliente. Lo que necesita del backend:

- `destacada`: la fábula de la semana → hero + banda de título.
- `ultimas[]`: las cinco últimas fábulas publicadas → rejilla. Campos por fábula: `ilustracion` (3:2), `titulo`, `autor`, `resumen` (1–2 frases), `tradicion`, `forma` (`Verso` | `Prosa`), `minutosLectura` (entero).
- `totalFabulas`: entero → cartela de archivo, renderizado en letra.
- `enlacePodcast`: URL → CTA.

Si el hero y la primera ficha pudieran coincidir, excluye la destacada de `ultimas[]` en la consulta: en el prototipo «El Amor y la Locura» aparece dos veces por escasez de ilustraciones reales, y en producción no debería.

## Design Tokens

### Color

| Token | Hex | Uso |
|---|---|---|
| Marfil | `#F0E5CE` | fondo de página |
| Marfil cálido | `#EBDDBF` | hover de fichas, fondo de EXPLORAR y de la cartela |
| Negro | `#1A1714` | texto principal, fondos inversos, rótulo sobre coral |
| Oro decorativo | `#C9A14A` | filetes; texto solo a ≥24 px |
| Oro legible | `#7A5F1F` | eyebrows y metadatos en mayúsculas sobre marfil |
| Esmeralda | `#0A5F3E` | autoría; hover de enlaces |
| Coral | `#D45B3C` | **solo** fondo de CTA |
| Zafiro | `#1C3A7A` | enlaces primarios y citas |
| Texto auxiliar | `#4A413A` | resúmenes y glosas |
| Filete atenuado | `rgba(201,161,74,0.55)` | separadores secundarios |
| Filete de cartela | `rgba(201,161,74,0.45)` | outline interior del doble encuadre |

### Tipografía

Google Fonts: `Cinzel` (400/500/600/700) y `Cormorant Garamond` (300/400/500 + **itálicas reales**).

**Cinzel** — display: titulares, eyebrows, nav, metadatos, numerales. **Siempre en mayúsculas**, `letter-spacing` entre 0.09em y 0.30em (a menor tamaño, más abierto).

| Rol | Familia | Tamaño | Peso | Tracking |
|---|---|---|---|---|
| H1 destacado | Cinzel | `clamp(28px,3vw,40px)` | 600 | 0.05em |
| H2 sección | Cinzel | `clamp(17px,1.7vw,22px)` | 500 | 0.20em |
| H3 ficha | Cinzel | 21px | 600 | 0.05em |
| Cifra cartela | Cinzel | `clamp(24px,2.4vw,30px)` | 400 | 0.06em |
| Numeral EXPLORAR | Cinzel | 26px | 400 | — |
| Wordmark | Cinzel | 16px | 400 | 0.26em |
| Eyebrow banda | Cinzel | 11px | 400 | 0.28em |
| Nav / CTA / enlace | Cinzel | 11px | 400 | 0.20em |
| Título EXPLORAR | Cinzel | 13px | 400 | 0.16em |
| Eyebrow cartela | Cinzel | 10px | 400 | 0.26em |
| Metadatos / pie | Cinzel | 9–10px | 400 | 0.18–0.20em |
| Lede | Cormorant | 19px | 400 | line-height 1.5 |
| Byline | Cormorant *itálica* | 20px | 400 | — |
| Autor de ficha | Cormorant *itálica* | 18px | 400 | — |
| Frase pódcast | Cormorant *itálica* | 21px | 400 | — |
| Resumen de ficha | Cormorant | 18px | 400 | line-height 1.45 |
| Glosa EXPLORAR | Cormorant | 17px | 400 | — |

`text-wrap: pretty` en todos los párrafos de resumen, lede y glosa.

### Espaciado

Escala derivada de los `clamp()` usados: 8 · 10 · 14 · 16 · 18 · 20 · 24 · 26 · 28 · 30 · 38 · 40 px.

| Uso | Valor |
|---|---|
| Padding lateral de sección | `clamp(20px, 3vw, 40px)` |
| Padding vertical de sección | `clamp(26px, 3vw, 38px)` |
| Padding banda de título | `clamp(20px, 2.4vw, 28px)` |
| Gap de rejilla | `clamp(20px, 2.4vw, 30px)` |
| Gap de columnas de banda | `clamp(24px, 3vw, 44px)` |
| Gap interno de ficha | `10px` |
| Padding de ficha | `14px` |
| Ancho máximo de contenido | `1200px` |

### Filetes y geometría

| Token | Valor |
|---|---|
| Radio | `0` en todo |
| Sombra | ninguna |
| Filete simple | `1px solid #C9A14A` |
| Filete atenuado | `1px solid rgba(201,161,74,0.55)` |
| Filete doble | `1.5px solid #C9A14A` + `0.5px solid rgba(201,161,74,0.55)` separados 4px |
| Doble encuadre de cartela | `border: 1px solid #C9A14A` + `outline: 1px solid rgba(201,161,74,0.45); outline-offset: -9px` |
| Proporción de ilustración | `3/2` (nativa) |
| Altura de hero | `300px` fija |

## Assets

Todos en `img/`, PNG, incluidos en este paquete. Las ilustraciones son originales del proyecto, **1536×1024 px (3:2 nativo)**.

| Archivo | Contenido | `object-position` en el diseño |
|---|---|---|
| `logo-rombo.png` | Logo rombo, fondo transparente | `contain`, 38×38 |
| `amor-locura.png` | *El Amor y la Locura* — La Fontaine | hero `50% 34%` · ficha `22% 52%` |
| `comadrejas-ratones.png` | *Las comadrejas y los ratones* — Esopo | `50% 42%` |
| `higos.png` | *El viejo y los higos* — Leonardo da Vinci | `50% 40%` |
| `bufon.png` | *El bufón y el aldeano* — Esopo | `50% 36%` |
| `comadreja.png` | *El hombre y la comadreja* — Esopo | `50% 34%` |

Los `object-position` están ajustados a mano para centrar el rostro o la escena de cada pieza en el recorte. Consérvalos: con `50% 50%` varias quedan descabezadas. En producción, el CMS debería guardar un punto focal por ilustración.

**Existen además diez retratos de autor** (Esopo, La Fontaine, Iriarte, Samaniego, Hartzenbusch, Da Vinci, Miguel Agustín Príncipe, Aquiles Nazoa, Alejandro Morales Loaiza, Anónimo) en el proyecto de diseño; no se usan en la portada, pero están disponibles para las vistas de autor.

## Files

| Archivo | Qué es |
|---|---|
| `Portada Cartelera.dc.html` | La maqueta de referencia. Ábrela en el navegador. |
| `support.js` | Runtime de la herramienta de prototipado. **No es parte del diseño**; no lo portes. |
| `img/` | Los seis assets de la portada. |

En el proyecto de diseño de origen, la comparativa completa de las tres direcciones exploradas (Mosaico jerárquico, Cartelera y Portadas + índice) está en `El Fabulario - Portada direcciones.dc.html`; esta dirección es la **1b**. El mockup del sitio completo con las otras cuatro vistas (listado, fábula individual, autores, autor individual) está en `El Fabulario - Sitio.dc.html`, todavía con el ritmo vertical antiguo.

## Notas de implementación

- El HTML de referencia usa `<x-dc>` y estilos en línea por la herramienta de prototipado. **Ignora esa estructura**: extrae markup semántico (`<header>`, `<main>`, `<article>`, `<footer>`) y lleva los valores a los tokens del codebase.
- Carga Cinzel y Cormorant Garamond con `preconnect` y `display=swap`, o autoalójalas. **Cormorant necesita las itálicas reales**, no sintéticas: la autoría y el lede pierden el registro editorial si el navegador las oblicua.
- Cinzel solo tiene mayúsculas de caja alta; escribe el texto ya en mayúsculas o usa `text-transform: uppercase` — pero no dependas de `font-variant: small-caps`.
- Antes de dar por buena la implementación, comprueba los cuatro puntos que fallaron en revisión: **regla del oro** (nada de `#C9A14A` bajo 24 px), **rótulo negro sobre coral**, **radio 0** y **sin `box-shadow`**.
